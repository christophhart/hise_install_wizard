'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExplanationMode } from '@/types/wizard';
import { EXPLANATION_MODE_KEY, EXPLANATION_MODE_CHANGE_EVENT } from '@/lib/constants';

interface UseExplanationModeReturn {
  /** Current explanation mode */
  mode: ExplanationMode;
  /** Update the explanation mode (persists to localStorage and dispatches event) */
  setMode: (mode: ExplanationMode) => void;
}

/**
 * Hook for managing explanation mode state.
 * Handles persistence to localStorage and syncs across components via custom events.
 */
export function useExplanationMode(): UseExplanationModeReturn {
  const [mode, setModeState] = useState<ExplanationMode>('easy');

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(EXPLANATION_MODE_KEY);
      if (stored === 'easy' || stored === 'dev') {
        setModeState(stored);
      }
    }
  }, []);

  // Listen for changes from other components
  useEffect(() => {
    const handleModeChange = (e: CustomEvent<ExplanationMode>) => {
      setModeState(e.detail);
    };
    
    window.addEventListener(EXPLANATION_MODE_CHANGE_EVENT, handleModeChange as EventListener);
    return () => window.removeEventListener(EXPLANATION_MODE_CHANGE_EVENT, handleModeChange as EventListener);
  }, []);

  // Listen for storage changes (from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === EXPLANATION_MODE_KEY && (e.newValue === 'easy' || e.newValue === 'dev')) {
        setModeState(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setMode = useCallback((newMode: ExplanationMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(EXPLANATION_MODE_KEY, newMode);
      // Dispatch custom event so other components can sync
      window.dispatchEvent(new CustomEvent(EXPLANATION_MODE_CHANGE_EVENT, { detail: newMode }));
    }
  }, []);

  return { mode, setMode };
}

/**
 * Hook for listening to explanation mode changes only (no setter).
 * Useful for components that only need to react to mode changes.
 */
export function useExplanationModeListener(): ExplanationMode {
  const [mode, setModeState] = useState<ExplanationMode>('easy');

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(EXPLANATION_MODE_KEY);
      if (stored === 'easy' || stored === 'dev') {
        setModeState(stored);
      }
    }
  }, []);

  // Listen for changes from other components
  useEffect(() => {
    const handleModeChange = (e: CustomEvent<ExplanationMode>) => {
      setModeState(e.detail);
    };
    
    window.addEventListener(EXPLANATION_MODE_CHANGE_EVENT, handleModeChange as EventListener);
    return () => window.removeEventListener(EXPLANATION_MODE_CHANGE_EVENT, handleModeChange as EventListener);
  }, []);

  return mode;
}
