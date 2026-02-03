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
import { updateGeneratePage, updateHowToRun, updatePhases, regenerateInfo, migrationPage } from '@/lib/content/explanations';
import { downloadAsFile, generateUniqueFilename } from '@/lib/utils/download';
import { expandHomePath } from '@/lib/utils/path';
import InfoPopup from '@/components/ui/InfoPopup';
import DownloadLocationInput, { DEFAULT_DOWNLOAD_PATHS } from '@/components/wizard/DownloadLocationInput';

// Migration phases for the summary (PATH before Verify)
const migrationPhases = [
  { id: 1, name: { easy: 'Check/Install Git', dev: 'Git Check' }, description: { easy: 'Ensure Git is installed for repository management', dev: 'Verify/install git' } },
  { id: 2, name: { easy: 'Backup Existing Installation', dev: 'Backup' }, description: { easy: 'Rename current HISE folder to HISE_pre_git', dev: 'Rename to HISE_pre_git' } },
  { id: 3, name: { easy: 'Clone HISE Repository', dev: 'Clone Repo' }, description: { easy: 'Clone fresh copy from GitHub', dev: 'git clone HISE' } },
  { id: 4, name: { easy: 'Compile HISE', dev: 'Compile' }, description: { easy: 'Build HISE with detected configuration', dev: 'Build HISE binary' } },
  { id: 5, name: { easy: 'Add to PATH', dev: 'PATH' }, description: { easy: 'Add HISE to system PATH for easy access', dev: 'Update system PATH' } },
  { id: 6, name: { easy: 'Verify Build', dev: 'Verify' }, description: { easy: 'Check that HISE compiled correctly and PATH works', dev: 'get_build_flags (tests PATH)' } },
  { id: 7, name: { easy: 'Test Build', dev: 'Test' }, description: { easy: 'Export and compile demo project', dev: 'Test with demo project' } },
];

// Migration phases without backup (when keepBackup is false)
const migrationPhasesNoBackup = [
  { id: 1, name: { easy: 'Check/Install Git', dev: 'Git Check' }, description: { easy: 'Ensure Git is installed for repository management', dev: 'Verify/install git' } },
  { id: 2, name: { easy: 'Remove Existing Installation', dev: 'Delete' }, description: { easy: 'Delete current HISE folder to free space', dev: 'Delete existing folder' } },
  { id: 3, name: { easy: 'Clone HISE Repository', dev: 'Clone Repo' }, description: { easy: 'Clone fresh copy from GitHub', dev: 'git clone HISE' } },
  { id: 4, name: { easy: 'Compile HISE', dev: 'Compile' }, description: { easy: 'Build HISE with detected configuration', dev: 'Build HISE binary' } },
  { id: 5, name: { easy: 'Add to PATH', dev: 'PATH' }, description: { easy: 'Add HISE to system PATH for easy access', dev: 'Update system PATH' } },
  { id: 6, name: { easy: 'Verify Build', dev: 'Verify' }, description: { easy: 'Check that HISE compiled correctly and PATH works', dev: 'get_build_flags (tests PATH)' } },
  { id: 7, name: { easy: 'Test Build', dev: 'Test' }, description: { easy: 'Export and compile demo project', dev: 'Test with demo project' } },
];

// Update/Migration summary component
function UpdateSummary({ 
  get,
  phases,
  title,
  completedPhaseIds = [],
}: { 
  get: (content: { easy: string; dev: string }) => string;
  phases: typeof updatePhases;
  title: string;
  completedPhaseIds?: number[];
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-300 text-sm">{title}</h4>
      <div className="space-y-2">
        {phases.map((phase) => {
          const isCompleted = completedPhaseIds.includes(phase.id);
          
          return (
            <div 
              key={phase.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                isCompleted 
                  ? 'bg-surface/50 border-border/50' 
                  : 'bg-background border-border'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-success/20' : 'bg-accent/20'
              }`}>
                {isCompleted ? (
                  <Check className="w-3 h-3 text-success" />
                ) : (
                  <span className="text-xs font-medium text-accent">{phase.id}</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isCompleted ? 'text-gray-500' : ''}`}>
                  {get(phase.name)}
                </p>
                <p className={`text-xs ${isCompleted ? 'text-gray-600' : 'text-gray-500'}`}>
                  {get(phase.description)}
                </p>
              </div>
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <span className="text-xs text-success font-medium">Already Done</span>
                ) : (
                  <span className="text-xs text-accent font-medium">Will Run</span>
                )}
              </div>
            </div>
          );
        })}
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
          // Migration-specific parameters
          migrationMode: state.migrationMode,
          keepBackup: state.keepBackup,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate ${state.migrationMode ? 'migration' : 'update'} script`);
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
  
  // Determine which phases to show based on migration mode and backup setting
  const getPhases = () => {
    if (state.migrationMode) {
      return state.keepBackup ? migrationPhases : migrationPhasesNoBackup;
    }
    return updatePhases;
  };
  
  // Calculate completed phase IDs based on detection state
  // For update flow: if customBinaryFolder is null, HISE was found in PATH (phase 4 done)
  // For migration flow: PATH is always "Will Run" (users don't have HISE in PATH)
  const getCompletedPhaseIds = (): number[] => {
    if (state.migrationMode) {
      // Migration users never have HISE in PATH already
      return [];
    }
    // For update flow: PATH phase is id 4
    // If customBinaryFolder is null, HISE was detected via PATH environment variable
    if (state.customBinaryFolder === null) {
      return [4]; // PATH phase is already done
    }
    return [];
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
          <CardTitle>
            {state.migrationMode ? get(migrationPage.title) : get(updateGeneratePage.title)}
          </CardTitle>
          <CardDescription>
            {state.migrationMode ? get(migrationPage.description) : get(updateGeneratePage.description)}
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
              
              {/* Update/Migration Summary */}
              <div className="bg-background border border-border rounded-lg p-4">
                <UpdateSummary 
                  get={get} 
                  phases={getPhases()}
                  title={state.migrationMode ? 'Migration Phases' : 'Update Phases'}
                  completedPhaseIds={getCompletedPhaseIds()}
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
                  expandHomePath(downloadLocation || (state.platform ? DEFAULT_DOWNLOAD_PATHS[state.platform] : '')),
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
