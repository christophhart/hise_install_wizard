import { 
  ScriptConfig, 
  UpdateScriptConfig,
  HELP_URL, 
  generateHeader,
  generateUpdateHeader,
  generatePowerShellUtilities,
  generatePowerShellErrorHandler,
  generateCompileSectionWindows,
  generateVerifySectionPS,
  generateUpdateSuccessMessagePS,
  generateGitCloneWithCommitPS,
  generateGitUpdateWithCommitPS,
  generateCommitNotePS,
  generateTestProjectSectionPS,
} from './common';

export function generateWindowsScript(config: ScriptConfig): string {
  const { installPath, includeFaust, includeIPP, skipPhases, targetCommit, faustVersion } = config;
  
  // Escape backslashes for PowerShell
  const escapedPath = installPath.replace(/\\/g, '\\');
  
  // Generate commit note if using specific commit
  const commitHeaderNote = targetCommit 
    ? `\n# NOTE: Using specific commit ${targetCommit.substring(0, 7)} (CI build failing on latest)\n`
    : '';
  
  const script = `# ${generateHeader(config).split('\n').join('\n# ')}${commitHeaderNote}
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
    $parentPath = Split-Path $HISE_PATH -Parent
    # Only create parent directory if it's not a drive root (e.g., C:\Dev but not C:)
    if ($parentPath -and $parentPath.Length -gt 3) {
        New-Item -ItemType Directory -Force -Path $parentPath | Out-Null
    }
    git clone https://github.com/christophhart/HISE.git "$HISE_PATH"
    if ($LASTEXITCODE -ne 0) { Handle-Error 2 "Failed to clone HISE repository" }
} else {
    Write-Step "Updating HISE repository..."
    Set-Location $HISE_PATH
    git fetch origin
}

Set-Location $HISE_PATH
${targetCommit ? `# Using specific commit due to CI build failure on latest
git checkout ${targetCommit}
if ($LASTEXITCODE -ne 0) { Handle-Error 2 "Failed to checkout commit ${targetCommit.substring(0, 7)}" }` : `git checkout develop
git pull origin develop`}
git submodule update --init
Set-Location JUCE
git checkout juce6
Set-Location $HISE_PATH

Write-Success "Git setup complete"
`}

# ============================================
# Phase 3: Visual Studio 2026 (Pre-requisite Check)
# ============================================
Write-Phase "Phase 3: Visual Studio 2026 Check"

