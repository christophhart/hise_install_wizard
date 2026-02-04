// Common utilities for nuke script generation

import { NukeScriptConfig, SETTINGS_PATHS, SHELL_CONFIG_FILES } from '@/types/wizard';
export type { NukeScriptConfig };

// Re-export from main common
export { 
  generateBashUtilities, 
  generatePowerShellUtilities,
  BASH_COLORS,
} from '../common';

// ============================================
// Nuke Script Headers
// ============================================

export function generateNukeHeaderBash(config: NukeScriptConfig): string {
  const timestamp = new Date().toISOString();
  return `#!/bin/bash
# ============================================
# HISE Nuke Script
# Generated: ${timestamp}
# Platform: ${config.platform}
# ============================================
#
# WARNING: This script will PERMANENTLY DELETE all HISE files!
# This action cannot be undone.
#
# Paths to be removed:
${config.installationPaths.map(p => `#   - ${p}`).join('\n')}
${config.removeSettings ? `#   - ${SETTINGS_PATHS[config.platform]} (settings)` : ''}
${config.removePathEntries ? `#   - PATH entries from shell configs` : ''}
#
# ============================================

set -e
`;
}

export function generateNukeHeaderPS(config: NukeScriptConfig): string {
  const timestamp = new Date().toISOString();
  return `# ============================================
# HISE Nuke Script
# Generated: ${timestamp}
# Platform: ${config.platform}
# ============================================
#
# WARNING: This script will PERMANENTLY DELETE all HISE files!
# This action cannot be undone.
#
# Paths to be removed:
${config.installationPaths.map(p => `#   - ${p}`).join('\n')}
${config.removeSettings ? `#   - ${SETTINGS_PATHS[config.platform]} (settings)` : ''}
${config.removePathEntries ? `#   - PATH entries from User environment variable` : ''}
#
# ============================================

$ErrorActionPreference = "Stop"
`;
}

// ============================================
// Confirmation Section
// ============================================

export function generateConfirmationBash(config: NukeScriptConfig): string {
  const settingsPath = SETTINGS_PATHS[config.platform];
  
  return `# Show what will be deleted
echo ""
echo -e "\${RED}============================================\${NC}"
echo -e "\${RED}       HISE REMOVAL SCRIPT\${NC}"
echo -e "\${RED}============================================\${NC}"
echo ""
echo "This script will PERMANENTLY DELETE the following:"
echo ""
echo "HISE Installations:"
${config.installationPaths.map(p => `echo "  - ${p}"`).join('\n')}
${config.removeSettings ? `echo ""
echo "Settings folder:"
echo "  - ${settingsPath}"` : ''}
${config.removePathEntries ? `echo ""
echo "PATH entries:"
echo "  - Lines containing 'HISE' in shell config files"` : ''}
echo ""
echo -e "\${YELLOW}This action CANNOT be undone!\${NC}"
echo ""
echo -e "\${YELLOW}Type NUKE to confirm, or press Ctrl+C to cancel:\${NC}"
read -r confirmation

if [ "$confirmation" != "NUKE" ]; then
    echo ""
    echo -e "\${GREEN}Cancelled. No files were deleted.\${NC}"
    echo ""
    exit 0
fi

echo ""
echo -e "\${CYAN}Starting removal...\${NC}"
echo ""
`;
}

export function generateConfirmationPS(config: NukeScriptConfig): string {
  const settingsPath = SETTINGS_PATHS[config.platform];
  
  return `# Show what will be deleted
Write-Host ""
Write-Host "============================================" -ForegroundColor Red
Write-Host "       HISE REMOVAL SCRIPT" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Red
Write-Host ""
Write-Host "This script will PERMANENTLY DELETE the following:"
Write-Host ""
Write-Host "HISE Installations:" -ForegroundColor White
${config.installationPaths.map(p => `Write-Host "  - ${p.replace(/\\/g, '\\\\')}"`).join('\n')}
${config.removeSettings ? `Write-Host ""
Write-Host "Settings folder:" -ForegroundColor White
Write-Host "  - ${settingsPath.replace(/\\/g, '\\\\')}"` : ''}
${config.removePathEntries ? `Write-Host ""
Write-Host "PATH entries:" -ForegroundColor White
Write-Host "  - HISE entries from User PATH environment variable"` : ''}
Write-Host ""
Write-Host "This action CANNOT be undone!" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Type NUKE to confirm, or press Ctrl+C to cancel"

if ($confirmation -ne "NUKE") {
    Write-Host ""
    Write-Host "Cancelled. No files were deleted." -ForegroundColor Green
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "Starting removal..." -ForegroundColor Cyan
Write-Host ""
`;
}

// ============================================
// PATH Cleanup Section
// ============================================

export function generatePathCleanupBash(platform: 'macos' | 'linux'): string {
  const configFiles = SHELL_CONFIG_FILES[platform];
  
  return `phase "Cleaning PATH entries"

${configFiles.map(file => {
  const expandedFile = file.replace('~', '$HOME');
  return `# Clean ${file}
if [ -f "${expandedFile}" ]; then
    step "Cleaning HISE entries from ${file}..."
    # Remove lines containing HISE paths
    sed -i.bak '/HISE\\.app\\/Contents\\/MacOS/d' "${expandedFile}" 2>/dev/null || true
    sed -i.bak '/HISE.*standalone.*Builds/d' "${expandedFile}" 2>/dev/null || true
    sed -i.bak '/LinuxMakefile\\/build/d' "${expandedFile}" 2>/dev/null || true
    # Clean up backup files
    rm -f "${expandedFile}.bak" 2>/dev/null || true
    success "Cleaned ${file}"
else
    step "${file} not found, skipping"
fi`;
}).join('\n\n')}

success "PATH entries cleaned"
`;
}

export function generatePathCleanupPS(): string {
  return `Write-Phase "Cleaning PATH entries"

Write-Step "Removing HISE entries from User PATH..."

$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath) {
    # Split path into components and filter out HISE-related entries
    $pathComponents = $currentPath -split ';' | Where-Object { 
        $_ -and 
        $_ -notmatch 'HISE' -and 
        $_ -notmatch 'VisualStudio2026.*App$'
    }
    
    $newPath = $pathComponents -join ';'
    
    if ($newPath -ne $currentPath) {
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Success "HISE entries removed from PATH"
    } else {
        Write-Step "No HISE entries found in PATH"
    }
} else {
    Write-Step "User PATH is empty, skipping"
}

Write-Success "PATH cleanup complete"
`;
}

// ============================================
// Settings Removal Section
// ============================================

export function generateSettingsRemovalBash(platform: 'macos' | 'linux'): string {
  const settingsPath = SETTINGS_PATHS[platform].replace('~', '$HOME');
  
  return `phase "Removing settings folder"

SETTINGS_PATH="${settingsPath}"

if [ -d "$SETTINGS_PATH" ]; then
    step "Removing $SETTINGS_PATH..."
    rm -rf "$SETTINGS_PATH" || warn "Could not remove settings folder"
    success "Settings folder removed"
else
    step "Settings folder not found, skipping"
fi
`;
}

export function generateSettingsRemovalPS(): string {
  return `Write-Phase "Removing settings folder"

$settingsPath = "$env:APPDATA\\HISE"

if (Test-Path $settingsPath) {
    Write-Step "Removing $settingsPath..."
    Remove-Item -Path $settingsPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Success "Settings folder removed"
} else {
    Write-Step "Settings folder not found, skipping"
}
`;
}

// ============================================
// Installation Removal Section
// ============================================

export function generateInstallationRemovalBash(paths: string[]): string {
  const sections = paths.map((path, index) => {
    // Handle paths with ~ by expanding them
    const expandedPath = path.startsWith('~') ? path.replace('~', '$HOME') : path;
    
    return `# Remove installation ${index + 1}
INSTALL_PATH_${index + 1}="${expandedPath}"
if [ -d "$INSTALL_PATH_${index + 1}" ]; then
    step "Removing $INSTALL_PATH_${index + 1}..."
    rm -rf "$INSTALL_PATH_${index + 1}" || warn "Could not fully remove $INSTALL_PATH_${index + 1}"
    success "Removed ${path}"
else
    step "${path} not found, skipping"
fi`;
  });
  
  return `phase "Removing HISE installations"

${sections.join('\n\n')}

success "All HISE installations removed"
`;
}

export function generateInstallationRemovalPS(paths: string[]): string {
  const sections = paths.map((path, index) => {
    const escapedPath = path.replace(/\\/g, '\\\\');
    
    return `# Remove installation ${index + 1}
$installPath${index + 1} = "${escapedPath}"
if (Test-Path $installPath${index + 1}) {
    Write-Step "Removing $installPath${index + 1}..."
    Remove-Item -Path $installPath${index + 1} -Recurse -Force -ErrorAction SilentlyContinue
    Write-Success "Removed ${escapedPath}"
} else {
    Write-Step "${escapedPath} not found, skipping"
}`;
  });
  
  return `Write-Phase "Removing HISE installations"

${sections.join('\n\n')}

Write-Success "All HISE installations removed"
`;
}

// ============================================
// Temp Files Cleanup Section
// ============================================

export function generateTempCleanupBash(platform: 'macos' | 'linux'): string {
  if (platform === 'macos') {
    return `phase "Cleaning temporary files"

step "Removing Faust DMG files..."
rm -f /tmp/Faust-*.dmg 2>/dev/null || true

step "Removing Faust mount points..."
rm -rf /tmp/faust-mount 2>/dev/null || true
rm -rf /tmp/faust_preserve_* 2>/dev/null || true

success "Temporary files cleaned"
`;
  }
  
  // Linux - no temp files to clean
  return `phase "Cleaning temporary files"

step "No temporary files to clean on Linux"
success "Temporary files cleanup complete"
`;
}

export function generateTempCleanupPS(): string {
  return `Write-Phase "Cleaning temporary files"

Write-Step "Removing installer files..."
Remove-Item -Path "$env:TEMP\\faust-installer.exe" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\\git-installer.exe" -Force -ErrorAction SilentlyContinue

Write-Success "Temporary files cleaned"
`;
}

// ============================================
// Verification Section
// ============================================

export function generateVerificationBash(): string {
  return `phase "Verifying removal"

if command -v HISE &> /dev/null; then
    warn "HISE command still found in PATH"
    echo "You may need to restart your terminal or remove it manually from your PATH."
else
    success "HISE command no longer available"
fi
`;
}

export function generateVerificationPS(): string {
  return `Write-Phase "Verifying removal"

# Refresh PATH from registry
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")

$hiseCmd = Get-Command HISE -ErrorAction SilentlyContinue
if ($hiseCmd) {
    Write-Warn "HISE command still found in PATH"
    Write-Host "You may need to restart your terminal or remove it manually from your PATH."
} else {
    Write-Success "HISE command no longer available"
}
`;
}

// ============================================
// Success Message
// ============================================

export function generateNukeSuccessMessageBash(): string {
  return `echo ""
echo -e "\${GREEN}============================================\${NC}"
echo -e "\${GREEN}  HISE REMOVAL COMPLETE\${NC}"
echo -e "\${GREEN}============================================\${NC}"
echo ""
echo "All HISE files have been removed from your system."
echo ""
echo "If you want to reinstall HISE, visit:"
echo "  https://hise-setup.app"
echo ""
echo "Thank you for using HISE!"
echo ""
`;
}

export function generateNukeSuccessMessagePS(): string {
  return `Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  HISE REMOVAL COMPLETE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "All HISE files have been removed from your system."
Write-Host ""
Write-Host "If you want to reinstall HISE, visit:"
Write-Host "  https://hise-setup.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Thank you for using HISE!"
Write-Host ""
`;
}
