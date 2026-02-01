'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import { PHASES, PhaseStatus } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase1Page() {
  const router = useRouter();
  const { setCurrentPhase, preferences, setPreferences } = useWizard();
  const [installLocation, setInstallLocation] = useState(preferences.installLocation);
  const [includeIntelIPP, setIncludeIntelIPP] = useState(preferences.includeIntelIPP);
  const [includeFaust, setIncludeFaust] = useState(preferences.includeFaust);

  useEffect(() => {
    setCurrentPhase(1);
  }, [setCurrentPhase]);

  const handleContinue = () => {
    setPreferences({ installLocation, includeIntelIPP, includeFaust });
    router.push('/setup/2');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <PhaseStepper currentPhase={1} />

        <div className="bg-surface p-8 rounded shadow-md border border-border">
          <h1 className="text-2xl font-bold mb-2">Phase 1: User Configuration</h1>
          <p className="text-gray-400 mb-6">
            Configure your HISE installation preferences and optional components.
          </p>

          <h2 className="text-xl font-semibold mb-4">Installation Settings</h2>
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="installLocation" className="block font-medium mb-2">
                Installation Location
              </label>
              <input
                id="installLocation"
                type="text"
                value={installLocation}
                onChange={(e) => setInstallLocation(e.target.value)}
                className="w-full p-3 border border-border rounded bg-gray-700 text-gray-100 placeholder-gray-400"
                placeholder="e.g., C:\HISE"
              />
              <p className="text-sm text-gray-500 mt-1">
                Default: C:\HISE
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Optional Components</h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <input
                id="includeIntelIPP"
                type="checkbox"
                checked={includeIntelIPP}
                onChange={(e) => setIncludeIntelIPP(e.target.checked)}
                className="w-5 h-5 accent-accent"
              />
              <div>
                <label htmlFor="includeIntelIPP" className="font-medium">
                  Include Intel IPP
                </label>
                <p className="text-sm text-gray-500">
                  Performance optimization library (optional but recommended)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="includeFaust"
                type="checkbox"
                checked={includeFaust}
                onChange={(e) => setIncludeFaust(e.target.checked)}
                className="w-5 h-5 accent-accent"
              />
              <div>
                <label htmlFor="includeFaust" className="font-medium">
                  Include Faust
                </label>
                <p className="text-sm text-gray-500">
                  DSP programming language support (optional)
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-accent hover:bg-green-400 text-background font-semibold rounded border border-border"
          >
            Continue to Next Step
          </button>
        </div>
      </div>
    </div>
  );
}
