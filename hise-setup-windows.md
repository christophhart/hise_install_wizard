---
name: hise-setup-windows
description: Setup Windows computer to work with HISE (refactored version).
---

# HISE Development Environment Setup - Windows

## Overview
Automates complete development environment setup for HISE (Hart Instrument Software Environment) on Windows.

## Supported Platforms
- **Windows 7+** (64-bit x64 only - **ARM64 not currently supported**)

> **Windows ARM64 Note:** HISE does not currently have native Windows ARM64 build configurations. Windows ARM devices can run the x64 build through emulation, but native ARM64 builds would require modifications to the Projucer project file.

---

## Core Capabilities

### 1. Platform Detection
- Automatically detects Windows version
- Verifies OS version compatibility
- **Detects CPU architecture** (x64, arm64)
- Adjusts setup workflow based on platform
- **Windows ARM64:** Warns user that native ARM64 builds are not supported; x64 builds will run via emulation

### 2. Git Installation & Repository Setup
- Checks for Git installation
- Installs Git if missing
- Clones HISE repository from **develop branch** (default)
- Initializes and updates JUCE submodule
- Uses **juce6 branch only** (stable version)

### 3. Visual Studio 2026 Installation (REQUIRED - Cannot Skip)

> **This step is mandatory.** HISE cannot be compiled without a C++ compiler. The agent must not offer an option to skip this step.

- Detects Visual Studio installation (**VS2026 required**)
- If not installed: **HALT** and direct user to install VS2026 Community with "Desktop development with C++" workload
- Verifies MSBuild availability before proceeding
- **Cannot proceed without Visual Studio**

### 4. SDK Installation

**Required SDKs:**
- Extracts and configures ASIO SDK 2.3 (low-latency audio)
- Extracts and configures VST3 SDK

**Optional (User Prompted):**
- **Intel IPP oneAPI:** Performance optimization (installed after Visual Studio)
  - User prompted after VS installation
  - Provides option to build without IPP
  - Configures Projucer setting accordingly
  - User downloads and runs GUI installer manually
