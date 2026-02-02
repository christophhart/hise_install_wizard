# HISE Setup Wizard - Agent Documentation

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
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout with header/footer
│   ├── setup/
│   │   ├── page.tsx                    # Configuration page (platform, path, components)
│   │   └── generate/page.tsx           # Script preview, summary, and download
│   ├── help/
│   │   └── page.tsx                    # Error analysis page
│   └── api/
│       ├── generate-script/route.ts    # Script generation endpoint
│       └── parse-error/route.ts        # Error pattern matching endpoint
│
├── components/
│   ├── wizard/
│   │   ├── PlatformSelector.tsx        # OS selection with auto-detect
│   │   ├── ArchitectureSelector.tsx    # x64/arm64 for macOS
│   │   ├── PathInput.tsx               # Install path with validation & paste
│   │   ├── ComponentChecklist.tsx      # Component detection + install toggles
│   │   ├── PhaseStepper.tsx            # 2-step progress indicator
│   │   ├── ScriptPreview.tsx           # Clean code display with line numbers
│   │   └── SetupSummary.tsx            # Shows all phases with run/skip status
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Checkbox.tsx
│   │   ├── RadioGroup.tsx
│   │   ├── Alert.tsx
│   │   ├── CodeBlock.tsx               # Code display with copy button
│   │   ├── InlineCopy.tsx              # Inline command with copy button
│   │   └── Textarea.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── PageContainer.tsx
│
├── contexts/
│   └── WizardContext.tsx               # React Context for wizard state
│
├── lib/
│   └── scripts/
│       ├── generator.ts                # Main script generator
│       └── templates/
│           ├── common.ts               # Shared template utilities
│           ├── windows.ts              # PowerShell script template
│           ├── macos.ts                # Bash script for macOS
│           └── linux.ts                # Bash script for Linux
│
├── types/
│   └── wizard.ts                       # TypeScript type definitions
│
├── public/                             # Static assets
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

1. **Landing Page** (`/`) - User clicks "Start Setup"
2. **Configuration** (`/setup`) - Three-section form:
   - Section 1: Platform selection (auto-detected)
   - Section 2: Installation path (with regex validation)
   - Section 3: Component checklist with auto-detect feature
3. **Script Generation** (`/setup/generate`) - Shows:
   - Setup summary (all phases with run/skip status)
   - Download button with unique timestamped filename
   - How to run instructions
   - Clean script preview with line numbers
4. **Help** (`/help`) - Error analysis with pattern matching

---

## Key Features

### Auto-Detect Components (ComponentChecklist.tsx)

Users can run a detection script to automatically check which components are installed:

1. Click "Show" on Auto-Detect section
2. Copy the generated detection script
3. Run in PowerShell/Terminal
4. Paste output (e.g., `git,compiler,hiseRepo,juce,sdks`)
5. Click "Apply" - checkboxes are automatically ticked

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

### Verification Commands

All component verification commands return `True`/`False` for consistency:

| Component | Windows | macOS/Linux |
|-----------|---------|-------------|
| Git | `[bool](Get-Command git -ErrorAction SilentlyContinue)` | `command -v git >/dev/null && echo "True" \|\| echo "False"` |
| Compiler | `Test-Path "...MSBuild.exe"` | `xcode-select -p` / `command -v gcc` |
| HISE Repo | `Test-Path "<path>\.git"` | `test -d "<path>/.git"` |
| JUCE | `(Test-Path ...) -and (git branch = "juce6")` | `test + git branch check` |
| SDKs | `Test-Path "<path>\tools\SDK"` | `test -d` |
| Faust | `Test-Path "C:\Program Files\Faust\bin\faust.exe"` | `test -f /usr/local/bin/faust` |
| Intel IPP | `Test-Path "...\Intel\oneAPI\ipp\latest"` | N/A |

### Setup Summary (SetupSummary.tsx)

Shows all setup phases with status indicators:

| Status | Icon | Meaning |
|--------|------|---------|
| Will Run | Orange circle | Phase will be executed |
| Already Done | Green check | Component detected, phase skipped |
| Skipped | Gray arrow | Optional phase not selected |

**Phases displayed:**
- Git & Repository Setup
- C++ Compiler
- Intel IPP (optional, Windows only)
- Faust DSP Compiler (optional)
- Repository Check
- Compile HISE (always runs)
- Add to PATH (always runs)
- Verify Build (always runs)
- Test Project (always runs)

### Script Preview (ScriptPreview.tsx)

Clean, minimal display:
- Line numbers
- Comments highlighted in gray italic
- No colorful syntax highlighting (cleaner look)
- Copy and download buttons
- Expandable for long scripts

---

## API Routes

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

### POST `/api/parse-error`
**Input:**
```typescript
{
  error: string;         // Error message from user
  platform: string;
}
```

**Output:**
```typescript
{
  patterns: Array<{
    pattern: string;
    cause: string;
    solution: string;
  }>;
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
| `windows.ts` | PowerShell (.ps1) | Uses winget, MSBuild, VS2022 |
| `macos.ts` | Bash (.sh) | Uses Homebrew, xcodebuild |
| `linux.ts` | Bash (.sh) | Uses apt/dnf, make |

Each template:
- Checks prerequisites
- Skips phases based on user configuration
- Includes error handling with colored output
- Provides progress indicators

---

## Styling

Colors defined in `tailwind.config.ts`:
- **Background:** `#0F0F0F`
- **Surface:** `#1A1A1A`
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
