// Common script generation utilities

// Re-export types from the central types file
import { ScriptConfig, UpdateScriptConfig } from '@/types/wizard';
export type { ScriptConfig, UpdateScriptConfig };

import { HELP_URL } from '@/lib/constants';
export { HELP_URL };

// Helper to create bash variable references like ${CYAN}, ${NC}, etc.
// Using a function prevents bundler constant-folding/inlining
export function bashVar(name: string): string {
  return '${' + name + '}';
}

// Shorthand for common color variables
export const BASH_COLORS = {
  CYAN: '${CYAN}',
  NC: '${NC}',
  GREEN: '${GREEN}',
  YELLOW: '${YELLOW}',
  RED: '${RED}',
  BOLD: '${BOLD}',
} as const;

// Color codes for terminal output
export const colors = {
  bash: {
    reset: '\\033[0m',
    red: '\\033[0;31m',
    green: '\\033[0;32m',
    yellow: '\\033[0;33m',
    blue: '\\033[0;34m',
    cyan: '\\033[0;36m',
    bold: '\\033[1m',
  },
  powershell: {
    // PowerShell uses different syntax
    reset: '$Host.UI.RawUI.ForegroundColor = "White"',
  },
};

export function generateHeader(config: ScriptConfig): string {
  const timestamp = new Date().toISOString();
  const lines = [
    `HISE Setup Script`,
    `Generated: ${timestamp}`,
    `Platform: ${config.platform}`,
    `Architecture: ${config.architecture}`,
    `Install Path: ${config.installPath}`,
    `Include Faust: ${config.includeFaust ? 'Yes' : 'No'}`,
    `Include IPP: ${config.includeIPP ? 'Yes' : 'No'}`,
  ];
  return lines.join('\n');
}

export function generateUpdateHeader(config: UpdateScriptConfig): string {
  const timestamp = new Date().toISOString();
  const lines = [
    `HISE Update Script`,
    `Generated: ${timestamp}`,
    `Platform: ${config.platform}`,
    `Architecture: ${config.architecture}`,
    `HISE Path: ${config.hisePath}`,
    `Faust Build: ${config.hasFaust ? 'Yes' : 'No'}`,
  ];
  return lines.join('\n');
}

// ============================================
// Shared Bash Utilities (macOS/Linux)
// ============================================

export function generateBashUtilities(): string {
  const { CYAN, NC, GREEN, YELLOW, RED } = BASH_COLORS;
  return `# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[0;33m'
CYAN='\\033[0;36m'
NC='\\033[0m' # No Color
BOLD='\\033[1m'

phase() { echo -e "${CYAN}[PHASE]${NC} $1"; }
step() { echo -e "  -> $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; }`;
}

export function generateBashErrorHandler(scriptType: 'setup' | 'update' | 'migration'): string {
  const baseUrl = scriptType === 'setup' ? HELP_URL : `${HELP_URL}?mode=${scriptType}`;
  const { YELLOW, NC } = BASH_COLORS;
  return `# Error handler
handle_error() {
    local phase=$1
    local message=$2
    err "$message"
    echo ""
    echo -e "${YELLOW}Need help? Visit: ${baseUrl}&phase=$phase${NC}"
    echo ""
    exit 1
}`;
}

// ============================================
// Shared PowerShell Utilities (Windows)
// ============================================

export function generatePowerShellUtilities(): string {
  return `# Colors for output
function Write-Phase { param($msg) Write-Host "[PHASE] $msg" -ForegroundColor Cyan }
function Write-Step { param($msg) Write-Host "  -> $msg" -ForegroundColor White }
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }`;
}

export function generatePowerShellErrorHandler(scriptType: 'setup' | 'update' | 'migration'): string {
  const baseUrl = scriptType === 'setup' ? HELP_URL : `${HELP_URL}?mode=${scriptType}`;
  return `# Error handler
function Handle-Error {
    param($phase, $message)
    Write-Err $message
    Write-Host ""
    Write-Host "Need help? Visit: ${baseUrl}&phase=$phase" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}`;
}

// ============================================
// Migration Script Utilities (ZIP to Git)
// ============================================

import { MigrationScriptConfig } from '@/types/wizard';
export type { MigrationScriptConfig };

/**
 * Generate migration script header
 */