- **Faust DSP programming language**
  - User prompted before installation
  - Download using curl or manually from GitHub releases
  - Install to `C:\Program Files\Faust\`
  - Requires Faust version 2.54.0+ (recommended)

### 6. HISE Compilation
- Compiles HISE from `projects/standalone/HISE Standalone.jucer`
- Uses Projucer (from JUCE submodule) to generate IDE project files
- Compiles HISE using Visual Studio 2026 (Release)
- **Aborts on non-trivial build failures**

### 7. Environment Setup
- Adds compiled HISE binary to PATH environment variable
- Verifies HISE is callable from command line

### 8. Verification
- Runs `HISE --help` to display available CLI commands
- Compiles test project from `extras/demo_project/`
- Confirms system is ready for HISE development

---

## Verified Download URLs

### Windows Specific
- **Visual Studio 2026 Community:** https://visualstudio.microsoft.com/downloads/
  - Download: "Visual Studio Community 2026" (Web Installer)
  - Workload: "Desktop development with C++"
- **Intel IPP oneAPI 2022.3.1.10:** https://registrationcenter-download.intel.com/akdlm/IRC_NAS/9c651894-4548-491c-b69f-49e84b530c1d/intel-ipp-2022.3.1.10_offline.exe
- **ASIO SDK 2.3:** https://www.steinberg.net/de/company/developer.html

### All Platforms
- **Faust DSP Language (2.54.0+):** https://github.com/grame-cncm/faust/releases
  - Windows: `Faust-VERSION-win64.exe`

---

## Required Tools & Paths

### Windows Build Tools
1. **MSBuild** (from Visual Studio 2026)
   - Path: `C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe`

2. **Projucer** (from JUCE submodule)
   - Path: `{hisePath}\JUCE\Projucer\Projucer.exe`

3. **Visual Studio Solution**
   - Path: `{buildPath}\Builds\VisualStudio2026\{project}.sln`

---

## HISE CLI Commands (verified from Main.cpp)

**Available Commands:**
- `export` - builds project using default settings
- `export_ci` - builds project using customized behaviour for automated builds
- `full_exp` - exports project as Full Instrument Expansion (HISE Player Library)
- `compress_samples` - collects all HLAC files into a hr1 archive
- `set_project_folder` - changes current project folder
- `set_hise_folder` - sets HISE source code folder location
- `get_project_folder` - returns current project folder
- `set_version` - sets project version number
- `clean` - cleans Binaries folder
- `create-win-installer` - creates Inno Setup installer script
- `create-docs` - creates HISE documentation files
- `load` - loads given file and returns status code
- `compile_script` - compiles script file and returns Console output as JSON
- `compile_networks` - compiles DSP networks in given project folder
- `create_builder_cache` - creates cache file for Builder AI agent
- `get_build_flags` - prints out the build configuration and feature flags (Faust, IPP, etc.)
- `run_unit_tests` - runs unit tests (requires CI build)

**Usage:**
```batch
HISE COMMAND [FILE] [OPTIONS]
```

**Verify Build Configuration:**
After compilation, you can verify the build configuration with:
```batch
HISE get_build_flags
```

This displays:
- Build type (Release or Release with Faust)
- Enabled features (Faust, IPP, Rlottie, Loris, RT Neural)
- HISE and JUCE versions
- Git commit hash

**Arguments:**
- `-h:{TEXT}` - sets HISE path
- `-ipp` - enables Intel Performance Primitives
- `-l` - compile for legacy CPU models
- `-t:{TEXT}` - sets project type ('standalone' | 'instrument' | 'effect' | 'midi')
- `-p:{TEXT}` - sets plugin type ('VST' | 'AU' | 'VST_AU' | 'AAX' | 'ALL' | 'VST2' | 'VST3' | 'VST23AU')
- `--help` - displays this help message

---

## Automated Workflow

### Administrator Check (REQUIRED)

> **CRITICAL:** This setup script MUST be run with Administrator privileges. Several steps require admin access (installing software, modifying PATH, etc.). The script will abort immediately if not run as Administrator.

**Check Command:**
```batch
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [CRITICAL ERROR] Administrator privileges required!
    echo Please right-click and select "Run as administrator"
    exit /b 1
)
```

**If not Administrator:** Display error and abort immediately. Do NOT offer a workaround or alternative path.

---

## Phase 0: System State Detection

**High-level log:** "Detecting system state and installed components..."

This phase checks the current system state to determine which components are already installed and which steps can be skipped. This allows the setup wizard to automatically bypass completed steps.

### System State Checks

The agent should query the system for the following:

1. **Platform Detection**
   - Verify Windows compatibility (Windows 7+ required)
   - **Detect CPU architecture** (x64, arm64)
   - Check disk space requirements (~2-5 GB)

   **Architecture Detection Commands:**
   - **Windows:** `echo %PROCESSOR_ARCHITECTURE%` (returns `AMD64` for x64, `ARM64` for ARM)

   **Normal Mode:**
   - **Windows ARM64:** Display warning that native ARM64 is not supported, x64 build will be created (runs via Windows x64 emulation)

2. **Component Auto-Detection**
   - **Visual Studio 2026:** Check installation at `C:\Program Files\Microsoft Visual Studio\18\Community\`
   - **Intel IPP:** Check installation at `C:\Program Files (x86)\Intel\oneAPI\ipp\latest`
   - **Faust:** Check installation at `C:\Program Files\Faust\lib\faust.dll`
   - **Git:** Run `git --version` to check if installed
   - **HISE Repository:** Check if current directory is a git repository with `.git` folder
   - **SDKs:** Check if `tools/SDK/ASIOSDK2.3/` and `tools/SDK/VST3 SDK/` directories exist
   - **JUCE Submodule:** Check if `JUCE/` directory exists and is on `juce6` branch

3. **Display System State Summary**
   - Show status of all detected components:
     - Visual Studio: Installed/Not installed
     - Intel IPP: Installed/Not installed
     - Faust: Installed/Not installed
     - Git: Installed/Not installed
     - HISE Repository: Exists/Does not exist
     - SDKs: Already extracted/Need extraction
     - JUCE Submodule: Initialized/Not initialized

---

## Phase 1: User Configuration

**High-level log:** "Gathering user preferences and configuration settings..."

This phase collects user preferences for the setup process, including installation location and optional component selections (Intel IPP, Faust).

### User Configuration Options

1. **Installation Location Selection**
   - Default path: `C:\HISE`
   - Prompt user:
     ```
     Default HISE installation path: C:\HISE

     Where would you like to install HISE?
     1. Use default location (C:\HISE)
     2. Specify custom path
     ```

2. **Optional Component Selection**

**Visual Studio (REQUIRED - cannot skip):**
   - If Visual Studio is NOT installed from Phase 0 detection:
     ```
     [REQUIRED] Visual Studio 2026 is not installed.

     Please download and install Visual Studio 2026 Community:
     - Download from: https://visualstudio.microsoft.com/downloads/
     - Select "Visual Studio Community 2026" (Web Installer)
     - During installation, select "Desktop development with C++" workload
     - IMPORTANT: Use the standard Community edition, NOT Preview/Insider editions

     After installation is complete, press Enter to continue...
     ```
   - The agent **HALTS** and waits for user to press Enter
   - After user confirms, verify installation again:
     ```batch
     if exist "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" (
         echo Visual Studio 2026 installed successfully
     ) else (
         echo ERROR: Visual Studio installation not detected. Please try again.
         exit /b 1
     )
     ```

**Intel IPP (Optional - user selection):**
   - Prompt user:
     ```
     Install Intel IPP oneAPI for performance optimization?

     Intel IPP provides optimized signal processing functions that can improve HISE performance.

     [Y] Yes, install Intel IPP
     [N] No, build without IPP
     ```
   - Store user choice for Phase 6 execution
   - If user selects "Yes" and IPP is not installed: Phase 6 will install it
   - If user selects "Yes" and IPP is already installed: Phase 6 will be skipped
   - If user selects "No": Phase 6 will be skipped

**Faust (Optional - user selection):**
   - Prompt user:
     ```
     Install Faust DSP programming language?

     Faust allows real-time DSP compilation within HISE, enabling dynamic audio processing algorithms.

     [Y] Yes, install Faust (builds "Release with Faust" configuration)
     [N] No, skip Faust (builds standard Release configuration)
     ```
   - Store user choice for Phase 7 execution
   - If user selects "Yes" and Faust is not installed: Phase 7 will install it
   - If user selects "Yes" and Faust is already installed: Phase 7 will be skipped
   - If user selects "No": Phase 7 will be skipped and standard Release build will be used

**After Phase 1 Complete:**
- Store all user preferences:
  - Installation path (default `C:\HISE` or custom path)
  - Intel IPP choice (true/false)
  - Faust choice (true/false)
- Proceed to Phase 2 with all preferences set (no more user prompts required)

---

## Phase 2: Git Setup (if needed)

**High-level log:** "Setting up HISE repository (cloning or updating)..."

### Step 2: Git Setup
- Check if repository already exists at installation path
- If already exists: Pull latest changes from develop branch
- If not exists: Clone repository from develop branch
- Initialize JUCE submodule and checkout juce6

**Normal Mode:**
```batch
cd {hisePath}

