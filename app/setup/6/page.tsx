'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import CommandBlock from '@/components/wizard/CommandBlock';
import ErrorAssistant from '@/components/wizard/ErrorAssistant';
import { MOCK_COMMANDS } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase6Page() {
  const router = useRouter();
  const { setCurrentPhase, completePhase, preferences } = useWizard();
  const [stepFailed, setStepFailed] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  const phaseData = MOCK_COMMANDS.find(c => c.phase === 6);
  const command = phaseData?.command || '';
  const explanation = phaseData?.explanation || '';

  useEffect(() => {
    setCurrentPhase(6);
    
    if (!preferences.includeIntelIPP) {
      setIsSkipped(true);
    }
  }, [setCurrentPhase, preferences.includeIntelIPP]);

  useEffect(() => {
    if (isSkipped) {
      const timer = setTimeout(() => {
        router.push('/setup/7');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSkipped, router]);

  const handleSuccess = () => {
    completePhase(6);
    setTimeout(() => {
      router.push('/setup/7');
    }, 500);
  };

  const handleFailure = () => {
    setStepFailed(true);
  };

  const handleRetry = () => {
    setStepFailed(false);
  };

  const handleSkip = () => {
    setTimeout(() => {
      router.push('/setup/7');
    }, 500);
  };

  if (isSkipped) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <PhaseStepper currentPhase={6} />

          <div className="bg-surface p-8 rounded shadow-md border border-border">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⊘</div>
              <h1 className="text-2xl font-bold text-gray-300 mb-4">Phase 6: Intel IPP Installation</h1>
              <p className="text-gray-400 mb-8">
                Skipping - You chose not to install Intel IPP in Phase 0.
              </p>
              <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded border border-border">
                Redirecting to next phase...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <PhaseStepper currentPhase={6} />

        <div className="bg-surface p-8 rounded shadow-md border border-border">
          <h1 className="text-2xl font-bold mb-2">Phase 6: Intel IPP Installation</h1>
          <p className="text-gray-400 mb-6">
            Install Intel IPP oneAPI for performance optimization.
          </p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">What we're doing:</h2>
            <p className="text-gray-300 mb-4">{explanation}</p>
          </div>

          <div className="mb-6 p-4 bg-green-900/30 border border-accent rounded">
            <h3 className="font-medium text-accent mb-2">Optional</h3>
            <p className="text-gray-300">
              Intel IPP provides optimized math functions that can significantly improve HISE performance. You can skip this phase if you prefer to build without IPP.
            </p>
          </div>

          <CommandBlock command={command} />

          <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded">
            <h3 className="font-medium text-blue-300 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Download Intel IPP from link below</li>
              <li>Run the installer with Visual Studio integration enabled</li>
              <li>Wait for installation to complete (~5-10 minutes)</li>
              <li>Return here and click "Success" or "Skip" if you prefer not to install IPP</li>
            </ol>
            <div className="mt-4">
              <a
                href="https://registrationcenter-download.intel.com/akdlm/IRC_NAS/9c651894-4548-491c-b69f-49e84b530c1d/intel-ipp-2022.3.1.10_offline.exe"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Download Intel IPP oneAPI 2022.3.1.10
              </a>
            </div>
          </div>

          {!stepFailed ? (
            <div className="flex gap-4">
              <button
                onClick={handleSuccess}
                className="flex-1 px-6 py-3 bg-accent hover:bg-green-400 text-background font-semibold rounded border border-border"
              >
                Success
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 px-6 py-3 bg-surface hover:bg-gray-700 text-white font-semibold rounded border border-border"
              >
                Skip
              </button>
              <button
                onClick={handleFailure}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded border border-border"
              >
                Failure
              </button>
            </div>
          ) : (
            <ErrorAssistant onRetry={handleRetry} />
          )}
        </div>
      </div>
    </div>
  );
}
