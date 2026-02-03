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
      easy: 'Toggle off any components you already have installed to skip them. Use the Auto-Detect feature to automatically detect what\'s on your system, or adjust the toggles manually. The status badges show what the script will do for each component.',
      dev: 'Toggle off installed components to skip them. Use Auto-Detect or adjust manually. Optional components require enabling "Install during setup".',
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
      dev: 'Visual Studio 2026 (Windows), Xcode (macOS), or GCC (Linux)',
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
    easy: 'Your custom installation script is ready to install HISE to this location:',
    dev: 'Script configured to install HISE to this location:',
  } as ModeContent,
  
  stepsExplanation: {
    easy: 'Before running the script, make sure to install the required development tools listed in the "Install Before Running Script" section above. Then the script will automatically perform the remaining steps. Items marked with a green checkmark will be skipped because those components are already installed.',
    dev: 'Install manual prerequisites first, then run the script. Detected components will be skipped.',
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
// Regenerate Info (for Download button area)
// ============================================================================

export const regenerateInfo = {
  title: {
    easy: 'Why Regenerate?',
    dev: 'Regenerate Script',
  } as ModeContent,
  
  description: {
    easy: 'Each download creates a file with a unique timestamp in its name. If you need to download the script again (for example, to try on another computer or after making configuration changes), click Regenerate first. This creates a fresh script with a new filename so your downloads stay organized and you always know which version is which.',
    dev: 'Generates a new script with a fresh timestamp. Click before re-downloading to avoid filename conflicts.',
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
          easy: 'Install Visual Studio 2026 (if not already installed)',
          dev: 'Install VS2026 prerequisites',
        },
        description: {
          easy: 'Download and install Visual Studio 2026 Community from the link above. Make sure to select "Desktop development with C++" during installation.',
          dev: 'Desktop development with C++ workload required',
        },
      },
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
          easy: 'Install Xcode Command Line Tools (if not already installed)',
          dev: 'Install Xcode CLT',
        },
        description: {
          easy: 'Open Terminal and run: xcode-select --install. Or download Xcode from the App Store.',
          dev: 'Run: xcode-select --install',
        },
      },
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

// ============================================================================
// Update Page Content
// ============================================================================

export const updatePage = {
  title: {
    easy: 'Update HISE',
    dev: 'Update HISE',
  } as ModeContent,
  
  description: {
    easy: 'Already have HISE installed? This will detect your installation and generate a script to pull the latest changes and recompile.',
    dev: 'Generate update script to pull latest and recompile.',
  } as ModeContent,
  
  detectSection: {
    title: {
      easy: 'Detect HISE Installation',
      dev: 'Detect Installation',
    } as ModeContent,
    
    description: {
      easy: 'Run this script in your terminal to find your HISE installation:',
      dev: 'Run to detect HISE path:',
    } as ModeContent,
    
    pasteLabel: {
      easy: 'Paste the result here:',
      dev: 'Paste output:',
    } as ModeContent,
    
    placeholder: {
      easy: 'After running the command, paste the result here',
      dev: 'e.g., C:\\HISE,valid,faust',
    } as ModeContent,
  },
  
  pathStatus: {
    valid: {
      easy: 'Valid HISE repository found!',
      dev: 'Valid repo',
    } as ModeContent,
    
    invalid: {
      easy: 'Path found but it doesn\'t appear to be a valid HISE git repository.',
      dev: 'Invalid repo - .git not found',
    } as ModeContent,
    
    notFound: {
      easy: 'HISE not found in your PATH. Have you completed the initial setup?',
      dev: 'HISE not in PATH',
    } as ModeContent,
  },
  
  faustStatus: {
    enabled: {
      easy: 'Faust support detected - update will preserve this.',
      dev: 'Faust: enabled',
    } as ModeContent,
    
    disabled: {
      easy: 'Standard build detected (no Faust).',
      dev: 'Faust: disabled',
    } as ModeContent,
  },
};

export const updateGeneratePage = {
  title: {
    easy: 'Your Update Script',
    dev: 'Update Script',
  } as ModeContent,
  
  description: {
    easy: 'Your update script is ready. It will pull the latest HISE changes and recompile.',
    dev: 'Script will pull and recompile.',
  } as ModeContent,
  
  stepsExplanation: {
    easy: 'The script will perform these steps:',
    dev: 'Update phases:',
  } as ModeContent,
};

// Simplified "How to Run" for update mode
interface UpdateHowToRunStep {
  title: ModeContent;
  command?: ModeContent;
}

export const updateHowToRun: Record<Exclude<Platform, null>, { steps: UpdateHowToRunStep[] }> = {
  windows: {
    steps: [
      {
        title: {
          easy: 'Open PowerShell as Administrator',
          dev: 'Admin PowerShell',
        },
      },
      {
        title: {
          easy: 'Allow script execution for this session',
          dev: 'Set execution policy',
        },
        command: {
          easy: 'Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process',
          dev: 'Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process',
        },
      },
      {
        title: {
          easy: 'Run this command to execute the script',
          dev: 'Run script',
        },
        command: {
          easy: (filename: string) => `cd $HOME\\Downloads; .\\"${filename}"`,
          dev: (filename: string) => `cd $HOME\\Downloads; .\\"${filename}"`,
        },
      },
    ],
  },
  macos: {
    steps: [
      {
        title: {
          easy: 'Open Terminal',
          dev: 'Terminal',
        },
      },
      {
        title: {
          easy: 'Run this command to execute the script',
          dev: 'Run script',
        },
        command: {
          easy: (filename: string) => `cd ~/Downloads && chmod +x "${filename}" && ./"${filename}"`,
          dev: (filename: string) => `cd ~/Downloads && chmod +x "${filename}" && ./"${filename}"`,
        },
      },
    ],
  },
  linux: {
    steps: [
      {
        title: {
          easy: 'Open Terminal',
          dev: 'Terminal',
        },
      },
      {
        title: {
          easy: 'Run this command to execute the script',
          dev: 'Run script',
        },
        command: {
          easy: (filename: string) => `cd ~/Downloads && chmod +x "${filename}" && ./"${filename}"`,
          dev: (filename: string) => `cd ~/Downloads && chmod +x "${filename}" && ./"${filename}"`,
        },
      },
    ],
  },
};

// Update phases for summary display
export const updatePhases = [
  {
    id: 1,
    name: {
      easy: 'Validate Installation',
      dev: 'Validate',
    } as ModeContent,
    description: {
      easy: 'Check that the HISE path is valid',
      dev: 'Verify .git and JUCE exist',
    } as ModeContent,
  },
  {
    id: 2,
    name: {
      easy: 'Update Repository',
      dev: 'Git Pull',
    } as ModeContent,
    description: {
      easy: 'Pull latest changes and update submodules',
      dev: 'git pull, submodule update, JUCE juce6',
    } as ModeContent,
  },
  {
    id: 3,
    name: {
      easy: 'Compile HISE',
      dev: 'Compile',
    } as ModeContent,
    description: {
      easy: 'Rebuild HISE with the updated code',
      dev: 'Projucer + build',
    } as ModeContent,
  },
  {
    id: 4,
    name: {
      easy: 'Verify Build',
      dev: 'Verify',
    } as ModeContent,
    description: {
      easy: 'Check that the build completed successfully',
      dev: 'get_build_flags',
    } as ModeContent,
  },
  {
    id: 5,
    name: {
      easy: 'Test Project',
      dev: 'Test',
    } as ModeContent,
    description: {
      easy: 'Verify HISE can export and compile a demo project',
      dev: 'export_ci -nolto + batch compile',
    } as ModeContent,
  },
];
