'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '@/contexts/WizardContext';
import { GenerateScriptResponse, Platform } from '@/types/wizard';
import { CIStatus, CIStatusResponse } from '@/lib/github';
import PageContainer from '@/components/layout/PageContainer';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import ScriptPreview from '@/components/wizard/ScriptPreview';
import SetupSummary from '@/components/wizard/SetupSummary';
import PathDisplay from '@/components/wizard/PathDisplay';
import CIStatusAlert from '@/components/wizard/CIStatusAlert';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import InlineCopy from '@/components/ui/InlineCopy';
import { ArrowLeft, Download, RefreshCw, Terminal } from 'lucide-react';
import Collapsible from '@/components/ui/Collapsible';
import { useExplanation } from '@/hooks/useExplanation';
import { generatePage, howToRun, alerts, regenerateInfo } from '@/lib/content/explanations';
import { downloadAsFile, generateUniqueFilename } from '@/lib/utils/download';
import InfoPopup from '@/components/ui/InfoPopup';

// Commands for each step based on platform
const stepCommands: Record<Exclude<Platform, null>, (string | ((filename: string) => string))[]> = {
  windows: [
    '', // Step 1: no command
    'cd $HOME\\Downloads',
    'Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser',
    (filename: string) => `.\\"${filename}"`,
  ],
  macos: [
    '', // Step 1: no command
    'cd ~/Downloads',
    (filename: string) => `chmod +x "${filename}"`,
    (filename: string) => `./"${filename}"`,
  ],
  linux: [
    '', // Step 1: no command
    'cd ~/Downloads',
    (filename: string) => `chmod +x "${filename}"`,
    (filename: string) => `./"${filename}"`,
  ],
};

// Render how-to-run instructions based on explanation mode
function renderHowToRunInstructions(
  platform: Platform,
  filename: string,
  get: (content: { easy: string; dev: string }) => string,
  getOptional: (content: { easy: string; dev: string | null }) => string,
  isEasyMode: boolean
) {
  if (!platform) return null;
  
  const steps = howToRun[platform].steps;
  const commands = stepCommands[platform];
  
  return (
    <div className="text-sm text-gray-400 space-y-3">
      {/* Windows admin alert */}
      {platform === 'windows' && (
        <Alert variant="info">
          {get(alerts.windowsAdmin)}
        </Alert>
      )}
      
      {steps.map((step, index) => {
        const command = commands[index];
        const commandStr = typeof command === 'function' ? command(filename) : command;
        const description = step.description ? getOptional(step.description) : null;
        
        return (
          <div key={index}>
            <p className="mb-2">
              {index + 1}. {get(step.title)}
              {isEasyMode && description && (
                <span className="text-gray-500 ml-1">- {description}</span>
              )}
            </p>
            {commandStr && <InlineCopy text={commandStr} />}
          </div>
        );
      })}
    </div>
  );
}

