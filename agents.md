# HISE Setup Wizard - Agent Documentation

## Project Overview

A web-based wizard application that helps HISE developers setup their computer to compile HISE and export audio plugins. The app guides users through a 10-phase setup process with LLM-powered command generation and error handling.

**Current Focus:** Windows platform (macOS/Linux to follow)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend Framework** | Next.js 14+ (App Router) | React framework with SSR/API routes |
| **Language** | TypeScript | Type safety and better DX |
| **UI Library** | shadcn/ui | Accessible, customizable component library |
| **Styling** | TailwindCSS | Utility-first CSS framework |
| **State Management** | React Context | Wizard session state (no persistence) |
| **LLM Provider** | OpenRouter API | GLM 4.7 via OpenRouter |
| **Markdown** | react-markdown | For documentation display |
| **Deployment** | Vercel/Netlify | Serverless deployment platform |
| **Terminal Interaction** | Copy-paste | Users manually copy commands to terminal |

---

## Project Structure

```
hise-install-wizard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page
│   │   ├── setup/
│   │   │   ├── page.tsx              # Phase 0: System detection & preferences
│   │   │   └── [phase]/page.tsx      # Individual phase pages (1-10)
│   │   └── api/                      # API routes
│   │       ├── setup/
│   │       │   ├── detect-system/route.ts    # Auto-detect system & completed phases
│   │       │   ├── generate-plan/route.ts    # Generate setup plan
│   │       │   ├── generate-command/route.ts # Generate command for current step
│   │       │   └── parse-error/route.ts      # LLM error analysis
│   │       └── llm/
│   │           └── chat/route.ts             # Direct LLM access
│   │
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── SetupWizard.tsx        # Main wizard container
│   │   │   ├── PhaseStepper.tsx       # Progress stepper component
│   │   │   ├── CommandBlock.tsx        # Code block with copy functionality
│   │   │   ├── SystemDetection.tsx     # Auto-detection results display
│   │   │   ├── StepExplanation.tsx     # Explains what each step does
│   │   │   └── ErrorAssistant.tsx     # LLM-powered error help
│   │   ├── ui/                         # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── stepper.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── badge.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── llm/
│   │   │   ├── openRouter.ts          # OpenRouter API client
│   │   │   ├── prompts.ts             # Prompt templates
│   │   │   └── parsers.ts             # Response parsers
│   │   ├── setup/
│   │   │   ├── phases.ts              # Phase definitions & data
│   │   │   ├── commands.ts            # Command templates
│   │   │   ├── validation.ts          # Validation logic
│   │   │   └── detection.ts           # System detection functions
│   │   └── utils/
│   │       └── platform.ts            # Platform detection utilities
│   │
│   └── contexts/
│       └── WizardContext.tsx          # React Context for wizard state
│
├── public/                           # Static assets
├── hise-setup-windows.md             # Windows setup documentation
├── hise-setup-macos.md                # macOS setup documentation (future)
├── hise-setup-linux.md                # Linux setup documentation (future)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local                        # OpenRouter API key (gitignored)
```

---

## Phase Definitions

| Phase | Name | Required | Description |
|-------|------|----------|-------------|
| 0 | System Detection & Preferences | - | Detect system state, completed phases, gather user preferences |
| 1 | Platform Detection | ✓ | Detect OS, architecture, disk space |
| 2 | Git Setup | ✓ | Install Git, clone HISE repository, init JUCE submodule |
| 3 | SDK Installation | ✓ | Extract ASIO SDK 2.3 and VST3 SDK |
| 4 | JUCE Submodule Verification | ✓ | Verify JUCE is on juce6 branch |
| 5 | Faust Installation | ○ | Optional: Install Faust DSP compiler |
| 6 | HISE Compilation | ✓ | Compile HISE standalone application |
| 7 | Add HISE to PATH | ✓ | Add HISE binary to system PATH |
| 8 | Verify Build Configuration | ✓ | Run `HISE get_build_flags` to verify build |
| 9 | Compile Test Project | ✓ | Compile demo project to verify setup |
| 10 | Success Verification | ✓ | Final verification and completion |

---

## System Detection Logic

**Important:** Each phase is checked **independently**. No assumptions are made about previous phases being complete.

```typescript
async function detectAllPhases(): Promise<PhaseStatus[]> {
  const checks = await Promise.all([
    checkPlatform(),           // Phase 1
    checkGitInstall(),         // Phase 2
    checkSDKsExtracted(),      // Phase 3
    checkJUCEInitialized(),    // Phase 4
    checkFaustInstalled(),     // Phase 5 (optional)
    checkHISECompiled(),       // Phase 6
    checkHISEInPATH(),         // Phase 7
    checkBuildFlags(),         // Phase 8
    checkTestProject(),        // Phase 9
  ]);

  return checks.map((status, index) => ({
    phase: index + 1,
    name: PHASE_NAMES[index],
    status: status ? 'completed' : 'pending',
    isRequired: REQUIRED_PHASES.includes(index + 1)
  }));
}
```

### Detection Functions

