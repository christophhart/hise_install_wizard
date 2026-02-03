'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '@/contexts/WizardContext';
import { GenerateScriptResponse, Platform } from '@/types/wizard';
import { CIStatus, CIStatusResponse } from '@/lib/github';
import { VerifiableTool } from '@/lib/verification';
import PageContainer from '@/components/layout/PageContainer';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import ScriptPreview from '@/components/wizard/ScriptPreview';
import SetupSummary, { getManualPhases } from '@/components/wizard/SetupSummary';
import CIStatusAlert from '@/components/wizard/CIStatusAlert';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import InlineCopy from '@/components/ui/InlineCopy';
import Collapsible from '@/components/ui/Collapsible';
import { ArrowLeft, Download, RefreshCw, Terminal, Folder, Check, AlertTriangle, Code } from 'lucide-react';
import { useExplanation } from '@/hooks/useExplanation';
import { generatePage, alerts, regenerateInfo } from '@/lib/content/explanations';
import { downloadAsFile, generateUniqueFilename } from '@/lib/utils/download';
import InfoPopup from '@/components/ui/InfoPopup';

// Commands for running the script (simplified - no IDE installation steps)
const runCommands: Record<Exclude<Platform, null>, { steps: { title: string; command?: string | ((filename: string) => string) }[] }> = {
  windows: {
    steps: [
      { title: 'Open PowerShell as Administrator' },
      { title: 'Allow script execution for this session', command: 'Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process' },
      { title: 'Run this command to execute the script', command: (filename: string) => `cd $HOME\\Downloads; .\\"${filename}"` },
    ],
  },
  macos: {
    steps: [
      { title: 'Open Terminal' },
      { title: 'Run this command to execute the script', command: (filename: string) => `cd ~/Downloads && chmod +x "${filename}" && ./"${filename}"` },
    ],
  },
  linux: {
    steps: [
      { title: 'Open Terminal' },
      { title: 'Run this command to execute the script', command: (filename: string) => `cd ~/Downloads && chmod +x "${filename}" && ./"${filename}"` },
    ],
  },
};

interface VerificationStatus {
  ide: boolean | null;
  ipp: boolean | null;
}

