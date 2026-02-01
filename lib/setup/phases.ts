export interface Phase {
  id: number;
  name: string;
  description: string;
  required: boolean;
}

export interface PhaseCommand {
  phase: number;
  command: string;
  explanation: string;
}

export const PHASES: Phase[] = [
  { id: 0, name: 'System Detection & Preferences', description: 'Detect system state and gather user preferences', required: false },
  { id: 1, name: 'Platform Detection', description: 'Detect OS, architecture, and disk space', required: true },
  { id: 2, name: 'Git Setup', description: 'Install Git, clone HISE repository, init JUCE submodule', required: true },
  { id: 3, name: 'SDK Installation', description: 'Extract ASIO SDK 2.3 and VST3 SDK', required: true },
  { id: 4, name: 'JUCE Submodule Verification', description: 'Verify JUCE is on juce6 branch', required: true },
  { id: 5, name: 'Faust Installation', description: 'Install Faust DSP compiler', required: false },
  { id: 6, name: 'HISE Compilation', description: 'Compile HISE standalone application', required: true },
  { id: 7, name: 'Add HISE to PATH', description: 'Add HISE binary to system PATH', required: true },
  { id: 8, name: 'Verify Build Configuration', description: 'Run HISE get_build_flags to verify build', required: true },
  { id: 9, name: 'Compile Test Project', description: 'Compile demo project to verify setup', required: true },
  { id: 10, name: 'Success Verification', description: 'Final verification and completion', required: true },
];

export const MOCK_COMMANDS: PhaseCommand[] = [
  {
    phase: 1,
    command: 'systeminfo',
    explanation: 'This command displays detailed Windows system information including OS version, CPU architecture, and available memory. This helps us verify your system meets the requirements for HISE development.',
  },
  {
    phase: 2,
    command: 'git clone https://github.com/christophhart/HISE.git && cd HISE && git checkout develop && git submodule update --init && cd JUCE && git checkout juce6 && cd ..',
    explanation: 'This command clones the HISE repository from GitHub, switches to the develop branch, initializes the JUCE submodule, and checks out the juce6 branch which is required for stable HISE builds.',
  },
];

export type PhaseStatus = 'pending' | 'active' | 'completed';

export interface PhaseStatusInfo {
  phase: number;
  status: PhaseStatus;
}
