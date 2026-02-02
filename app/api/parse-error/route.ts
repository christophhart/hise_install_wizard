import { NextRequest, NextResponse } from 'next/server';
import { ParseErrorRequest, ParseErrorResponse } from '@/types/wizard';

// Common error patterns and their solutions
const ERROR_PATTERNS: Array<{
  pattern: RegExp;
  response: (match: RegExpMatchArray, platform: string) => ParseErrorResponse;
}> = [
  // Git not found
  {
    pattern: /git.*not (found|recognized|installed)/i,
    response: (_, platform) => ({
      cause: 'Git is not installed on your system.',
      explanation: 'Git is required to clone the HISE repository and manage source code.',
      fixCommands: platform === 'windows' 
        ? ['winget install --id Git.Git -e --source winget']
        : platform === 'macos'
          ? ['xcode-select --install']
          : ['sudo apt-get install git'],
      severity: 'high',
      canContinue: true,
    }),
  },
  
  // Visual Studio not found
  {
    pattern: /(msbuild|cl\.exe|visual studio).*not (found|recognized)/i,
    response: () => ({
      cause: 'Visual Studio 2022 is not installed or not properly configured.',
      explanation: 'HISE requires Visual Studio 2022 with the "Desktop development with C++" workload.',
      fixCommands: [
        '# Download Visual Studio 2022 Community from:',
        '# https://visualstudio.microsoft.com/downloads/',
        '# Select "Desktop development with C++" during installation',
      ],
      severity: 'high',
      canContinue: false,
    }),
  },
  
  // Xcode not found
  {
    pattern: /xcodebuild.*not (found|recognized)|xcode.*not installed/i,
    response: () => ({
      cause: 'Xcode or Xcode Command Line Tools are not installed.',
      explanation: 'HISE requires Xcode to compile on macOS.',
      fixCommands: ['xcode-select --install'],
      severity: 'high',
      canContinue: false,
    }),
  },
  
  // GCC version too high
  {
    pattern: /gcc.*(version|>)\s*1[2-9]|gcc-1[2-9]/i,
    response: () => ({
      cause: 'GCC version is too high. HISE requires GCC 11 or earlier.',
      explanation: 'Newer GCC versions have compatibility issues with the HISE codebase.',
      fixCommands: [
        'sudo apt-get install gcc-11 g++-11',
        'sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-11 100',
        'sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-11 100',
      ],
      severity: 'high',
      canContinue: false,
    }),
  },
  
  // Submodule not initialized
  {
    pattern: /juce.*not (found|initialized)|submodule.*not/i,
    response: () => ({
      cause: 'JUCE submodule is not initialized.',
      explanation: 'The JUCE framework needs to be downloaded as a Git submodule.',
      fixCommands: [
        'git submodule update --init',
        'cd JUCE && git checkout juce6 && cd ..',
      ],
      severity: 'medium',
      canContinue: true,
    }),
  },
  
  // Projucer not found
  {
    pattern: /projucer.*not (found|exist)/i,
    response: (_, platform) => ({
      cause: 'Projucer executable not found.',
      explanation: 'Projucer is the JUCE project management tool needed to generate IDE files.',
      fixCommands: platform === 'windows'
        ? ['# Projucer should be at: JUCE\\extras\\Projucer\\Projucer.exe']
        : ['# Build Projucer first, or check the path in the JUCE submodule'],
      severity: 'medium',
      canContinue: false,
    }),
  },
  
  // SDK not found
  {
    pattern: /(asio|vst3).*sdk.*not (found|exist)/i,
    response: () => ({
      cause: 'Required SDK files are missing.',
      explanation: 'The ASIO and VST3 SDKs need to be extracted from tools/SDK/sdk.zip.',
      fixCommands: [
        '# Extract the SDK archive:',
        'unzip tools/SDK/sdk.zip -d tools/SDK/',
      ],
      severity: 'medium',
      canContinue: false,
    }),
  },
  
  // Build failed
  {
    pattern: /build failed|compilation.*failed|error.*c\d+/i,
    response: () => ({
      cause: 'C++ compilation failed.',
      explanation: 'There was an error during the HISE build process. This could be due to missing dependencies, incompatible compiler version, or source code issues.',
      fixCommands: [
        '# Check the error message above for specific details',
        '# Common fixes:',
        '# - Ensure all dependencies are installed',
        '# - Check compiler version compatibility',
        '# - Try cleaning and rebuilding',
      ],
      severity: 'high',
      canContinue: false,
    }),
  },
  
  // Permission denied
  {
    pattern: /permission denied|access.*denied|requires.*admin/i,
    response: (_, platform) => ({
      cause: 'Permission denied - administrator privileges required.',
      explanation: 'Some operations require elevated permissions.',
      fixCommands: platform === 'windows'
        ? ['# Run PowerShell as Administrator']
        : ['# Use sudo for commands that modify system directories'],
      severity: 'medium',
      canContinue: true,
    }),
  },
  
  // Faust not found
  {
    pattern: /faust.*not (found|installed)|libfaust/i,
    response: (_, platform) => ({
      cause: 'Faust is not installed or not properly configured.',
      explanation: 'If you selected Faust support, it needs to be installed before building.',
      fixCommands: platform === 'windows'
        ? ['# Download from: https://github.com/grame-cncm/faust/releases', '# Install Faust-2.XX.X-win64.exe']
        : platform === 'linux'
          ? ['sudo apt-get install faust libfaust-dev']
          : ['# Download from: https://github.com/grame-cncm/faust/releases', '# Extract to: {hisePath}/tools/faust/'],
      severity: 'medium',
      canContinue: true,
    }),
  },
  
  // Intel IPP not found
  {
    pattern: /ipp.*not (found|installed)|intel.*ipp/i,
    response: () => ({
      cause: 'Intel IPP is not installed.',
      explanation: 'Intel Performance Primitives needs to be installed for IPP support.',
      fixCommands: [
        '# Download from: https://registrationcenter-download.intel.com/...',
        '# Run the installer with: intel-ipp-installer.exe -s -a --silent --eula accept',
      ],
      severity: 'low',
      canContinue: true,
    }),
  },
];

// Default response for unknown errors
function getDefaultResponse(error: string): ParseErrorResponse {
  return {
    cause: 'Unable to automatically identify the error.',
    explanation: `The error message doesn't match any known patterns. Please check the HISE documentation or forum for help with this specific issue.`,
    fixCommands: [],
    severity: 'medium',
    canContinue: false,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ParseErrorRequest = await request.json();
    
    if (!body.error) {
      return NextResponse.json(
        { error: 'Missing required field: error' },
        { status: 400 }
      );
    }
    
    const platform = body.platform || 'windows';
    const errorText = body.error.toLowerCase();
    
    // Try to match against known patterns
    for (const { pattern, response } of ERROR_PATTERNS) {
      const match = errorText.match(pattern);
      if (match) {
        return NextResponse.json(response(match, platform));
      }
    }
    
    // Return default response if no pattern matches
    return NextResponse.json(getDefaultResponse(body.error));
    
  } catch (error) {
    console.error('Error parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse error' },
      { status: 500 }
    );
  }
}
