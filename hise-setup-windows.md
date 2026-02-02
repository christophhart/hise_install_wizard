# HISE Development Environment Setup - Windows

## Overview

Setup guide for HISE (Hart Instrument Software Environment) on Windows 7+ (64-bit x64 only).

---

## Setup Phases

| Phase | Name | Required | Description |
|-------|------|----------|-------------|
| 0 | System Detection | - | Detect installed components |
| 1 | User Configuration | - | Gather preferences (install path, optional components) |
| 2 | Git Setup | Yes | Clone HISE, init JUCE submodule (juce6 branch) |
| 3 | Visual Studio 2026 | Yes | Install with "Desktop development with C++" workload |
| 4 | Intel IPP | No | Optional performance optimization |
| 5 | Faust | No | Optional DSP compiler |
| 6 | Repository Check | Yes | Verify JUCE submodule and SDKs |
| 7 | Compile HISE | Yes | Build standalone application |
| 8 | Add to PATH | Yes | Add HISE binary to system PATH |
| 9 | Verify Build | Yes | Run `HISE get_build_flags` |
| 10 | Test Project | Yes | Compile demo project |
| 11 | Success | Yes | Final verification |

---

## Download URLs

| Component | URL |
|-----------|-----|
| Visual Studio 2026 Community | https://visualstudio.microsoft.com/downloads/ |
| Intel IPP 2022.3.1.10 | https://registrationcenter-download.intel.com/akdlm/IRC_NAS/9c651894-4548-491c-b69f-49e84b530c1d/intel-ipp-2022.3.1.10_offline.exe |
| Faust 2.54.0+ | https://github.com/grame-cncm/faust/releases |

---

## Prerequisites

### Administrator Privileges (Required)

```batch
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [CRITICAL] Administrator privileges required!
    exit /b 1
)
```
---

## Phase 0: System Detection

Detect installed components:

| Component | Check |
|-----------|-------|
| Visual Studio 2026 | `C:\Program Files\Microsoft Visual Studio\18\Community\` |
| Intel IPP | `C:\Program Files (x86)\Intel\oneAPI\ipp\latest` |
| Faust | `C:\Program Files\Faust\lib\faust.dll` |
| Git | `git --version` |
| HISE Repository | `.git` folder exists |
| SDKs | `tools/SDK/ASIOSDK2.3/` and `tools/SDK/VST3 SDK/` |
| JUCE | `JUCE/` on `juce6` branch |

---

## Phase 1: User Configuration

Collect user preferences:

1. **Installation Location** - Default: `C:\HISE`
2. **Intel IPP** - Optional performance optimization
3. **Faust** - Optional DSP compiler (changes build to "Release with Faust")

---

## Phase 2: Git Setup

```batch
cd {hisePath}

if exist ".git" (
    git fetch origin
    git pull origin develop
) else (
    git clone https://github.com/christophhart/HISE.git
    cd HISE
)

git checkout develop
git submodule update --init
cd JUCE && git checkout juce6 && cd ..
```

---

## Phase 3: Visual Studio 2026

**This step cannot be skipped.** HISE requires a C++ compiler.

1. Download Visual Studio Community 2026
2. Select "Desktop development with C++" workload
3. Verify installation:

```batch
if exist "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" (
    echo Visual Studio 2026 installed successfully
) else (
    echo ERROR: Visual Studio not detected
    exit /b 1
)
```

---

## Phase 4: Intel IPP (Optional)

```batch
REM Verify VS2026 is installed first
if not exist "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" (
    echo ERROR: Visual Studio 2026 required before IPP installation
    exit /b 1
)

curl -L -o "%TEMP%\intel-ipp-installer.exe" "https://registrationcenter-download.intel.com/akdlm/IRC_NAS/9c651894-4548-491c-b69f-49e84b530c1d/intel-ipp-2022.3.1.10_offline.exe"
"%TEMP%\intel-ipp-installer.exe" -s -a --silent --eula accept

REM Verify
if exist "C:\Program Files (x86)\Intel\oneAPI\ipp\latest" (
    echo Intel IPP installed successfully
    set IPP_INSTALLED=1
) else (
    echo Intel IPP installation not found
    set IPP_INSTALLED=0
)
```

---

## Phase 5: Faust (Optional)

```batch
curl -L -o "%TEMP%\faust-installer.exe" "https://github.com/grame-cncm/faust/releases/latest/download/Faust-2.54.0-win64.exe"
"%TEMP%\faust-installer.exe"

REM Must install to default path - .jucer file has this hardcoded
REM Verify
if exist "C:\Program Files\Faust\lib\faust.dll" (
    echo Faust installed successfully
    set FAUST_INSTALLED=1
) else (
    echo Faust installation not found
    set FAUST_INSTALLED=0
)
```

**Post-Installation:** Set `FaustPath` in HISE Settings to `C:\Program Files\Faust\`

---

## Phase 6: Repository Structure Check

```batch
cd {hisePath}

