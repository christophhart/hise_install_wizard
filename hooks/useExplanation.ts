'use client';

import { useWizard } from '@/contexts/WizardContext';
import { ExplanationMode } from '@/types/wizard';

/**
 * A simple interface for mode-aware content
 */
interface ModeContent {
  easy: string;
  dev: string;
}

/**
 * Hook to get mode-appropriate explanations.
 * Returns the current mode and a helper function to get content based on mode.
 */
export function useExplanation() {
  const { state } = useWizard();
  const mode: ExplanationMode = state.explanationMode;
  
  /**
   * Get content for the current mode from a ModeContent object
   */
  function get(content: ModeContent): string {
    return content[mode];
  }
  
  /**
   * Get content with optional fallback for dev mode
   * If dev mode content is null, returns easy mode content
   */
  function getOptional(content: { easy: string; dev: string | null }): string {
    const value = content[mode];
    return value ?? content.easy;
  }
  
  /**
   * Check if we're in easy mode
   */
  const isEasyMode = mode === 'easy';
  
  /**
   * Check if we're in dev mode
   */
  const isDevMode = mode === 'dev';
  
  return {
    mode,
    get,
    getOptional,
    isEasyMode,
    isDevMode,
  };
}
