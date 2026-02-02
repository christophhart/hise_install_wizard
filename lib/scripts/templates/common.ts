// Common script generation utilities

export interface ScriptConfig {
  platform: 'windows' | 'macos' | 'linux';
  architecture: 'x64' | 'arm64';
  installPath: string;
  includeFaust: boolean;
  includeIPP: boolean;
  skipPhases: number[];
}

export const HELP_URL = 'https://hise-setup.app/help';

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
