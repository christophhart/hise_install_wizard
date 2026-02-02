import { ExplanationMode, Platform } from '@/types/wizard';

/**
 * Mode-aware content strings for Easy Mode and Dev Mode.
 * Easy Mode: Detailed explanations for beginners new to development environments.
 * Dev Mode: Concise, technical information for experienced developers.
 */

interface ModeContent {
  easy: string;
  dev: string;
}

interface PlatformModeContent {
  easy: Record<Exclude<Platform, null>, string>;
  dev: Record<Exclude<Platform, null>, string>;
}

// ============================================================================
// Setup Page Content
// ============================================================================

export const setupPage = {
  // Page header
  title: {
    easy: 'Setup Configuration',
    dev: 'Setup Configuration',
  } as ModeContent,
  
  description: {
    easy: 'This wizard will help you generate a custom script to install HISE and all its dependencies. Just follow the steps below - we\'ll guide you through each one.',
    dev: 'Configure your system and preferences to generate a customized setup script.',
  } as ModeContent,
  
  // Section headers
  platformSection: {
    title: {
      easy: 'Platform',
      dev: 'Platform',
    } as ModeContent,
    description: {
      easy: 'First, let\'s confirm which operating system you\'re using. The script will be customized for your specific platform.',
      dev: 'Select your operating system',
    } as ModeContent,
  },
  
  installPathSection: {
    title: {
      easy: 'Installation Path',
      dev: 'Installation Path',
    } as ModeContent,
    description: {
      easy: 'Choose where HISE will be installed on your computer. This folder will contain all HISE files, including the source code and compiled application. Make sure you have write access to this location.',
      dev: 'Base directory for HISE repository and build artifacts',
    } as ModeContent,
  },
  
  componentsSection: {
    title: {
      easy: 'Components',
      dev: 'Components',
    } as ModeContent,
    description: {
      easy: 'Check the boxes for any tools you already have installed on your computer. This helps us skip unnecessary steps and make the installation faster. Don\'t worry if you\'re not sure - leaving them unchecked just means the script will install them for you.',
      dev: 'Check any components you already have installed. The script will skip those steps. For optional components (Faust, Intel IPP), check "Install during setup" if you want them included.',
    } as ModeContent,
  },
};

// ============================================================================
// Component Descriptions
// ============================================================================

interface ComponentContent {
  label: string;
  description: ModeContent;
}

export const components: Record<string, ComponentContent> = {
  git: {
    label: 'Git',
    description: {
      easy: 'A tool that developers use to track changes in code and download projects from the internet. Required to download the HISE source code.',
      dev: 'Version control system',
    },
  },
  compiler: {
    label: 'C++ Compiler',
    description: {
      easy: 'Software that converts the HISE source code into a working application. On Windows this is Visual Studio, on macOS it\'s Xcode, and on Linux it\'s GCC.',
      dev: 'Visual Studio 2022 (Windows), Xcode (macOS), or GCC (Linux)',
    },
  },
  hiseRepo: {
    label: 'HISE Repository',
    description: {
      easy: 'The HISE source code files downloaded to your computer. If you\'ve already cloned the repository, check this box.',
      dev: 'HISE source code already cloned',
    },
  },
  juce: {
    label: 'JUCE Submodule',
    description: {
      easy: 'JUCE is an audio framework that HISE is built on. It needs to be downloaded separately and set to a specific version (juce6 branch).',
      dev: 'JUCE framework initialized on juce6 branch',
    },
  },
  sdks: {
    label: 'SDKs Extracted',
    description: {
      easy: 'Software Development Kits (SDKs) for audio plugins. These include ASIO for audio drivers and VST3 for plugin formats.',
      dev: 'ASIO and VST3 SDKs in tools/SDK/',
    },
  },
  faust: {
    label: 'Faust DSP Compiler',
    description: {
      easy: 'An optional tool for writing audio effects using a special programming language. Only needed if you plan to use Faust for DSP development.',
      dev: 'Optional: Enables Faust JIT compilation for DSP development',
    },
  },
  intelIPP: {
    label: 'Intel IPP',
    description: {
      easy: 'Intel\'s optimized audio processing library. Optional but recommended for better performance on Windows. Makes audio processing faster.',
      dev: 'Optional: Intel Performance Primitives for optimized audio processing',
    },
  },
};

// ============================================================================
// Auto-Detect Section
// ============================================================================

export const autoDetect = {
  title: {
    easy: 'Auto-Detect Components',
    dev: 'Auto-Detect Components',
  } as ModeContent,
  
  howItWorks: {
    easy: {
      title: 'How to use this feature',
      intro: 'Instead of checking each box manually, you can run a quick command that automatically detects what\'s already installed on your computer:',
      steps: [
        'Copy the command below by clicking the copy button',
        'Open your terminal application (PowerShell on Windows, Terminal on Mac/Linux)',
        'Paste the command and press Enter',
        'Copy the result that appears (it will look like: git,compiler,hiseRepo)',
        'Paste it in the input box below and click "Apply"',
        'The checkboxes will automatically update to match what\'s installed',
      ],
    },
    dev: {
      title: 'How it works',
      intro: '',
      steps: [
        'Copy the detection script below',
        'Run it in your terminal',
        'Paste the output in the input field and click Apply',
        'Checkboxes will be updated based on the result',
      ],
    },
  },
  
  scriptLabel: {
    easy: 'Copy and run this command in your terminal:',
    dev: 'Detection script:',
  } as ModeContent,
  
  pasteLabel: {
    easy: 'Paste the result here:',
    dev: 'Paste output:',
  } as ModeContent,
  
  placeholder: {
    easy: 'After running the command, paste the result here (e.g., git,compiler,hiseRepo)',
    dev: 'e.g., git,compiler,hiseRepo,juce,sdks',
  } as ModeContent,
};

