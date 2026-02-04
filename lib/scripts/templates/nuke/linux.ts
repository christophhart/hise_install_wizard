// Linux nuke script generator

import { NukeScriptConfig } from '@/types/wizard';
import {
  generateBashUtilities,
} from '../common';
import {
  generateNukeHeaderBash,
  generateConfirmationBash,
  generatePathCleanupBash,
  generateSettingsRemovalBash,
  generateInstallationRemovalBash,
  generateTempCleanupBash,
  generateVerificationBash,
  generateNukeSuccessMessageBash,
} from './common';

export function generateLinuxNukeScript(config: NukeScriptConfig): string {
  const sections: string[] = [];
  
  // Header
  sections.push(generateNukeHeaderBash(config));
  
  // Utility functions
  sections.push(generateBashUtilities());
  
  // Confirmation prompt
  sections.push(generateConfirmationBash(config));
  
  // Phase 1: Clean PATH entries
  if (config.removePathEntries) {
    sections.push(generatePathCleanupBash('linux'));
  }
  
  // Phase 2: Remove settings folder
  if (config.removeSettings) {
    sections.push(generateSettingsRemovalBash('linux'));
  }
  
  // Phase 3: Remove HISE installations
  sections.push(generateInstallationRemovalBash(config.installationPaths));
  
  // Phase 4: Clean temp files (minimal on Linux)
  sections.push(generateTempCleanupBash('linux'));
  
  // Phase 5: Verify removal
  sections.push(generateVerificationBash());
  
  // Success message
  sections.push(generateNukeSuccessMessageBash());
  
  return sections.join('\n');
}
