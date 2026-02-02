# HISE Setup Wizard - Agent Documentation

---

## CRITICAL INFORMATION

> **Visual Studio Version: VS2026 is the correct version for this project.**
> 
> Do NOT change references to Visual Studio 2026 to any other version (e.g., VS2022, VS2019).
> The project targets VS2026 specifically. All paths, verification commands, and documentation
> should reference `Visual Studio 2026` and the path `C:\Program Files\Microsoft Visual Studio\18\`.

---

## Project Overview

A web-based wizard application that generates platform-specific setup scripts for HISE (Hart Instrument Software Environment). Users configure their preferences and the app outputs customized bash/PowerShell scripts they can download and run.

**Platforms Supported:** Windows, macOS, Linux

**Current Status:** UI complete, ready for script testing on VMs

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend Framework** | Next.js 14+ (App Router) | React framework with SSR/API routes |
| **Language** | TypeScript | Type safety and better DX |
| **Styling** | TailwindCSS | Utility-first CSS framework |
| **State Management** | React Context | Wizard session state (no persistence) |
| **Icons** | lucide-react | Icon library |
| **Deployment** | Vercel/Netlify | Serverless deployment platform |

---

## Project Structure

```
hise-install-wizard/
├── app/                                # Next.js App Router
│   ├── page.tsx                        # Landing page (New Installation / Update HISE)
│   ├── layout.tsx                      # Root layout with header/footer
│   ├── setup/
│   │   ├── page.tsx                    # Configuration page (platform, path, components)
│   │   └── generate/page.tsx           # Script preview, summary, and download
│   ├── update/
│   │   ├── layout.tsx                  # Update layout with UpdateProvider
│   │   ├── page.tsx                    # Update config (detect HISE installation)
│   │   └── generate/page.tsx           # Update script preview and download
│   └── api/
│       ├── generate-script/route.ts    # Setup script generation endpoint
│       ├── generate-update-script/route.ts  # Update script generation endpoint
│       └── check-ci-status/route.ts    # GitHub Actions CI status endpoint
│
├── components/
│   ├── wizard/
│   │   ├── PlatformSelector.tsx        # OS selection with auto-detect
│   │   ├── ArchitectureSelector.tsx    # x64/arm64 for macOS
│   │   ├── PathInput.tsx               # Install path with validation & paste
│   │   ├── ComponentChecklist.tsx      # iOS-style toggles + auto-detect
│   │   ├── ExplanationModeSelector.tsx # EZ/Dev mode toggle in header
│   │   ├── PhaseStepper.tsx            # 2-step progress indicator (setup/update modes)
│   │   ├── ScriptPreview.tsx           # Clean code display with line numbers
│   │   ├── SetupSummary.tsx            # Shows all phases with run/skip/download status
│   │   ├── IDEVerification.tsx         # Verify IDE installation before script run
│   │   ├── HisePathDetector.tsx        # Detect existing HISE installation from PATH
│   │   └── CIStatusAlert.tsx           # Warning when CI build is failing
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Checkbox.tsx
│   │   ├── RadioGroup.tsx
│   │   ├── Alert.tsx
│   │   ├── CodeBlock.tsx               # Code display with copy button
│   │   ├── Collapsible.tsx             # Expandable section component
│   │   ├── InlineCopy.tsx              # Inline command with copy button
│   │   └── Textarea.tsx
│   └── layout/
│       ├── Header.tsx                  # Black header bar with logo + mode selector
│       ├── Footer.tsx
│       └── PageContainer.tsx
│
├── contexts/
│   ├── WizardContext.tsx               # React Context for setup wizard state
│   └── UpdateContext.tsx               # React Context for update mode state
│
├── hooks/
│   └── useExplanation.ts               # Hook for EZ/Dev mode content switching
│
├── lib/
│   ├── content/
│   │   └── explanations.ts             # Mode-aware content strings (EZ/Dev)
│   ├── github.ts                       # GitHub API utilities for CI status checking
│   └── scripts/
│       ├── generator.ts                # Main script generator (setup + update)
│       └── templates/
│           ├── common.ts               # Shared template utilities and sections
│           ├── windows.ts              # PowerShell scripts (setup + update)
│           ├── macos.ts                # Bash scripts for macOS (setup + update)
│           └── linux.ts                # Bash scripts for Linux (setup + update)
│
├── types/
│   └── wizard.ts                       # TypeScript type definitions
│
├── public/
│   └── images/
│       └── logo_new.png                # HISE logo
├── hise-setup-windows.md               # Windows setup reference
├── hise-setup-macos.md                 # macOS setup reference
├── hise-setup-linux.md                 # Linux setup reference
├── style_guide.md                      # Design guidelines
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## User Flow

