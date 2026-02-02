import { 
  ScriptConfig, 
  UpdateScriptConfig,
  HELP_URL, 
  generateHeader,
  generateUpdateHeader,
  generatePowerShellUtilities,
  generatePowerShellErrorHandler,
  generateGitPullSectionPS,
  generateCompileSectionWindows,
  generateVerifySectionPS,
  generateUpdateSuccessMessagePS,
} from './common';

export function generateWindowsScript(config: ScriptConfig): string {
  const { installPath, includeFaust, includeIPP, skipPhases } = config;
  
  // Escape backslashes for PowerShell
  const escapedPath = installPath.replace(/\\/g, '\\');
  
  const script = `# ${generateHeader(config).split('\n').join('\n# ')}

# ============================================
# HISE Setup Script for Windows
# ============================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
function Write-Phase { param($msg) Write-Host "[PHASE] $msg" -ForegroundColor Cyan }
function Write-Step { param($msg) Write-Host "  -> $msg" -ForegroundColor White }
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Error handler
function Handle-Error {
    param($phase, $message)
    Write-Err $message
    Write-Host ""
    Write-Host "Need help? Visit: ${HELP_URL}?platform=windows&phase=$phase" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check admin privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Err "This script requires Administrator privileges."
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

$HISE_PATH = "${escapedPath}"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HISE Setup Script for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Install path: $HISE_PATH" -ForegroundColor White
Write-Host ""

# ============================================
# Phase 2: Git Setup
# ============================================
${skipPhases.includes(2) ? '# SKIPPED: Git already configured' : `
Write-Phase "Phase 2: Git Setup"

# Check if Git is installed
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitPath) {
    Write-Step "Installing Git..."
    $gitInstaller = "$env:TEMP\\git-installer.exe"
    Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe" -OutFile $gitInstaller
    Start-Process -FilePath $gitInstaller -Args "/VERYSILENT /NORESTART" -Wait
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Success "Git installed"
} else {
    Write-Success "Git already installed"
}

# Clone or update HISE repository
if (-not (Test-Path "$HISE_PATH\\.git")) {
    Write-Step "Cloning HISE repository..."
    New-Item -ItemType Directory -Force -Path (Split-Path $HISE_PATH -Parent) | Out-Null
    git clone https://github.com/christophhart/HISE.git "$HISE_PATH"
    if ($LASTEXITCODE -ne 0) { Handle-Error 2 "Failed to clone HISE repository" }
} else {
    Write-Step "Updating HISE repository..."
    Set-Location $HISE_PATH
    git fetch origin
    git pull origin develop
}

Set-Location $HISE_PATH
git checkout develop
git submodule update --init
Set-Location JUCE
git checkout juce6
Set-Location $HISE_PATH

Write-Success "Git setup complete"
`}

# ============================================
# Phase 3: Visual Studio 2022
# ============================================
${skipPhases.includes(3) ? '# SKIPPED: Visual Studio already installed' : `
Write-Phase "Phase 3: Visual Studio 2022"