REM Check if repository already exists
if exist ".git" (
    echo HISE repository already exists, pulling latest changes...
    git fetch origin
    git pull origin develop
) else (
    echo Cloning HISE repository...
    git clone https://github.com/christophhart/HISE.git
    cd HISE
)
git checkout develop
git submodule update --init
cd JUCE && git checkout juce6 && cd ..
```

---

## Phase 3: Visual Studio 2026 Installation

**High-level log:** "Installing Visual Studio 2026 Community..."

### Step 3: Visual Studio 2026 Installation (REQUIRED - Cannot Skip)

> **This step is mandatory.** HISE cannot be compiled without a C++ compiler. The agent must not offer an option to skip this step.

- Detects Visual Studio installation (**VS2026 required**)
- If not installed: **HALT** and direct user to install VS2026 Community with "Desktop development with C++" workload
- Verifies MSBuild availability before proceeding
- **Cannot proceed without Visual Studio**

**Normal Mode (if Visual Studio not installed):**
```batch
REM Download Visual Studio 2026 Community from https://visualstudio.microsoft.com/downloads/
REM Select "Visual Studio Community 2026" (Web Installer)
REM During installation, select "Desktop development with C++" workload
REM IMPORTANT: Use the standard Community edition, NOT Preview/Insider editions

REM After installation is complete, verify:
if exist "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" (
    echo Visual Studio 2026 installed successfully
) else (
    echo ERROR: Visual Studio installation not detected. Please try again.
    exit /b 1
)
```

---

## Phase 4: JUCE Submodule Verification

**High-level log:** "Verifying JUCE submodule configuration..."

### Step 4: JUCE Submodule Verification
- Verify JUCE submodule is on **juce6 branch**
- Validate JUCE structure is complete


**Normal Mode (if JUCE not initialized):**
```batch
cd {hisePath}
git submodule update --init
cd JUCE && git checkout juce6 && cd ..
```

---

## Phase 5: SDK Installation (if needed)

**High-level log:** "Extracting and configuring required SDKs..."

### Step 5: SDK Installation
- Check if SDKs are already extracted
- If not extracted: Extract tools/SDK/sdk.zip to tools/SDK/
- Verify structure:
  - tools/SDK/ASIOSDK2.3/
  - tools/SDK/VST3 SDK/

```

**Normal Mode (if SDKs not already extracted):**
```batch
cd {hisePath}
unzip tools/SDK/sdk.zip -d tools/SDK/
```

---

## Phase 6: Intel IPP Installation (if user selected)

**High-level log:** "Installing Intel IPP oneAPI for performance optimization..."

### Step 6: Intel IPP Installation (Optional)

**Note:** This step only executes if user selected "Yes" to Intel IPP in Phase 1 and Intel IPP is not already installed.

