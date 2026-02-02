# HISE Development Environment Setup - Linux

## Overview

Setup guide for HISE (Hart Instrument Software Environment) on Linux (Ubuntu 16.04+ tested, x64 only).

---

## Setup Phases

| Phase | Name | Required | Description |
|-------|------|----------|-------------|
| 0 | System Detection | - | Detect installed components |
| 1 | User Configuration | - | Gather preferences (install path, optional components) |
| 2 | Git Setup | Yes | Clone HISE, init JUCE submodule (juce6 branch) |
| 3 | GCC/Clang | Yes | Install build-essential and dependencies (GCC ≤11 required) |
| 4 | Intel IPP | No | Not available on Linux |
| 5 | Faust | No | Optional DSP compiler |
| 6 | Repository Check | Yes | Verify JUCE submodule and SDKs |
| 7 | Compile HISE | Yes | Build standalone application |
| 8 | Add to PATH | Yes | Add HISE binary to shell config |
| 9 | Verify Build | Yes | Run `HISE get_build_flags` |
| 10 | Test Project | Yes | Compile demo project |
| 11 | Success | Yes | Final verification |

---

## Download URLs

| Component | URL |
|-----------|-----|
| Faust 2.54.0+ | https://github.com/grame-cncm/faust/releases or `apt-get install faust libfaust-dev` |

---

## Prerequisites

### Architecture Detection

```bash
uname -m
# Returns: x86_64 (x64 only supported)
```

---

## Phase 0: System Detection

Detect installed components:

| Component | Check |
|-----------|-------|
| GCC | `gcc --version` (must be ≤11) |
| Faust | `which faust` and `ldconfig -p \| grep faust` |
| Git | `git --version` |
| HISE Repository | `.git` folder exists |
| SDKs | `tools/SDK/ASIOSDK2.3/` and `tools/SDK/VST3 SDK/` |
| JUCE | `JUCE/` on `juce6` branch |

---

## Phase 1: User Configuration

Collect user preferences:

1. **Installation Location** - Default: `~/HISE`
2. **Faust** - Optional DSP compiler (changes build to `ReleaseWithFaust`)

---

## Phase 2: Git Setup

```bash
cd {hisePath}

if [ -d ".git" ]; then
    git fetch origin
    git pull origin develop
else
    git clone https://github.com/christophhart/HISE.git
    cd HISE
fi

git checkout develop
git submodule update --init
cd JUCE && git checkout juce6 && cd ..
```

**If Git not found:**
```bash
sudo apt-get install git
```

---

## Phase 3: GCC/Clang

**This step cannot be skipped.** HISE requires a C++ compiler.

> **IMPORTANT:** GCC version must be ≤11. Newer versions are incompatible and will cause build failures.

```bash
# Check GCC version
gcc --version

# If GCC >11, install GCC 11:
sudo apt-get install gcc-11 g++-11
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-11 100
sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-11 100

# Install all dependencies
sudo apt-get -y install build-essential make llvm clang \
    libfreetype6-dev libx11-dev libxinerama-dev libxrandr-dev \
    libxcursor-dev mesa-common-dev libasound2-dev freeglut3-dev \
    libxcomposite-dev libcurl4-gnutls-dev libgtk-3-dev \
    libjack-jackd2-dev libwebkit2gtk-4.0-dev libpthread-stubs0-dev ladspa-sdk
```

---

## Phase 4: Intel IPP

**Not available on Linux.** Skip this phase.

---

## Phase 5: Faust (Optional)

```bash
# Check if already installed
which faust && faust --version
ldconfig -p | grep faust

# Install via package manager (Debian/Ubuntu)
sudo apt-get install faust libfaust-dev

# Or Arch Linux
sudo pacman -S faust

# Or build from source
git clone https://github.com/grame-cncm/faust.git
cd faust && make && sudo make install && sudo ldconfig

# Verify
faust --version  # Should be 2.54.0+
ldconfig -p | grep faust  # Should show libfaust

# Track installation status
if which faust > /dev/null 2>&1; then
    FAUST_INSTALLED=1
else
    FAUST_INSTALLED=0
fi
```