export default function GeneratePage() {
  const router = useRouter();
  const { state, getSkipPhases } = useWizard();
  const { get, isEasyMode } = useExplanation();
  
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
  
  // Verification state
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    ide: null,
    ipp: null,
  });
  
  // Check if platform has manual phases
  const hasManualPhases = state.platform 
    ? getManualPhases(state.platform, state.includeIPP).length > 0 
    : false;
  
  // Check if any required tools are unverified
  const hasUnverifiedTools = state.platform && hasManualPhases && (
    // IDE is required and not verified (except on Linux)
    (state.platform !== 'linux' && verificationStatus.ide !== true) ||
    // IPP is selected but not verified (Windows only)
    (state.platform === 'windows' && state.includeIPP && verificationStatus.ipp !== true)
  );
  
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
    
    if (!ciLoading) {
      generateScript();
    }
  }, [state.platform, ciLoading, useLatestOverride]);
  
  const generateScript = async () => {
    if (!state.platform) return;
    
    setLoading(true);
    setError(null);
    
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
  
  const handleVerificationChange = (tool: VerifiableTool, verified: boolean) => {
    setVerificationStatus(prev => ({ ...prev, [tool]: verified }));
  };
  
  const handleBack = () => {
    router.push('/setup');
  };
  
  // Get dynamic message based on which tools are unverified
  const getUnverifiedToolsMessage = (): { title: string; subtitle: string } => {
    const unverifiedTools: string[] = [];
    
    if (state.platform !== 'linux' && verificationStatus.ide !== true) {
      unverifiedTools.push(state.platform === 'windows' ? 'Visual Studio 2026' : 'Xcode');
    }
    
    if (state.platform === 'windows' && state.includeIPP && verificationStatus.ipp !== true) {
      unverifiedTools.push('Intel IPP');
    }
    
    if (unverifiedTools.length === 1) {
      return {
        title: `Install and verify ${unverifiedTools[0]} before downloading`,
        subtitle: `The setup script requires ${unverifiedTools[0]} to be installed first.`
      };
    }
    
    const toolsList = unverifiedTools.join(' and ');
    return {
      title: 'Install and verify all prerequisites above before downloading',
      subtitle: `The setup script requires ${toolsList} to be installed first.`
    };
  };
  
  if (!state.platform) {
    return null;
  }
  
  const commands = runCommands[state.platform];
  
  return (
    <PageContainer>
      <PhaseStepper currentPhase={1} className="mb-8" />
      
      <Card>
        <CardHeader>
          <CardTitle>{get(generatePage.title)}</CardTitle>
          
          {/* Integrated path display in header */}
          <div className="mt-3">
            <p className="text-sm text-gray-400 mb-2">
              {isEasyMode 
                ? 'Your script is configured to install HISE to:'
                : 'Target directory:'}
            </p>
            <div className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3">
              <Folder className="w-5 h-5 text-accent flex-shrink-0" />
              <span className="font-mono text-sm text-gray-200 truncate flex-1" title={state.installPath}>
                {state.installPath}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div 
                  className={`
                    w-5 h-5 rounded border flex items-center justify-center
                    ${state.detectedComponents.hiseRepo 
                      ? 'bg-success/20 border-success' 
                      : 'bg-transparent border-border'}
                  `}
                >
                  {state.detectedComponents.hiseRepo && (
                    <Check className="w-3 h-3 text-success" />
                  )}
                </div>
                <span className="text-xs text-gray-500">HISE Repository</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Loading state */}
          {(loading || ciLoading) && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-accent animate-spin" />
              <span className="ml-3 text-gray-400">
                {ciLoading ? 'Checking CI status...' : 'Generating script...'}
              </span>
            </div>
          )}
          
          {/* Error state */}
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
              
              {/* Warnings from script generation */}
              {result.warnings.length > 0 && (
                <div className="space-y-2">
                  {result.warnings.map((warning, i) => (
                    <Alert key={i} variant="warning">
                      {warning}
                    </Alert>
                  ))}
                </div>
              )}
              
              {/* Setup Summary with Steps 1 & 2 */}
              <div className="bg-background border border-border rounded-lg p-5">
                <SetupSummary
                  platform={state.platform}
                  skipPhases={getSkipPhases()}
                  includeFaust={state.includeFaust}
                  includeIPP={state.includeIPP}
                  isEasyMode={isEasyMode}
                  verificationStatus={verificationStatus}
                  onVerificationChange={handleVerificationChange}
                />
              </div>
              
              {/* Step 3: Download & Run */}
              <div className="bg-background border border-border rounded-lg p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-background text-sm font-bold">
                    {hasManualPhases ? 3 : 2}
                  </div>
                  <h4 className="font-medium text-white">
                    {isEasyMode ? 'Download & Run' : 'Download'}
                  </h4>
                </div>
                
                {/* Prerequisites status message - only show on Windows/macOS */}
                {state.platform !== 'linux' && (
                  hasUnverifiedTools ? (
                    <Alert variant={isEasyMode ? "error" : "warning"} className="mb-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">
                            {isEasyMode 
                              ? getUnverifiedToolsMessage().title
                              : 'Prerequisites not verified'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {isEasyMode
                              ? getUnverifiedToolsMessage().subtitle
                              : 'Script may fail. Verify prerequisites above.'}
                          </p>
                        </div>
                      </div>
                    </Alert>
                  ) : (
                    <Alert variant="success" className="mb-4">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">All prerequisites verified</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {isEasyMode
                              ? "You're ready to download and run the setup script!"
                              : 'Ready to download.'}
                          </p>
                        </div>
                      </div>
                    </Alert>
                  )
                )}
                
                {/* Download Button */}
                <div className="flex items-center justify-center gap-3 py-4">
                  <Button 
                    onClick={handleDownload} 
                    size="lg"
                    disabled={hasDownloaded || (isEasyMode && !!hasUnverifiedTools)}
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
                
                {/* How to Run */}
                <Collapsible
                  title={isEasyMode ? "How to run the script" : "Run instructions"}
                  icon={<Terminal className="w-4 h-4 text-accent" />}
                  defaultOpen={true}
                >
                  <div className="space-y-3 text-sm text-gray-400">
                    {commands.steps.map((step, index) => {
                      const command = step.command;
                      const commandStr = typeof command === 'function' 
                        ? command(uniqueFilename) 
                        : command;
                      
                      return (
                        <div key={index}>
                          <p className="mb-2">{index + 1}. {step.title}</p>
                          {commandStr && <InlineCopy text={commandStr} />}
                        </div>
                      );
                    })}
                  </div>
                </Collapsible>
              </div>
              
              {/* Script Preview (collapsed) */}
              <Collapsible
                title="Script Preview"
                icon={<Code className="w-4 h-4 text-accent" />}
                defaultOpen={false}
              >
                <ScriptPreview 
                  script={result.script} 
                  filename={result.filename}
                />
              </Collapsible>
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