export function generateMigrationHeader(config: MigrationScriptConfig): string {
  const timestamp = new Date().toISOString();
  const lines = [
    `HISE Migration Script (ZIP to Git)`,
    `Generated: ${timestamp}`,
    `Platform: ${config.platform}`,
    `Architecture: ${config.architecture}`,
    `Existing Path: ${config.existingPath}`,
    `Faust Build: ${config.hasFaust ? 'Yes' : 'No'}`,
    `Keep Backup: ${config.keepBackup ? 'Yes (HISE_pre_git)' : 'No'}`,
  ];
  return lines.join('\n');
}

/**
 * Generate Git installation check/install for Bash (macOS/Linux)
 * On macOS: Git comes with Xcode CLI tools, just check it exists
 * On Linux: Install via apt-get if missing
 */
export function generateGitInstallCheckBash(platform: 'macos' | 'linux'): string {
  const { CYAN, NC, YELLOW } = BASH_COLORS;
  
  if (platform === 'macos') {
    return `phase "Check/Install Git"

if ! command -v git &> /dev/null; then
    err "Git is not installed."
    echo ""
    echo -e "${YELLOW}Please install Xcode Command Line Tools:${NC}"
    echo -e "${CYAN}xcode-select --install${NC}"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi
success "Git is installed"`;
  }
  
  // Linux
  return `phase "Check/Install Git"

if ! command -v git &> /dev/null; then
    step "Installing Git..."
    sudo apt-get update
    sudo apt-get install -y git || handle_error 1 "Failed to install Git"
fi
success "Git is installed"`;
}

/**
 * Generate Git installation check/install for PowerShell (Windows)
 * Installs via direct download if not present
 */
export function generateGitInstallCheckPS(): string {
  return `Write-Phase "Check/Install Git"

$gitPath = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitPath) {
    Write-Step "Installing Git..."
    $gitInstaller = "$env:TEMP\\git-installer.exe"
    Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe" -OutFile $gitInstaller
    Start-Process -FilePath $gitInstaller -Args "/VERYSILENT /NORESTART" -Wait
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Success "Git installed"
} else {
    Write-Success "Git is already installed"
}`;
}

/**
 * Generate backup/delete existing folder section for Bash
 */
export function generateBackupSectionBash(keepBackup: boolean): string {
  const { CYAN, NC, GREEN, YELLOW } = BASH_COLORS;
  
  if (keepBackup) {
    return `phase "Backup Existing Installation"

step "Renaming existing HISE folder to HISE_pre_git..."
BACKUP_PATH="\${HISE_PATH%/*}/HISE_pre_git"

# Check if backup already exists
if [ -d "$BACKUP_PATH" ]; then
    err "Backup folder already exists at $BACKUP_PATH"
    echo ""
    echo -e "${YELLOW}Please remove or rename the existing backup folder and try again.${NC}"
    exit 1
fi

mv "$HISE_PATH" "$BACKUP_PATH" || handle_error 2 "Failed to rename existing folder"
success "Backup created at HISE_pre_git"
echo -e "${YELLOW}Note: You can delete this backup after verifying the migration worked.${NC}"`;
  }
  
  return `phase "Remove Existing Installation"

step "Deleting existing HISE folder..."
echo -e "${YELLOW}WARNING: This cannot be undone!${NC}"
rm -rf "$HISE_PATH" || handle_error 2 "Failed to delete existing folder"
success "Existing folder removed"`;
}

/**
 * Generate backup/delete existing folder section for PowerShell
 */
export function generateBackupSectionPS(keepBackup: boolean): string {
  if (keepBackup) {
    return `Write-Phase "Backup Existing Installation"

Write-Step "Renaming existing HISE folder to HISE_pre_git..."
$backupPath = Join-Path (Split-Path $HISE_PATH -Parent) "HISE_pre_git"

# Check if backup already exists
if (Test-Path $backupPath) {
    Write-Err "Backup folder already exists at $backupPath"
    Write-Host ""
    Write-Host "Please remove or rename the existing backup folder and try again." -ForegroundColor Yellow
    exit 1
}

Rename-Item -Path $HISE_PATH -NewName "HISE_pre_git" -ErrorAction Stop
Write-Success "Backup created at HISE_pre_git"
Write-Host "Note: You can delete this backup after verifying the migration worked." -ForegroundColor Yellow`;
  }
  
  return `Write-Phase "Remove Existing Installation"

Write-Step "Deleting existing HISE folder..."
Write-Host "WARNING: This cannot be undone!" -ForegroundColor Yellow
Remove-Item -Path $HISE_PATH -Recurse -Force -ErrorAction Stop
Write-Success "Existing folder removed"`;
}

