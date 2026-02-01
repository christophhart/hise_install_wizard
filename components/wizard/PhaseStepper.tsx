'use client';

import { PHASES } from '@/lib/setup/phases';
import { PhaseStatus } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

interface PhaseStepperProps {
  currentPhase: number;
}

export default function PhaseStepper({ currentPhase }: PhaseStepperProps) {
  const { completedPhases } = useWizard();
  const activePhase = PHASES.find(p => p.id === currentPhase);

  const getStatus = (phaseId: number): PhaseStatus => {
    if (phaseId === currentPhase) return 'active';
    if (completedPhases.includes(phaseId)) return 'completed';
    return 'pending';
  };

  const progress = ((currentPhase + 1) / PHASES.length) * 100;

  return (
    <div className="mb-8 p-4 bg-surface border border-border" style={{ borderRadius: '3px' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-400">Phase {currentPhase}</div>
          <div className="text-lg font-semibold">{activePhase?.name}</div>
        </div>
        <div className="text-sm text-gray-400">
          {currentPhase + 1} / {PHASES.length}
        </div>
      </div>
      <div className="w-full h-2.5" style={{ backgroundColor: '#444', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          className="h-2.5 transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: '#90FFB1', borderRadius: '3px' }}
        ></div>
      </div>
      <div className="mt-2 text-sm text-gray-400">{activePhase?.description}</div>
    </div>
  );
}
