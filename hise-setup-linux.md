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
| 6 | Repository Check | Yes | Verify JUCE submodule and SDKs (including VST3 SDK) |
| 7 | Compile HISE | Yes | Build standalone application |
| 8 | Add to PATH | Yes | Add HISE binary to shell config + create symlink |
| 9 | Verify Build | Yes | Run `HISE get_build_flags` |
| 10 | Test Project | Yes | Compile demo project as VST3 plugin (CI config) |
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

# Extract SDKs (contains VST3 SDK required for plugin builds)
cd tools/SDK
tar -xf sdk.zip
cd ../..

# Verify SDKs
[ -d "tools/SDK/ASIOSDK2.3" ] && echo "ASIO SDK OK" || echo "WARNING: ASIO SDK not found"
[ -d "tools/SDK/VST3 SDK" ] && echo "VST3 SDK OK" || echo "WARNING: VST3 SDK not found - required for VST3 plugin builds"

# Verify Projucer (note: case-sensitive path on Linux)
[ -f "JUCE/Projucer/Projucer" ] && echo "Projucer OK" || echo "ERROR: Projucer not found"

# Make Projucer executable
chmod +x "JUCE/Projucer/Projucer"
```

> **Note:** The VST3 SDK is required for building VST3 plugins (used in Phase 10 test). It is included in `sdk.zip`.

---

## Phase 7: Compile HISE

> **Build Timeout:** Compilation takes 5-15 minutes. Set timeout to 600000ms minimum.

> **Projucer Location:** `{hisePath}/JUCE/Projucer/Projucer` (case-sensitive on Linux)

> **Output Binary:** The compiled binary is named `HISE Standalone` (with space).

**Without Faust:**
```bash
cd {hisePath}/projects/standalone
chmod +x "{hisePath}/JUCE/Projucer/Projucer"
"{hisePath}/JUCE/Projucer/Projucer" --resave "HISE Standalone.jucer"
cd Builds/LinuxMakefile
make CONFIG=Release AR=gcc-ar -j$(nproc --ignore=2)
```

**With Faust:**
```bash
cd {hisePath}/projects/standalone
chmod +x "{hisePath}/JUCE/Projucer/Projucer"
"{hisePath}/JUCE/Projucer/Projucer" --resave "HISE Standalone.jucer"
cd Builds/LinuxMakefile
make CONFIG=ReleaseWithFaust AR=gcc-ar -j$(nproc --ignore=2)
```

> **Note:** Linux uses `ReleaseWithFaust` (no spaces), while Windows/macOS use `"Release with Faust"` (with spaces).

**Post-build verification:**
```bash
# Check binary exists
[ -f "build/HISE Standalone" ] && echo "Build successful" || echo "ERROR: Build failed"
```

---

## Phase 8: Add to PATH

> **Important:** The Linux binary is named `HISE Standalone` (with space). A symlink `HISE` is created for convenience.

```bash
# Create symlink for convenience (binary has space in name)
cd {hisePath}/projects/standalone/Builds/LinuxMakefile/build
ln -sf "HISE Standalone" HISE