### New Installation Flow (Setup)

1. **Landing Page** (`/`) - User clicks "New Installation"
2. **Configuration** (`/setup`) - Three-section form:
   - Section 1: Platform selection (auto-detected)
   - Section 2: Installation path (with regex validation)
   - Section 3: Component checklist with auto-detect feature and iOS-style toggles
3. **Script Generation** (`/setup/generate`) - Shows:
   - CI status alert (if latest commit is failing)
   - Installation folder display with HISE repository status
   - Setup summary (all phases with run/skip status)
   - Download button with unique timestamped filename
   - How to run instructions
   - Clean script preview with line numbers

### Update Flow

1. **Landing Page** (`/`) - User clicks "Update HISE"
2. **Configuration** (`/update`) - Two-section form:
   - Section 1: Platform display (auto-detected)
   - Section 2: HISE path detection via script (detects path from PATH, Faust status, architecture)
3. **Script Generation** (`/update/generate`) - Shows:
   - CI status alert (if latest commit is failing)
   - HISE path display with Faust build status
   - Update summary (4 phases: validate, git pull, compile, verify)
   - Download button with unique timestamped filename
   - Simplified how to run instructions
   - Clean script preview with line numbers

---

## Key Features

### Explanation Modes (EZ Mode / Dev Mode)

Two content modes available via toggle in header:
- **EZ Mode**: Detailed explanations for beginners new to development environments
- **Dev Mode**: Concise, technical information for experienced developers

Content is managed in `lib/content/explanations.ts` with mode-aware strings.

### CI Build Status Checking

The wizard automatically checks the HISE repository's GitHub Actions CI status before generating scripts. This prevents users from pulling broken commits.

**How it works:**
1. On the generate page, the app fetches CI status from `/api/check-ci-status`
2. The API checks GitHub Actions for the latest workflow runs on the `develop` branch
3. If the latest commit is failing, the wizard finds the most recent passing commit
4. A warning alert is displayed showing the failing vs. passing commit info
5. The generated script will checkout the specific passing commit SHA instead of just pulling `develop`

**CI Status Alert behavior:**
- In **EZ Mode**: Shows full explanation, no override option (uses passing commit automatically)
- In **Dev Mode**: Shows concise message with "Use latest commit anyway" checkbox for advanced users

**Stale commit warning:** If the last passing commit is 30+ days old, an additional warning is shown suggesting users check the HISE forum for updates.

**Caching:** CI status is cached server-side for 5 minutes to avoid GitHub API rate limits.

**Files involved:**
- `lib/github.ts` - GitHub API utilities and types
- `app/api/check-ci-status/route.ts` - Server endpoint with caching
- `components/wizard/CIStatusAlert.tsx` - Warning UI component
- `lib/scripts/templates/common.ts` - Commit-aware git clone/update functions

### Component Checklist (ComponentChecklist.tsx)

iOS-style toggles with inverted UX logic:
- **Toggle ON (orange)**: Component will be installed
- **Toggle OFF (grey)**: Component already installed, will be skipped
- Status badges show "Will Install" or "Already Installed"
- Summary at bottom shows counts

**Displayed Components:**
- Git
- C++ Compiler
- HISE Repository
- Faust DSP Compiler (optional)
- Intel IPP (optional, Windows only)

**Note:** JUCE Submodule and SDKs are tracked internally but hidden from UI (assumed handled with repo setup).

### IDE Toolset Workflow

IDE tools (Visual Studio 2026, Xcode) require manual installation before running the setup script. This is handled via:

**Manual Installation Phases:**
- Phases marked as `type: 'manual'` display download buttons instead of "Will Run" status
- Download URLs are platform-specific and appear inline in the SetupSummary
- Linux is excluded from manual phases (uses `apt-get` which is automated)

**IDE Verification (IDEVerification.tsx):**
- Appears on the generate page for Windows and macOS
- Provides verification commands to check if IDE is installed
- Users paste verification output to confirm installation
- Shows warning if IDE is not detected, but allows proceeding anyway
- Verification status is passed to SetupSummary to update phase indicators

