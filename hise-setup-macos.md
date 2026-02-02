# HISE Development Environment Setup - macOS

## Overview

Setup guide for HISE (Hart Instrument Software Environment) on macOS 10.13+ (Intel x64 and Apple Silicon arm64).

---

## Setup Phases

| Phase | Name | Required | Description |
|-------|------|----------|-------------|
| 0 | System Detection | - | Detect installed components |
| 1 | User Configuration | - | Gather preferences (install path, optional components) |
| 2 | Git Setup | Yes | Clone HISE, init JUCE submodule (juce6 branch) |
| 3 | Xcode | Yes | Install with Command Line Tools |
| 4 | Intel IPP | No | Not available on macOS |
| 5 | Faust | No | Optional DSP compiler |
| 6 | Repository Check | Yes | Verify JUCE submodule and SDKs (including VST3 SDK) |
| 7 | Compile HISE | Yes | Build standalone application |
| 8 | Add to PATH | Yes | Add HISE binary to shell config |
| 9 | Verify Build | Yes | Run `HISE get_build_flags` |
| 10 | Test Project | Yes | Compile demo project as VST3 plugin (CI config) |
| 11 | Success | Yes | Final verification |

---

## Download URLs

| Component | URL |
|-----------|-----|
| Xcode | https://developer.apple.com/xcode/ (or Mac App Store) |
| Faust 2.54.0+ (Intel) | https://github.com/grame-cncm/faust/releases (`Faust-VERSION-x64.dmg`) |
| Faust 2.54.0+ (Apple Silicon) | https://github.com/grame-cncm/faust/releases (`Faust-VERSION-arm64.dmg`) |

---

## Prerequisites

### Architecture Detection

```bash
uname -m
# Returns: x86_64 (Intel) or arm64 (Apple Silicon)
```

---

## Phase 0: System Detection

Detect installed components:

| Component | Check |
|-----------|-------|
| Xcode | `xcode-select -p` and `xcodebuild -version` |
| Faust | `{hisePath}/tools/faust/lib/libfaust.dylib` |
| Git | `git --version` |
| HISE Repository | `.git` folder exists |
| SDKs | `tools/SDK/ASIOSDK2.3/` and `tools/SDK/VST3 SDK/` |
| JUCE | `JUCE/` on `juce6` branch |

---

## Phase 1: User Configuration

Collect user preferences:

1. **Installation Location** - Default: `~/HISE`
2. **Faust** - Optional DSP compiler (changes build to "Release with Faust")

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

**If Git not found:** HALT and prompt user to install Xcode Command Line Tools:
```bash
xcode-select --install
```

---

## Phase 3: Xcode

**This step cannot be skipped.** HISE requires a C++ compiler.

1. Install Xcode from Mac App Store, or run `xcode-select --install` for Command Line Tools only
2. Accept license and verify installation:

```bash
# Verify Xcode installation
xcodebuild -version
xcode-select -p

# Accept license (if needed)
sudo xcodebuild -license accept
```

---

## Phase 4: Intel IPP

**Not available on macOS.** Skip this phase.

---

## Phase 5: Faust (Optional)

```bash
# Detect architecture
CPU_ARCH=$(uname -m)

# Direct user to download correct DMG:
# - Intel Mac: Faust-VERSION-x64.dmg
# - Apple Silicon: Faust-VERSION-arm64.dmg

# User must extract all folders to {hisePath}/tools/faust/:
# - include/, lib/, bin/, share/

# Verify
if [ -f "{hisePath}/tools/faust/lib/libfaust.dylib" ]; then
    echo "Faust installed successfully"
    FAUST_INSTALLED=1
else
    echo "Faust installation not found"
    FAUST_INSTALLED=0
fi
```

**Gatekeeper:** If macOS blocks unsigned Faust libraries, direct user to System Preferences > Security & Privacy > Allow.

**Post-Installation:** Set `FaustPath` in HISE Settings to `{hisePath}/tools/faust/`

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

# Verify Projucer
[ -f "JUCE/Projucer/Projucer.app/Contents/MacOS/Projucer" ] && echo "Projucer OK" || echo "ERROR: Projucer not found"

# Make Projucer executable
chmod +x "JUCE/Projucer/Projucer.app/Contents/MacOS/Projucer"
```

> **Note:** The VST3 SDK is required for building VST3 plugins (used in Phase 10 test). It is included in `sdk.zip`.

---

## Phase 7: Compile HISE

> **Build Timeout:** Compilation takes 5-15 minutes. Set timeout to 600000ms minimum.

> **Projucer Location:** `{hisePath}/JUCE/Projucer/Projucer.app/Contents/MacOS/Projucer`

**Configure Architecture (if Faust installed):**
```bash
CPU_ARCH=$(uname -m)
if [ "$CPU_ARCH" == "arm64" ]; then
    ARCH_SETTING="arm64"
else
    ARCH_SETTING="x86_64"
fi

