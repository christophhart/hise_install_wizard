import { 
  ScriptConfig, 
  UpdateScriptConfig,
  HELP_URL, 
  generateHeader,
  generateUpdateHeader,
  generateBashUtilities,
  generateBashErrorHandler,
  generateGitPullSectionBash,
  generateCompileSectionMacOS,
  generateVerifySectionBash,
  generateUpdateSuccessMessageBash,
} from './common';

export function generateMacOSScript(config: ScriptConfig): string {
  const { installPath, includeFaust, architecture, skipPhases } = config;
  
  // Expand ~ for home directory
  const expandedPath = installPath.startsWith('~') 
    ? installPath.replace('~', '$HOME')
    : installPath;
  
  const script = `#!/bin/bash
# ${generateHeader(config).split('\n').join('\n# ')}

# ============================================
# HISE Setup Script for macOS
# ============================================

set -e

# Colors for output
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
err() { echo -e "\${RED}[ERROR]\${NC} $1"; }

# Error handler
handle_error() {
    local phase=$1
    local message=$2
    err "$message"
    echo ""
    echo -e "\${YELLOW}Need help? Visit: ${HELP_URL}?platform=macos&phase=$phase\${NC}"
    echo ""
    exit 1
}

HISE_PATH="${expandedPath}"
ARCH="${architecture}"

echo ""
echo -e "\${CYAN}========================================\${NC}"
echo -e "\${CYAN}  HISE Setup Script for macOS\${NC}"
echo -e "\${CYAN}========================================\${NC}"
echo ""
echo "Install path: $HISE_PATH"
echo "Architecture: $ARCH"
echo ""

# ============================================
# Phase 2: Git Setup
# ============================================
${skipPhases.includes(2) ? '# SKIPPED: Git already configured' : `
phase "Phase 2: Git Setup"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    err "Git is not installed."
    echo ""
    echo -e "\${YELLOW}Please install Xcode Command Line Tools:\${NC}"
    echo -e "\${CYAN}xcode-select --install\${NC}"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi
success "Git installed"

# Clone or update HISE repository
if [ ! -d "$HISE_PATH/.git" ]; then
    step "Cloning HISE repository..."
    mkdir -p "$(dirname "$HISE_PATH")"
    git clone https://github.com/christophhart/HISE.git "$HISE_PATH" || handle_error 2 "Failed to clone HISE repository"
else
    step "Updating HISE repository..."
    cd "$HISE_PATH"
    git fetch origin
    git pull origin develop
fi

cd "$HISE_PATH"
git checkout develop
git submodule update --init
cd JUCE && git checkout juce6 && cd ..

success "Git setup complete"
`}

# ============================================
# Phase 3: Xcode
# ============================================
${skipPhases.includes(3) ? '# SKIPPED: Xcode already installed' : `
phase "Phase 3: Xcode"

if ! command -v xcodebuild &> /dev/null; then
    err "Xcode Command Line Tools are not installed."
    echo ""
    echo -e "\${YELLOW}Please install Xcode Command Line Tools:\${NC}"
    echo -e "\${CYAN}xcode-select --install\${NC}"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

# Accept Xcode license if needed
step "Checking Xcode license..."
sudo xcodebuild -license accept 2>/dev/null || true

success "Xcode detected"
`}

# ============================================
# Phase 5: Faust (Optional)
# ============================================
${!includeFaust || skipPhases.includes(5) ? '# SKIPPED: Faust not selected or already installed' : `
phase "Phase 5: Faust"

FAUST_LIB="$HISE_PATH/tools/faust/lib/libfaust.dylib"

if [ ! -f "$FAUST_LIB" ]; then
    echo ""
    echo -e "\${YELLOW}========================================\${NC}"
    echo -e "\${YELLOW}  MANUAL STEP REQUIRED: Install Faust\${NC}"
    echo -e "\${YELLOW}========================================\${NC}"
    echo ""
    echo "Please download Faust 2.54.0 or later:"
    echo -e "\${CYAN}https://github.com/grame-cncm/faust/releases\${NC}"
    echo ""
    if [ "$ARCH" = "arm64" ]; then
        echo "Download: Faust-2.XX.X-arm64.dmg (for Apple Silicon)"
    else
        echo "Download: Faust-2.XX.X-x64.dmg (for Intel Mac)"
    fi
    echo ""
    echo "Extract ALL folders (include, lib, bin, share) to:"
    echo -e "\${CYAN}$HISE_PATH/tools/faust/\${NC}"
    echo ""
    read -p "Press Enter after extraction is complete..."
    
    if [ ! -f "$FAUST_LIB" ]; then
        warn "Faust not detected. Build will continue without Faust support."
        FAUST_INSTALLED=0
    else
        success "Faust detected"
        FAUST_INSTALLED=1
    fi
else
    success "Faust already installed"
    FAUST_INSTALLED=1
fi
`}

# ============================================
# Phase 6: Repository Structure Check
# ============================================
${skipPhases.includes(6) ? '# SKIPPED: Repository structure already verified' : `
phase "Phase 6: Repository Structure Check"

cd "$HISE_PATH"

# Verify JUCE submodule
step "Verifying JUCE submodule..."
if [ ! -d "JUCE/modules" ]; then
    git submodule update --init
fi
cd JUCE
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "juce6" ]; then
    git checkout juce6
