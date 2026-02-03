'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdate } from '@/contexts/UpdateContext';
import { UpdateScriptResponse, Platform } from '@/types/wizard';
import { CIStatus, CIStatusResponse } from '@/lib/github';
import PageContainer from '@/components/layout/PageContainer';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import ScriptPreview from '@/components/wizard/ScriptPreview';
import PathDisplay from '@/components/wizard/PathDisplay';
import CIStatusAlert from '@/components/wizard/CIStatusAlert';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import InlineCopy from '@/components/ui/InlineCopy';
import Collapsible from '@/components/ui/Collapsible';
import { ArrowLeft, Download, RefreshCw, Terminal, Check } from 'lucide-react';
import { useExplanation } from '@/hooks/useExplanation';
import { updateGeneratePage, updateHowToRun, updatePhases, regenerateInfo } from '@/lib/content/explanations';
import { downloadAsFile, generateUniqueFilename } from '@/lib/utils/download';
import InfoPopup from '@/components/ui/InfoPopup';
import DownloadLocationInput, { DEFAULT_DOWNLOAD_PATHS } from '@/components/wizard/DownloadLocationInput';

// Update summary component
function UpdateSummary({ 
  get 
}: { 
  get: (content: { easy: string; dev: string }) => string;
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-300 text-sm">Update Phases</h4>
      <div className="space-y-2">
        {updatePhases.map((phase) => (
          <div 
            key={phase.id}
            className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg"
          >
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-xs font-medium text-accent">{phase.id}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{get(phase.name)}</p>
              <p className="text-xs text-gray-500">{get(phase.description)}</p>
            </div>
            <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-accent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Type for command content that can be string or function
type CommandContent = string | ((filename: string, downloadPath: string) => string);
type CommandModeContent = { easy: CommandContent; dev: CommandContent };

// Render how-to-run instructions
function renderHowToRunInstructions(
  platform: Platform,
  filename: string,
  downloadPath: string,
  get: (content: { easy: string; dev: string }) => string,
  mode: 'easy' | 'dev'
) {
  if (!platform) return null;
  
  const steps = updateHowToRun[platform].steps;
  
  return (
    <div className="text-sm text-gray-400 space-y-3">
      {/* Windows admin alert */}
      {platform === 'windows' && (
        <Alert variant="info">
          Run PowerShell as Administrator for the script to work correctly.
        </Alert>
      )}
      
      {steps.map((step, index) => {
        // Get the raw command value based on mode (may be string or function)
        const rawCommandValue = step.command ? (step.command as CommandModeContent)[mode] : null;
        const commandContent = typeof rawCommandValue === 'function' 
          ? rawCommandValue(filename, downloadPath) 
          : rawCommandValue;
        
        return (
          <div key={index}>
            <p className="mb-2">
              {index + 1}. {get(step.title)}
            </p>
            {commandContent && <InlineCopy text={commandContent} />}
          </div>
        );
      })}
    </div>
  );
}

export default function UpdateGeneratePage() {
  const router = useRouter();
  const { state, canGenerate } = useUpdate();
  const { get, isEasyMode, mode } = useExplanation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UpdateScriptResponse | null>(null);
  const [uniqueFilename, setUniqueFilename] = useState<string>('');
  const [hasDownloaded, setHasDownloaded] = useState(false);
  
  // CI status state
  const [ciStatus, setCiStatus] = useState<CIStatus | null>(null);
  const [ciLoading, setCiLoading] = useState(true);
  const [ciError, setCiError] = useState<string | null>(null);
  const [useLatestOverride, setUseLatestOverride] = useState(false);
  
  // Faust version state
  const [faustVersion, setFaustVersion] = useState<string | null>(null);
  
  // Download location state
  const [downloadLocation, setDownloadLocation] = useState<string>('');
  
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
  
  // Fetch Faust version when Faust build is detected (non-blocking)
  useEffect(() => {
    async function fetchFaustVersion() {
      if (!state.hasFaust) return;
      
      try {
        const response = await fetch('/api/get-latest-faust-version');
        const data = await response.json();
        if (data.status === 'ok' && data.version) {
          setFaustVersion(data.version);
        }
      } catch (err) {
        console.error('Failed to fetch Faust version:', err);
        // Non-blocking - script will use fallback version
      }
    }
    
    fetchFaustVersion();
  }, [state.hasFaust]);
  
  // Initialize download location when platform is available
  useEffect(() => {
    if (state.platform && !downloadLocation) {
      setDownloadLocation(DEFAULT_DOWNLOAD_PATHS[state.platform]);
    }
  }, [state.platform, downloadLocation]);
  
  // Redirect if no valid detection, generate script when CI check completes
  useEffect(() => {
    if (!canGenerate) {
      router.push('/update');
      return;
    }
    
    // Wait for CI status check to complete before generating
    if (!ciLoading) {
      generateScript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canGenerate, router, ciLoading, useLatestOverride]);
  
  const generateScript = async () => {
    if (!state.platform || !state.hisePath) return;
    
    setLoading(true);
    setError(null);
    
    // Determine which commit to use
    let targetCommit: string | undefined;
    if (ciStatus && !ciStatus.isLatestPassing && !useLatestOverride && ciStatus.lastPassingCommit) {
      targetCommit = ciStatus.lastPassingCommit.sha;
    }
    
    try {
      const response = await fetch('/api/generate-update-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: state.platform,
          architecture: state.architecture || 'x64',
          hisePath: state.hisePath,
          hasFaust: state.hasFaust,
          targetCommit,
          faustVersion: faustVersion || undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate update script');
      }
      
      const data: UpdateScriptResponse = await response.json();
      setResult(data);
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
    router.push('/update');
  };
  
  if (!canGenerate) {
    return null;
  }
  
  return (
    <PageContainer>
      <PhaseStepper currentPhase={1} mode="update" className="mb-8" />
      
      <Card>
        <CardHeader>
          <CardTitle>{get(updateGeneratePage.title)}</CardTitle>
          <CardDescription>
            {get(updateGeneratePage.description)}
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
              
              {/* HISE Path Display */}
              <PathDisplay 
                path={state.hisePath}
                label="HISE Installation"
                indicator={{
                  label: state.hasFaust ? 'Faust Build' : 'Standard Build',
                  active: state.hasFaust,
                  colorScheme: 'accent',
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
                {get(updateGeneratePage.stepsExplanation)}
              </p>
              
              {/* Update Summary */}
              <div className="bg-background border border-border rounded-lg p-4">
                <UpdateSummary get={get} />
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
              
              {/* Download Location */}
              {state.platform && (
                <DownloadLocationInput
                  platform={state.platform}
                  value={downloadLocation}
                  onChange={setDownloadLocation}
                  className="mb-4"
                />
              )}
              
              {/* Instructions */}
              <Collapsible
                title="How to run the script"
                icon={<Terminal className="w-4 h-4 text-accent" />}
                defaultOpen={true}
              >
                {renderHowToRunInstructions(
                  state.platform, 
                  uniqueFilename, 
                  downloadLocation || (state.platform ? DEFAULT_DOWNLOAD_PATHS[state.platform] : ''),
                  get, 
                  mode
                )}
              </Collapsible>
              
              {/* Script Preview - Dev mode only */}
              {!isEasyMode && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-300">Script Preview</h4>
                  <ScriptPreview 
                    script={result.script} 
                    filename={result.filename}
                  />
                </div>
              )}
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
