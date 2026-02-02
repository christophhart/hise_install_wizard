# HISE Development Environment Setup - Windows

## Overview

Setup guide for HISE (Hart Instrument Software Environment) on Windows 10+ (64-bit x64 only).

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
| 6 | Repository Check | Yes | Verify JUCE submodule and SDKs (including VST3 SDK) |
| 7 | Compile HISE | Yes | Build standalone application |
| 8 | Add to PATH | Yes | Add HISE binary to system PATH |
| 9 | Verify Build | Yes | Run `HISE get_build_flags` |
| 10 | Test Project | Yes | Compile demo project as VST3 plugin (CI config) |
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

> **IMPORTANT:** HISE requires Visual Studio 2026 **Community Edition** specifically. Professional and Enterprise editions are not currently supported.

1. Download Visual Studio Community 2026
2. Select "Desktop development with C++" workload
3. Verify installation:

```batch
if exist "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" (
    echo Visual Studio 2026 Community Edition installed successfully
) else (
    echo ERROR: Visual Studio 2026 Community Edition not detected
    echo NOTE: Professional and Enterprise editions are not supported
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

REM Extract SDKs (contains ASIO SDK, VST3 SDK required for plugin builds)
cd tools\SDK
tar -xf sdk.zip
cd ..\..

REM Verify SDKs
if exist "tools\SDK\ASIOSDK2.3" (echo ASIO SDK OK) else (echo WARNING: ASIO SDK not found)
if exist "tools\SDK\VST3 SDK" (echo VST3 SDK OK) else (echo WARNING: VST3 SDK not found - required for VST3 plugin builds)

REM Verify Projucer
if exist "JUCE\Projucer\Projucer.exe" (echo Projucer OK) else (echo ERROR: Projucer not found)
```

> **Note:** The VST3 SDK is required for building VST3 plugins (used in Phase 10 test). It is included in `sdk.zip`.

---

## Phase 7: Compile HISE

> **Build Timeout:** Compilation takes 5-15 minutes. Set timeout to 600000ms minimum.

> **Projucer Location:** `{hisePath}\JUCE\Projucer\Projucer.exe` (case-sensitive path)

> **Important:** Use absolute paths for all file references to avoid working directory issues.

**Without Faust:**
```batch
cd {hisePath}\projects\standalone
"{hisePath}\JUCE\Projucer\Projucer.exe" --resave "{hisePath}\projects\standalone\HISE Standalone.jucer"
set PreferredToolArchitecture=x64
"C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" "{hisePath}\projects\standalone\Builds\VisualStudio2026\HISE Standalone.sln" /p:Configuration=Release /p:Platform=x64 /verbosity:minimal
```

**With Faust:**
```batch
cd {hisePath}\projects\standalone
"{hisePath}\JUCE\Projucer\Projucer.exe" --resave "{hisePath}\projects\standalone\HISE Standalone.jucer"
set PreferredToolArchitecture=x64
"C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" "{hisePath}\projects\standalone\Builds\VisualStudio2026\HISE Standalone.sln" /p:Configuration="Release with Faust" /p:Platform=x64 /verbosity:minimal
```

**Post-build verification:** HISE.exe must be > 10MB (corrupted builds are ~2MB)

```batch
cd Builds\VisualStudio2026\x64\Release\App
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

> **Note:** Uses `-nolto` for faster test builds. Builds a VST3 instrument plugin which requires the VST3 SDK (extracted in Phase 6).

**Step 1: Configure HISE compiler settings**

Before exporting, configure the compiler settings. This sets the HISE source path, Visual Studio version, and optionally IPP and Faust paths:

```batch
REM Detect IPP installation
if exist "C:\Program Files (x86)\Intel\oneAPI\ipp\latest" (
    set IPP_FLAG=-ipp:1
) else (
    set IPP_FLAG=-ipp:0
)

REM Detect Faust installation
if exist "C:\Program Files\Faust\lib\faust.dll" (
    set FAUST_FLAG=-faustpath:"C:\Program Files\Faust"
) else (
    set FAUST_FLAG=
)

