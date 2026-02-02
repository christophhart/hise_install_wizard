# HISE Setup Wizard

A web-based wizard that generates platform-specific setup scripts for [HISE](https://hise.dev) (Hart Instruments Software Environment). Configure your preferences through an intuitive interface and download a customized script to automate the entire build process.

## Why Use This?

Setting up HISE from source can be challenging, especially for newcomers. This wizard solves common pain points:

- **Smart Version Selection** - Automatically checks CI build status and uses the last known working commit if the latest is broken. No more pulling broken code.

- **Auto-Detect Components** - Detects already-installed tools like Git, compilers, and Faust, then skips unnecessary setup steps.

- **Cross-Platform Support** - Native scripts for Windows (PowerShell), macOS (x64 & ARM64), and Linux (Bash). No extra tools needed.

- **Built-in Error Handling** - Scripts include error detection with colored output and links to troubleshooting resources.

## Supported Platforms

| Platform | Script Type | Architectures |
|----------|-------------|---------------|
| Windows  | PowerShell  | x64           |
| macOS    | Bash        | x64, ARM64    |
| Linux    | Bash        | x64           |

## How It Works

1. **Configure** - Select your platform, choose an install path, and indicate which components are already installed.

2. **Download** - Get a script tailored to your system. Review the setup summary before running.

3. **Run** - Execute the script in your terminal. It handles everything automatically with progress updates.

## Features

### New Installation

For users setting up HISE for the first time:

- Installs Git (if needed)
- Clones the HISE repository
- Sets up JUCE submodule
- Extracts SDKs
- Optionally installs Faust DSP compiler
- Optionally installs Intel IPP (Windows)
- Compiles HISE
- Adds HISE to your PATH
- Verifies the build
- Runs a test project export

### Update Existing Installation

For users who already have HISE installed:

- Detects your existing HISE installation path
- Pulls the latest working changes
- Recompiles with your existing configuration (Faust support preserved)
- Verifies the updated build

### EZ Mode / Dev Mode

Toggle between two explanation styles:

- **EZ Mode** - Detailed explanations for beginners new to development environments
- **Dev Mode** - Concise, technical information for experienced developers

## Getting Started

### Using the Hosted Version

Visit the deployed wizard at [your-deployment-url] and follow the on-screen instructions.

### Running Locally

```bash
# Clone the repository
git clone https://github.com/your-username/hise-setup-wizard.git
cd hise-setup-wizard

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: lucide-react

## Project Structure

```
hise-setup-wizard/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── setup/              # New installation flow
│   ├── update/             # Update existing installation flow
│   └── api/                # API routes for script generation
├── components/             # React components
│   ├── wizard/             # Wizard-specific components
│   ├── ui/                 # Reusable UI components
│   └── layout/             # Layout components
├── lib/                    # Utilities and script templates
│   ├── github.ts           # GitHub API for CI status
│   └── scripts/            # Script generation logic
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript type definitions
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Testing Scripts

If you'd like to help test the generated scripts:

1. Generate a script for your platform
2. Run it in a VM or test environment
3. Report any issues with:
   - Your platform and version
   - The phase where the error occurred
   - The error message
   - Any relevant system information

## License

[Add your license here]

## Links

- [HISE Documentation](https://docs.hise.dev)
- [HISE Forum](https://forum.hise.audio)
- [HISE GitHub Repository](https://github.com/christophhart/HISE)
