'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  Platform, 
  Architecture, 
  ExplanationMode,
  HiseInstallation,
  NukeState,
} from '@/types/wizard';
import { EXPLANATION_MODE_KEY, EXPLANATION_MODE_CHANGE_EVENT } from '@/lib/constants';
import { detectPlatform } from '@/lib/utils/platform';

const initialState: NukeState = {
  platform: null,
  architecture: null,
  installations: [],
  removeSettings: true,
  removePathEntries: true,
  explanationMode: 'easy',
};

interface NukeContextType {
  state: NukeState;
  setPlatform: (platform: Platform) => void;
  setArchitecture: (arch: Architecture) => void;
  setInstallations: (installations: HiseInstallation[]) => void;
  toggleInstallation: (path: string) => void;
  setRemoveSettings: (remove: boolean) => void;
  setRemovePathEntries: (remove: boolean) => void;
  setExplanationMode: (mode: ExplanationMode) => void;
  reset: () => void;
  canGenerate: boolean;
  selectedInstallations: HiseInstallation[];
}

const NukeContext = createContext<NukeContextType | undefined>(undefined);

export function NukeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NukeState>(initialState);

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

  const setInstallations = useCallback((installations: HiseInstallation[]) => {
    setState(prev => ({ ...prev, installations }));
  }, []);

  const toggleInstallation = useCallback((path: string) => {
    setState(prev => ({
      ...prev,
      installations: prev.installations.map(inst =>
        inst.path === path ? { ...inst, selected: !inst.selected } : inst
      ),
    }));
  }, []);

  const setRemoveSettings = useCallback((removeSettings: boolean) => {
    setState(prev => ({ ...prev, removeSettings }));
  }, []);

  const setRemovePathEntries = useCallback((removePathEntries: boolean) => {
    setState(prev => ({ ...prev, removePathEntries }));
  }, []);

  const setExplanationMode = useCallback((explanationMode: ExplanationMode) => {
    setState(prev => ({ ...prev, explanationMode }));
    if (typeof window !== 'undefined') {
      localStorage.setItem(EXPLANATION_MODE_KEY, explanationMode);
    }
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...initialState,
      explanationMode: prev.explanationMode,
    }));
  }, []);

  // Get selected installations
  const selectedInstallations = state.installations.filter(inst => inst.selected);

  // Can generate when we have platform and at least one selected installation
  const canGenerate = state.platform !== null && selectedInstallations.length > 0;

  return (
    <NukeContext.Provider
      value={{
        state,
        setPlatform,
        setArchitecture,
        setInstallations,
        toggleInstallation,
        setRemoveSettings,
        setRemovePathEntries,
        setExplanationMode,
        reset,
        canGenerate,
        selectedInstallations,
      }}
    >
      {children}
    </NukeContext.Provider>
  );
}

export function useNuke() {
  const context = useContext(NukeContext);
  if (context === undefined) {
    throw new Error('useNuke must be used within a NukeProvider');
  }
  return context;
}
