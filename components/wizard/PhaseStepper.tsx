'use client';

import { Check } from 'lucide-react';

interface Phase {
  id: number;
  name: string;
}

const defaultPhases: Phase[] = [
  { id: 0, name: 'Setup' },
  { id: 1, name: 'Generate Script' },
];

const updatePhases: Phase[] = [
  { id: 0, name: 'Paste Info' },
  { id: 1, name: 'Check Updates' },
];

interface PhaseStepperProps {
  currentPhase: number;
  className?: string;
  mode?: 'setup' | 'update';
}

export default function PhaseStepper({ currentPhase, className = '', mode = 'setup' }: PhaseStepperProps) {
  const phases = mode === 'update' ? updatePhases : defaultPhases;
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {phases.map((phase, index) => (
        <div key={phase.id} className="flex items-center">
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                border-2 transition-colors duration-200
                ${currentPhase > phase.id
                  ? 'bg-success border-success text-white'
                  : currentPhase === phase.id
                    ? 'bg-accent border-accent text-background'
                    : 'bg-transparent border-border text-gray-400'
                }
              `}
            >
              {currentPhase > phase.id ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{phase.id + 1}</span>
              )}
            </div>
            <span 
              className={`
                mt-2 text-xs font-medium
                ${currentPhase >= phase.id ? 'text-white' : 'text-gray-500'}
              `}
            >
              {phase.name}
            </span>
          </div>
          
          {/* Connector line */}
          {index < phases.length - 1 && (
            <div 
              className={`
                w-24 sm:w-32 h-0.5 mx-4
                ${currentPhase > phase.id ? 'bg-success' : 'bg-border'}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}
