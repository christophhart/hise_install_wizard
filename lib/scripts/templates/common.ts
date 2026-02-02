// Common script generation utilities

// Re-export types from the central types file
import { ScriptConfig, UpdateScriptConfig } from '@/types/wizard';
export type { ScriptConfig, UpdateScriptConfig };

import { HELP_URL } from '@/lib/constants';
export { HELP_URL };

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
  return `# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[0;33m'
CYAN='\\033[0;36m'
NC='\\033[0m' # No Color
BOLD='\\033[1m'

phase() { echo -e "\${CYAN}[PHASE]\${NC} $1"; }
step() { echo -e "  -> $1"; }
success() { echo -e "\${GREEN}[OK]\${NC} $1"; }
warn() { echo -e "\${YELLOW}[WARN]\${NC} $1"; }
err() { echo -e "\${RED}[ERROR]\${NC} $1"; }`;
}

export function generateBashErrorHandler(scriptType: 'setup' | 'update'): string {
  const baseUrl = scriptType === 'setup' ? HELP_URL : `${HELP_URL}?mode=update`;
  return `# Error handler
handle_error() {
    local phase=$1
    local message=$2
    err "$message"
    echo ""
    echo -e "\${YELLOW}Need help? Visit: ${baseUrl}&phase=$phase\${NC}"
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

export function generatePowerShellErrorHandler(scriptType: 'setup' | 'update'): string {
  const baseUrl = scriptType === 'setup' ? HELP_URL : `${HELP_URL}?mode=update`;
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
PROJUCER="$HISE_PATH/JUCE/extras/Projucer/Builds/MacOSX/build/Release/Projucer.app/Contents/MacOS/Projucer"

# Build Projucer if needed
if [ ! -f "$PROJUCER" ]; then
    step "Building Projucer..."
    cd "$HISE_PATH/JUCE/extras/Projucer/Builds/MacOSX"
    xcodebuild -project Projucer.xcodeproj -configuration Release -jobs $(sysctl -n hw.ncpu) | xcpretty 2>/dev/null || xcodebuild -project Projucer.xcodeproj -configuration Release -jobs $(sysctl -n hw.ncpu)
    cd "$HISE_PATH/projects/standalone"
fi

"$PROJUCER" --resave "HISE Standalone.jucer"

step "Compiling HISE (this will take 5-15 minutes)..."
CORES=$(sysctl -n hw.ncpu)
BUILD_CONFIG="${buildConfig}"

# Try with xcbeautify first, fall back to plain xcodebuild
XCBEAUTIFY="$HISE_PATH/tools/Projucer/xcbeautify"
if [ -x "$XCBEAUTIFY" ]; then
    xcodebuild -project "Builds/MacOSX/HISE Standalone.xcodeproj" -configuration "$BUILD_CONFIG" -jobs $CORES | "$XCBEAUTIFY" || handle_error 2 "HISE compilation failed"
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
PROJUCER="$HISE_PATH/JUCE/extras/Projucer/Builds/LinuxMakefile/build/Projucer"

# Build Projucer if needed
if [ ! -f "$PROJUCER" ]; then
    step "Building Projucer..."
    cd "$HISE_PATH/JUCE/extras/Projucer/Builds/LinuxMakefile"
    make CONFIG=Release -j$(nproc --ignore=2)
    cd "$HISE_PATH/projects/standalone"
fi

"$PROJUCER" --resave "HISE Standalone.jucer"

step "Compiling HISE (this will take 5-15 minutes)..."
cd Builds/LinuxMakefile
BUILD_CONFIG="${buildConfig}"

make CONFIG=$BUILD_CONFIG AR=gcc-ar -j$(nproc --ignore=2) || handle_error 2 "HISE compilation failed"

# Verify build
HISE_BIN="build/HISE"
if [ ! -f "$HISE_BIN" ]; then
    handle_error 2 "HISE binary not found after build"
fi

success "HISE compiled successfully"`;
}

export function generateCompileSectionWindows(hisePath: string, hasFaust: boolean): string {
  const buildConfig = hasFaust ? 'Release with Faust' : 'Release';
  // Use String.raw or construct paths carefully to avoid octal escape issues
  const msbuildPath = 'C:\\\\Program Files\\\\Microsoft Visual Studio\\\\2022\\\\Community\\\\MSBuild\\\\Current\\\\Bin\\\\MSBuild.exe';
  
  return `Write-Phase "Compiling HISE"

Set-Location "$HISE_PATH\\projects\\standalone"

Write-Step "Running Projucer..."
$projucer = "$HISE_PATH\\JUCE\\extras\\Projucer\\Builds\\VisualStudio2022\\x64\\Release\\App\\Projucer.exe"

# Build Projucer if needed - fall back to shipped version
if (-not (Test-Path $projucer)) {
    $projucer = "$HISE_PATH\\JUCE\\Projucer\\Projucer.exe"
}

& $projucer --resave "HISE Standalone.jucer"

Write-Step "Compiling HISE (this will take 5-15 minutes)..."
$msbuild = "${msbuildPath}"
$buildConfig = "${buildConfig}"

& $msbuild "Builds\\VisualStudio2022\\HISE Standalone.sln" /p:Configuration="$buildConfig" /p:PreferredToolArchitecture=x64 /verbosity:minimal

if ($LASTEXITCODE -ne 0) {
    Handle-Error 2 "HISE compilation failed"
}

# Verify build
$hiseExe = "Builds\\VisualStudio2022\\x64\\$buildConfig\\App\\HISE.exe"
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
  let binPath: string;
  if (platform === 'macos') {
    binPath = `$HISE_PATH/projects/standalone/Builds/MacOSX/build/${buildConfig}/HISE.app/Contents/MacOS/HISE`;
  } else {
    binPath = `$HISE_PATH/projects/standalone/Builds/LinuxMakefile/build/HISE`;
  }
  
  return `phase "Verifying Build"

step "Checking build flags..."
"${binPath}" get_build_flags || warn "Could not verify build flags"

success "Build verified"`;
}

export function generateVerifySectionPS(hisePath: string, buildConfig: string): string {
  return `Write-Phase "Verifying Build"

$hiseBinPath = "$HISE_PATH\\projects\\standalone\\Builds\\VisualStudio2022\\x64\\${buildConfig}\\App"

Write-Step "Checking build flags..."
& "$hiseBinPath\\HISE.exe" get_build_flags

Write-Success "Build verified"`;
}

// ============================================
// Shared Success Messages
// ============================================

export function generateUpdateSuccessMessageBash(hisePath: string): string {
  return `echo ""
echo -e "\${GREEN}========================================\${NC}"
echo -e "\${GREEN}  HISE Update Complete!\${NC}"
echo -e "\${GREEN}========================================\${NC}"
echo ""
echo "HISE has been updated at: $HISE_PATH"
echo ""
echo "You can now run HISE from your terminal or restart it if it's already open."
echo ""
echo "Resources:"
echo -e "  - Documentation: \${CYAN}https://docs.hise.dev\${NC}"
echo -e "  - Forum: \${CYAN}https://forum.hise.audio\${NC}"
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