**Script Behavior:**
- Scripts now perform pre-requisite checks instead of attempting installation
- If IDE is not found, script exits with helpful error message and download link
- Intel IPP check is non-blocking (warns but continues)

**Affected Files:**
- `components/wizard/SetupSummary.tsx` - Phase type handling and download buttons
- `components/wizard/IDEVerification.tsx` - Verification UI component
- `lib/scripts/templates/windows.ts` - VS2026 pre-requisite check
- `lib/scripts/templates/macos.ts` - Xcode pre-requisite check

### Auto-Detect Components

Users can run a detection script to automatically check which components are installed:

1. Expand "Auto-Detect Components" section
2. Copy the generated detection script
3. Run in PowerShell/Terminal
4. Paste output (e.g., `git,compiler,hiseRepo`)
5. Click "Apply" - toggles are automatically updated

**Detection Script Output Format:** Comma-separated list of installed component keys

### Path Validation (PathInput.tsx)

Regex patterns validate paths per platform:
```typescript
const PATH_PATTERNS = {
  windows: /^[A-Za-z]:\\(?:[^<>:"|?*\n]+\\?)*$/,  // C:\Users\Name\HISE
  macos: /^(?:~|\/)[^<>:"|?*\n]*$/,               // ~/Development/HISE
  linux: /^(?:~|\/)[^<>:"|?*\n]*$/,               // /home/user/HISE
};
```

### Generate Page Features

- **IDE Verification**: Allows users to verify IDE installation before running script (Windows/macOS only)
- **Install Path Display**: Shows selected folder with HISE repository checkbox indicator
- **Steps Explanation**: Mode-aware text explaining what the script will do
- **Setup Summary**: Visual list of all phases with status indicators (including manual download phases)
- **Download Button**: Unique timestamped filenames prevent conflicts
- **How to Run**: Collapsible instructions with copy-able commands
- **Script Preview**: Clean display with line numbers

### Setup Summary (SetupSummary.tsx)

Shows all setup phases with status indicators. Separates manual installation phases from automatic script phases.

**Manual Installation Section:**
| Status | Icon | Meaning |
|--------|------|---------|
| Download | Orange download button | Tool needs to be installed manually |
| Installed | Green check | Tool verified as installed |
| Skipped | Gray arrow | Optional tool not selected |

**Script Steps Section:**
| Status | Icon | Meaning |
|--------|------|---------|
| Will Run | Orange circle | Phase will be executed |
| Already Done | Green check | Component detected, phase skipped |
| Skipped | Gray arrow | Optional phase not selected |

---

## API Routes

### GET `/api/check-ci-status`
Checks HISE repository CI build status. Results are cached server-side for 5 minutes.

**Output:**
```typescript
{
  status: 'ok' | 'error';
  data?: {
    latestCommit: {
      sha: string;
      shortSha: string;
      message: string;
      date: string;
      conclusion: 'success' | 'failure' | 'pending' | 'unknown';
    };
    lastPassingCommit: {
      sha: string;
      shortSha: string;
      message: string;
      date: string;
    } | null;
    isLatestPassing: boolean;
    isStale: boolean;        // true if passing commit is 30+ days old
    daysBehind: number;
    checkedAt: string;
  };
  warning?: string;          // e.g., "Using cached data"
  message?: string;          // Error message if status is 'error'
}
```

### POST `/api/generate-script`
**Input:**
```typescript
{
  platform: 'windows' | 'macos' | 'linux';
  architecture: 'x64' | 'arm64';
  installPath: string;
  includeFaust: boolean;
  includeIPP: boolean;
  skipPhases: number[];  // Phase IDs to skip
  targetCommit?: string; // If provided, checkout this specific commit
}
```

**Output:**
```typescript
{
  script: string;        // The generated script content
  filename: string;      // e.g., "hise-setup.ps1"
  warnings: string[];    // Any warnings for the user
}
```

### POST `/api/generate-update-script`
**Input:**
```typescript
{
  platform: 'windows' | 'macos' | 'linux';
  architecture: 'x64' | 'arm64';
  hisePath: string;      // Detected HISE repository path
  hasFaust: boolean;     // Whether current build has Faust support
  targetCommit?: string; // If provided, checkout this specific commit
}
```

**Output:**
```typescript
{
  script: string;        // The generated update script content
  filename: string;      // e.g., "hise-update.ps1"
  warnings: string[];    // Any warnings for the user
}
```