/**
 * Generate migration success message for Bash
 */
export function generateMigrationSuccessMessageBash(keepBackup: boolean): string {
  const { GREEN, NC, YELLOW } = BASH_COLORS;
  
  const backupNote = keepBackup 
    ? `echo ""
echo -e "${YELLOW}Note: Your original HISE folder was saved as HISE_pre_git.${NC}"
echo "You can delete it manually once you've verified everything works."` 
    : '';
    
  return `echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  HISE MIGRATION COMPLETE!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "HISE has been migrated to a Git-based workflow."
echo "You can now use the Update flow to easily pull new changes."
${backupNote}
echo ""
echo "Next steps:"
echo "  1. Open a new terminal window"
echo "  2. Run 'HISE --help' to verify HISE is in your PATH"
echo "  3. Start building your projects!"
echo ""`;
}

/**
 * Generate migration success message for PowerShell
 */
export function generateMigrationSuccessMessagePS(keepBackup: boolean): string {
  const backupNote = keepBackup 
    ? `Write-Host ""
Write-Host "Note: Your original HISE folder was saved as HISE_pre_git." -ForegroundColor Yellow
Write-Host "You can delete it manually once you've verified everything works."` 
    : '';
    
  return `Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  HISE MIGRATION COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "HISE has been migrated to a Git-based workflow."
Write-Host "You can now use the Update flow to easily pull new changes."
${backupNote}
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Open a new PowerShell window"
Write-Host "  2. Run 'HISE --help' to verify HISE is in your PATH"
Write-Host "  3. Start building your projects!"
Write-Host ""`;
}

/**
 * Generate PATH addition section for Bash (macOS/Linux)
 * Used in migration scripts since user likely doesn't have HISE in PATH
 */
export function generateAddToPathBash(hisePath: string, platform: 'macos' | 'linux', architecture: 'x64' | 'arm64', hasFaust: boolean): string {
  const { CYAN, NC, GREEN, YELLOW } = BASH_COLORS;
  
  // Determine the binary path based on platform and build config
  let binaryPath: string;
  const buildConfig = hasFaust ? 'Release with Faust' : 'Release';
  
  if (platform === 'macos') {
    binaryPath = `$HISE_PATH/projects/standalone/Builds/MacOSX/build/${buildConfig}/HISE.app/Contents/MacOS`;
  } else {
    // Linux - Faust config uses different folder name
    const linuxBuildConfig = hasFaust ? 'ReleaseWithFaust' : 'Release';
    binaryPath = `$HISE_PATH/projects/standalone/Builds/LinuxMakefile/build/${linuxBuildConfig}`;
  }
  
  const shellConfig = platform === 'macos' ? '$HOME/.zshrc' : '$HOME/.bashrc';
  
  return `phase "Add HISE to PATH"

HISE_BIN="${binaryPath}"

# Check if already in PATH
if [[ ":$PATH:" != *":$HISE_BIN:"* ]]; then
    step "Adding HISE to PATH in ${shellConfig}..."
    echo "" >> ${shellConfig}
    echo "# HISE" >> ${shellConfig}
    echo "export PATH=\\"\\$PATH:$HISE_BIN\\"" >> ${shellConfig}
    export PATH="$PATH:$HISE_BIN"
    success "HISE added to PATH"
    echo -e "${YELLOW}Note: Run 'source ${shellConfig}' or open a new terminal to use HISE.${NC}"
else
    success "HISE already in PATH"
fi`;
}

/**
 * Generate PATH addition section for PowerShell (Windows)
 * Used in migration scripts since user likely doesn't have HISE in PATH
 */
export function generateAddToPathPS(hisePath: string, hasFaust: boolean): string {
  // Determine the binary path based on build config
  const buildConfig = hasFaust ? 'Release with Faust' : 'Release';
  const binaryPath = `$HISE_PATH\\projects\\standalone\\Builds\\VisualStudio2022\\x64\\${buildConfig}\\App`;
  
  return `Write-Phase "Add HISE to PATH"

$HISE_BIN = "${binaryPath}"

# Check if already in PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$HISE_BIN*") {
    Write-Step "Adding HISE to user PATH..."
    $newPath = $currentPath + ";" + $HISE_BIN
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    $env:Path = $env:Path + ";" + $HISE_BIN
    Write-Success "HISE added to PATH"
    Write-Host "Note: You may need to restart your terminal for PATH changes to take effect." -ForegroundColor Yellow
} else {
    Write-Success "HISE already in PATH"
}`;
}

