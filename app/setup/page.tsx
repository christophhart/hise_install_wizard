'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import { PHASES, PhaseStatus } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase0Page() {
  const router = useRouter();
  const { setCurrentPhase, preferences, setPreferences } = useWizard();
  const [installLocation, setInstallLocation] = useState(preferences.installLocation);
  const [includeIntelIPP, setIncludeIntelIPP] = useState(preferences.includeIntelIPP);
  const [includeFaust, setIncludeFaust] = useState(preferences.includeFaust);

  useEffect(() => {
    setCurrentPhase(0);
  }, [setCurrentPhase]);

  const mockPhaseStatuses: PhaseStatus[] = [
    'pending',
    'pending',
    'pending',
    'pending',
    'pending',
    'pending',
    'pending',
    'pending',
    'pending',
    'pending',
    'pending',
  ];

  const handleBeginSetup = () => {
    setPreferences({ installLocation, includeIntelIPP, includeFaust });
    router.push('/setup/1');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <PhaseStepper currentPhase={0} />

        <div className="bg-surface p-8 rounded shadow-md border border-border">
          <h1 className="text-2xl font-bold mb-2">Phase 0: System Detection & Preferences</h1>
          <p className="text-gray-400 mb-6">
            We've detected your system state. Please review and configure your preferences.
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

          <h2 className="text-xl font-semibold mb-4">Setup Preferences</h2>
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
            onClick={handleBeginSetup}
            className="w-full px-6 py-3 bg-accent hover:bg-green-400 text-background font-semibold rounded border border-border"
          >
            Begin Setup
          </button>
        </div>
      </div>
    </div>
  );
}
