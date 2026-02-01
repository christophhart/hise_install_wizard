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
  { id: 3, name: 'Visual Studio 2026 Installation', description: 'Install Visual Studio 2026 Community with C++ workload', required: true },
  { id: 4, name: 'JUCE Submodule Verification', description: 'Verify JUCE is on juce6 branch', required: true },
  { id: 5, name: 'SDK Installation', description: 'Extract ASIO SDK 2.3 and VST3 SDK', required: true },
  { id: 6, name: 'Intel IPP Installation', description: 'Install Intel IPP oneAPI for performance optimization', required: false },
  { id: 7, name: 'Faust Installation', description: 'Install Faust DSP compiler', required: false },
  { id: 8, name: 'HISE Compilation', description: 'Compile HISE standalone application', required: true },
  { id: 9, name: 'Add HISE to PATH', description: 'Add HISE binary to system PATH', required: true },
  { id: 10, name: 'Verify Build Configuration', description: 'Run HISE get_build_flags to verify build', required: true },
  { id: 11, name: 'Compile Test Project', description: 'Compile demo project to verify setup', required: true },
  { id: 12, name: 'Success Verification', description: 'Final verification and completion', required: true },
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
  {
    phase: 3,
    command: 'REM Download Visual Studio 2026 Community from https://visualstudio.microsoft.com/downloads/ and select "Desktop development with C++" workload during installation',
    explanation: 'Visual Studio 2026 is required to compile HISE. The installer will download the necessary C++ build tools and libraries. This is a critical dependency that cannot be skipped.',
  },
  {
    phase: 4,
    command: 'cd {installLocation}\\HISE && cd JUCE && git status && git branch --show-current',
    explanation: 'This command verifies that the JUCE submodule is properly initialized and checked out to the juce6 branch. The juce6 branch is required for stable HISE builds.',
  },
  {
    phase: 5,
    command: 'cd {installLocation}\\HISE && unzip tools/SDK/sdk.zip -d tools/SDK/',
    explanation: 'This command extracts the required SDK files from the HISE repository. The SDKs include ASIO SDK 2.3 for low-latency audio and VST3 SDK for plugin development.',
  },
  {
    phase: 6,
    command: 'REM Download Intel IPP oneAPI 2022.3.1.10 from https://registrationcenter-download.intel.com/akdlm/IRC_NAS/9c651894-4548-491c-b69f-49e84b530c1d/intel-ipp-2022.3.1.10_offline.exe and run the installer with Visual Studio integration',
    explanation: 'Intel IPP (Intel Integrated Performance Primitives) is a library of highly optimized functions for image processing, signal processing, and data compression. It significantly improves HISE performance.',
  },
  {
    phase: 7,
    command: 'curl -L -o "%TEMP%\\faust-installer.exe" "https://github.com/grame-cncm/faust/releases/latest/download/Faust-2.54.0-win64.exe" && "%TEMP%\\faust-installer.exe"',
    explanation: 'Faust is a functional programming language for signal processing. Installing Faust enables HISE to compile Faust scripts at runtime, which is useful for dynamic DSP algorithms.',
  },
  {
    phase: 8,
    command: 'cd {installLocation}\\HISE\\projects\\standalone && "{installLocation}\\HISE\\JUCE\\Projucer\\Projucer.exe" --resave "HISE Standalone.jucer" && "C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\MSBuild\\Current\\Bin\\MsBuild.exe" "Builds\\VisualStudio2026\\HISE Standalone.sln" /p:Configuration=Release /p:PreferredToolArchitecture=x64 /verbosity:minimal',
    explanation: 'This command compiles the HISE standalone application. The Projucer generates the Visual Studio project files, and MSBuild compiles the application. This process can take 5-15 minutes depending on your system.',
  },
  {
    phase: 9,
    command: 'setx PATH "%PATH%;{installLocation}\\HISE\\projects\\standalone\\Builds\\VisualStudio2026\\x64\\Release\\App"',
    explanation: 'This command adds the HISE binary directory to your system PATH environment variable. This allows you to run HISE from any terminal window without specifying the full path.',
  },
  {
    phase: 10,
    command: 'HISE get_build_flags',
    explanation: 'This command displays the current build configuration and feature flags. It verifies that HISE was compiled with the correct settings (Release configuration, IPP support, Faust support) matching your Phase 0 preferences.',
  },
  {
    phase: 11,
    command: 'HISE set_project_folder -p:"{installLocation}\\HISE\\extras\\demo_project" && HISE export_ci "XmlPresetBackups\\Demo.xml" -t:standalone -a:x64',
    explanation: 'This command compiles a test demo project to verify that your HISE development environment is fully configured and working correctly. It tests project loading, compilation, and export functionality.',
  },
];

export type PhaseStatus = 'pending' | 'active' | 'completed';

export interface PhaseStatusInfo {
  phase: number;
  status: PhaseStatus;
}