// ============================================
// Shared Git Pull Section
// ============================================

export function generateGitPullSectionBash(hisePath: string): string {
  return `phase "Updating HISE Repository"

cd "$HISE_PATH"

step "Fetching latest changes..."
git fetch origin || handle_error 1 "Failed to fetch from origin"

step "Pulling develop branch..."
git checkout develop || handle_error 1 "Failed to checkout develop branch"
git pull origin develop || handle_error 1 "Failed to pull latest changes"

step "Updating submodules..."
git submodule update --init || handle_error 1 "Failed to update submodules"

step "Switching JUCE to juce6 branch..."
cd JUCE && git checkout juce6 && cd ..

success "Repository updated"`;
}

export function generateGitPullSectionPS(hisePath: string): string {
  return `Write-Phase "Updating HISE Repository"

Set-Location $HISE_PATH

Write-Step "Fetching latest changes..."
git fetch origin
if ($LASTEXITCODE -ne 0) { Handle-Error 1 "Failed to fetch from origin" }

Write-Step "Pulling develop branch..."
git checkout develop
if ($LASTEXITCODE -ne 0) { Handle-Error 1 "Failed to checkout develop branch" }
git pull origin develop
if ($LASTEXITCODE -ne 0) { Handle-Error 1 "Failed to pull latest changes" }

Write-Step "Updating submodules..."
git submodule update --init
if ($LASTEXITCODE -ne 0) { Handle-Error 1 "Failed to update submodules" }

Write-Step "Switching JUCE to juce6 branch..."
Set-Location JUCE
git checkout juce6
Set-Location $HISE_PATH

Write-Success "Repository updated"`;
}

// ============================================
// Shared Compile Section
// ============================================

export function generateCompileSectionMacOS(hisePath: string, architecture: string, hasFaust: boolean): string {
  const buildConfig = hasFaust ? 'Release with Faust' : 'Release';
  
  return `phase "Compiling HISE"

cd "$HISE_PATH/projects/standalone"

step "Running Projucer..."
PROJUCER="$HISE_PATH/JUCE/Projucer/Projucer.app/Contents/MacOS/Projucer"

# Verify Projucer exists
if [ ! -f "$PROJUCER" ]; then
    handle_error 2 "Projucer not found at $PROJUCER"
fi

chmod +x "$PROJUCER"
"$PROJUCER" --resave "HISE Standalone.jucer"

step "Compiling HISE (this will take 5-15 minutes)..."
CORES=$(sysctl -n hw.ncpu)
BUILD_CONFIG="${buildConfig}"

# Try with xcbeautify first, fall back to plain xcodebuild
# Use set -o pipefail to detect xcodebuild errors when piped
XCBEAUTIFY="$HISE_PATH/tools/Projucer/xcbeautify"
if [ -x "$XCBEAUTIFY" ]; then
    set -o pipefail && xcodebuild -project "Builds/MacOSX/HISE Standalone.xcodeproj" -configuration "$BUILD_CONFIG" -jobs $CORES | "$XCBEAUTIFY" || handle_error 2 "HISE compilation failed"
else
    xcodebuild -project "Builds/MacOSX/HISE Standalone.xcodeproj" -configuration "$BUILD_CONFIG" -jobs $CORES || handle_error 2 "HISE compilation failed"
fi

# Verify build
HISE_BIN="Builds/MacOSX/build/$BUILD_CONFIG/HISE.app/Contents/MacOS/HISE"
if [ ! -f "$HISE_BIN" ]; then
    handle_error 2 "HISE binary not found after build"
fi

success "HISE compiled successfully"`;
}

