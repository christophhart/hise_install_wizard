// Windows nuke script generator

import { NukeScriptConfig } from '@/types/wizard';
import {
  generatePowerShellUtilities,
} from '../common';
import {
  generateNukeHeaderPS,
  generateConfirmationPS,
  generatePathCleanupPS,
  generateSettingsRemovalPS,
  generateInstallationRemovalPS,
  generateTempCleanupPS,
  generateVerificationPS,
  generateNukeSuccessMessagePS,
} from './common';

export function generateWindowsNukeScript(config: NukeScriptConfig): string {
  const sections: string[] = [];
  
  // Header
  sections.push(generateNukeHeaderPS(config));
  
  // Utility functions
  sections.push(generatePowerShellUtilities());
  
  // Confirmation prompt
  sections.push(generateConfirmationPS(config));
  
  // Phase 1: Clean PATH entries
  if (config.removePathEntries) {
    sections.push(generatePathCleanupPS());
  }
  
  // Phase 2: Remove settings folder
  if (config.removeSettings) {
    sections.push(generateSettingsRemovalPS());
  }
  
  // Phase 3: Remove HISE installations
  sections.push(generateInstallationRemovalPS(config.installationPaths));
  
  // Phase 4: Clean temp files
  sections.push(generateTempCleanupPS());
  
  // Phase 5: Verify removal
  sections.push(generateVerificationPS());
  
  // Success message
  sections.push(generateNukeSuccessMessagePS());
  
  return sections.join('\n');
}