// ============================================================================
// Generate Page Content
// ============================================================================

export const generatePage = {
  title: {
    easy: 'Your Setup Script',
    dev: 'Your Setup Script',
  } as ModeContent,
  
  description: {
    easy: 'Your custom installation script is ready! Download it and follow the instructions below to install HISE on your computer.',
    dev: 'Download and run this script to set up HISE on your system.',
  } as ModeContent,
  
  downloadButton: {
    easy: 'Download Script',
    dev: 'Download',
  } as ModeContent,
  
  helpLink: {
    easy: 'If something goes wrong while running the script, don\'t worry! Visit our Help page where we can analyze the error and suggest solutions.',
    dev: 'If you encounter any errors while running the script, visit the Help page to get assistance.',
  } as ModeContent,
};

// ============================================================================
// How to Run Instructions
// ============================================================================

interface ModeContentOptional {
  easy: string;
  dev: string | null;
}

interface HowToRunStep {
  title: ModeContent;
  description?: ModeContentOptional;
}

export const howToRun: Record<Exclude<Platform, null>, { steps: HowToRunStep[] }> = {
  windows: {
    steps: [
      {
        title: {
          easy: 'Open PowerShell as Administrator',
          dev: 'Open PowerShell as Administrator',
        },
        description: {
          easy: 'Right-click the Start menu and select "Windows PowerShell (Admin)" or "Terminal (Admin)". The script needs admin rights to install software.',
          dev: 'Required for software installation',
        },
      },
      {
        title: {
          easy: 'Navigate to your Downloads folder',
          dev: 'Navigate to Downloads',
        },
        description: {
          easy: 'This is where your browser saved the script file.',
          dev: null,
        },
      },
      {
        title: {
          easy: 'Allow script execution (if needed)',
          dev: 'Set execution policy',
        },
        description: {
          easy: 'Windows blocks scripts by default for security. This command allows your user account to run downloaded scripts.',
          dev: 'Allows running local scripts',
        },
      },
      {
        title: {
          easy: 'Run the script',
          dev: 'Run script',
        },
        description: {
          easy: 'This starts the installation process. Follow any prompts that appear.',
          dev: null,
        },
      },
    ],
  },
  macos: {
    steps: [
      {
        title: {
          easy: 'Open Terminal',
          dev: 'Open Terminal',
        },
        description: {
          easy: 'You can find Terminal in Applications > Utilities, or search for it using Spotlight (Cmd+Space).',
          dev: null,
        },
      },
      {
        title: {
          easy: 'Navigate to your Downloads folder',
          dev: 'Navigate to Downloads',
        },
        description: {
          easy: 'This is where your browser saved the script file.',
          dev: null,
        },
      },
      {
        title: {
          easy: 'Make the script executable',
          dev: 'Make executable',
        },
        description: {
          easy: 'This gives the script permission to run. It\'s a security measure on macOS.',
          dev: 'Set execute permission',
        },
      },
      {
        title: {
          easy: 'Run the script',
          dev: 'Run script',
        },
        description: {
          easy: 'This starts the installation process. You may be asked for your password.',
          dev: null,
        },
      },
    ],
  },
  linux: {
    steps: [
      {
        title: {
          easy: 'Open Terminal',
          dev: 'Open Terminal',
        },
        description: {
          easy: 'Use your distribution\'s terminal application (usually Ctrl+Alt+T).',
          dev: null,
        },
      },
      {
        title: {
          easy: 'Navigate to your Downloads folder',
          dev: 'Navigate to Downloads',
        },
        description: {
          easy: 'This is where your browser saved the script file.',
          dev: null,
        },
      },
      {
        title: {
          easy: 'Make the script executable',
          dev: 'Make executable',
        },
        description: {
          easy: 'This gives the script permission to run. It\'s a security measure on Linux.',
          dev: 'Set execute permission',
        },
      },
      {
        title: {
          easy: 'Run the script',
          dev: 'Run script',
        },
        description: {
          easy: 'This starts the installation process. You may be asked for your sudo password.',
          dev: null,
        },
      },
    ],
  },
};

// ============================================================================
// Alerts and Tips
// ============================================================================

export const alerts = {
  windowsAdmin: {
    easy: 'Important: Make sure to run PowerShell as Administrator. Without admin rights, the script won\'t be able to install software like Visual Studio or Git.',
    dev: 'Make sure to run PowerShell as Administrator for the script to work correctly.',
  } as ModeContent,
  
  verifyCommands: {
    easy: 'Not sure if something is installed? Expand "Show verification commands" below each component to get a command you can run to check.',
    dev: 'Use verification commands to confirm component installation status.',
  } as ModeContent,
};

// ============================================================================
// Helper function to get content based on mode
// ============================================================================

export function getContent<T extends ModeContent | PlatformModeContent>(
  content: T,
  mode: ExplanationMode
): T extends PlatformModeContent ? Record<Exclude<Platform, null>, string> : string {
  return content[mode] as any;
}

export function getContentForPlatform(
  content: PlatformModeContent,
  mode: ExplanationMode,
  platform: Exclude<Platform, null>
): string {
  return content[mode][platform];
}
