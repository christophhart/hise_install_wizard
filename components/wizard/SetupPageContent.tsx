'use client';

import React from 'react';
import PhaseStepper from './PhaseStepper';

interface SetupPageContentProps {
  phaseNumber: number;
  children: React.ReactNode;
}

export default function SetupPageContent({ phaseNumber, children }: SetupPageContentProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4">
        <PhaseStepper currentPhase={phaseNumber} />
      </div>

      <div className="flex-1 px-4 pb-4">
        <div className="bg-surface p-8 border border-border flex-1" style={{ borderRadius: '3px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