export function generateCompileSectionLinux(hisePath: string, hasFaust: boolean): string {
  const buildConfig = hasFaust ? 'ReleaseWithFaust' : 'Release';
  
  return `phase "Compiling HISE"

cd "$HISE_PATH/projects/standalone"

step "Running Projucer..."
PROJUCER="$HISE_PATH/JUCE/Projucer/Projucer"

# Verify Projucer exists
if [ ! -f "$PROJUCER" ]; then
    handle_error 2 "Projucer not found at $PROJUCER"
fi

chmod +x "$PROJUCER"
"$PROJUCER" --resave "HISE Standalone.jucer"

step "Compiling HISE (this will take 5-15 minutes)..."
cd Builds/LinuxMakefile
BUILD_CONFIG="${buildConfig}"

make CONFIG=$BUILD_CONFIG AR=gcc-ar -j$(nproc --ignore=2) || handle_error 2 "HISE compilation failed"

# Verify build (note: binary is named "HISE Standalone" with space)
HISE_BIN="build/HISE Standalone"
if [ ! -f "$HISE_BIN" ]; then
    handle_error 2 "HISE binary not found after build"
fi

# Create symlink for convenience
step "Creating HISE symlink..."
cd build
ln -sf "HISE Standalone" HISE
cd ..

success "HISE compiled successfully"`;
}

export function generateCompileSectionWindows(hisePath: string, hasFaust: boolean): string {
  const buildConfig = hasFaust ? 'Release with Faust' : 'Release';
  // VS2026 uses version folder "18"
  const msbuildPath = 'C:\\\\Program Files\\\\Microsoft Visual Studio\\\\18\\\\Community\\\\MSBuild\\\\Current\\\\Bin\\\\MSBuild.exe';
  
  return `Write-Phase "Compiling HISE"

Set-Location "$HISE_PATH\\projects\\standalone"

Write-Step "Running Projucer..."
$projucer = "$HISE_PATH\\JUCE\\Projucer\\Projucer.exe"

# Verify Projucer exists
if (-not (Test-Path $projucer)) {
    Handle-Error 2 "Projucer not found at $projucer"
}

& $projucer --resave "$HISE_PATH\\projects\\standalone\\HISE Standalone.jucer"
if ($LASTEXITCODE -ne 0) {
    Handle-Error 2 "Projucer failed to generate solution"
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
    Handle-Error 2 "Solution file not found after Projucer: $slnPath"
}

Write-Step "Compiling HISE (this will take 5-15 minutes)..."
$env:PreferredToolArchitecture = "x64"
$msbuild = "${msbuildPath}"
$buildConfig = "${buildConfig}"

& $msbuild "$HISE_PATH\\projects\\standalone\\Builds\\VisualStudio2026\\HISE Standalone.sln" /p:Configuration="$buildConfig" /p:Platform=x64 /verbosity:minimal

if ($LASTEXITCODE -ne 0) {
    Handle-Error 2 "HISE compilation failed"
}

# Verify build
$hiseExe = "$HISE_PATH\\projects\\standalone\\Builds\\VisualStudio2026\\x64\\$buildConfig\\App\\HISE.exe"
if (-not (Test-Path $hiseExe)) {
    Handle-Error 2 "HISE.exe not found after build"
}

$fileSize = (Get-Item $hiseExe).Length
if ($fileSize -lt 10MB) {
    Handle-Error 2 "HISE.exe appears corrupted (size: $fileSize bytes)"
}

Write-Success "HISE compiled successfully"`;
}

// ============================================
// Shared Verify Section
// ============================================

export function generateVerifySectionBash(hisePath: string, buildConfig: string, platform: 'macos' | 'linux'): string {
  const { YELLOW, NC } = BASH_COLORS;
  
  let binPath: string;
  if (platform === 'macos') {
    binPath = `$HISE_PATH/projects/standalone/Builds/MacOSX/build/${buildConfig}/HISE.app/Contents/MacOS/HISE`;
  } else {
    // Linux uses symlink HISE -> "HISE Standalone"
    binPath = `$HISE_PATH/projects/standalone/Builds/LinuxMakefile/build/HISE`;
  }
  
  return `phase "Verifying Build"

step "Checking build flags..."

# Try using HISE from PATH first to verify PATH is working
if command -v HISE &> /dev/null; then
    HISE get_build_flags || warn "Could not verify build flags"
    success "Build verified (HISE found in PATH)"
else
    warn "HISE not found in PATH - this may be a temporary issue"
    echo -e "${YELLOW}Your terminal session may need to be restarted for PATH changes to take effect.${NC}"
    warn "Falling back to direct binary path..."
    "${binPath}" get_build_flags || warn "Could not verify build flags"
    success "Build verified (using direct path)"
fi`;
}