> **Intel IPP Download URL:** https://registrationcenter-download.intel.com/akdlm/IRC_NAS/9c651894-4548-491c-b69f-49e84b530c1d/intel-ipp-2022.3.1.10_offline.exe
> **Recommended Version:** 2022.3.1.10

**Windows Intel IPP Installation:**
1. **Option A - Download using curl (automatic):**
    ```batch
    REM Verify Visual Studio 2026 is installed before attempting IPP installation
    if not exist "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" (
        echo ERROR: Visual Studio 2026 not found. IPP cannot be installed without Visual Studio.
        echo Please install Visual Studio 2026 first, then run this setup again.
        exit /b 1
    )

    echo Visual Studio 2026 detected, proceeding with IPP installation...
    Downloading Intel IPP oneAPI 2022.3.1.10 installer...
    curl -L -o "%TEMP%\intel-ipp-installer.exe" "https://registrationcenter-download.intel.com/akdlm/IRC_NAS/9c651894-4548-491c-b69f-49e84b530c1d/intel-ipp-2022.3.1.10_offline.exe"

    Installing Intel IPP with Visual Studio 2026 integration...
    "%TEMP%\intel-ipp-installer.exe" -s -a --silent --eula accept
    if not %errorlevel%==0 (
        echo ERROR: Intel IPP installation failed. Press Enter to continue without IPP...
        pause
        SET IPP_INSTALLED=0
    ) else (
        echo Intel IPP installed successfully
        SET IPP_INSTALLED=1
    )
    ```
2. **Option B - Manual download:**
    - Direct user to download from the Intel IPP URL
    - Instruct user to run the installer and ensure Visual Studio integration is selected
3. **WAIT** for user to confirm installation is complete
4. Verify installation by checking that this path exists:
    ```batch
    if exist "C:\Program Files (x86)\Intel\oneAPI\ipp\latest" (echo Intel IPP installed successfully) else (echo Intel IPP installation not found)
    ```
5. **If verification fails:** Re-prompt user to complete installation, do NOT proceed

After successful Intel IPP verification, track the installation status:
```batch
REM Track Intel IPP installation status for Phase 10 validation
set IPP_INSTALLED=1
```

If user selected "No" to Intel IPP installation or if installation failed:
```batch
REM Intel IPP was not installed - track for Phase 10 validation
set IPP_INSTALLED=0
```

---

## Phase 7: Faust Installation (if user selected)

**High-level log:** "Installing Faust DSP compiler..."

### Step 7: Faust Installation (Optional)

**Note:** This step only executes if user selected "Yes" to Faust in Phase 1 and Faust is not already installed.

> **Faust Download URL:** https://github.com/grame-cncm/faust/releases
> **Recommended Version:** 2.54.0 or later

**Windows Faust Installation:**
1. **Option A - Download using curl (automatic):**
    ```batch
    curl -L -o "%TEMP%\faust-installer.exe" "https://github.com/grame-cncm/faust/releases/latest/download/Faust-2.54.0-win64.exe"
    "%TEMP%\faust-installer.exe"
    ```
2. **Option B - Manual download:**
    - Direct user to download `Faust-VERSION-win64.exe` from https://github.com/grame-cncm/faust/releases
    - Instruct user to run the installer and install to default path: `C:\Program Files\Faust\`
     - **IMPORTANT:** Must use default path - the .jucer file has this path hardcoded
3. **WAIT** for user to confirm installation is complete
4. Verify installation by checking that these paths exist:
    ```batch
    if exist "C:\Program Files\Faust\lib\faust.dll" (echo Faust installed successfully) else (echo Faust installation not found)
    ```
5. **If verification fails:** Re-prompt user to complete installation, do NOT proceed
6. **No .jucer modifications needed** - Windows Faust configurations already include:
    - Header path: `C:\Program Files\Faust\include`
    - Library path: `C:\Program Files\Faust\lib`
    - Post-build command to copy `faust.dll` to output directory

After successful Faust verification, track the installation status:
```batch
REM Track Faust installation status for Phase 10 validation
set FAUST_INSTALLED=1
```

If user selected "No" to Faust installation or if installation failed:
```batch
REM Faust was not installed - track for Phase 10 validation
set FAUST_INSTALLED=0
```

```
```

**Post-Installation (Windows):**
- After HISE is built and running, set the `FaustPath` in HISE Settings:
  - Windows: `C:\Program Files\Faust\`
- This allows HISE to find Faust libraries for DSP compilation

---

## Phase 8: Compile HISE Standalone Application

**High-level log:** "Compiling HISE Standalone application..."

### Step 8: Compile HISE Standalone Application

**Build Configuration Selection:**
- If Faust was installed (Phase 7): Use `"Release with Faust"` configuration
- If Faust was not installed: Use `Release` configuration

> **IMPORTANT - Build Timeout:** HISE compilation can take **5-15 minutes** depending on the system.
> - Set command timeout to at least **600000ms (10 minutes)** for build commands
> - Do NOT abort the build while the compiler is still running
> - Monitor build output for progress (compiler messages indicate active compilation)
> - Only consider the build failed if the command returns a non-zero exit code
> - **64-bit Linker:** Uses `/p:PreferredToolArchitecture=x64` to avoid out-of-memory errors with 32-bit linker

**Windows:**
- Launch Projucer: `{hisePath}\JUCE\Projucer\Projucer.exe`
- Load project: `projects\standalone\HISE Standalone.jucer`
- Save project to generate IDE files
- Build using MSBuild with 64-bit toolchain

```
```

**Normal Mode (Windows - without Faust):**
```batch
cd {hisePath}\projects\standalone
"{hisePath}\JUCE\Projucer\Projucer.exe" --resave "HISE Standalone.jucer"

