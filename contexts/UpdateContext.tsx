'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  Platform, 
  Architecture, 
  ExplanationMode,
  DetectionResult,
} from '@/types/wizard';
import { EXPLANATION_MODE_KEY, EXPLANATION_MODE_CHANGE_EVENT } from '@/lib/constants';
import { detectPlatform } from '@/lib/utils/platform';

interface UpdateState {
  platform: Platform;
  architecture: Architecture;
  hisePath: string;
  hasFaust: boolean;
  detectionStatus: 'valid' | 'invalid' | 'not_found' | null;
  explanationMode: ExplanationMode;
}

const initialState: UpdateState = {
  platform: null,
  architecture: null,
  hisePath: '',
  hasFaust: false,
  detectionStatus: null,
  explanationMode: 'easy',
};

interface UpdateContextType {
  state: UpdateState;
  setPlatform: (platform: Platform) => void;
  setArchitecture: (arch: Architecture) => void;
  applyDetectionResult: (result: DetectionResult) => void;
  setExplanationMode: (mode: ExplanationMode) => void;
  reset: () => void;
  canGenerate: boolean;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export function UpdateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UpdateState>(initialState);

  // Load explanation mode from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(EXPLANATION_MODE_KEY);
      if (stored === 'easy' || stored === 'dev') {
        setState(prev => ({ ...prev, explanationMode: stored }));
      }
    }
  }, []);

  // Listen for explanation mode changes from Header
  useEffect(() => {
    const handleModeChange = (e: CustomEvent<ExplanationMode>) => {
      setState(prev => ({ ...prev, explanationMode: e.detail }));
    };
    
    window.addEventListener(EXPLANATION_MODE_CHANGE_EVENT, handleModeChange as EventListener);
    return () => window.removeEventListener(EXPLANATION_MODE_CHANGE_EVENT, handleModeChange as EventListener);
  }, []);

  // Auto-detect platform on mount
  useEffect(() => {
    const detected = detectPlatform();
    if (detected && !state.platform) {
      setState(prev => ({
        ...prev,
        platform: detected,
        // Set default architecture for non-macOS platforms
        architecture: detected === 'macos' ? null : 'x64',
      }));
    }
  }, [state.platform]);

  const setPlatform = useCallback((platform: Platform) => {
    setState(prev => ({
      ...prev,
      platform,
      architecture: platform === 'macos' ? null : 'x64',
    }));
  }, []);

  const setArchitecture = useCallback((architecture: Architecture) => {
    setState(prev => ({ ...prev, architecture }));
  }, []);

  const applyDetectionResult = useCallback((result: DetectionResult) => {
    setState(prev => ({
      ...prev,
      hisePath: result.path || '',
      hasFaust: result.hasFaust,
      detectionStatus: result.status,
      // Update architecture if provided (macOS)
      architecture: result.architecture || prev.architecture,
    }));
  }, []);

  const setExplanationMode = useCallback((explanationMode: ExplanationMode) => {
    setState(prev => ({ ...prev, explanationMode }));
    // Persist to localStorage for sharing with WizardContext
    if (typeof window !== 'undefined') {
      localStorage.setItem(EXPLANATION_MODE_KEY, explanationMode);
    }
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...initialState,
      explanationMode: prev.explanationMode, // Preserve mode preference
    }));
  }, []);

  // Can generate update script when we have a valid detection
  const canGenerate = state.platform !== null && 
    state.detectionStatus === 'valid' && 
    state.hisePath !== '' &&
    (state.platform !== 'macos' || state.architecture !== null);

  return (
    <UpdateContext.Provider
      value={{
        state,
        setPlatform,
        setArchitecture,
        applyDetectionResult,
        setExplanationMode,
        reset,
        canGenerate,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
}

export function useUpdate() {
  const context = useContext(UpdateContext);
  if (context === undefined) {
    throw new Error('useUpdate must be used within an UpdateProvider');
  }
  return context;
}