export function generateVerifySectionPS(hisePath: string, buildConfig: string): string {
  return `Write-Phase "Verifying Build"

$hiseBinPath = "$HISE_PATH\\projects\\standalone\\Builds\\VisualStudio2026\\x64\\${buildConfig}\\App"

Write-Step "Checking build flags..."

# Try using HISE from PATH first to verify PATH is working
$hiseCmd = Get-Command HISE -ErrorAction SilentlyContinue
if ($hiseCmd) {
    & HISE get_build_flags
    Write-Success "Build verified (HISE found in PATH)"
} else {
    Write-Warn "HISE not found in PATH - this may be a temporary issue"
    Write-Host "Your terminal session may need to be restarted for PATH changes to take effect." -ForegroundColor Yellow
    Write-Warn "Falling back to direct binary path..."
    & "$hiseBinPath\\HISE.exe" get_build_flags
    Write-Success "Build verified (using direct path)"
}`;
}

// ============================================
// Shared Success Messages
// ============================================

export function generateUpdateSuccessMessageBash(hisePath: string): string {
  const { GREEN, NC, CYAN } = BASH_COLORS;
  return `echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  HISE Update Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "HISE has been updated at: $HISE_PATH"
echo ""
echo "You can now run HISE from your terminal or restart it if it's already open."
echo ""
echo "Resources:"
echo -e "  - Documentation: ${CYAN}https://docs.hise.dev${NC}"
echo -e "  - Forum: ${CYAN}https://forum.hise.audio${NC}"
echo ""`;
}

export function generateUpdateSuccessMessagePS(hisePath: string): string {
  return `Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  HISE Update Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "HISE has been updated at: $HISE_PATH" -ForegroundColor White
Write-Host ""
Write-Host "You can now run HISE from your terminal or restart it if it's already open."
Write-Host ""
Write-Host "Resources:" -ForegroundColor White
Write-Host "  - Documentation: https://docs.hise.dev" -ForegroundColor Cyan
Write-Host "  - Forum: https://forum.hise.audio" -ForegroundColor Cyan
Write-Host ""`;
}

// ============================================
// Commit-Aware Git Operations
// ============================================

/**
 * Generate a comment block noting when a specific commit is being used
 */
export function generateCommitNoteBash(targetCommit: string): string {
  return `# NOTE: Using specific commit ${targetCommit.substring(0, 7)} instead of latest
# This commit was chosen because the CI build is currently failing on newer commits.
# For the latest code (which may not build), remove the 'git checkout' line below.`;
}

export function generateCommitNotePS(targetCommit: string): string {
  return `# NOTE: Using specific commit ${targetCommit.substring(0, 7)} instead of latest
# This commit was chosen because the CI build is currently failing on newer commits.
# For the latest code (which may not build), remove the 'git checkout' line below.`;
}

/**
 * Generate git clone with optional checkout to specific commit (Bash)
 */
export function generateGitCloneWithCommitBash(installPath: string, targetCommit?: string): string {
  const commitNote = targetCommit ? `\n${generateCommitNoteBash(targetCommit)}\n` : '';
  const checkoutLine = targetCommit ? `\ngit checkout ${targetCommit} || handle_error 2 "Failed to checkout commit ${targetCommit.substring(0, 7)}"` : '';
  
  return `${commitNote}step "Cloning HISE repository..."
git clone https://github.com/christophhart/HISE.git "$INSTALL_PATH/HISE" || handle_error 2 "Failed to clone HISE repository"
cd "$INSTALL_PATH/HISE"${checkoutLine}

step "Initializing submodules..."
git submodule update --init || handle_error 2 "Failed to initialize submodules"

step "Switching JUCE to juce6 branch..."
cd JUCE && git checkout juce6 && cd ..

success "HISE repository cloned"`;
}

/**
 * Generate git clone with optional checkout to specific commit (PowerShell)
 */