REM Timeout: 600000ms (10 minutes) - compilation takes 5-15 minutes
"C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" "Builds\VisualStudio2026\HISE Standalone.sln" /p:Configuration=Release /p:PreferredToolArchitecture=x64 /verbosity:minimal
set BUILD_RESULT=%errorlevel%

if not %BUILD_RESULT%==0 (
    echo ERROR: MSBuild failed with exit code %BUILD_RESULT%
    exit /b %BUILD_RESULT%
)

REM Verify binary size - valid HISE.exe should be > 10MB
REM Corrupted builds from linker failures are typically ~2MB
for %%A in ("HISE.exe") do set HISE_SIZE=%%~zA
if %HISE_SIZE% LSS 10485760 (
    echo ERROR: HISE.exe appears corrupted - size is less than 10MB
    echo This usually indicates a linker failure.
    exit /b 1
)
```

**Normal Mode (Windows - with Faust):**
```batch
cd {hisePath}\projects\standalone
"{hisePath}\JUCE\Projucer\Projucer.exe" --resave "HISE Standalone.jucer"

REM Timeout: 600000ms (10 minutes) - compilation takes 5-15 minutes
"C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" "Builds\VisualStudio2026\HISE Standalone.sln" /p:Configuration="Release with Faust" /p:PreferredToolArchitecture=x64 /verbosity:minimal
set BUILD_RESULT=%errorlevel%

if not %BUILD_RESULT%==0 (
    echo ERROR: MSBuild failed with exit code %BUILD_RESULT%
    exit /b %BUILD_RESULT%
)

REM Verify binary size - valid HISE.exe should be > 10MB
REM Corrupted builds from linker failures are typically ~2MB
for %%A in ("HISE.exe") do set HISE_SIZE=%%~zA
if %HISE_SIZE% LSS 10485760 (
    echo ERROR: HISE.exe appears corrupted - size is less than 10MB
    echo This usually indicates a linker failure.
    exit /b 1
)
```

**Post-build verification:** Check that HISE.exe is > 10MB (corrupted linker builds are ~2MB)

---

## Phase 9: Add HISE to PATH

**High-level log:** "Adding HISE to PATH environment variable..."

### Step 9: Add HISE to PATH

**Path Selection:**
- If Faust was installed: Use `"Release with Faust"` output directory
- If Faust was not installed: Use `Release` output directory

**Windows:**
- Add HISE binary location to PATH

```
```

**Normal Mode (Windows - without Faust):**
```batch
setx PATH "%PATH%;{hisePath}\projects\standalone\Builds\VisualStudio2026\x64\Release\App"
```

**Normal Mode (Windows - with Faust):**
```batch
setx PATH "%PATH%;{hisePath}\projects\standalone\Builds\VisualStudio2026\x64\Release with Faust\App"
```

---

## Phase 10: Verify Build Configuration

**High-level log:** "Verifying HISE build configuration and validating compiled features against user preferences..."

### Step 10: Verify Build Configuration

**Validate Build Flags:**
This step executes `HISE get_build_flags` to verify that HISE was compiled with the configuration that matches the user's preferences from Phase 1:
- Release or Release with Faust build configuration (never Debug)
- Faust support must match the user's Phase 1 Faust selection
- IPP support must match the user's Phase 1 IPP selection (if applicable)

**Validation Process:**
1. Execute: `HISE get_build_flags`
2. Capture and parse the output to extract:
   - Build Configuration: {value}
   - Faust Support: {value}
   - IPP Support: {value}
3. Validate against Phase 1 preferences:
   - Build Configuration must contain "Release" (and "Faust" if selected)
   - Faust Support = "Enabled" if user selected "Yes" in Phase 1, "Disabled" otherwise
   - IPP Support = "Enabled" if user selected "Yes" and installed IPP in Phase 1, "Disabled" otherwise

```

**Normal Mode Execution:**