$vsPath = "C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe"
if (-not (Test-Path $vsPath)) {
    Write-Err "Visual Studio 2022 is not installed."
    Write-Host ""
    Write-Host "Please install Visual Studio 2022 Community with 'Desktop development with C++' workload:" -ForegroundColor Yellow
    Write-Host "https://visualstudio.microsoft.com/downloads/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Success "Visual Studio 2022 detected"
`}

# ============================================
# Phase 4: Intel IPP (Optional)
# ============================================
${!includeIPP || skipPhases.includes(4) ? '# SKIPPED: Intel IPP not selected or already installed' : `
Write-Phase "Phase 4: Intel IPP"

$ippPath = "C:\\Program Files (x86)\\Intel\\oneAPI\\ipp\\latest"
if (-not (Test-Path $ippPath)) {
    Write-Step "Downloading Intel IPP..."
    $ippInstaller = "$env:TEMP\\intel-ipp-installer.exe"
    Invoke-WebRequest -Uri "https://registrationcenter-download.intel.com/akdlm/IRC_NAS/9c651894-4548-491c-b69f-49e84b530c1d/intel-ipp-2022.3.1.10_offline.exe" -OutFile $ippInstaller
    
    Write-Step "Installing Intel IPP (this may take a few minutes)..."
    Start-Process -FilePath $ippInstaller -Args "-s -a --silent --eula accept" -Wait
    
    if (Test-Path $ippPath) {
        Write-Success "Intel IPP installed"
    } else {
        Write-Warn "Intel IPP installation may have failed. Continuing anyway..."
    }
} else {
    Write-Success "Intel IPP already installed"
}
`}

# ============================================
# Phase 5: Faust (Optional)
# ============================================
${!includeFaust || skipPhases.includes(5) ? '# SKIPPED: Faust not selected or already installed' : `
Write-Phase "Phase 5: Faust"

$faustPath = "C:\\Program Files\\Faust\\lib\\faust.dll"
if (-not (Test-Path $faustPath)) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  MANUAL STEP REQUIRED: Install Faust" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please download and install Faust 2.54.0 or later:" -ForegroundColor White
    Write-Host "https://github.com/grame-cncm/faust/releases" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Download: Faust-2.XX.X-win64.exe" -ForegroundColor White
    Write-Host "Install to the DEFAULT location (C:\\Program Files\\Faust)" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after Faust installation is complete..."
    
    if (-not (Test-Path $faustPath)) {
        Write-Warn "Faust not detected. Build will continue without Faust support."
    } else {
        Write-Success "Faust detected"
    }
} else {
    Write-Success "Faust already installed"
}

$FAUST_INSTALLED = Test-Path $faustPath
`}

# ============================================
# Phase 6: Repository Structure Check
# ============================================
${skipPhases.includes(6) ? '# SKIPPED: Repository structure already verified' : `
Write-Phase "Phase 6: Repository Structure Check"

Set-Location $HISE_PATH

# Verify JUCE submodule
Write-Step "Verifying JUCE submodule..."
if (-not (Test-Path "JUCE\\modules")) {
    git submodule update --init
}
Set-Location JUCE
$branch = git branch --show-current
if ($branch -ne "juce6") {
    git checkout juce6
}
Set-Location $HISE_PATH

# Extract SDKs
Write-Step "Extracting SDKs..."
if (-not (Test-Path "tools\\SDK\\ASIOSDK2.3")) {
    Expand-Archive -Path "tools\\SDK\\sdk.zip" -DestinationPath "tools\\SDK\\" -Force
}

