import { ScriptConfig, GenerateScriptResponse, UpdateScriptConfig, UpdateScriptResponse, MigrationScriptConfig } from '@/types/wizard';
import { generateWindowsScript, generateWindowsUpdateScript, generateWindowsMigrationScript } from './templates/windows';
import { generateMacOSScript, generateMacOSUpdateScript, generateMacOSMigrationScript } from './templates/macos';
import { generateLinuxScript, generateLinuxUpdateScript, generateLinuxMigrationScript } from './templates/linux';

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
      break;

    case 'linux':
      script = generateLinuxScript(config);
      filename = 'hise-setup.sh';
      
      warnings.push('This script requires sudo privileges for package installation.');
      break;

    default:
      throw new Error(`Unsupported platform: ${config.platform}`);
  }

  if (config.includeFaust && config.platform !== 'linux') {
    if (config.faustVersion) {
      warnings.push(`Faust ${config.faustVersion} will be downloaded and installed automatically.`);
    } else {
      warnings.push('Faust will be downloaded and installed automatically.');
    }
  } else if (config.includeFaust && config.platform === 'linux') {
    warnings.push('Faust installation on Linux requires a manual step. The script will pause and provide instructions.');
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

export function generateMigrationScript(config: MigrationScriptConfig): UpdateScriptResponse {
  const warnings: string[] = [];
  let script: string;
  let filename: string;

  // Add migration-specific warning
  warnings.push('This will replace your existing HISE folder. Make sure you have backed up any local modifications.');

  switch (config.platform) {
    case 'windows':
      script = generateWindowsMigrationScript(config);
      filename = 'hise-migration.ps1';
      break;

    case 'macos':
      script = generateMacOSMigrationScript(config);
      filename = 'hise-migration.sh';
      break;

    case 'linux':
      script = generateLinuxMigrationScript(config);
      filename = 'hise-migration.sh';
      warnings.push('This script requires sudo privileges for Git installation and some operations.');
      break;

    default:
      throw new Error(`Unsupported platform: ${config.platform}`);
  }

  if (config.keepBackup) {
    warnings.push('Your existing HISE folder will be renamed to HISE_pre_git as a backup.');
  } else {
    warnings.push('Your existing HISE folder will be permanently deleted.');
  }

  if (config.hasFaust) {
    warnings.push('Building with Faust support. Make sure Faust is installed on your system.');
  }

  return {
    script,
    filename,
    warnings,
  };
}