---

## State Management

`WizardContext.tsx` manages:
```typescript
interface WizardState {
  platform: 'windows' | 'macos' | 'linux' | null;
  architecture: 'x64' | 'arm64' | null;
  installPath: string;
  detectedComponents: {
    git: boolean;
    compiler: boolean;
    hiseRepo: boolean;
    juce: boolean;
    sdks: boolean;
    faust: boolean;
    intelIPP: boolean;
  };
  includeFaust: boolean;
  includeIPP: boolean;
  explanationMode: 'easy' | 'dev';
}
```

**Skip Phase Logic:**
- Phase 2 (Git): Skip if `git` + `hiseRepo` detected
- Phase 3 (Compiler): Skip if `compiler` detected
- Phase 4 (IPP): Skip if `intelIPP` detected OR not selected
- Phase 5 (Faust): Skip if `faust` detected OR not selected
- Phase 6 (Repo Check): Skip if `sdks` + `juce` detected
- Phases 7-10: Always run (compile, PATH, verify, test)

---

## Script Templates

Located in `lib/scripts/templates/`:

| File | Output | Description |
|------|--------|-------------|
| `common.ts` | - | Shared utilities and script section generators |
| `windows.ts` | PowerShell (.ps1) | Uses winget, MSBuild, VS2026 |
| `macos.ts` | Bash (.sh) | Uses Homebrew, xcodebuild |
| `linux.ts` | Bash (.sh) | Uses apt/dnf, make |

Each template exports two functions:
- `generate{Platform}Script(config)` - Full setup script
- `generate{Platform}UpdateScript(config)` - Streamlined update script

Common features:
- Checks prerequisites
- Skips phases based on user configuration
- Includes error handling with colored output
- Provides progress indicators

### Shared Script Sections (common.ts)

The `common.ts` file provides reusable script section generators:
- `generateBashUtilities()` / `generatePowerShellUtilities()` - Color output functions
- `generateGitCloneWithCommitBash()` / `generateGitCloneWithCommitPS()` - Git clone with optional commit checkout
- `generateGitUpdateWithCommitBash()` / `generateGitUpdateWithCommitPS()` - Git update with optional commit checkout
- `generateCompileSectionMacOS()` / `generateCompileSectionLinux()` / `generateCompileSectionWindows()` - Build commands
- `generateVerifySectionBash()` / `generateVerifySectionPS()` - Build verification
- `generateUpdateSuccessMessageBash()` / `generateUpdateSuccessMessagePS()` - Success output

This shared approach keeps the codebase lean and ensures consistency between setup and update scripts.

---

## Styling

Colors defined in `tailwind.config.ts`:
- **Background:** `#0F0F0F`
- **Surface:** `#1A1A1A`
- **Header:** `#000000` (black)
- **Border:** `#2A2A2A`
- **Accent:** `#FF6B35` (orange)
- **Success:** `#10B981`
- **Warning:** `#F59E0B`
- **Error:** `#EF4444`

---

## Build & Run

```bash
# Development
npm run dev

# Production build
npm run build

# Start production
npm start
```

---

## Next Steps / TODO

### Testing Phase
- [ ] Test generated scripts on Windows VM (fresh install)
- [ ] Test generated scripts on Windows VM (partial install)
- [ ] Test generated scripts on macOS VM (fresh install)
- [ ] Test generated scripts on macOS VM (partial install)
- [ ] Test generated scripts on Linux VM (Ubuntu fresh)
- [ ] Test generated scripts on Linux VM (Ubuntu partial)
- [ ] Verify skip logic works correctly for each component
- [ ] Verify error handling in scripts

### Future Enhancements
- [ ] Add progress tracking during script execution
- [ ] Add rollback functionality for failed installs
- [ ] Add log file generation
- [ ] Add email/notification on completion
- [ ] Add installer creation support

---

## Notes

- No user authentication required
- No data persistence (session-only state)
- Scripts are generated via API route
- Unique filenames with timestamps prevent download conflicts
- Path validation prevents invalid paths from being used
- All platforms supported: Windows, macOS, Linux
- PowerShell commands use `Test-Path` (compatible with all PS versions)
- Verification commands all return `True`/`False` for consistency
- Component toggles use inverted display logic (ON = will install)
- JUCE and SDKs hidden from UI but tracked in state
- Explanation mode (EZ/Dev) is shared between Setup and Update flows via localStorage
