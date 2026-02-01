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
    <div className="mb-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-400">Phase {currentPhase}</div>
          <div className="text-lg font-semibold">{activePhase?.name}</div>
        </div>
        <div className="text-sm text-gray-400">
          {currentPhase + 1} / {PHASES.length}
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-2 text-sm text-gray-400">{activePhase?.description}</div>
    </div>
  );
}
