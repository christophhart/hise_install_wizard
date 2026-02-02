'use client';

import { useState } from 'react';
import { Platform } from '@/types/wizard';
import { Check, SkipForward, Circle, ExternalLink, Download, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import VerificationModal from '@/components/wizard/VerificationModal';
import { VerifiableTool, requiresVerification, getToolName } from '@/lib/verification';

type PhaseType = 'automatic' | 'manual';

interface SetupPhase {
  id: number;
  name: string;
  description: string;
  required: boolean;
  alwaysRun?: boolean;
  type: PhaseType;
  downloadUrls?: Partial<Record<Exclude<Platform, null>, string>>;
  downloadInstructions?: Partial<Record<Exclude<Platform, null>, string>>;
  /** For manual phases: which verification tool to use */
  verificationTool?: VerifiableTool;
}

// Download URLs for manual installation phases
const DOWNLOAD_URLS = {
  visualStudio: 'https://visualstudio.microsoft.com/downloads/',
  intelIPP: 'https://www.intel.com/content/www/us/en/developer/tools/oneapi/ipp-download.html',
  xcode: 'https://developer.apple.com/xcode/',
};

// All setup phases
const setupPhases: SetupPhase[] = [
  {
    id: 2,
    name: 'Git & Repository Setup',
    description: 'Clone HISE repository and initialize JUCE submodule',
    required: true,
    type: 'automatic',
  },
  {
    id: 3,
    name: 'C++ Compiler',
    description: 'Visual Studio 2026 (Windows) or Xcode Command Line Tools (macOS)',
    required: true,
    type: 'manual',
    verificationTool: 'ide',
    downloadUrls: {
      windows: DOWNLOAD_URLS.visualStudio,
      macos: DOWNLOAD_URLS.xcode,
    },
    downloadInstructions: {
      windows: 'Install Visual Studio 2026 Community with "Desktop development with C++" workload',
      macos: 'Install Xcode from App Store, then run: xcode-select --install',
    },
  },
  {
    id: 4,
    name: 'Intel IPP',
    description: 'Intel Performance Primitives for optimized audio processing',
    required: false,
    type: 'manual',
    verificationTool: 'ipp',
    downloadUrls: {
      windows: DOWNLOAD_URLS.intelIPP,
    },
    downloadInstructions: {
      windows: 'Download and install Intel IPP from the oneAPI toolkit',
    },
  },
  {
    id: 5,
    name: 'Faust DSP Compiler',
    description: 'Install Faust for DSP development support',
    required: false,
    type: 'automatic',
  },
  {
    id: 6,
    name: 'Repository Check',
    description: 'Verify JUCE submodule and extract SDKs',
    required: true,
    type: 'automatic',
  },
  {
    id: 7,
    name: 'Compile HISE',
    description: 'Build the HISE standalone application (5-15 minutes)',
    required: true,
    alwaysRun: true,
    type: 'automatic',
  },
  {
    id: 8,
    name: 'Add to PATH',
    description: 'Add HISE binary to system PATH for command-line access',
    required: true,
    alwaysRun: true,
    type: 'automatic',
  },
  {
    id: 9,
    name: 'Verify Build',
    description: 'Run HISE get_build_flags to verify installation',
    required: true,
    alwaysRun: true,
    type: 'automatic',
  },
  {
    id: 10,
    name: 'Test Project',
    description: 'Compile demo project to verify complete setup',
    required: true,
    alwaysRun: true,
    type: 'automatic',
  },
];

interface VerificationStatus {
  ide: boolean | null;
  ipp: boolean | null;
}

interface SetupSummaryProps {
  platform: Exclude<Platform, null>;
  skipPhases: number[];
  includeFaust: boolean;
  includeIPP: boolean;
  isEasyMode: boolean;
  verificationStatus: VerificationStatus;
  onVerificationChange: (tool: VerifiableTool, verified: boolean) => void;
}

// Helper to check if a phase is manual for a given platform
function isManualPhase(phase: SetupPhase, platform: Exclude<Platform, null>): boolean {
  if (phase.type !== 'manual') return false;
  if (phase.id === 3 && platform === 'linux') return false;
  return phase.downloadUrls?.[platform] !== undefined;
}

// Get phases that need manual installation before running script
export function getManualPhases(platform: Exclude<Platform, null>, includeIPP: boolean): SetupPhase[] {
  return setupPhases.filter(phase => {
    if (!isManualPhase(phase, platform)) return false;
    if (phase.id === 4 && !includeIPP) return false;
    if (phase.id === 4 && platform !== 'windows') return false;
    return true;
  });
}

/**
 * Step header component for numbered sections
 */
function StepHeader({ 
  number, 
  title, 
  subtitle 
}: { 
  number: number; 
  title: string; 
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-background text-sm font-bold">
        {number}
      </div>
      <div>
        <h4 className="font-medium text-white">{title}</h4>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function SetupSummary({
  platform,
  skipPhases,
  includeFaust,
  includeIPP,
  isEasyMode,
  verificationStatus,
  onVerificationChange,
}: SetupSummaryProps) {
  const [verifyingTool, setVerifyingTool] = useState<VerifiableTool | null>(null);

  // Filter phases for current platform
  const filteredPhases = setupPhases.filter((phase) => {
    if (phase.id === 4 && platform !== 'windows') return false;
    return true;
  });
  
  // Separate manual and automatic phases
  const manualPhases = filteredPhases.filter(phase => isManualPhase(phase, platform));
  const automaticPhases = filteredPhases.filter(phase => !isManualPhase(phase, platform));

  // Determine phase status for automatic phases
  const getPhaseStatus = (phase: SetupPhase): 'run' | 'skip' | 'optional-skip' => {
    if (skipPhases.includes(phase.id)) {
      return 'skip';
    }
    if (phase.id === 4 && !includeIPP) return 'optional-skip';
    if (phase.id === 5 && !includeFaust) return 'optional-skip';
    return 'run';
  };

  const getStatusIcon = (status: 'run' | 'skip' | 'optional-skip') => {
    switch (status) {
      case 'run':
        return <Circle className="w-4 h-4 text-accent fill-accent" />;
      case 'skip':
        return <Check className="w-4 h-4 text-success" />;
      case 'optional-skip':
        return <SkipForward className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: 'run' | 'skip' | 'optional-skip') => {
    switch (status) {
      case 'run':
        return <span className="text-xs text-accent font-medium">Will Run</span>;
      case 'skip':
        return <span className="text-xs text-success font-medium">Already Done</span>;
      case 'optional-skip':
        return <span className="text-xs text-gray-500">Skipped</span>;
    }
  };
  
  // Get manual phase status
  const getManualPhaseStatus = (phase: SetupPhase): 'verified' | 'needs-download' | 'not-found' | 'optional-skip' => {
    if (phase.id === 4 && !includeIPP) return 'optional-skip';
    
    const tool = phase.verificationTool;
    if (!tool) return 'needs-download';
    
    const status = verificationStatus[tool];
    if (status === true) return 'verified';
    if (status === false) return 'not-found';
    return 'needs-download';
  };

  // Check if tool can be verified on this platform
  const canVerify = (phase: SetupPhase): boolean => {
    if (!phase.verificationTool) return false;
    return requiresVerification(platform, phase.verificationTool);
  };

  const runCount = automaticPhases.filter(p => getPhaseStatus(p) === 'run').length;
  const skipCount = automaticPhases.filter(p => getPhaseStatus(p) !== 'run').length;

  // Get active manual phases (not skipped)
  const activeManualPhases = manualPhases.filter(p => getManualPhaseStatus(p) !== 'optional-skip');

  return (
    <div className="space-y-6">
      {/* Step 1: Prerequisites */}
      {manualPhases.length > 0 && (
        <div>
          <StepHeader 
            number={1} 
            title={isEasyMode ? "Install Prerequisites" : "Prerequisites"}
            subtitle={isEasyMode ? `${activeManualPhases.length} tool${activeManualPhases.length !== 1 ? 's' : ''} to install before running the script` : undefined}
          />
          
          <div className="space-y-2">
            {manualPhases.map((phase) => {
              const status = getManualPhaseStatus(phase);
              const isSkipped = status === 'optional-skip';
              const isVerified = status === 'verified';
              const isNotFound = status === 'not-found';
              const downloadUrl = phase.downloadUrls?.[platform];
              const instructions = phase.downloadInstructions?.[platform];
              const showVerify = canVerify(phase) && !isSkipped;
              
              return (
                <div
                  key={phase.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border
                    ${isSkipped 
                      ? 'bg-surface/50 border-border/50' 
                      : isVerified
                        ? 'bg-success/5 border-success/30'
                        : isNotFound
                          ? 'bg-warning/5 border-warning/30'
                          : 'bg-surface border-border'
                    }
                  `}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {isVerified ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : isSkipped ? (
                      <SkipForward className="w-4 h-4 text-gray-500" />
                    ) : isNotFound ? (
                      <Download className="w-4 h-4 text-warning" />
                    ) : (
                      <Download className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${isSkipped ? 'text-gray-500' : 'text-white'}`}>
                      {phase.name}
                      {!phase.required && (
                        <span className="ml-2 text-xs text-gray-600">(Optional)</span>
                      )}
                    </div>
                    <div className={`text-xs ${isSkipped ? 'text-gray-600' : 'text-gray-400'}`}>
                      {instructions || phase.description}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isVerified ? (
                      <span className="text-xs text-success font-medium px-2">Verified</span>
                    ) : isSkipped ? (
                      <span className="text-xs text-gray-500">Skipped</span>
                    ) : (
                      <>
                        {showVerify && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setVerifyingTool(phase.verificationTool!)}
                            className="text-xs"
                          >
                            <Shield className="w-3 h-3" />
                            Verify
                          </Button>
                        )}
                        {downloadUrl && (
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-accent text-background hover:bg-accent/90 transition-colors"
                          >
                            Download
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Step 2: Script Actions */}
      <div>
        <StepHeader 
          number={manualPhases.length > 0 ? 2 : 1} 
          title={isEasyMode ? "What the Script Will Do" : "Script Actions"}
          subtitle={isEasyMode ? `${runCount} step${runCount !== 1 ? 's' : ''} to run, ${skipCount} skipped` : `${runCount} to run, ${skipCount} skipped`}
        />
        
        <div className="space-y-2">
          {automaticPhases.map((phase) => {
            const status = getPhaseStatus(phase);
            const isSkipped = status !== 'run';
            
            return (
              <div
                key={phase.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border
                  ${isSkipped 
                    ? 'bg-surface/50 border-border/50' 
                    : 'bg-surface border-border'
                  }
                `}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${isSkipped ? 'text-gray-500' : 'text-white'}`}>
                    {phase.name}
                    {!phase.required && (
                      <span className="ml-2 text-xs text-gray-600">(Optional)</span>
                    )}
                  </div>
                  <div className={`text-xs ${isSkipped ? 'text-gray-600' : 'text-gray-400'}`}>
                    {phase.description}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getStatusLabel(status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-3 border-t border-border">
        {manualPhases.length > 0 && (
          <>
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3 text-gray-400" />
              <span>Manual Install</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-success" />
              <span>Verified</span>
            </div>
          </>
        )}
        <div className="flex items-center gap-1">
          <Circle className="w-3 h-3 text-accent fill-accent" />
          <span>Will Run</span>
        </div>
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3 text-success" />
          <span>Already Done</span>
        </div>
        <div className="flex items-center gap-1">
          <SkipForward className="w-3 h-3 text-gray-500" />
          <span>Skipped</span>
        </div>
      </div>

      {/* Verification Modal */}
      {verifyingTool && (
        <VerificationModal
          isOpen={true}
          onClose={() => setVerifyingTool(null)}
          platform={platform}
          tool={verifyingTool}
          onVerified={(verified) => {
            onVerificationChange(verifyingTool, verified);
            // Keep modal open to show result
          }}
          isEasyMode={isEasyMode}
        />
      )}
    </div>
  );
}