export function generateGitCloneWithCommitPS(installPath: string, targetCommit?: string): string {
  const commitNote = targetCommit ? `\n${generateCommitNotePS(targetCommit)}\n` : '';
  const checkoutLine = targetCommit 
    ? `\ngit checkout ${targetCommit}\nif ($LASTEXITCODE -ne 0) { Handle-Error 2 "Failed to checkout commit ${targetCommit.substring(0, 7)}" }` 
    : '';
  
  return `${commitNote}Write-Step "Cloning HISE repository..."
git clone https://github.com/christophhart/HISE.git "$INSTALL_PATH\\HISE"
if ($LASTEXITCODE -ne 0) { Handle-Error 2 "Failed to clone HISE repository" }
Set-Location "$INSTALL_PATH\\HISE"${checkoutLine}

Write-Step "Initializing submodules..."
git submodule update --init
if ($LASTEXITCODE -ne 0) { Handle-Error 2 "Failed to initialize submodules" }

Write-Step "Switching JUCE to juce6 branch..."
Set-Location JUCE
git checkout juce6
Set-Location "$INSTALL_PATH\\HISE"

Write-Success "HISE repository cloned"`;
}

/**
 * Generate git pull/fetch with optional checkout to specific commit (Bash)
 * Used for update scripts
 */
export function generateGitUpdateWithCommitBash(hisePath: string, targetCommit?: string): string {
  const commitNote = targetCommit ? `\n${generateCommitNoteBash(targetCommit)}\n` : '';
  
  if (targetCommit) {
    // Fetch and checkout specific commit
    return `${commitNote}phase "Updating HISE Repository"

cd "$HISE_PATH"

step "Fetching latest changes..."
git fetch origin || handle_error 1 "Failed to fetch from origin"

step "Checking out known working commit..."
git checkout ${targetCommit} || handle_error 1 "Failed to checkout commit ${targetCommit.substring(0, 7)}"

step "Updating submodules..."
git submodule update --init || handle_error 1 "Failed to update submodules"

step "Switching JUCE to juce6 branch..."
cd JUCE && git checkout juce6 && cd ..

success "Repository updated to commit ${targetCommit.substring(0, 7)}"`;
  }
  
  // Standard pull (no specific commit)
  return `phase "Updating HISE Repository"

cd "$HISE_PATH"

step "Fetching latest changes..."
git fetch origin || handle_error 1 "Failed to fetch from origin"

step "Pulling develop branch..."
git checkout develop || handle_error 1 "Failed to checkout develop branch"
git pull origin develop || handle_error 1 "Failed to pull latest changes"

step "Updating submodules..."
git submodule update --init || handle_error 1 "Failed to update submodules"

step "Switching JUCE to juce6 branch..."
cd JUCE && git checkout juce6 && cd ..

success "Repository updated"`;
}

/**
 * Generate git pull/fetch with optional checkout to specific commit (PowerShell)
 * Used for update scripts
 */
export function generateGitUpdateWithCommitPS(hisePath: string, targetCommit?: string): string {
  const commitNote = targetCommit ? `\n${generateCommitNotePS(targetCommit)}\n` : '';
  
  if (targetCommit) {
    // Fetch and checkout specific commit
    return `${commitNote}Write-Phase "Updating HISE Repository"

Set-Location $HISE_PATH

Write-Step "Fetching latest changes..."
git fetch origin
if ($LASTEXITCODE -ne 0) { Handle-Error 1 "Failed to fetch from origin" }

Write-Step "Checking out known working commit..."
git checkout ${targetCommit}
if ($LASTEXITCODE -ne 0) { Handle-Error 1 "Failed to checkout commit ${targetCommit.substring(0, 7)}" }

Write-Step "Updating submodules..."
git submodule update --init
if ($LASTEXITCODE -ne 0) { Handle-Error 1 "Failed to update submodules" }

Write-Step "Switching JUCE to juce6 branch..."
Set-Location JUCE
git checkout juce6
Set-Location $HISE_PATH

Write-Success "Repository updated to commit ${targetCommit.substring(0, 7)}"`;
  }
  
  // Standard pull (no specific commit)
  return `Write-Phase "Updating HISE Repository"

Set-Location $HISE_PATH

Write-Step "Fetching latest changes..."
git fetch origin
if ($LASTEXITCODE -ne 0) { Handle-Error 1 "Failed to fetch from origin" }

Write-Step "Pulling develop branch..."
git checkout develop
if ($LASTEXITCODE -ne 0) { Handle-Error 1 "Failed to checkout develop branch" }
git pull origin develop
if ($LASTEXITCODE -ne 0) { Handle-Error 1 "Failed to pull latest changes" }

Write-Step "Updating submodules..."
git submodule update --init
if ($LASTEXITCODE -ne 0) { Handle-Error 1 "Failed to update submodules" }

Write-Step "Switching JUCE to juce6 branch..."
Set-Location JUCE
git checkout juce6
Set-Location $HISE_PATH

Write-Success "Repository updated"`;
}