# Update .jucer file for single architecture (required for Faust)
sed -i '' "s/xcodeValidArchs=\"[^\"]*\"/xcodeValidArchs=\"$ARCH_SETTING\"/" \
  "projects/standalone/HISE Standalone.jucer"
```

**Without Faust:**
```bash
cd {hisePath}/projects/standalone
chmod +x "{hisePath}/JUCE/Projucer/Projucer.app/Contents/MacOS/Projucer"
"{hisePath}/JUCE/Projucer/Projucer.app/Contents/MacOS/Projucer" --resave "HISE Standalone.jucer"

CORES=$(sysctl -n hw.ncpu)
set -o pipefail && xcodebuild -project "Builds/MacOSX/HISE Standalone.xcodeproj" -configuration Release -jobs $CORES | "{hisePath}/tools/Projucer/xcbeautify"
```

**With Faust:**
```bash
cd {hisePath}/projects/standalone
chmod +x "{hisePath}/JUCE/Projucer/Projucer.app/Contents/MacOS/Projucer"
"{hisePath}/JUCE/Projucer/Projucer.app/Contents/MacOS/Projucer" --resave "HISE Standalone.jucer"

CORES=$(sysctl -n hw.ncpu)
set -o pipefail && xcodebuild -project "Builds/MacOSX/HISE Standalone.xcodeproj" -configuration "Release with Faust" -jobs $CORES | "{hisePath}/tools/Projucer/xcbeautify"
```

> **Note:** The `set -o pipefail` ensures xcodebuild errors are properly detected even when piped through xcbeautify.

---

## Phase 8: Add to PATH

```bash
# Detect shell
if [ "$(basename "$SHELL")" = "zsh" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
else
    SHELL_CONFIG="$HOME/.bash_profile"
fi

HISE_PATH="{hisePath}/projects/standalone/Builds/MacOSX/build/Release/HISE.app/Contents/MacOS"

# Clean up existing entries
sed -i '' '/HISE\.app\/Contents\/MacOS/d' "$SHELL_CONFIG"

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

> **Note:** Uses CI configuration with `-nolto` for faster test builds. Builds a VST3 instrument plugin which requires the VST3 SDK (extracted in Phase 6).

```bash
HISE set_project_folder -p:"{hisePath}/extras/demo_project"
HISE export_ci "XmlPresetBackups/Demo.xml" -t:instrument -p:VST3 -a:x64 -nolto
```

**Expected Output:**
- Build files generated in `{hisePath}/extras/demo_project/Binaries/`
- Batch compile script created: `batchCompileOSX`

**Run the generated compile script:**
```bash
chmod +x "{hisePath}/extras/demo_project/Binaries/batchCompileOSX"
"{hisePath}/extras/demo_project/Binaries/batchCompileOSX"
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
| Release | `projects/standalone/Builds/MacOSX/build/Release/HISE.app/Contents/MacOS/HISE` |
| Release with Faust | `projects/standalone/Builds/MacOSX/build/Release/HISE.app/Contents/MacOS/HISE` |

> **Note:** Both configurations output to the same `Release` directory. Use `HISE get_build_flags` to verify Faust support.

---

## Error Handling

| Issue | Solution |
|-------|----------|
| Git not found | Run `xcode-select --install` - HALT until installed |
| Xcode not found | Install from Mac App Store or run `xcode-select --install` - HALT until installed |
| Projucer not found | Run `git submodule update --init --recursive` |
| Projucer blocked by Gatekeeper | System Preferences > Security & Privacy > Allow |
| xcbeautify not found | Verify path: `{hisePath}/tools/Projucer/xcbeautify` |
| Architecture mismatch (Faust) | Set single architecture in .jucer: `sed -i '' 's/xcodeValidArchs="[^"]*"/xcodeValidArchs="arm64"/'` |
| Faust version too old | Requires 2.54.0+ or enable `HI_FAUST_NO_WARNING_MESSAGES` flag |
| HISE not in PATH | Check shell config file (`.zshrc` or `.bash_profile`) and restart terminal |

---

## Technical Notes

- **C++ Standard:** C++17
- **JUCE Branch:** juce6 (fixed)
- **Build Timeout:** 600000ms (10 minutes) recommended
- **Compiler:** Clang via Xcode
- **Output Formatter:** xcbeautify (included in HISE repo at `tools/Projucer/xcbeautify`)
- **Projucer Path:** `{hisePath}/JUCE/Projucer/Projucer.app/Contents/MacOS/Projucer`
- **Test Build Config:** CI configuration with `-nolto` flag for faster test builds
- **Build Output:** `projects/standalone/Builds/MacOSX/build/Release/HISE.app`

---

## Limitations

- Requires internet connection
- Requires admin/sudo privileges for license acceptance
- Does not handle code signing certificates automatically
- Does not create installers

---

## Resources

- Website: https://hise.audio
- Forum: https://forum.hise.audio/
- Documentation: https://docs.hise.dev/
- Repository: https://github.com/christophhart/HISE
