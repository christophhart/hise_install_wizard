import { ScriptConfig, GenerateScriptResponse, UpdateScriptConfig, UpdateScriptResponse } from '@/types/wizard';
import { generateWindowsScript, generateWindowsUpdateScript } from './templates/windows';
import { generateMacOSScript, generateMacOSUpdateScript } from './templates/macos';
import { generateLinuxScript, generateLinuxUpdateScript } from './templates/linux';

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

export function generateUpdateScript(config: UpdateScriptConfig): UpdateScriptResponse {
  const warnings: string[] = [];
  let script: string;
  let filename: string;

  switch (config.platform) {
    case 'windows':
      script = generateWindowsUpdateScript(config);
      filename = 'hise-update.ps1';
      break;

    case 'macos':
      script = generateMacOSUpdateScript(config);
      filename = 'hise-update.sh';
      break;

    case 'linux':
      script = generateLinuxUpdateScript(config);
      filename = 'hise-update.sh';
      warnings.push('This script requires sudo privileges for some operations.');
      break;

    default:
      throw new Error(`Unsupported platform: ${config.platform}`);
  }

  if (config.hasFaust) {
    warnings.push('Building with Faust support. Make sure Faust is still installed on your system.');
  }

  return {
    script,
    filename,
    warnings,
  };
}