| Function | Purpose |
|----------|---------|
| `checkPlatform()` | Verify OS is Windows 7+ x64, detect architecture |
| `checkGitInstall()` | Check if Git is installed and accessible |
| `checkSDKsExtracted()` | Verify ASIO SDK and VST3 SDK directories exist |
| `checkJUCEInitialized()` | Verify JUCE submodule is initialized on juce6 branch |
| `checkFaustInstalled()` | Check if Faust is installed at `C:\Program Files\Faust\` |
| `checkHISECompiled()` | Verify HISE.exe exists and is > 10MB |
| `checkHISEInPATH()` | Check if HISE binary directory is in PATH |
| `checkBuildFlags()` | Run `HISE get_build_flags` and validate output |
| `checkTestProject()` | Verify demo project compiles successfully |

---

## API Routes

### `/api/setup/detect-system`
- **Method:** POST
- **Input:** `{ platform?: string }` (optional, defaults to client platform)
- **Output:**
  ```typescript
  {
    platform: 'windows' | 'macos' | 'linux';
    architecture: 'x64' | 'arm64';
    phases: PhaseStatus[];
    detectedComponents: {
      visualStudio?: 'vs2026' | null;
      git?: boolean;
      intelIPP?: boolean;
      faust?: boolean;
    };
  }
  ```

### `/api/setup/generate-plan`
- **Method:** POST
- **Input:**
  ```typescript
  {
    detectedPhases: PhaseStatus[];
    preferences: {
      installLocation: string;
      includeIntelIPP: boolean;
      includeFaust: boolean;
    };
  }
  ```
- **Output:** Customized setup plan with first incomplete phase

### `/api/setup/generate-command`
- **Method:** POST
- **Input:**
  ```typescript
  {
    phase: number;
    context: {
      platform: string;
      installLocation: string;
      includeIntelIPP: boolean;
      includeFaust: boolean;
      detectedComponents: DetectedComponents;
      previousSteps: CompletedStep[];
    };
  }
  ```
- **Output:**
  ```typescript
  {
    commands: string[];
    explanation: string;
    tips: string[];
    warnings: string[];
    estimatedTime: string;
  }
  ```

### `/api/setup/parse-error`
- **Method:** POST
- **Input:**
  ```typescript
  {
    error: string;
    phase: number;
    command: string;
    platform: string;
    context: SetupContext;
  }
  ```
- **Output:**
  ```typescript
  {
    cause: string;
    fixCommands: string[];
    prevention: string;
    severity: 'low' | 'medium' | 'high';
    canContinue: boolean;
  }
  ```

### `/api/llm/chat`
- **Method:** POST
- **Input:** `{ message: string; history?: Message[] }`
- **Output:** `{ response: string; history: Message[] }`

---

## LLM Integration

### Provider
- **Service:** OpenRouter API
- **Model:** GLM 4.7
- **Authentication:** `OPENROUTER_API_KEY` environment variable

### Prompt Templates

**Command Generation:**
```
You are a HISE setup assistant. Generate terminal command(s) for:

Phase: {phaseNumber} - {phaseName}
Platform: {platform}
Install Location: {installPath}
Preferences: Intel IPP={includeIPP}, Faust={includeFaust}

Detected State:
- VS2026: {detected}
- Git: {detected}
- etc.

Generate ONLY the command(s) needed. Keep it concise and accurate.
```

**Error Parsing:**
```
Analyze this error from HISE setup:

Error: {errorMessage}
Phase: {phase}
Command: {command}
Platform: {platform}

Provide:
1. Root cause analysis (1-2 sentences)
2. Step-by-step fix (max 3 commands)
3. Prevention tips (1 sentence)

Format as JSON with: cause, fixCommands, prevention, severity, canContinue
```

---

## User Flow Summary

1. **Landing Page** → User clicks "Start Setup"
2. **Phase 0: System Detection** → All phases checked independently
   - Display status of all 10 phases
   - Show detected components
   - Gather preferences (install location, optional components)
3. **Wizard Start** → Begin at first incomplete phase
4. **Phase Pages (1-10)** → Each phase includes:
   - Step explanation (what we're doing)
   - Command block with copy button
   - Success/failure toggles
   - Error assistant (if something goes wrong)
5. **Completion** → Success message with quick start commands

---

## Key Components

### SetupWizard.tsx
Main container that manages the wizard state and phase navigation.

### PhaseStepper.tsx
Displays progress stepper showing completed/pending phases.

### CommandBlock.tsx
Displays terminal commands with copy-to-clipboard functionality.

### SystemDetection.tsx
Shows auto-detection results and phase status.

### StepExplanation.tsx
Explains what each step is doing to the user in clear language.

### ErrorAssistant.tsx
LLM-powered error analysis and fix suggestions.

---

## Environment Variables

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

---

## Deployment

- **Platform:** Vercel or Netlify
- **Build:** `npm run build`
- **Start:** `npm start`
- **Framework:** Next.js 14+ with App Router

---

## Notes

- No user authentication required
- No data persistence (no LocalStorage, no database)
- Session-only state via React Context
- Terminal commands delivered via copy-paste
- Each phase tested independently (no dependency assumptions)
- LLM used for intelligent command generation and error handling
- Platform-specific: Windows initially, macOS/Linux to follow

---

## Future Enhancements

- macOS support (hise-setup-macos.md)
- Linux support (hise-setup-linux.md)
- Advanced configuration options
- Offline command generation (cached commands)