git submodule update --init
cd JUCE && git checkout juce6 && cd ..

REM Extract SDKs
unzip tools/SDK/sdk.zip -d tools/SDK/

REM Verify
if exist "tools/SDK/ASIOSDK2.3" (echo ASIO SDK OK) else (echo WARNING: ASIO SDK not found)
if exist "tools/SDK/VST3 SDK" (echo VST3 SDK OK) else (echo WARNING: VST3 SDK not found)
```

---

## Phase 7: Compile HISE

> **Build Timeout:** Compilation takes 5-15 minutes. Set timeout to 600000ms minimum.

**Without Faust:**
```batch
cd {hisePath}\projects\standalone
"{hisePath}\JUCE\Projucer\Projucer.exe" --resave "HISE Standalone.jucer"
"C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" "Builds\VisualStudio2026\HISE Standalone.sln" /p:Configuration=Release /p:PreferredToolArchitecture=x64 /verbosity:minimal
```

**With Faust:**
```batch
cd {hisePath}\projects\standalone
"{hisePath}\JUCE\Projucer\Projucer.exe" --resave "HISE Standalone.jucer"
"C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" "Builds\VisualStudio2026\HISE Standalone.sln" /p:Configuration="Release with Faust" /p:PreferredToolArchitecture=x64 /verbosity:minimal
```

**Post-build verification:** HISE.exe must be > 10MB (corrupted builds are ~2MB)

```batch
for %%A in ("HISE.exe") do set HISE_SIZE=%%~zA
if %HISE_SIZE% LSS 10485760 (
    echo ERROR: HISE.exe appears corrupted - size less than 10MB
    exit /b 1
)
```

---

## Phase 8: Add to PATH

**Without Faust:**
```batch
setx PATH "%PATH%;{hisePath}\projects\standalone\Builds\VisualStudio2026\x64\Release\App"
```

**With Faust:**
```batch
setx PATH "%PATH%;{hisePath}\projects\standalone\Builds\VisualStudio2026\x64\Release with Faust\App"
```

---

## Phase 9: Verify Build

```batch
HISE get_build_flags
```

Validates:
- Build Configuration contains "Release"
- Faust Support matches user selection
- IPP Support matches user selection

---

## Phase 10: Test Project

```batch
HISE set_project_folder -p:"{hisePath}\extras\demo_project"
HISE export_ci "XmlPresetBackups\Demo.xml" -t:standalone -a:x64
```

---

## Phase 11: Success

Criteria:
1. HISE compiled successfully
2. HISE in PATH
3. Build flags verified
4. Test project compiles

---

## HISE CLI Commands

| Command | Description |
|---------|-------------|
| `export` | Build project with default settings |
| `export_ci` | Build for automated/CI workflows |
| `set_project_folder` | Set current project folder |
| `set_hise_folder` | Set HISE source location |
| `get_project_folder` | Get current project folder |
| `set_version` | Set project version |
| `clean` | Clean Binaries folder |
| `get_build_flags` | Show build configuration and features |

---

## Build Artifacts

| Configuration | Path |
|---------------|------|
| Release | `projects\standalone\Builds\VisualStudio2026\x64\Release\App\HISE.exe` |
| Release with Faust | `projects\standalone\Builds\VisualStudio2026\x64\Release with Faust\App\HISE.exe` |

---

## Error Handling

| Issue | Solution |
|-------|----------|
| Git not found | `curl -L -o "%TEMP%\git-installer.exe" "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe"` |
| VS2026 not found | Download from https://visualstudio.microsoft.com/downloads/ - HALT until installed |
| ARM64 detected | Proceed with x64 build (runs via emulation) |
| Projucer not found | Run `git submodule update --init --recursive` |
| MSBuild already running | Wait for existing build to complete |
| HISE.exe < 10MB | Linker failure - rebuild with `/p:PreferredToolArchitecture=x64` |
| IPP not found | Silent install: `intel-ipp-installer.exe -s -a --silent --eula accept` |
| Faust version too old | Requires 2.54.0+ or enable `HI_FAUST_NO_WARNING_MESSAGES` flag |

---

## Technical Notes

- **C++ Standard:** C++17
- **JUCE Branch:** juce6 (fixed)
- **Build Timeout:** 600000ms (10 minutes) recommended
- **64-bit Linker:** Use `/p:PreferredToolArchitecture=x64` to avoid out-of-memory errors
- **Intel IPP Silent Install:** `-s -a --silent --eula accept` includes VS integration by default

---

## Limitations

- Requires internet connection
- Requires Administrator privileges
- Does not create installers

---

## Resources

- Website: https://hise.audio
- Forum: https://forum.hise.audio/
- Documentation: https://docs.hise.dev/
- Repository: https://github.com/christophhart/HISE