**Post-Installation:** Set `FaustPath` in HISE Settings to `/usr/local/` (or wherever Faust is installed)

---

## Phase 6: Repository Structure Check

```bash
cd {hisePath}

git submodule update --init
cd JUCE && git checkout juce6 && cd ..

# Extract SDKs
unzip tools/SDK/sdk.zip -d tools/SDK/

# Verify
[ -d "tools/SDK/ASIOSDK2.3" ] && echo "ASIO SDK OK" || echo "WARNING: ASIO SDK not found"
[ -d "tools/SDK/VST3 SDK" ] && echo "VST3 SDK OK" || echo "WARNING: VST3 SDK not found"
```

---

## Phase 7: Compile HISE

> **Build Timeout:** Compilation takes 5-15 minutes. Set timeout to 600000ms minimum.

**Without Faust:**
```bash
cd {hisePath}/projects/standalone
"{hisePath}/JUCE/Projucer/Projucer" --resave "HISE Standalone.jucer"
cd Builds/LinuxMakefile
make CONFIG=Release AR=gcc-ar -j$(nproc --ignore=2)
```

**With Faust:**
```bash
cd {hisePath}/projects/standalone
"{hisePath}/JUCE/Projucer/Projucer" --resave "HISE Standalone.jucer"
cd Builds/LinuxMakefile
make CONFIG=ReleaseWithFaust AR=gcc-ar -j$(nproc --ignore=2)
```

> **Note:** Linux uses `ReleaseWithFaust` (no spaces), while Windows/macOS use `"Release with Faust"` (with spaces).

---

## Phase 8: Add to PATH

```bash
# Detect shell
if [ "$(basename "$SHELL")" = "zsh" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
else
    SHELL_CONFIG="$HOME/.bashrc"
fi

HISE_PATH="{hisePath}/projects/standalone/Builds/LinuxMakefile/build"

# Add to PATH
echo 'export PATH="$PATH:'"$HISE_PATH"'"' >> "$SHELL_CONFIG"
source "$SHELL_CONFIG"
```

---

## Phase 9: Verify Build

```bash
HISE get_build_flags
```

Validates:
- Build Configuration contains "Release"
- Faust Support matches user selection

---

## Phase 10: Test Project

```bash
HISE set_project_folder -p:"{hisePath}/extras/demo_project"
HISE export_ci "XmlPresetBackups/Demo.xml" -t:standalone -a:x64
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
| Release | `projects/standalone/Builds/LinuxMakefile/build/HISE` |
| ReleaseWithFaust | `projects/standalone/Builds/LinuxMakefile/build/HISE` |

> **Note:** Both configurations output to the same `build` directory. Use `HISE get_build_flags` to verify Faust support.

---

## Error Handling

| Issue | Solution |
|-------|----------|
| Git not found | `sudo apt-get install git` |
| GCC >11 | Install GCC 11: `sudo apt-get install gcc-11 g++-11` and set as default via `update-alternatives` - ABORT if not resolved |
| Projucer not found | Run `git submodule update --init --recursive` |
| Faust not found | `sudo apt-get install faust libfaust-dev` or build from source |
| libfaust not found | Run `sudo ldconfig` after Faust installation |
| Faust version too old | Requires 2.54.0+ or enable `HI_FAUST_NO_WARNING_MESSAGES` flag |
| HISE not in PATH | Check shell config file (`.bashrc` or `.zshrc`) and restart terminal |

---

## Technical Notes

- **C++ Standard:** C++17
- **JUCE Branch:** juce6 (fixed)
- **Build Timeout:** 600000ms (10 minutes) recommended
- **Compiler:** GCC ≤11 or Clang (GCC >11 incompatible)
- **Parallel Build:** Uses `nproc --ignore=2` to leave 2 cores free

---

## Limitations

- Requires internet connection
- Requires sudo privileges for package installation
- Requires GCC ≤11 (newer versions incompatible)
- Does not create installers

---

## Resources

- Website: https://hise.audio
- Forum: https://forum.hise.audio/
- Documentation: https://docs.hise.dev/
- Repository: https://github.com/christophhart/HISE
