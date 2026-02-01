'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import { PHASES, PhaseStatus } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase0Page() {
  const router = useRouter();
  const { setCurrentPhase } = useWizard();

  useEffect(() => {
    setCurrentPhase(0);
  }, [setCurrentPhase]);

  const mockDetectedComponents = {
    visualStudio: true,
    git: false,
    intelIPP: false,
    faust: false,
    hiseRepository: false,
    sdks: false,
    juceSubmodule: false,
  };

  const handleContinue = () => {
    router.push('/setup/1');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <PhaseStepper currentPhase={0} />

        <div className="bg-surface p-8 rounded shadow-md border border-border">
          <h1 className="text-2xl font-bold mb-2">Phase 0: System State Detection</h1>
          <p className="text-gray-400 mb-6">
            We've detected the current state of your system. Review which components are already installed.
          </p>

          <h2 className="text-xl font-semibold mb-4">Detected System Components</h2>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-900/30 border border-accent rounded">
              <div className="font-medium">Visual Studio 2026</div>
              <div className="text-accent">Installed</div>
            </div>
            <div className="p-4 bg-surface border border-border rounded">
              <div className="font-medium">Git</div>
              <div className="text-red-400">Not installed</div>
            </div>
            <div className="p-4 bg-surface border border-border rounded">
              <div className="font-medium">Intel IPP</div>
              <div className="text-red-400">Not installed</div>
            </div>
            <div className="p-4 bg-surface border border-border rounded">
              <div className="font-medium">Faust</div>
              <div className="text-red-400">Not installed</div>
            </div>
            <div className="p-4 bg-surface border border-border rounded">
              <div className="font-medium">HISE Repository</div>
              <div className="text-red-400">Not found</div>
            </div>
            <div className="p-4 bg-surface border border-border rounded">
              <div className="font-medium">SDKs</div>
              <div className="text-red-400">Not extracted</div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-accent hover:bg-green-400 text-background font-semibold rounded border border-border"
          >
            Continue to Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
