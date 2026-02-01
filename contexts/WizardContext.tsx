'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { PhaseStatus } from '@/lib/setup/phases';

interface WizardPreferences {
  installLocation: string;
  includeIntelIPP: boolean;
  includeFaust: boolean;
}

interface WizardContextType {
  currentPhase: number;
  setCurrentPhase: (phase: number) => void;
  completedPhases: number[];
  completePhase: (phase: number) => void;
  preferences: WizardPreferences;
  setPreferences: (prefs: Partial<WizardPreferences>) => void;
  phaseStatuses: Map<number, PhaseStatus>;
  setPhaseStatus: (phase: number, status: PhaseStatus) => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [preferences, setPreferencesState] = useState<WizardPreferences>({
    installLocation: 'C:\\HISE',
    includeIntelIPP: false,
    includeFaust: false,
  });
  const [phaseStatuses, setPhaseStatuses] = useState<Map<number, PhaseStatus>>(new Map());

  const completePhase = (phase: number) => {
    setCompletedPhases(prev => {
      if (!prev.includes(phase)) {
        return [...prev, phase];
      }
      return prev;
    });
  };

  const setPreferences = (prefs: Partial<WizardPreferences>) => {
    setPreferencesState(prev => ({ ...prev, ...prefs }));
  };

  const setPhaseStatus = (phase: number, status: PhaseStatus) => {
    setPhaseStatuses(prev => new Map(prev).set(phase, status));
  };

  return (
    <WizardContext.Provider
      value={{
        currentPhase,
        setCurrentPhase,
        completedPhases,
        completePhase,
        preferences,
        setPreferences,
        phaseStatuses,
        setPhaseStatus,
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
