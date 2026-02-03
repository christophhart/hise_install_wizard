import { Platform } from '@/types/wizard';

/**
 * Verification utilities for IDE and tool installation checks.
 * Extracted from IDEVerification component for reuse across the application.
 */

export type VerifiableTool = 'ide' | 'ipp';

export interface VerificationResult {
  verified: boolean;
  toolName: string;
}

/**
 * Get the display name for a tool on a given platform
 */
export function getToolName(platform: Exclude<Platform, null>, tool: VerifiableTool): string {
  if (tool === 'ipp') {
    return 'Intel IPP';
  }
  
  switch (platform) {
    case 'windows':
      return 'Visual Studio 2026';
    case 'macos':
      return 'Xcode Command Line Tools';
    case 'linux':
      return 'GCC';
    default:
      return 'C++ Compiler';
  }
}

/**
 * Get the verification command for a specific tool on a given platform.
 * Windows and macOS commands copy output to clipboard automatically.
 * Linux shows visual markers for manual copying.
 */
export function getVerificationCommand(
  platform: Exclude<Platform, null>,
  tool: VerifiableTool
): string {
  if (tool === 'ipp') {
    // IPP is Windows only
    if (platform !== 'windows') return '';
    // PowerShell: copy to clipboard + show confirmation
    return '$r = if (Test-Path "C:\\Program Files (x86)\\Intel\\oneAPI\\ipp\\latest") { "ipp" } else { "none" }; Set-Clipboard $r; "Copied to clipboard: $r"';
  }
  
  // IDE verification
  switch (platform) {
    case 'windows':
      // PowerShell: copy to clipboard + show confirmation
      return '$r = if (Test-Path "C:\\Program Files\\Microsoft Visual Studio\\18\\*\\MSBuild\\Current\\Bin\\MSBuild.exe") { "vs" } else { "none" }; Set-Clipboard $r; "Copied to clipboard: $r"';
    case 'macos':
      // Bash: copy to clipboard with pbcopy + show confirmation
      return 'r=$(if xcode-select -p &>/dev/null; then echo "xcode"; else echo "none"; fi); echo "$r" | pbcopy; echo "Copied to clipboard: $r"';
    case 'linux':
      // Linux: show visual markers for manual copying
      return 'echo "==== COPY BELOW ===="; if command -v gcc &>/dev/null; then echo "gcc"; else echo "none"; fi; echo "==== COPY ABOVE ===="';
    default:
      return '';
  }
}

/**
 * Parse the output of a verification command
 */
export function parseVerificationOutput(
  output: string,
  platform: Exclude<Platform, null>,
  tool: VerifiableTool
): boolean {
  const trimmed = output.trim().toLowerCase();
  
  if (tool === 'ipp') {
    return trimmed.includes('ipp');
  }
  
  // IDE verification
  switch (platform) {
    case 'windows':
      return trimmed.includes('vs');
    case 'macos':
      return trimmed.includes('xcode');
    case 'linux':
      return trimmed.includes('gcc');
    default:
      return false;
  }
}

/**
 * Get the expected output format hint for a tool
 */
export function getOutputHint(
  platform: Exclude<Platform, null>,
  tool: VerifiableTool
): string {
  if (tool === 'ipp') {
    return 'e.g., ipp or none';
  }
  
  switch (platform) {
    case 'windows':
      return 'e.g., vs or none';
    case 'macos':
      return 'e.g., xcode or none';
    case 'linux':
      return 'e.g., gcc or none';
    default:
      return 'e.g., found or none';
  }
}

/**
 * Check if a tool requires verification for a given platform
 */
export function requiresVerification(
  platform: Exclude<Platform, null>,
  tool: VerifiableTool
): boolean {
  // IPP is Windows only
  if (tool === 'ipp' && platform !== 'windows') {
    return false;
  }
  
  // IDE: Linux doesn't need verification (apt-get handles it)
  if (tool === 'ide' && platform === 'linux') {
    return false;
  }
  
  return true;
}