1. Execute: `HISE get_build_flags`
2. Capture and parse the output
3. Extract the following lines:
   - Build Configuration: {value}
   - Faust Support: {value}
   - IPP Support: {value}

4. Validate against Phase 1 user preferences:
   - Build Configuration must contain "Release"
   - If user selected "Yes" to Faust in Phase 1: Faust Support must be "Enabled"
   - If user selected "No" to Faust in Phase 1: Faust Support must be "Disabled"
   - If user selected "Yes" to IPP in Phase 1 and installed it: IPP Support must be "Enabled"
   - If user selected "No" to IPP in Phase 1: IPP Support must be "Disabled"

**If All Validations Pass:**
```
Verifying HISE build configuration against your Phase 1 preferences...

Build Configuration Validation Results:
[✓] Build Configuration: Release with Faust (matches your selection)
[✓] Faust Support: Enabled (matches your Phase 1 choice)
[✓] IPP Support: Enabled (matches your Phase 1 choice)

Build configuration verified successfully!
```
Then proceed to Phase 11.

**If Any Validation Fails:**

Display validation error with options:
```
[✗] BUILD CONFIGURATION VALIDATION FAILED

Your Phase 1 Preferences:
  - Faust: Yes (you selected to install Faust)
  - IPP: Yes (you selected to install IPP)

Expected Build Flags (from your choices):
  - Faust Support: Enabled
  - IPP Support: Enabled

Actual Build Flags (from HISE get_build_flags output):
  - Build Configuration: Release
  - Faust Support: Disabled ✗
  - IPP Support: Enabled ✓

PROBLEM: Faust support is disabled but you requested it in Phase 1.
This indicates Faust was not properly linked during compilation.

OPTIONS:
1. Rebuild HISE automatically
    - Will run: Projucer --resave, then MSBuild, then re-verify build flags

2. Reconfigure manually
    - Verify your installation matches Phase 1 preferences
    - Check Projucer project settings
    - Manually rebuild HISE using the build commands from Phase 8
    - Re-run this verification: HISE get_build_flags

3. Skip validation and continue
    - Proceed to Phase 11 without verification

Select option (1/2/3):
```

**Option 1 (Rebuild Automatically):**
- Execute: `"{hisePath}\JUCE\Projucer\Projucer.exe" --resave "projects\standalone\HISE Standalone.jucer"`
- If Projucer fails: Display error and ask user to select option 2
- Execute: `"C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" "projects\standalone\Builds\VisualStudio2026\HISE Standalone.sln" /p:Configuration={Release|"Release with Faust"} /p:PreferredToolArchitecture=x64 /verbosity:minimal`
- If MSBuild fails: Display error and ask user to select option 2
- Execute `HISE get_build_flags` again and validate
- If validation passes: Display success message and proceed to Phase 11
- If validation still fails: Display error prompt again and loop back to OPTIONS

**Option 2 (Reconfigure Manually):**
```
MANUAL RECONFIGURATION REQUIRED

Please review and correct the following:

For Faust issues:
  1. Verify Faust is installed: C:\Program Files\Faust\lib\faust.dll
  2. Check Projucer project settings include Faust paths
  3. Manually rebuild HISE using the build commands from Phase 8
  4. Re-run this verification: HISE get_build_flags

For IPP issues:
  1. Verify IPP is installed: C:\Program Files (x86)\Intel\oneAPI\ipp\latest
  2. Check Projucer project settings include IPP paths
  3. Manually rebuild HISE using the build commands from Phase 8
  4. Re-run this verification: HISE get_build_flags

For IPP issues:
  1. Verify IPP is installed: C:\Program Files (x86)\Intel\oneAPI\ipp\latest
  2. Check Projucer project settings include IPP paths
  3. Manually rebuild HISE using the build commands from Phase 8
  4. Re-run this verification: HISE get_build_flags

After rebuilding, restart this setup script.
```
Then exit the script.

**Option 3 (Skip):**
```
Skipping build configuration validation.
WARNING: Build may be incomplete if validations failed!
Proceeding to Phase 11...
```
Then proceed to Phase 11.

---

## Phase 11: Compile Test Project

**High-level log:** "Compiling test project to verify complete setup..."

### Step 11: Compile Test Project

**Test Project Location:** `extras\demo_project\`

**Compile Test Project:**
```batch
HISE set_project_folder -p:"{hisePath}\extras\demo_project"
HISE export_ci "XmlPresetBackups\Demo.xml" -t:standalone -a:x64
```

```

**Normal Mode:**
- Sets the demo project as the current HISE project folder
- Exports and compiles standalone application using CI export workflow
- Verifies all tools and SDKs are correctly configured

---

## Phase 12: Success Verification

**High-level log:** "Setup complete! HISE development environment is ready to use."