// ============================================
// Shared Test Project Section (Update Scripts)
// ============================================

/**
 * Generate test project phase for Bash (macOS/Linux)
 * Includes PATH check - if HISE not in PATH, skips test but doesn't fail
 */
export function generateTestProjectSectionBash(hisePath: string, platform: 'macos' | 'linux'): string {
  const batchScript = platform === 'macos' 
    ? '$HISE_PATH/extras/demo_project/Binaries/batchCompileOSX'
    : '$HISE_PATH/extras/demo_project/Binaries/batchCompileLinux.sh';
  
  return `phase "Test Project"

# Check HISE is in PATH
if ! command -v HISE &> /dev/null; then
    warn "HISE not found in PATH - skipping test phase"
    echo ""
    echo "The update completed successfully, but HISE is not in your PATH."
    echo "To run the test manually, add HISE to your PATH and run:"
    echo "  HISE set_project_folder -p:\\"$HISE_PATH/extras/demo_project\\""
    echo "  HISE export \\"$HISE_PATH/extras/demo_project/XmlPresetBackups/Demo.xml\\" -t:instrument -p:VST3 -nolto"
    echo ""
else
    step "Setting project folder..."
    HISE set_project_folder -p:"$HISE_PATH/extras/demo_project"

    step "Exporting demo project (VST3 instrument)..."
    HISE export "$HISE_PATH/extras/demo_project/XmlPresetBackups/Demo.xml" -t:instrument -p:VST3 -nolto || warn "Demo project export had issues, but HISE is updated"

    success "Demo project exported successfully"

    # Run the generated batch compile script
    step "Running batch compile script..."
    BATCH_SCRIPT="${batchScript}"
    if [ -f "$BATCH_SCRIPT" ]; then
        chmod +x "$BATCH_SCRIPT"
        "$BATCH_SCRIPT" || warn "Batch compile had issues, but HISE is updated"
        success "Demo project compiled successfully"
    else
        warn "Batch compile script not found at $BATCH_SCRIPT"
    fi
fi`;
}

/**
 * Generate test project phase for PowerShell (Windows)
 * Includes PATH check - if HISE not in PATH, skips test but doesn't fail
 */
export function generateTestProjectSectionPS(hisePath: string): string {
  return `Write-Phase "Test Project"

# Check HISE is in PATH
$hiseCmd = Get-Command HISE -ErrorAction SilentlyContinue
if (-not $hiseCmd) {
    Write-Warn "HISE not found in PATH - skipping test phase"
    Write-Host ""
    Write-Host "The update completed successfully, but HISE is not in your PATH."
    Write-Host "To run the test manually, add HISE to your PATH and run:"
    Write-Host "  HISE set_project_folder -p:\\\`"$HISE_PATH\\extras\\demo_project\\\`""
    Write-Host "  HISE export \\\`"$HISE_PATH\\extras\\demo_project\\XmlPresetBackups\\Demo.xml\\\`" -t:instrument -p:VST3 -a:x64 -nolto"
    Write-Host ""
} else {
    Write-Step "Setting project folder..."
    & HISE set_project_folder -p:"$HISE_PATH\\extras\\demo_project"
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Failed to set project folder, but continuing..."
    }

    Write-Step "Exporting demo project (VST3 instrument)..."
    & HISE export "$HISE_PATH\\extras\\demo_project\\XmlPresetBackups\\Demo.xml" -t:instrument -p:VST3 -a:x64 -nolto

    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Demo project export had issues, but HISE is updated"
    } else {
        Write-Success "Demo project exported successfully"
        
        # Run the generated batch compile script
        Write-Step "Running batch compile script..."
        $batchScript = "$HISE_PATH\\extras\\demo_project\\Binaries\\batchCompile.bat"
        if (Test-Path $batchScript) {
            Set-Location "$HISE_PATH\\extras\\demo_project\\Binaries"
            & cmd.exe /c "batchCompile.bat"
            if ($LASTEXITCODE -ne 0) {
                Write-Warn "Batch compile had issues, but HISE is updated"
            } else {
                Write-Success "Demo project compiled successfully"
            }
            Set-Location $HISE_PATH
        } else {
            Write-Warn "Batch compile script not found at $batchScript"
        }
    }
}`;
}