export default function GeneratePage() {
  const router = useRouter();
  const { state, getSkipPhases } = useWizard();
  const { get, getOptional, isEasyMode } = useExplanation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateScriptResponse | null>(null);
  const [uniqueFilename, setUniqueFilename] = useState<string>('');
  const [hasDownloaded, setHasDownloaded] = useState(false);
  
  // CI status state
  const [ciStatus, setCiStatus] = useState<CIStatus | null>(null);
  const [ciLoading, setCiLoading] = useState(true);
  const [ciError, setCiError] = useState<string | null>(null);
  const [useLatestOverride, setUseLatestOverride] = useState(false);
  
  // Fetch CI status on mount
  useEffect(() => {
    async function checkCIStatus() {
      try {
        setCiLoading(true);
        const response = await fetch('/api/check-ci-status');
        const data: CIStatusResponse = await response.json();
        
        if (data.status === 'ok' && data.data) {
          setCiStatus(data.data);
        } else if (data.status === 'error') {
          setCiError(data.message || 'Failed to check CI status');
        }
      } catch (err) {
        setCiError('Could not check CI status');
      } finally {
        setCiLoading(false);
      }
    }
    
    checkCIStatus();
  }, []);
  
  // Redirect if no platform selected, generate script when CI check completes
  useEffect(() => {
    if (!state.platform) {
      router.push('/setup');
      return;
    }
    
    // Wait for CI status check to complete before generating
    if (!ciLoading) {
      generateScript();
    }
  }, [state.platform, ciLoading, useLatestOverride]);
  
  const generateScript = async () => {
    if (!state.platform) return;
    
    setLoading(true);
    setError(null);
    
    // Determine which commit to use
    let targetCommit: string | undefined;
    if (ciStatus && !ciStatus.isLatestPassing && !useLatestOverride && ciStatus.lastPassingCommit) {
      targetCommit = ciStatus.lastPassingCommit.sha;
    }
    
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: state.platform,
          architecture: state.architecture || 'x64',
          installPath: state.installPath,
          includeFaust: state.includeFaust,
          includeIPP: state.includeIPP,
          skipPhases: getSkipPhases(),
          targetCommit,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate script');
      }
      
      const data: GenerateScriptResponse = await response.json();
      setResult(data);
      // Generate unique filename for this download
      setUniqueFilename(generateUniqueFilename(data.filename));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!result) return;
    
    downloadAsFile(result.script, uniqueFilename);
    setHasDownloaded(true);
  };
  
  const handleRegenerate = async () => {
    await generateScript();
    setHasDownloaded(false);
  };
  
  const handleBack = () => {
    router.push('/setup');
  };
  
  if (!state.platform) {
    return null;
  }
  
  return (
    <PageContainer>
      <PhaseStepper currentPhase={1} className="mb-8" />
      
      <Card>
        <CardHeader>
          <CardTitle>{get(generatePage.title)}</CardTitle>
          <CardDescription>
            {get(generatePage.description)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {(loading || ciLoading) && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-accent animate-spin" />
              <span className="ml-3 text-gray-400">
                {ciLoading ? 'Checking CI status...' : 'Generating script...'}
              </span>
            </div>
          )}
          
          {error && (
            <Alert variant="error" title="Generation Failed">
              {error}
              <Button 
                onClick={generateScript} 
                variant="secondary" 
                size="sm" 
                className="mt-3"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </Alert>
          )}
          
          {result && !loading && (
            <>
              {/* CI Status Alert */}
              {ciStatus && !ciStatus.isLatestPassing && (
                <CIStatusAlert
                  ciStatus={ciStatus}
                  useLatestOverride={useLatestOverride}
                  onOverrideChange={setUseLatestOverride}
                  isEasyMode={isEasyMode}
                />
              )}
              
              {/* CI Error (non-blocking) */}
              {ciError && (
                <Alert variant="info">
                  Could not check CI status: {ciError}. Proceeding with latest commit.
                </Alert>
              )}
              
              {/* Install Path Display */}
              <PathDisplay 
                path={state.installPath}
                label="Installation Folder"
                indicator={{
                  label: 'HISE Repository',
                  active: state.detectedComponents.hiseRepo,
                  colorScheme: 'success',
                }}
                className="mb-6"
              />
              
              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="space-y-2">
                  {result.warnings.map((warning, i) => (
                    <Alert key={i} variant="warning">
                      {warning}
                    </Alert>
                  ))}
                </div>
              )}
              
              {/* Steps Explanation */}
              <p className="text-sm text-gray-400">
                {get(generatePage.stepsExplanation)}
              </p>
              
              {/* Setup Summary */}
              <div className="bg-background border border-border rounded-lg p-4">
                <SetupSummary
                  platform={state.platform}
                  skipPhases={getSkipPhases()}
                  includeFaust={state.includeFaust}
                  includeIPP={state.includeIPP}
                />
              </div>
              
              {/* Download & Regenerate Buttons */}
              <div className="flex items-center justify-center gap-3">
                <Button 
                  onClick={handleDownload} 
                  size="lg"
                  disabled={hasDownloaded}
                >
                  <Download className="w-5 h-5" />
                  Download {uniqueFilename}
                </Button>
                
                {hasDownloaded && (
                  <>
                    <Button 
                      onClick={handleRegenerate}
                      variant="secondary"
                      size="lg"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </Button>
                    
                    <InfoPopup>
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-accent">
                          {get(regenerateInfo.title)}
                        </span>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {get(regenerateInfo.description)}
                        </p>
                      </div>
                    </InfoPopup>
                  </>
                )}
              </div>
              
              {/* Instructions */}
              <Collapsible
                title="How to run the script"
                icon={<Terminal className="w-4 h-4 text-accent" />}
                defaultOpen={true}
              >
                {renderHowToRunInstructions(state.platform, uniqueFilename, get, getOptional, isEasyMode)}
              </Collapsible>
              
              {/* Script Preview */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-300">Script Preview</h4>
                <ScriptPreview 
                  script={result.script} 
                  filename={result.filename}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-start mt-6">
        <Button 
          onClick={handleBack}
          variant="secondary"
          size="lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
    </PageContainer>
  );
}