# Check for VS2026 Community Edition (required - Pro/Enterprise not supported)
$vsPath = "C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe"
if (Test-Path $vsPath) {
    Write-Success "Visual Studio 2026 Community Edition detected"
} else {
    Write-Err "Visual Studio 2026 Community Edition is not installed."
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  PREREQUISITE MISSING" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Visual Studio 2026 Community Edition before running this script." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "NOTE: HISE requires the Community Edition. Professional and Enterprise" -ForegroundColor Yellow
    Write-Host "editions are not currently supported." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Download: https://visualstudio.microsoft.com/downloads/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "During installation, make sure to select:" -ForegroundColor White
    Write-Host "  - 'Desktop development with C++' workload" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

# ============================================
# Phase 4: Intel IPP (Optional - Pre-requisite Check)
# ============================================
${!includeIPP || skipPhases.includes(4) ? '# SKIPPED: Intel IPP not selected or already installed' : `
Write-Phase "Phase 4: Intel IPP Check"

$ippPath = "C:\\Program Files (x86)\\Intel\\oneAPI\\ipp\\latest"
if (-not (Test-Path $ippPath)) {
    Write-Warn "Intel IPP is not installed."
    Write-Host ""
    Write-Host "Intel IPP provides optimized audio processing but is optional." -ForegroundColor Yellow
    Write-Host "The build will continue without IPP optimization." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To install IPP later, download from:" -ForegroundColor White
    Write-Host "https://www.intel.com/content/www/us/en/developer/tools/oneapi/ipp-download.html" -ForegroundColor Cyan
    Write-Host ""
    $IPP_INSTALLED = $false
} else {
    Write-Success "Intel IPP detected"
    $IPP_INSTALLED = $true
}
`}

# ============================================
# Phase 5: Faust (Optional)
# ============================================
${!includeFaust || skipPhases.includes(5) ? '# SKIPPED: Faust not selected or already installed' : `
Write-Phase "Phase 5: Faust (Optional, fully automated)"

$faustDll = "C:\\Program Files\\Faust\\lib\\faust.dll"
if (-not (Test-Path $faustDll)) {
    Write-Step "Downloading Faust ${faustVersion || '2.75.7'}..."
    $faustInstaller = "$env:TEMP\\faust-installer.exe"
    $faustUrl = "https://github.com/grame-cncm/faust/releases/download/${faustVersion || '2.75.7'}/Faust-${faustVersion || '2.75.7'}-win64.exe"
    
    Invoke-WebRequest -Uri $faustUrl -OutFile $faustInstaller
    
    if (-not (Test-Path $faustInstaller)) {
        Handle-Error 5 "Failed to download Faust installer"
    }
    
    Write-Step "Installing Faust ${faustVersion || '2.75.7'}..."
    Start-Process -FilePath $faustInstaller -Args "/S /D=C:\\Program Files\\Faust" -Wait
    
    if ($LASTEXITCODE -ne 0) {
        Handle-Error 5 "Faust installation failed"
    }
    
    # Verify installation
    if (-not (Test-Path $faustDll)) {
        Handle-Error 5 "Faust installation failed - faust.dll not found"
    }
    
    # Cleanup installer
    Remove-Item $faustInstaller -Force
    
    Write-Success "Faust ${faustVersion || '2.75.7'} installed successfully"
} else {
    Write-Success "Faust already installed"
}

$FAUST_INSTALLED = Test-Path $faustDll
`}

# ============================================
# Phase 6: Repository Structure Check
# ============================================
${skipPhases.includes(6) ? '# SKIPPED: Repository structure already verified' : `
Write-Phase "Phase 6: Repository Structure Check"

Set-Location $HISE_PATH

# Verify JUCE submodule
Write-Step "Verifying JUCE submodule..."
if (-not (Test-Path "$HISE_PATH\\JUCE\\modules")) {
    git submodule update --init
}
Set-Location "$HISE_PATH\\JUCE"
$branch = git branch --show-current
if ($branch -ne "juce6") {
    git checkout juce6
}
Set-Location $HISE_PATH

# Extract SDKs
Write-Step "Extracting SDKs..."
if (-not (Test-Path "$HISE_PATH\\tools\\SDK\\ASIOSDK2.3")) {
    Set-Location "$HISE_PATH\\tools\\SDK"
    tar -xf sdk.zip
    Set-Location $HISE_PATH
}

# Verify
if ((Test-Path "$HISE_PATH\\tools\\SDK\\ASIOSDK2.3") -and (Test-Path "$HISE_PATH\\tools\\SDK\\VST3 SDK")) {
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

# Verify Projucer exists
if (-not (Test-Path $projucer)) {
    Handle-Error 7 "Projucer not found at $projucer"
}

& $projucer --resave "$HISE_PATH\\projects\\standalone\\HISE Standalone.jucer"
if ($LASTEXITCODE -ne 0) {
    Handle-Error 7 "Projucer failed to generate solution"
}

# Wait for solution file to be fully written
$slnPath = "$HISE_PATH\\projects\\standalone\\Builds\\VisualStudio2026\\HISE Standalone.sln"
$maxWait = 30
$waited = 0
while (-not (Test-Path $slnPath) -and $waited -lt $maxWait) {
    Start-Sleep -Seconds 1
    $waited++
}
if (-not (Test-Path $slnPath)) {
    Handle-Error 7 "Solution file not found after Projucer: $slnPath"
}

Write-Step "Compiling HISE (this will take 5-15 minutes)..."
$env:PreferredToolArchitecture = "x64"

# Use the detected MSBuild path
$msbuild = $vsPath

${includeFaust ? `
$buildConfig = if ($FAUST_INSTALLED) { "Release with Faust" } else { "Release" }
` : `
$buildConfig = "Release"
`}

& $msbuild "$HISE_PATH\\projects\\standalone\\Builds\\VisualStudio2026\\HISE Standalone.sln" /p:Configuration="$buildConfig" /p:Platform=x64 /verbosity:minimal

if ($LASTEXITCODE -ne 0) {
    Handle-Error 7 "HISE compilation failed"
}

# Verify build
$hiseExe = "$HISE_PATH\\projects\\standalone\\Builds\\VisualStudio2026\\x64\\$buildConfig\\App\\HISE.exe"
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

$hiseBinPath = "$HISE_PATH\\projects\\standalone\\Builds\\VisualStudio2026\\x64\\$buildConfig\\App"
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

# Detect IPP installation
$ippInstalled = Test-Path "C:\\Program Files (x86)\\Intel\\oneAPI\\ipp\\latest"
$ippFlag = if ($ippInstalled) { "-ipp:1" } else { "-ipp:0" }

# Detect Faust installation
$faustInstalled = Test-Path "C:\\Program Files\\Faust\\lib\\faust.dll"
$faustFlag = if ($faustInstalled) { "-faustpath:\`"C:\\Program Files\\Faust\`"" } else { "" }

Write-Step "Configuring HISE compiler settings..."
& "$hiseBinPath\\HISE.exe" set_hise_settings -hisepath:"$HISE_PATH" -vs:2026 $ippFlag $faustFlag
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Failed to configure HISE settings, but continuing..."
}

Write-Step "Setting project folder..."
& "$hiseBinPath\\HISE.exe" set_project_folder -p:"$HISE_PATH\\extras\\demo_project"
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Failed to set project folder, but continuing..."
}

Write-Step "Exporting demo project (VST3 instrument)..."
& "$hiseBinPath\\HISE.exe" export "$HISE_PATH\\extras\\demo_project\\XmlPresetBackups\\Demo.xml" -t:instrument -p:VST3 -a:x64 -nolto

if ($LASTEXITCODE -ne 0) {
    Write-Warn "Demo project export had issues, but HISE is installed"
} else {
    Write-Success "Demo project exported successfully"
    
    # Run the generated batch compile script
    Write-Step "Running batch compile script..."
    $batchScript = "$HISE_PATH\\extras\\demo_project\\Binaries\\batchCompile.bat"
    if (Test-Path $batchScript) {
        Set-Location "$HISE_PATH\\extras\\demo_project\\Binaries"
        & cmd.exe /c "batchCompile.bat"
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Batch compile had issues, but HISE is installed"
        } else {
            Write-Success "Demo project compiled successfully"
        }
        Set-Location $HISE_PATH
    } else {
        Write-Warn "Batch compile script not found at $batchScript"
    }
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
  const { hisePath, hasFaust, targetCommit } = config;
  
  // Escape backslashes for PowerShell
  const escapedPath = hisePath.replace(/\\/g, '\\');
  const buildConfig = hasFaust ? 'Release with Faust' : 'Release';
  
  // Generate commit note if using specific commit
  const commitHeaderNote = targetCommit 
    ? `\n# NOTE: Using specific commit ${targetCommit.substring(0, 7)} (CI build failing on latest)\n`
    : '';
  
  const script = `# ${generateUpdateHeader(config).split('\n').join('\n# ')}${commitHeaderNote}
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
${generateGitUpdateWithCommitPS(escapedPath, targetCommit)}

# ============================================
# Phase 3: Compile HISE
# ============================================
${generateCompileSectionWindows(escapedPath, hasFaust)}

# ============================================
# Phase 4: Verify Build
# ============================================
${generateVerifySectionPS(escapedPath, buildConfig)}

# ============================================
# Phase 5: Test Project
# ============================================
${generateTestProjectSectionPS(escapedPath)}

# ============================================
# Success
# ============================================
${generateUpdateSuccessMessagePS(escapedPath)}
`;

  return script;
}