# Verify
if ((Test-Path "tools\\SDK\\ASIOSDK2.3") -and (Test-Path "tools\\SDK\\VST3 SDK")) {
    Write-Success "SDKs verified"
} else {
    Handle-Error 6 "SDK extraction failed"
}
`}

# ============================================
# Phase 7: Compile HISE
# ============================================
Write-Phase "Phase 7: Compile HISE"

Set-Location "$HISE_PATH\\projects\\standalone"

Write-Step "Running Projucer..."
$projucer = "$HISE_PATH\\JUCE\\Projucer\\Projucer.exe"
& $projucer --resave "HISE Standalone.jucer"

Write-Step "Compiling HISE (this will take 5-15 minutes)..."
$msbuild = "C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe"
${includeFaust ? `
$buildConfig = if ($FAUST_INSTALLED) { "Release with Faust" } else { "Release" }
` : `
$buildConfig = "Release"
`}

& $msbuild "Builds\\VisualStudio2022\\HISE Standalone.sln" /p:Configuration="$buildConfig" /p:PreferredToolArchitecture=x64 /verbosity:minimal

if ($LASTEXITCODE -ne 0) {
    Handle-Error 7 "HISE compilation failed"
}

# Verify build
$hiseExe = "Builds\\VisualStudio2022\\x64\\$buildConfig\\App\\HISE.exe"
if (-not (Test-Path $hiseExe)) {
    Handle-Error 7 "HISE.exe not found after build"
}

$fileSize = (Get-Item $hiseExe).Length
if ($fileSize -lt 10MB) {
    Handle-Error 7 "HISE.exe appears corrupted (size: $fileSize bytes)"
}

Write-Success "HISE compiled successfully"

# ============================================
# Phase 8: Add to PATH
# ============================================
Write-Phase "Phase 8: Add HISE to PATH"

$hiseBinPath = "$HISE_PATH\\projects\\standalone\\Builds\\VisualStudio2022\\x64\\$buildConfig\\App"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$hiseBinPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$hiseBinPath", "User")
    $env:Path = "$env:Path;$hiseBinPath"
    Write-Success "HISE added to PATH"
} else {
    Write-Success "HISE already in PATH"
}

# ============================================
# Phase 9: Verify Build
# ============================================
Write-Phase "Phase 9: Verify Build"

Write-Step "Checking build flags..."
& "$hiseBinPath\\HISE.exe" get_build_flags

Write-Success "Build verified"

# ============================================
# Phase 10: Test Project
# ============================================
Write-Phase "Phase 10: Test Project"

Write-Step "Setting project folder..."
& "$hiseBinPath\\HISE.exe" set_project_folder -p:"$HISE_PATH\\extras\\demo_project"

Write-Step "Compiling demo project..."
& "$hiseBinPath\\HISE.exe" export_ci "XmlPresetBackups\\Demo.xml" -t:standalone -a:x64

if ($LASTEXITCODE -ne 0) {
    Write-Warn "Demo project compilation had issues, but HISE is installed"
} else {
    Write-Success "Demo project compiled successfully"
}

# ============================================
# Phase 11: Success
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  HISE Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "HISE has been installed to: $HISE_PATH" -ForegroundColor White
Write-Host ""
Write-Host "You can now:" -ForegroundColor White
Write-Host "  1. Open a new terminal and run: HISE --help" -ForegroundColor Cyan
Write-Host "  2. Start HISE from: $hiseBinPath\\HISE.exe" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resources:" -ForegroundColor White
Write-Host "  - Documentation: https://docs.hise.dev" -ForegroundColor Cyan
Write-Host "  - Forum: https://forum.hise.audio" -ForegroundColor Cyan
Write-Host ""
`;

  return script;
}

// ============================================
// Windows Update Script Generator
// ============================================

export function generateWindowsUpdateScript(config: UpdateScriptConfig): string {
  const { hisePath, hasFaust } = config;
  
  // Escape backslashes for PowerShell
  const escapedPath = hisePath.replace(/\\/g, '\\');
  const buildConfig = hasFaust ? 'Release with Faust' : 'Release';
  
  const script = `# ${generateUpdateHeader(config).split('\n').join('\n# ')}

# ============================================
# HISE Update Script for Windows
# ============================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

${generatePowerShellUtilities()}

${generatePowerShellErrorHandler('update')}

# Check admin privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Err "This script requires Administrator privileges."
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

$HISE_PATH = "${escapedPath}"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HISE Update Script for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "HISE path: $HISE_PATH" -ForegroundColor White
Write-Host "Build config: ${buildConfig}" -ForegroundColor White
Write-Host ""

# ============================================
# Phase 1: Validate HISE Path
# ============================================
Write-Phase "Validating HISE Installation"

if (-not (Test-Path "$HISE_PATH\\.git")) {
    Handle-Error 0 "Invalid HISE path - not a git repository: $HISE_PATH"
}

if (-not (Test-Path "$HISE_PATH\\JUCE")) {
    Handle-Error 0 "JUCE submodule not found in $HISE_PATH"
}

Write-Success "HISE installation validated"

# ============================================
# Phase 2: Update Repository
# ============================================
${generateGitPullSectionPS(escapedPath)}

# ============================================
# Phase 3: Compile HISE
# ============================================
${generateCompileSectionWindows(escapedPath, hasFaust)}

# ============================================
# Phase 4: Verify Build
# ============================================
${generateVerifySectionPS(escapedPath, buildConfig)}

# ============================================
# Success
# ============================================
${generateUpdateSuccessMessagePS(escapedPath)}
`;

  return script;
}