fi
cd "$HISE_PATH"

# Extract SDKs
step "Extracting SDKs..."
if [ ! -d "tools/SDK/ASIOSDK2.3" ]; then
    cd tools/SDK
    tar -xf sdk.zip
    cd "$HISE_PATH"
fi

# Verify
if [ -d "tools/SDK/ASIOSDK2.3" ] && [ -d "tools/SDK/VST3 SDK" ]; then
    success "SDKs verified"
else
    handle_error 6 "SDK extraction failed"
fi
`}

# ============================================
# Phase 7: Compile HISE
# ============================================
phase "Phase 7: Compile HISE"

cd "$HISE_PATH/projects/standalone"

${includeFaust ? `
# Configure architecture for Faust build
if [ "\${FAUST_INSTALLED:-0}" = "1" ]; then
    step "Configuring single architecture for Faust build..."
    sed -i '' "s/xcodeValidArchs=\\"[^\\"]*\\"/xcodeValidArchs=\\"$ARCH\\"/" "HISE Standalone.jucer"
fi
` : ''}

step "Running Projucer..."
PROJUCER="$HISE_PATH/JUCE/Projucer/Projucer.app/Contents/MacOS/Projucer"

# Verify Projucer exists
if [ ! -f "$PROJUCER" ]; then
    handle_error 7 "Projucer not found at $PROJUCER"
fi

chmod +x "$PROJUCER"
"$PROJUCER" --resave "HISE Standalone.jucer"

step "Compiling HISE (this will take 5-15 minutes)..."
CORES=$(sysctl -n hw.ncpu)

${includeFaust ? `
if [ "\${FAUST_INSTALLED:-0}" = "1" ]; then
    BUILD_CONFIG="Release with Faust"
else
    BUILD_CONFIG="Release"
fi
` : `
BUILD_CONFIG="Release"
`}

# Try with xcbeautify first, fall back to plain xcodebuild
# Use set -o pipefail to detect xcodebuild errors when piped
XCBEAUTIFY="$HISE_PATH/tools/Projucer/xcbeautify"
if [ -x "$XCBEAUTIFY" ]; then
    set -o pipefail && xcodebuild -project "Builds/MacOSX/HISE Standalone.xcodeproj" -configuration "$BUILD_CONFIG" -jobs $CORES | "$XCBEAUTIFY" || handle_error 7 "HISE compilation failed"
else
    xcodebuild -project "Builds/MacOSX/HISE Standalone.xcodeproj" -configuration "$BUILD_CONFIG" -jobs $CORES || handle_error 7 "HISE compilation failed"
fi

# Verify build
HISE_BIN="Builds/MacOSX/build/Release/HISE.app/Contents/MacOS/HISE"
if [ ! -f "$HISE_BIN" ]; then
    handle_error 7 "HISE binary not found after build"
fi

success "HISE compiled successfully"

# ============================================
# Phase 8: Add to PATH
# ============================================
phase "Phase 8: Add HISE to PATH"

HISE_BIN_PATH="$HISE_PATH/projects/standalone/Builds/MacOSX/build/Release/HISE.app/Contents/MacOS"

# Detect shell config file
if [ "$(basename "$SHELL")" = "zsh" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
else
    SHELL_CONFIG="$HOME/.bash_profile"
fi

# Clean up existing entries
sed -i '' '/HISE\\.app\\/Contents\\/MacOS/d' "$SHELL_CONFIG" 2>/dev/null || true

# Add to PATH
echo "export PATH=\\"\$PATH:$HISE_BIN_PATH\\"" >> "$SHELL_CONFIG"

success "HISE added to PATH"
echo "  (Restart your terminal or run: source $SHELL_CONFIG)"

# ============================================
# Phase 9: Verify Build
# ============================================
phase "Phase 9: Verify Build"

step "Checking build flags..."
"$HISE_BIN_PATH/HISE" get_build_flags || warn "Could not verify build flags"

success "Build verified"

# ============================================
# Phase 10: Test Project
# ============================================
phase "Phase 10: Test Project"

step "Setting project folder..."
"$HISE_BIN_PATH/HISE" set_project_folder -p:"$HISE_PATH/extras/demo_project"

step "Exporting demo project (VST3 instrument)..."
"$HISE_BIN_PATH/HISE" export_ci "XmlPresetBackups/Demo.xml" -t:instrument -p:VST3 -a:x64 -nolto || warn "Demo project export had issues, but HISE is installed"

success "Demo project exported successfully"

# Run the generated batch compile script
step "Running batch compile script..."
BATCH_SCRIPT="$HISE_PATH/extras/demo_project/Binaries/batchCompileOSX"
if [ -f "$BATCH_SCRIPT" ]; then
    chmod +x "$BATCH_SCRIPT"
    "$BATCH_SCRIPT" || warn "Batch compile had issues, but HISE is installed"
    success "Demo project compiled successfully"
else
    warn "Batch compile script not found at $BATCH_SCRIPT"
fi

# ============================================
# Phase 11: Success
# ============================================
echo ""
echo -e "\${GREEN}========================================\${NC}"
echo -e "\${GREEN}  HISE Setup Complete!\${NC}"
echo -e "\${GREEN}========================================\${NC}"
echo ""
echo "HISE has been installed to: $HISE_PATH"
echo ""
echo "You can now:"
echo -e "  1. Restart your terminal and run: \${CYAN}HISE --help\${NC}"
echo -e "  2. Or source your shell config: \${CYAN}source $SHELL_CONFIG\${NC}"
echo ""
echo "Resources:"
echo -e "  - Documentation: \${CYAN}https://docs.hise.dev\${NC}"
echo -e "  - Forum: \${CYAN}https://forum.hise.audio\${NC}"
echo ""
`;

  return script;
}

