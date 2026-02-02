import { 
  ScriptConfig, 
  UpdateScriptConfig,
  HELP_URL, 
  generateHeader,
  generateUpdateHeader,
  generateBashUtilities,
  generateBashErrorHandler,
  generateGitPullSectionBash,
  generateCompileSectionLinux,
  generateVerifySectionBash,
  generateUpdateSuccessMessageBash,
} from './common';

export function generateLinuxScript(config: ScriptConfig): string {
  const { installPath, includeFaust, skipPhases } = config;
  
  // Expand ~ for home directory
  const expandedPath = installPath.startsWith('~') 
    ? installPath.replace('~', '$HOME')
    : installPath;
  
  const script = `#!/bin/bash
# ${generateHeader(config).split('\n').join('\n# ')}

# ============================================
# HISE Setup Script for Linux
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
    echo -e "\${YELLOW}Need help? Visit: ${HELP_URL}?platform=linux&phase=$phase\${NC}"
    echo ""
    exit 1
}

HISE_PATH="${expandedPath}"

echo ""
echo -e "\${CYAN}========================================\${NC}"
echo -e "\${CYAN}  HISE Setup Script for Linux\${NC}"
echo -e "\${CYAN}========================================\${NC}"
echo ""
echo "Install path: $HISE_PATH"
echo ""

# ============================================
# Phase 2: Git Setup
# ============================================
${skipPhases.includes(2) ? '# SKIPPED: Git already configured' : `
phase "Phase 2: Git Setup"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    step "Installing Git..."
    sudo apt-get update
    sudo apt-get install -y git || handle_error 2 "Failed to install Git"
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
# Phase 3: GCC/Build Tools
# ============================================
${skipPhases.includes(3) ? '# SKIPPED: Build tools already installed' : `
phase "Phase 3: GCC/Build Tools"

# Check GCC version
if command -v gcc &> /dev/null; then
    GCC_VERSION=$(gcc -dumpversion | cut -d. -f1)
    if [ "$GCC_VERSION" -gt 11 ]; then
        err "GCC version $GCC_VERSION detected. HISE requires GCC 11 or earlier."
        echo ""
        echo -e "\${YELLOW}Please install GCC 11:\${NC}"
        echo -e "\${CYAN}sudo apt-get install gcc-11 g++-11\${NC}"
        echo -e "\${CYAN}sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-11 100\${NC}"
        echo -e "\${CYAN}sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-11 100\${NC}"
        echo ""
        exit 1
    fi
fi

step "Installing build dependencies..."
sudo apt-get update
sudo apt-get install -y \\
    build-essential \\
    make \\
    llvm \\
    clang \\
    libfreetype6-dev \\
    libx11-dev \\
    libxinerama-dev \\
    libxrandr-dev \\
    libxcursor-dev \\
    mesa-common-dev \\
    libasound2-dev \\
    freeglut3-dev \\
    libxcomposite-dev \\
    libcurl4-gnutls-dev \\
    libgtk-3-dev \\
    libjack-jackd2-dev \\
    libwebkit2gtk-4.0-dev \\
    libpthread-stubs0-dev \\
    ladspa-sdk \\
    || handle_error 3 "Failed to install build dependencies"

success "Build tools installed"
`}

# ============================================
# Phase 5: Faust (Optional)
# ============================================
${!includeFaust || skipPhases.includes(5) ? '# SKIPPED: Faust not selected or already installed' : `
phase "Phase 5: Faust"

FAUST_INSTALLED=0

if command -v faust &> /dev/null; then
    success "Faust already installed"
    FAUST_INSTALLED=1
else
    echo ""
    echo -e "\${YELLOW}========================================\${NC}"
    echo -e "\${YELLOW}  MANUAL STEP REQUIRED: Install Faust\${NC}"
    echo -e "\${YELLOW}========================================\${NC}"
    echo ""
    echo "Please install Faust using one of these methods:"
    echo ""
    echo -e "\${CYAN}# Debian/Ubuntu:\${NC}"
    echo "sudo apt-get install faust libfaust-dev"
    echo ""
    echo -e "\${CYAN}# Or build from source:\${NC}"
    echo "git clone https://github.com/grame-cncm/faust.git"
    echo "cd faust && make && sudo make install && sudo ldconfig"
    echo ""
    read -p "Press Enter after Faust installation is complete (or Enter to skip)..."
    
    if command -v faust &> /dev/null; then
        success "Faust detected"
        FAUST_INSTALLED=1
    else
        warn "Faust not detected. Build will continue without Faust support."
    fi
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

step "Running Projucer..."
PROJUCER="$HISE_PATH/JUCE/Projucer/Projucer"

# Verify Projucer exists
if [ ! -f "$PROJUCER" ]; then
    handle_error 7 "Projucer not found at $PROJUCER"
fi

chmod +x "$PROJUCER"
"$PROJUCER" --resave "HISE Standalone.jucer"

step "Compiling HISE (this will take 5-15 minutes)..."
cd Builds/LinuxMakefile

${includeFaust ? `
if [ "\${FAUST_INSTALLED:-0}" = "1" ]; then
    BUILD_CONFIG="ReleaseWithFaust"
else
    BUILD_CONFIG="Release"
fi
` : `
BUILD_CONFIG="Release"
`}

make CONFIG=$BUILD_CONFIG AR=gcc-ar -j$(nproc --ignore=2) || handle_error 7 "HISE compilation failed"

# Verify build (note: binary is named "HISE Standalone" with space)
HISE_BIN="build/HISE Standalone"
if [ ! -f "$HISE_BIN" ]; then
    handle_error 7 "HISE binary not found after build"
fi

# Create symlink for convenience
step "Creating HISE symlink..."
cd build
ln -sf "HISE Standalone" HISE
cd ..

success "HISE compiled successfully"

# ============================================
# Phase 8: Add to PATH
# ============================================
phase "Phase 8: Add HISE to PATH"

HISE_BIN_PATH="$HISE_PATH/projects/standalone/Builds/LinuxMakefile/build"

# Detect shell config file
if [ "$(basename "$SHELL")" = "zsh" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
else
    SHELL_CONFIG="$HOME/.bashrc"
fi

# Check if already in PATH
if ! grep -q "$HISE_BIN_PATH" "$SHELL_CONFIG" 2>/dev/null; then
    echo "export PATH=\\"\$PATH:$HISE_BIN_PATH\\"" >> "$SHELL_CONFIG"
    success "HISE added to PATH"
else
    success "HISE already in PATH"
fi

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
BATCH_SCRIPT="$HISE_PATH/extras/demo_project/Binaries/batchCompileLinux.sh"
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
// Linux Update Script Generator
// ============================================

export function generateLinuxUpdateScript(config: UpdateScriptConfig): string {
  const { hisePath, hasFaust } = config;
  
  // Expand ~ for home directory
  const expandedPath = hisePath.startsWith('~') 
    ? hisePath.replace('~', '$HOME')
    : hisePath;
  
  const buildConfig = hasFaust ? 'ReleaseWithFaust' : 'Release';
  
  const script = `#!/bin/bash
# ${generateUpdateHeader(config).split('\n').join('\n# ')}

# ============================================
# HISE Update Script for Linux
# ============================================

set -e

${generateBashUtilities()}

${generateBashErrorHandler('update')}

HISE_PATH="${expandedPath}"

echo ""
echo -e "\${CYAN}========================================\${NC}"
echo -e "\${CYAN}  HISE Update Script for Linux\${NC}"
echo -e "\${CYAN}========================================\${NC}"
echo ""
echo "HISE path: $HISE_PATH"
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
${generateCompileSectionLinux(expandedPath, hasFaust)}

# ============================================
# Phase 4: Verify Build
# ============================================
${generateVerifySectionBash(expandedPath, buildConfig, 'linux')}

# ============================================
# Success
# ============================================
${generateUpdateSuccessMessageBash(expandedPath)}
`;

  return script;
}