# Detect shell
if [ "$(basename "$SHELL")" = "zsh" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
else
    SHELL_CONFIG="$HOME/.bashrc"
fi

HISE_PATH="{hisePath}/projects/standalone/Builds/LinuxMakefile/build"

# Clean up existing entries
sed -i '/LinuxMakefile\/build/d' "$SHELL_CONFIG"

# Add to PATH
echo 'export PATH="$PATH:'"$HISE_PATH"'"' >> "$SHELL_CONFIG"
source "$SHELL_CONFIG"
```

> **Note:** After creating the symlink, you can use `HISE` command directly instead of `"HISE Standalone"` (with quotes).

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

> **Note:** Uses `-nolto` for faster test builds. Builds a VST3 instrument plugin which requires the VST3 SDK (extracted in Phase 6).

**Step 1: Configure HISE compiler settings**

Before exporting, configure the HISE source path:

```bash
HISE set_hise_settings -hisepath:"{hisePath}"
```

> **Note:** On Linux, the `-vs` and `-ipp` flags are not used.

**Step 2: Set project folder and export**

```bash
HISE set_project_folder -p:"{hisePath}/extras/demo_project"
HISE export "{hisePath}/extras/demo_project/XmlPresetBackups/Demo.xml" -t:instrument -p:VST3 -nolto
```

> **Note:** The `export` command requires an absolute path to the XML file. The `-a:x64` flag is not used on Linux.

**Expected Output:**
- Build files generated in `{hisePath}/extras/demo_project/Binaries/`
- Batch compile script created: `batchCompileLinux.sh`

**Run the generated compile script:**
```bash
chmod +x "{hisePath}/extras/demo_project/Binaries/batchCompileLinux.sh"
"{hisePath}/extras/demo_project/Binaries/batchCompileLinux.sh"
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
| `export_ci` | Build for automated/CI workflows (uses relative path) |
| `set_project_folder` | Set current project folder |
| `set_hise_folder` | Set HISE source location |
| `set_hise_settings` | Configure compiler settings (hisepath, faustpath) |
| `get_project_folder` | Get current project folder |
| `set_version` | Set project version |
| `clean` | Clean Binaries folder |
| `get_build_flags` | Show build configuration and features |

### set_hise_settings Command

```bash
HISE set_hise_settings [-hisepath:PATH] [-faustpath:PATH]
```

| Flag | Description |
|------|-------------|
| `-hisepath:PATH` | Absolute path to HISE source repository |
| `-faustpath:PATH` | Absolute path to Faust installation |

> **Note:** On Linux, the `-vs` and `-ipp` flags are not used.

---

## Build Artifacts

| Configuration | Path |
|---------------|------|
| Release | `projects/standalone/Builds/LinuxMakefile/build/HISE Standalone` |
| ReleaseWithFaust | `projects/standalone/Builds/LinuxMakefile/build/HISE Standalone` |

> **Note:** Both configurations output to the same `build` directory. The binary is named `HISE Standalone` (with space). A symlink `HISE` should be created for convenience (see Phase 8). Use `HISE get_build_flags` to verify Faust support.

---

## Error Handling

| Issue | Solution |
|-------|----------|
| Git not found | `sudo apt-get install git` |
| GCC >11 | Install GCC 11: `sudo apt-get install gcc-11 g++-11` and set as default via `update-alternatives` - ABORT if not resolved |
| Projucer not found | Run `git submodule update --init --recursive` and check path case-sensitivity |
| Projucer permission denied | Run `chmod +x "JUCE/Projucer/Projucer"` |
| Faust not found | `sudo apt-get install faust libfaust-dev` or build from source |
| libfaust not found | Run `sudo ldconfig` after Faust installation |
| Faust version too old | Requires 2.54.0+ or enable `HI_FAUST_NO_WARNING_MESSAGES` flag |
| HISE not in PATH | Check shell config file (`.bashrc` or `.zshrc`) and restart terminal |
| HISE command not found | Create symlink: `ln -sf "HISE Standalone" HISE` in the build directory |
| Binary name has space | Use quotes: `"HISE Standalone"` or use the `HISE` symlink |
| PRESET NOT FOUND error | Use absolute path with `export` command, not `export_ci` |

---

## Technical Notes

- **C++ Standard:** C++17
- **JUCE Branch:** juce6 (fixed)
- **Build Timeout:** 600000ms (10 minutes) recommended
- **Compiler:** GCC ≤11 or Clang (GCC >11 incompatible)
- **Parallel Build:** Uses `nproc --ignore=2` to leave 2 cores free
- **Projucer Path:** `{hisePath}/JUCE/Projucer/Projucer` (case-sensitive)
- **Binary Name:** `HISE Standalone` (with space) - create symlink `HISE` for convenience
- **Test Build Config:** Uses `-nolto` flag for faster test builds
- **Export Command:** Use `export` with absolute XML path (not `export_ci` which uses relative paths)
- **Compiler Settings:** Stored in `~/.config/HISE/compilerSettings.xml`
- **Build Output:** `projects/standalone/Builds/LinuxMakefile/build/HISE Standalone`

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