REM Configure HISE settings
HISE set_hise_settings -hisepath:"{hisePath}" -vs:2026 %IPP_FLAG% %FAUST_FLAG%
```

**Step 2: Set project folder and export**

```batch
HISE set_project_folder "-p:{hisePath}\extras\demo_project"
HISE export "{hisePath}\extras\demo_project\XmlPresetBackups\Demo.xml" -t:instrument -p:VST3 -a:x64 -nolto
```

> **Note:** The `export` command requires an absolute path to the XML file.

**Expected Output:**
- Build files generated in `{hisePath}\extras\demo_project\Binaries\`
- Batch compile script created: `batchCompile.bat`

**Run the generated compile script:**
```batch
call "{hisePath}\extras\demo_project\Binaries\batchCompile.bat"
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
| `export` | Build project with default settings (requires absolute path to XML) |
| `export_ci` | Build for automated/CI workflows (uses relative path, VS2017) |
| `set_project_folder` | Set current project folder |
| `set_hise_folder` | Set HISE source location |
| `set_hise_settings` | Configure compiler settings (hisepath, vs, ipp, faustpath) |
| `get_project_folder` | Get current project folder |
| `set_version` | Set project version |
| `clean` | Clean Binaries folder |
| `get_build_flags` | Show build configuration and features |

### set_hise_settings Command

```batch
HISE set_hise_settings [-hisepath:PATH] [-vs:20XX] [-ipp:X] [-faustpath:PATH]
```

| Flag | Description |
|------|-------------|
| `-hisepath:PATH` | Absolute path to HISE source repository |
| `-vs:20XX` | Visual Studio version (2022 or 2026). Windows only. |
| `-ipp:X` | Enable Intel IPP (1 or 0) |
| `-faustpath:PATH` | Absolute path to Faust installation |

All flags are optional. Omitted flags will use default values.

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
| Script execution blocked | Run `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process` before running script |
| Git not found | `curl -L -o "%TEMP%\git-installer.exe" "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe"` |
| VS2026 Community not found | Download Community Edition from https://visualstudio.microsoft.com/downloads/ - HALT until installed. Note: Pro/Enterprise not supported |
| ARM64 detected | Proceed with x64 build (runs via emulation) |
| Projucer not found | Run `git submodule update --init --recursive` |
| MSBuild path error | Use absolute paths: `"{hisePath}\projects\standalone\Builds\VisualStudio2026\HISE Standalone.sln"` |
| MSBuild already running | Wait for existing build to complete |
| HISE.exe < 10MB | Linker failure - rebuild with `/p:PreferredToolArchitecture=x64` |
| IPP not found | Silent install: `intel-ipp-installer.exe -s -a --silent --eula accept` |
| Faust version too old | Requires 2.54.0+ or enable `HI_FAUST_NO_WARNING_MESSAGES` flag |
| PRESET NOT FOUND error | Use absolute path with `export` command, not `export_ci` |

---

## Technical Notes

- **C++ Standard:** C++17
- **JUCE Branch:** juce6 (fixed)
- **Build Timeout:** 600000ms (10 minutes) recommended
- **64-bit Linker:** Set `PreferredToolArchitecture=x64` environment variable to avoid out-of-memory errors
- **Intel IPP Silent Install:** `-s -a --silent --eula accept` includes VS integration by default
- **MSBuild Path (VS2026):** `C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe`
- **VS Edition:** Community Edition only - Professional and Enterprise are not supported
- **Projucer Path:** `{hisePath}\JUCE\Projucer\Projucer.exe`
- **Test Build Config:** Uses `-nolto` flag for faster test builds
- **Export Command:** Use `export` with absolute XML path (not `export_ci` which uses relative paths)
- **Compiler Settings:** Stored in `%APPDATA%\HISE\compilerSettings.xml`
- **PowerShell Execution Policy:** May require `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process`

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
