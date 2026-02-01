# HISE Setup Web Server

## Overview

Web-based HISE setup generator with preflight check system. Users run local detection scripts, paste JSON results, and receive customized setup scripts.

## Architecture

```
hise-setup-web-tool/
├── public/scripts/           # Preflight check scripts
│   ├── check-windows.ps1
│   ├── check-macos.sh
│   └── check-linux.sh
├── src/
│   ├── routes/api/
│   │   ├── generate.ts      # Main script generation
│   │   └── parse-check.ts   # Preflight JSON parsing
│   ├── libs/
│   │   ├── ai-generator.ts  # GLM-4.7 wrapper
│   │   ├── cache.ts         # In-memory cache (24h TTL)
│   │   ├── validator.ts     # Zod validation
│   │   └── detector.ts      # Preflight result parsing
│   ├── components/
│   │   ├── PreflightInstructions.astro
│   │   ├── DetectedState.astro
│   │   └── SetupForm.astro
│   └── utils/
│       ├── constants.ts
│       └── schemas.ts
```

## Preflight Check Scripts

### Detection Logic (All Platforms)

Detect and output JSON:

```json
{
  "os": "windows|macos|linux",
  "architecture": "x64|arm64",
  "os_version": "string",
  "git": { "installed": bool, "version": string|null, "path": string|null },
  "compiler": { "installed": bool, "type": string|null, "version": string|null, "path": string|null },
  "hise": { "detected": bool, "path": string|null, "compiled": bool, "compiled_path": string|null },
  "faust": { "detected": bool, "path": string|null },
  "sdks": { "asio": { "detected": bool }, "vst3": { "detected": bool } },
  "timestamp": "ISO8601"
}
```

### Detection Commands

**Windows (PowerShell):**
- Git: `Get-Command git` / `git --version`
- Visual Studio: `"${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe" -latest -property installationPath`
- HISE: `Test-Path $env:USERPROFILE\HISE\.git`
- Compiled: `Test-Path $hisePath\projects\standalone\Builds\Win64\build\Release\HISE Standalone.exe`
- Faust: `Test-Path $hisePath\tools\faust\lib\libfaust.dll`

**macOS (Bash):**
- Git: `git --version`
- Xcode: `xcode-select -p`, `xcodebuild -version`
- HISE: `[ -d ~/HISE/.git ]`
- Compiled: `[ -d ~/HISE/projects/standalone/Builds/MacOSX/build/Release/HISE.app ]`
- Faust: `[ -f ~/HISE/tools/faust/lib/libfaust.dylib ]`

**Linux (Bash):**
- Git: `command -v git`
- GCC: `command -v gcc`
- HISE: `[ -d ~/HISE/.git ]`
- Compiled: `[ -f ~/HISE/projects/standalone/Builds/Linux/build/HISE ]`
- Faust: `[ -f ~/HISE/tools/faust/lib/libfaust.so ]`

## JSON Schema

```typescript
// src/utils/schemas.ts
export const PreflightDataSchema = z.object({
  os: z.enum(['windows', 'macos', 'linux']),
  architecture: z.enum(['x64', 'arm64']),
  git: z.object({ installed: z.boolean(), version: z.string().nullable(), path: z.string().nullable() }),
  compiler: z.object({ installed: z.boolean(), type: z.string().nullable(), version: z.string().nullable(), path: z.string().nullable() }),
  hise: z.object({ detected: z.boolean(), path: z.string().nullable(), compiled: z.boolean(), compiled_path: z.string().nullable() }),
  faust: z.object({ detected: z.boolean(), path: z.string().nullable() }),
  sdks: z.object({ asio: z.object({ detected: z.boolean() }), vst3: z.object({ detected: z.boolean() }) }),
});
```

## AI Context-Aware Prompt Template

```
Generate HISE setup script for {os} ({architecture})

## Current System State
Git: {git.installed} ({git.version})
Compiler: {compiler.installed} ({compiler.type} {compiler.version})
HISE Det: {hise.detected}, Compiled: {hise.compiled}
Faust: {faust.detected}

## Intelligent Rules
- Git: {if git.installed} Use existing {else} Install and HALT until complete {/if}
- Compiler: {if compiler.installed} Use existing {else} Install and HALT until complete {/if}
- HISE: {if hise.detected} Use existing dir {else} Clone to {installPath} {/if}
- Build: {if hise.compiled} Skip build, verify {else} Build from source {/if}
- Faust: {if faust.detected} Enable in build {else} Disable in build {/if}

## Documentation
[Include full workflow from hise-setup-{os}.md]
```

## API Routes

### POST /api/parse-check
```typescript
// Validate and parse preflight JSON
PreflightDataSchema.parse(JSON.parse(body.json))
```

### POST /api/generate (Modified)
```typescript
// Accepts: { systemData?, userPrefs, scriptType }
// systemData = preflight check results (or null for manual mode)
// userPrefs = { installPath, faust, testMode }
// Returns: Generated setup script
```

## Cache Key Strategy

```typescript
const cacheKey = {
  os, architecture,
  hasGit: systemData.git.installed,
  hasCompiler: systemData.compiler.installed,
  hasHiseDetected: systemData.hise.detected,
  hasHiseCompiled: systemData.hise.compiled,
  hasFaust: systemData.faust.detected || faustPreference === 'yes',
  installPath, testMode,
};
```

## User Flow

```
1. Download preflight script for OS
2. Run script locally, capture JSON output
3. Paste JSON into web app
4. Web app analyzes state and shows detected tools
5. Click "Generate Setup Script"
6. Receive intelligent script (skips already-done steps)
7. Run script to complete setup
```

## Implementation Checklist

- [ ] Create preflight scripts (check-*.ps1/sh)
- [ ] Create JSON schema (schemas.ts)
- [ ] Create API routes (parse-check.ts, modified generate.ts)
- [ ] Build AI context-aware prompt generator
- [ ] Create UI components (PreflightInstructions.astro, DetectedState.astro)
- [ ] Update SetupForm.astro for preflight/manual two-mode
- [ ] Test on all platforms
- [ ] Deploy to Vercel

## Tech Stack

- **Frontend:** Astro + Alpine.js + Tailwind CSS
- **Backend:** Node.js Astro API routes
- **AI:** OpenRouter API with GLM-4.7 model (z-ai/glm-4.7)
- **Validation:** Zod
- **Caching:** In-memory Map (24h TTL)
- **Deployment:** Vercel

## Cost Model

- Per script generation: ~$0.0055
- Cache hit rate: 55% (variable system states)
- Effective cost: ~$0.0025 per user

## Error Handling

- Invalid JSON: Show error, request user re-run preflight
- Platform mismatch: Warn user to download correct script
- Old timestamp: Warning if > 24 hours
- Path not found: Default to ~/HISE, offer custom path

## Success Criteria

- Preflight scripts work on all platforms
- Web app parses and validates JSON
- AI generates context-aware scripts
- Scripts skip already-completed steps intelligently
- Setup time reduced via intelligent skipping