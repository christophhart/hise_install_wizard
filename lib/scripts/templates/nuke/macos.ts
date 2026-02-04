// macOS nuke script generator

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

export function generateMacOSNukeScript(config: NukeScriptConfig): string {
  const sections: string[] = [];
  
  // Header
  sections.push(generateNukeHeaderBash(config));
  
  // Utility functions
  sections.push(generateBashUtilities());
  
  // Confirmation prompt
  sections.push(generateConfirmationBash(config));
  
  // Phase 1: Clean PATH entries
  if (config.removePathEntries) {
    sections.push(generatePathCleanupBash('macos'));
  }
  
  // Phase 2: Remove settings folder
  if (config.removeSettings) {
    sections.push(generateSettingsRemovalBash('macos'));
  }
  
  // Phase 3: Remove HISE installations (includes Faust on macOS)
  sections.push(generateInstallationRemovalBash(config.installationPaths));
  
  // Phase 4: Clean temp files
  sections.push(generateTempCleanupBash('macos'));
  
  // Phase 5: Verify removal
  sections.push(generateVerificationBash());
  
  // Success message
  sections.push(generateNukeSuccessMessageBash());
  
  return sections.join('\n');
}