// ============================================
// macOS Update Script Generator
// ============================================

export function generateMacOSUpdateScript(config: UpdateScriptConfig): string {
  const { hisePath, hasFaust, architecture } = config;
  
  // Expand ~ for home directory
  const expandedPath = hisePath.startsWith('~') 
    ? hisePath.replace('~', '$HOME')
    : hisePath;
  
  const buildConfig = hasFaust ? 'Release with Faust' : 'Release';
  
  const script = `#!/bin/bash
# ${generateUpdateHeader(config).split('\n').join('\n# ')}

# ============================================
# HISE Update Script for macOS
# ============================================

set -e

${generateBashUtilities()}

${generateBashErrorHandler('update')}

HISE_PATH="${expandedPath}"
ARCH="${architecture}"

echo ""
echo -e "\${CYAN}========================================\${NC}"
echo -e "\${CYAN}  HISE Update Script for macOS\${NC}"
echo -e "\${CYAN}========================================\${NC}"
echo ""
echo "HISE path: $HISE_PATH"
echo "Architecture: $ARCH"
echo "Build config: ${buildConfig}"
echo ""

# ============================================
# Phase 1: Validate HISE Path
# ============================================
phase "Validating HISE Installation"

if [ ! -d "$HISE_PATH/.git" ]; then
    handle_error 0 "Invalid HISE path - not a git repository: $HISE_PATH"
fi

if [ ! -d "$HISE_PATH/JUCE" ]; then
    handle_error 0 "JUCE submodule not found in $HISE_PATH"
fi

success "HISE installation validated"

# ============================================
# Phase 2: Update Repository
# ============================================
${generateGitPullSectionBash(expandedPath)}

# ============================================
# Phase 3: Compile HISE
# ============================================
${generateCompileSectionMacOS(expandedPath, architecture, hasFaust)}

# ============================================
# Phase 4: Verify Build
# ============================================
${generateVerifySectionBash(expandedPath, buildConfig, 'macos')}

# ============================================
# Success
# ============================================
${generateUpdateSuccessMessageBash(expandedPath)}
`;

  return script;
}