### Step 12: Success Verification

**Successful completion criteria:**
1. HISE compiled from `projects\standalone\HISE Standalone.jucer`
2. HISE binary added to PATH
3. Build configuration verified with `HISE get_build_flags`
4. Test project from `extras\demo_project\` compiles successfully
5. No errors during compilation

```

**Normal Mode:**
- Display success message
- Show HISE CLI help with `HISE --help`
- System is fully ready for HISE development

---

## Build Configuration Details

### Default Configuration
- **Configuration:** Release (without Faust) or "Release with Faust" (with Faust)
- **Architecture:** 64-bit (x64)
- **JUCE Version:** juce6 (stable)
- **Visual Studio:** 2026 (default)

### Build Configuration Selection
| Faust Installed | Platform | Configuration          | Output Directory                         |
|-----------------|----------|------------------------|------------------------------------------|
| No              | Windows  | `Release`              | `...\x64\Release\App\`                   |
| Yes             | Windows  | `"Release with Faust"` | `...\x64\Release with Faust\App\`        |

### Platform-Specific Build Commands

**Windows (VS2026 - without Faust):**
```batch
cd projects\standalone
"{hisePath}\JUCE\Projucer\Projucer.exe" --resave "HISE Standalone.jucer"
"C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" "Builds\VisualStudio2026\HISE Standalone.sln" /p:Configuration=Release /p:PreferredToolArchitecture=x64 /verbosity:minimal
```

**Windows (VS2026 - with Faust):**
```batch
cd projects\standalone
"{hisePath}\JUCE\Projucer\Projucer.exe" --resave "HISE Standalone.jucer"
"C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Current\Bin\MsBuild.exe" "Builds\VisualStudio2026\HISE Standalone.sln" /p:Configuration="Release with Faust" /p:PreferredToolArchitecture=x64 /verbosity:minimal
```

> **Note:**
> - The `/p:PreferredToolArchitecture=x64` flag ensures the 64-bit linker is used, avoiding out-of-memory errors

---

## Error Handling

### Common Issues & Solutions

**Git not found:**
- Windows: Download using curl or visit https://git-scm.com/
  ```batch
  curl -L -o "%TEMP%\git-installer.exe" "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe"
  "%TEMP%\git-installer.exe"
  ```

**Visual Studio 2026 not found (Windows):**
- Direct to download page: https://visualstudio.microsoft.com/downloads/
- Specify "Visual Studio Community 2026" and "Desktop development with C++" workload
- Script HALTS and waits for user to install and press Enter

**Windows ARM64 detected:**
- Display warning: Native ARM64 builds not currently supported
- Proceed with x64 build configuration (will run via Windows x64 emulation)
- Ensure Visual Studio includes x64 build tools (should be included by default)
- The resulting HISE.exe will be x64 and run through emulation on ARM64 Windows

**Projucer not found:**
- Verify JUCE submodule initialized
- Check path: `{hisePath}\JUCE\Projucer\Projucer.exe`
- Run: `git submodule update --init --recursive`

**MSBuild already running (Windows):**
- **ERROR:** "MSBuild is already running! Please wait for existing build to complete."
- **Action:** Setup script aborts to prevent system overload
- **Wait:** Monitor existing build to completion, then restart setup
- **Cause:** Multiple MSBuild instances (from AI agent retries or concurrent operations)
- **Solution:** Let the current build complete before restarting

**SDK extraction failed:**
- Verify tools\SDK\sdk.zip exists
- Check write permissions
- Manually guide extraction

**HISE not in PATH after setup:**
- Check PATH configuration
- Restart shell to apply changes

**Build failures:**
- Check compiler versions
- Verify SDK paths
- Review build output
- **ABORT** if non-trivial failure

**HISE.exe is too small (< 10MB):**
- **Cause:** Linker failure - the build appeared to succeed but produced a corrupted binary
- **Symptom:** HISE.exe exists but is only ~2MB instead of >10MB
- **Solution:** Check build output for linker errors (often out-of-memory with 32-bit linker)
- **Fix:** Ensure `/p:PreferredToolArchitecture=x64` is used to force 64-bit linker
- **Action:** Delete the corrupted HISE.exe and rebuild

**IPP not found (Windows):**
- Silent installation is attempted automatically: `%TEMP%\intel-ipp-installer.exe -s -a --silent --eula accept`
- This command installs IPP with Visual Studio integration by default
- If silent installation fails, offer to disable IPP in Projucer and rebuild without IPP

**Faust installation failed (Windows):**
- Verify `C:\Program Files\Faust\` exists
- Check that `faust.dll` is present in `C:\Program Files\Faust\lib\`
- Re-download using curl:
  ```batch
  curl -L -o "%TEMP%\faust-installer.exe" "https://github.com/grame-cncm/faust/releases/latest/download/Faust-2.54.0-win64.exe"
  "%TEMP%\faust-installer.exe"
  ```
- Or download manually from https://github.com/grame-cncm/faust/releases
- Run installer as Administrator if permission issues occur

**Faust version too old:**
- HISE requires Faust 2.54.0 or later
- If using older version (e.g., 2.50.6), enable `HI_FAUST_NO_WARNING_MESSAGES` flag in Projucer
- Recommended: Update to latest Faust release

**Test project compilation fails:**
- Verify demo project exists at `extras\demo_project\`
- Check all SDK paths
- Review error messages
- Provide specific troubleshooting steps

---

## Success Criteria

### Completion Criteria
Agent completes successfully when:
1. Platform is detected and verified
2. Visual Studio 2026 is installed and functional
3. Git is installed and repository cloned
4. JUCE submodule is initialized with **juce6 branch**
5. Required SDKs are extracted and configured
6. Intel IPP is installed (if user selected)
7. Faust is installed (if user selected)
8. HISE compiles from `projects\standalone\HISE Standalone.jucer` without errors
9. HISE binary is added to PATH environment variable
10. `HISE get_build_flags` displays correct build configuration
11. Test project from `extras\demo_project\` compiles successfully
12. System is fully ready for HISE development

---

## Technical Notes

### Intel IPP Command-Line Installation

The Intel IPP oneAPI installer supports silent command-line installation with the following key options:
- `-s -a --silent`: Runs in non-interactive (silent) mode
- `--eula accept`: Required to accept the End User License Agreement
- **Visual Studio Integration:** In silent mode, VS integration is installed by default (if supported)
  - To skip VS integration: `-p=NEED_VSXXXX_INTEGRATION=0` (e.g., `-p=NEED_VS2019_INTEGRATION=0`)
  - For VS2026, we use the default behavior which includes VS integration
- **Installation timeout:** Allow ~5-10 minutes for complete installation
- **Installation directory:** Default is `C:\Program Files (x86)\Intel\oneAPI`

Example command used in this setup:
```batch
intel-ipp-2022.3.1.10_offline.exe -s -a --silent --eula accept
```

This installs IPP with Visual Studio integration for all detected VS instances (including VS2026).

### Build Timeouts
- **HISE compilation takes 5-15 minutes** depending on system specifications
- **Recommended timeout for build commands: 600000ms (10 minutes)**
- Do NOT abort build commands while compiler output is still being generated
- Build is only failed if the command returns a non-zero exit code
- Projucer `--resave` command is fast (< 30 seconds)
- **64-bit Toolchain:** Uses `/p:PreferredToolArchitecture=x64` to ensure the 64-bit linker is used

### Compiler Requirements
- C++17 standard
- MSVC via Visual Studio 2026 (default)

### Project Files
- HISE Standalone: `projects\standalone\HISE Standalone.jucer`
- Test Project: `extras\demo_project\XmlPresetBackups\Demo.xml`
- Build Tool: Projucer (from JUCE submodule)
- JUCE Branch: juce6 (stable, only option)

### Build Artifacts

**Without Faust (Release configuration):**
- Windows: `projects\standalone\Builds\VisualStudio2026\x64\Release\App\HISE.exe`

**With Faust ("Release with Faust" configuration):**
- Windows: `projects\standalone\Builds\VisualStudio2026\x64\Release with Faust\App\HISE.exe`

### Environment Variables
- **PATH:** Includes HISE binary directory for command-line access
- **Visual Studio Version:** Default set to 2026 on Windows

### Optional Features
- Faust JIT compiler
- Perfetto profiling (disabled by default)
- Loris, RLottie (Minimal build excludes these)
- Intel IPP (Windows only, optional but recommended)

---

## Maintenance & Updates
- Follows develop branch by default
- Supports switching between branches
- Handles submodule updates
- Provides update workflow when new versions are available

---

## Limitations
- Requires internet connection for downloads
- **Windows:** Requires Administrator privileges (script will abort if not run as Administrator)
- **Windows ARM64:** Native ARM64 builds are not currently supported
  - The HISE Projucer project only includes x64 configurations
  - On Windows ARM devices, the x64 build will be created and runs via Windows x64 emulation
  - Performance may be reduced compared to native ARM64 builds
  - Native ARM64 support would require adding ARM64 configurations to the `.jucer` file
- Does not handle licensing (GPL v3)
- Does not create installers (focus on development environment)
- JUCE branch is fixed to juce6 (stable)

---

## Support Resources
- Website: https://hise.audio
- Forum: https://forum.hise.audio/
- Documentation: https://docs.hise.dev/
- Repository: https://github.com/christophhart/HISE
- CLI Help: Run `HISE --help` for complete command reference