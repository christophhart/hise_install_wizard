'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase12Page() {
  const router = useRouter();
  const { setCurrentPhase, completedPhases, preferences } = useWizard();

  useEffect(() => {
    setCurrentPhase(12);
  }, [setCurrentPhase]);

  const handleRestart = () => {
    router.push('/');
  };

  const getPhaseStatus = (phaseId: number): { completed: boolean; label: string } => {
    const phase = completedPhases.includes(phaseId);
    return {
      completed: phase,
      label: phase ? 'Completed' : 'Skipped'
    };
  };

  const ippStatus = getPhaseStatus(6);
  const faustStatus = getPhaseStatus(7);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <PhaseStepper currentPhase={12} />

        <div className="bg-surface p-8 rounded shadow-md border border-border">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-accent mb-2">Setup Complete!</h1>
            <p className="text-gray-400">
              Your HISE development environment has been configured successfully.
            </p>
          </div>

          <div className="bg-gray-700 border border-border rounded p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Installation Summary</h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✓</span>
                <div>
                  <div className="font-medium">Platform Detection</div>
                  <div className="text-sm text-gray-400">Phase 1</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✓</span>
                <div>
                  <div className="font-medium">Git Setup</div>
                  <div className="text-sm text-gray-400">Phase 2 - Repository cloned and JUCE submodule initialized</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✓</span>
                <div>
                  <div className="font-medium">Visual Studio 2026 Installation</div>
                  <div className="text-sm text-gray-400">Phase 3 - C++ compiler and build tools</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✓</span>
                <div>
                  <div className="font-medium">JUCE Submodule Verification</div>
                  <div className="text-sm text-gray-400">Phase 4 - JUCE on juce6 branch</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✓</span>
                <div>
                  <div className="font-medium">SDK Installation</div>
                  <div className="text-sm text-gray-400">Phase 5 - ASIO SDK 2.3 and VST3 SDK</div>
                </div>
              </div>

              <div className={`flex items-center gap-3 ${ippStatus.completed ? '' : 'opacity-50'}`}>
                <span className={`${ippStatus.completed ? 'text-accent' : 'text-gray-500'} text-xl`}>
                  {ippStatus.completed ? '✓' : '○'}
                </span>
                <div>
                  <div className="font-medium">Intel IPP Installation</div>
                  <div className="text-sm text-gray-400">Phase 6 - {ippStatus.label} (performance optimization)</div>
                </div>
              </div>

              <div className={`flex items-center gap-3 ${faustStatus.completed ? '' : 'opacity-50'}`}>
                <span className={`${faustStatus.completed ? 'text-accent' : 'text-gray-500'} text-xl`}>
                  {faustStatus.completed ? '✓' : '○'}
                </span>
                <div>
                  <div className="font-medium">Faust Installation</div>
                  <div className="text-sm text-gray-400">Phase 7 - {faustStatus.label} (DSP compiler)</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✓</span>
                <div>
                  <div className="font-medium">HISE Compilation</div>
                  <div className="text-sm text-gray-400">Phase 8 - Standalone application compiled</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✓</span>
                <div>
                  <div className="font-medium">PATH Configuration</div>
                  <div className="text-sm text-gray-400">Phase 9 - HISE added to system PATH</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✓</span>
                <div>
                  <div className="font-medium">Build Configuration Verified</div>
                  <div className="text-sm text-gray-400">Phase 10 - Build flags validated</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✓</span>
                <div>
                  <div className="font-medium">Test Project Compiled</div>
                  <div className="text-sm text-gray-400">Phase 11 - Demo project verified</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-900/30 border border-accent rounded p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
            <div className="space-y-3 text-gray-300">
              <p>• HISE is now available from your terminal</p>
              <p>• Run <code className="bg-gray-700 px-2 py-1 rounded">HISE --help</code> to see available commands</p>
              <p>• Create your first HISE project using HISE application</p>
              <p>• Visit HISE documentation: <a href="https://docs.hise.dev" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://docs.hise.dev</a></p>
              <p>• Join HISE forum for community support: <a href="https://forum.hise.audio" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://forum.hise.audio</a></p>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-700 rounded p-6 mb-6">
            <h3 className="font-semibold mb-2">Your Configuration</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>
                <span className="font-medium">Install Location:</span>
                <p className="ml-2">{preferences.installLocation}</p>
              </div>
              <div>
                <span className="font-medium">Intel IPP:</span>
                <p className="ml-2">{preferences.includeIntelIPP ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div>
                <span className="font-medium">Faust Support:</span>
                <p className="ml-2">{preferences.includeFaust ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-accent hover:bg-green-400 text-background font-semibold rounded border border-border"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
