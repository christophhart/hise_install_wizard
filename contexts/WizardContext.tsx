'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  Platform, 
  Architecture, 
  DetectedComponents, 
  WizardState,
  DEFAULT_PATHS 
} from '@/types/wizard';

const initialDetectedComponents: DetectedComponents = {
  git: false,
  compiler: false,
  faust: false,
  intelIPP: false,
  hiseRepo: false,
  sdks: false,
  juce: false,
};

const initialState: WizardState = {
  platform: null,
  architecture: null,
  detectedComponents: initialDetectedComponents,
  installPath: '',
  includeFaust: false,
  includeIPP: false,
};

interface WizardContextType {
  state: WizardState;
  setPlatform: (platform: Platform) => void;
  setArchitecture: (arch: Architecture) => void;
  setDetectedComponent: (key: keyof DetectedComponents, value: boolean) => void;
  setInstallPath: (path: string) => void;
  setIncludeFaust: (include: boolean) => void;
  setIncludeIPP: (include: boolean) => void;
  reset: () => void;
  getSkipPhases: () => number[];
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState);

  const setPlatform = useCallback((platform: Platform) => {
    setState(prev => ({
      ...prev,
      platform,
      // Reset architecture when platform changes
      architecture: platform === 'macos' ? null : 'x64',
      // Set default install path for platform
      installPath: platform ? DEFAULT_PATHS[platform] : '',
      // Reset IPP if not Windows
      includeIPP: platform === 'windows' ? prev.includeIPP : false,
    }));
  }, []);

  const setArchitecture = useCallback((architecture: Architecture) => {
    setState(prev => ({ ...prev, architecture }));
  }, []);

  const setDetectedComponent = useCallback((key: keyof DetectedComponents, value: boolean) => {
    setState(prev => ({
      ...prev,
      detectedComponents: {
        ...prev.detectedComponents,
        [key]: value,
      },
    }));
  }, []);

  const setInstallPath = useCallback((installPath: string) => {
    setState(prev => ({ ...prev, installPath }));
  }, []);

  const setIncludeFaust = useCallback((includeFaust: boolean) => {
    setState(prev => ({ ...prev, includeFaust }));
  }, []);

  const setIncludeIPP = useCallback((includeIPP: boolean) => {
    setState(prev => ({ ...prev, includeIPP }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Determine which phases to skip based on detected components
  const getSkipPhases = useCallback((): number[] => {
    const skip: number[] = [];
    const { detectedComponents } = state;
    
    if (detectedComponents.git && detectedComponents.hiseRepo) {
      skip.push(2); // Git setup
    }
    if (detectedComponents.compiler) {
      skip.push(3); // Compiler installation
    }
    // Skip IPP if already installed OR user doesn't want to install
    if (detectedComponents.intelIPP || !state.includeIPP) {
      skip.push(4); // Intel IPP installation
    }
    // Skip Faust if already installed OR user doesn't want to install
    if (detectedComponents.faust || !state.includeFaust) {
      skip.push(5); // Faust installation
    }
    if (detectedComponents.sdks && detectedComponents.juce) {
      skip.push(6); // Repository check
    }
    
    return skip;
  }, [state]);

  return (
    <WizardContext.Provider
      value={{
        state,
        setPlatform,
        setArchitecture,
        setDetectedComponent,
        setInstallPath,
        setIncludeFaust,
        setIncludeIPP,
        reset,
        getSkipPhases,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
