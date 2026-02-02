import { ScriptConfig, GenerateScriptResponse } from '@/types/wizard';
import { generateWindowsScript } from './templates/windows';
import { generateMacOSScript } from './templates/macos';
import { generateLinuxScript } from './templates/linux';

export function generateScript(config: ScriptConfig): GenerateScriptResponse {
  const warnings: string[] = [];
  let script: string;
  let filename: string;

  switch (config.platform) {
    case 'windows':
      script = generateWindowsScript(config);
      filename = 'hise-setup.ps1';
      
      if (config.includeIPP) {
        warnings.push('Intel IPP installation requires ~500MB download and may take several minutes.');
      }
      break;

    case 'macos':
      script = generateMacOSScript(config);
      filename = 'hise-setup.sh';
      
      if (config.includeFaust && config.architecture === 'arm64') {
        warnings.push('Make sure to download the ARM64 version of Faust for Apple Silicon.');
      }
      break;

    case 'linux':
      script = generateLinuxScript(config);
      filename = 'hise-setup.sh';
      
      warnings.push('This script requires sudo privileges for package installation.');
      break;

    default:
      throw new Error(`Unsupported platform: ${config.platform}`);
  }

  if (config.includeFaust) {
    warnings.push('Faust installation requires a manual download step. The script will pause and provide instructions.');
  }

  return {
    script,
    filename,
    warnings,
  };
}
