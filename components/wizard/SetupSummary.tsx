'use client';

import { Platform } from '@/types/wizard';
import { Check, SkipForward, Circle, ExternalLink, Download } from 'lucide-react';

type PhaseType = 'automatic' | 'manual';

interface SetupPhase {
  id: number;
  name: string;
  description: string;
  required: boolean;
  // Phases that are always included (can't be skipped by user detection)
  alwaysRun?: boolean;
  // Phase type: 'automatic' runs in script, 'manual' requires user to install beforehand
  type: PhaseType;
  // For manual phases: platform-specific download URLs
  downloadUrls?: Partial<Record<Exclude<Platform, null>, string>>;
  // For manual phases: platform-specific instructions
  downloadInstructions?: Partial<Record<Exclude<Platform, null>, string>>;
}

// Download URLs for manual installation phases
const DOWNLOAD_URLS = {
  visualStudio: 'https://visualstudio.microsoft.com/downloads/',
  intelIPP: 'https://www.intel.com/content/www/us/en/developer/tools/oneapi/ipp-download.html',
  xcode: 'https://developer.apple.com/xcode/',
  xcodeCommandLine: 'xcode-select --install', // This is a command, not URL
};

// All setup phases from the documentation
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
    downloadUrls: {
      windows: DOWNLOAD_URLS.visualStudio,
      macos: DOWNLOAD_URLS.xcode,
      // Linux uses apt-get, so it stays automatic
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
    type: 'automatic', // Faust stays automatic as it's simpler to install
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

interface SetupSummaryProps {
  platform: Exclude<Platform, null>;
  skipPhases: number[];
  includeFaust: boolean;
  includeIPP: boolean;
  // IDE verification status (for showing warnings)
  ideVerified?: boolean;
  ippVerified?: boolean;
}

// Helper to check if a phase is manual for a given platform
function isManualPhase(phase: SetupPhase, platform: Exclude<Platform, null>): boolean {
  if (phase.type !== 'manual') return false;
  // For phase 3 (compiler), Linux stays automatic
  if (phase.id === 3 && platform === 'linux') return false;
  // Check if there's a download URL for this platform
  return phase.downloadUrls?.[platform] !== undefined;
}

// Get phases that need manual installation before running script
export function getManualPhases(platform: Exclude<Platform, null>, includeIPP: boolean): SetupPhase[] {
  return setupPhases.filter(phase => {
    if (!isManualPhase(phase, platform)) return false;
    // Intel IPP is only shown if user selected it
    if (phase.id === 4 && !includeIPP) return false;
    // Intel IPP is Windows only
    if (phase.id === 4 && platform !== 'windows') return false;
    return true;
  });
}

export default function SetupSummary({
  platform,
  skipPhases,
  includeFaust,
  includeIPP,
  ideVerified,
  ippVerified,
}: SetupSummaryProps) {
  // Filter phases for current platform
  const filteredPhases = setupPhases.filter((phase) => {
    // Intel IPP is Windows only
    if (phase.id === 4 && platform !== 'windows') return false;
    return true;
  });
  
  // Separate manual and automatic phases
  const manualPhases = filteredPhases.filter(phase => isManualPhase(phase, platform));
  const automaticPhases = filteredPhases.filter(phase => !isManualPhase(phase, platform));

  // Determine phase status for automatic phases
  const getPhaseStatus = (phase: SetupPhase): 'run' | 'skip' | 'optional-skip' => {
    // Check if phase is in skip list
    if (skipPhases.includes(phase.id)) {
      return 'skip';
    }
    
    // Check optional phases that user didn't select
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
  
  // Get manual phase status (verified or needs download)
  const getManualPhaseStatus = (phase: SetupPhase): 'verified' | 'needs-download' | 'optional-skip' => {
    // Check if optional and not selected
    if (phase.id === 4 && !includeIPP) return 'optional-skip';
    
    // Check verification status
    if (phase.id === 3) {
      return ideVerified ? 'verified' : 'needs-download';
    }
    if (phase.id === 4) {
      return ippVerified ? 'verified' : 'needs-download';
    }
    
    return 'needs-download';
  };

  const runCount = automaticPhases.filter(p => getPhaseStatus(p) === 'run').length;
  const skipCount = automaticPhases.filter(p => getPhaseStatus(p) !== 'run').length;
  const manualCount = manualPhases.filter(p => getManualPhaseStatus(p) !== 'optional-skip').length;

  return (
    <div className="space-y-4">
      {/* Manual Installation Section */}
      {manualPhases.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-accent" />
              Install Before Running Script
            </h4>
            <div className="text-xs text-gray-500">
              {manualCount} {manualCount === 1 ? 'tool' : 'tools'}
            </div>
          </div>
          
          <div className="space-y-2">
            {manualPhases.map((phase) => {
              const status = getManualPhaseStatus(phase);
              const isSkipped = status === 'optional-skip';
              const isVerified = status === 'verified';
              const downloadUrl = phase.downloadUrls?.[platform];
              const instructions = phase.downloadInstructions?.[platform];
              
              return (
                <div
                  key={phase.id}
                  className={`
                    flex items-center gap-3 p-3 rounded border
                    ${isSkipped 
                      ? 'bg-surface/50 border-border/50' 
                      : isVerified
                        ? 'bg-success/5 border-success/30'
                        : 'bg-accent/5 border-accent/30'
                    }
                  `}
                >
                  <div className="flex-shrink-0">
                    {isVerified ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : isSkipped ? (
                      <SkipForward className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Download className="w-4 h-4 text-accent" />
                    )}
                  </div>
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
                  <div className="flex-shrink-0">
                    {isVerified ? (
                      <span className="text-xs text-success font-medium">Installed</span>
                    ) : isSkipped ? (
                      <span className="text-xs text-gray-500">Skipped</span>
                    ) : downloadUrl ? (
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-accent text-background hover:bg-accent/90 transition-colors"
                      >
                        Download
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          
          <hr className="border-border" />
        </>
      )}
      
      {/* Automatic Script Steps */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-white">Script Steps</h4>
        <div className="text-xs text-gray-500">
          {runCount} to run, {skipCount} skipped
        </div>
      </div>
      
      <div className="space-y-2">
        {automaticPhases.map((phase) => {
          const status = getPhaseStatus(phase);
          const isSkipped = status !== 'run';
          
          return (
            <div
              key={phase.id}
              className={`
                flex items-center gap-3 p-3 rounded border
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
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2 border-t border-border">
        {manualPhases.length > 0 && (
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3 text-accent" />
            <span>Manual Install</span>
          </div>
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
    </div>
  );
}
