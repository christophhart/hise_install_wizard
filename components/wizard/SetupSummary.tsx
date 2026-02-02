'use client';

import { Platform } from '@/types/wizard';
import { Check, SkipForward, Circle } from 'lucide-react';

interface SetupPhase {
  id: number;
  name: string;
  description: string;
  required: boolean;
  // Phases that are always included (can't be skipped by user detection)
  alwaysRun?: boolean;
}

// All setup phases from the documentation
const setupPhases: SetupPhase[] = [
  {
    id: 2,
    name: 'Git & Repository Setup',
    description: 'Clone HISE repository and initialize JUCE submodule',
    required: true,
  },
  {
    id: 3,
    name: 'C++ Compiler',
    description: 'Install Visual Studio 2022 (Windows), Xcode (macOS), or GCC (Linux)',
    required: true,
  },
  {
    id: 4,
    name: 'Intel IPP',
    description: 'Install Intel Performance Primitives for optimized audio processing',
    required: false,
  },
  {
    id: 5,
    name: 'Faust DSP Compiler',
    description: 'Install Faust for DSP development support',
    required: false,
  },
  {
    id: 6,
    name: 'Repository Check',
    description: 'Verify JUCE submodule and extract SDKs',
    required: true,
  },
  {
    id: 7,
    name: 'Compile HISE',
    description: 'Build the HISE standalone application (5-15 minutes)',
    required: true,
    alwaysRun: true,
  },
  {
    id: 8,
    name: 'Add to PATH',
    description: 'Add HISE binary to system PATH for command-line access',
    required: true,
    alwaysRun: true,
  },
  {
    id: 9,
    name: 'Verify Build',
    description: 'Run HISE get_build_flags to verify installation',
    required: true,
    alwaysRun: true,
  },
  {
    id: 10,
    name: 'Test Project',
    description: 'Compile demo project to verify complete setup',
    required: true,
    alwaysRun: true,
  },
];

interface SetupSummaryProps {
  platform: Exclude<Platform, null>;
  skipPhases: number[];
  includeFaust: boolean;
  includeIPP: boolean;
}

export default function SetupSummary({
  platform,
  skipPhases,
  includeFaust,
  includeIPP,
}: SetupSummaryProps) {
  // Filter phases for current platform
  const filteredPhases = setupPhases.filter((phase) => {
    // Intel IPP is Windows only
    if (phase.id === 4 && platform !== 'windows') return false;
    return true;
  });

  // Determine phase status
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

  const runCount = filteredPhases.filter(p => getPhaseStatus(p) === 'run').length;
  const skipCount = filteredPhases.filter(p => getPhaseStatus(p) !== 'run').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-white">Setup Steps</h4>
        <div className="text-xs text-gray-500">
          {runCount} to run, {skipCount} skipped
        </div>
      </div>
      
      <div className="space-y-2">
        {filteredPhases.map((phase) => {
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
      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-border">
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
          <span>Skipped (Optional)</span>
        </div>
      </div>
    </div>
  );
}
