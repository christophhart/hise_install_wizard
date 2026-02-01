'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import CommandBlock from '@/components/wizard/CommandBlock';
import ErrorAssistant from '@/components/wizard/ErrorAssistant';
import { MOCK_COMMANDS } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase7Page() {
  const router = useRouter();
  const { setCurrentPhase, completePhase, preferences } = useWizard();
  const [stepFailed, setStepFailed] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  const phaseData = MOCK_COMMANDS.find(c => c.phase === 7);
  const command = phaseData?.command || '';
  const explanation = phaseData?.explanation || '';

  useEffect(() => {
    setCurrentPhase(7);
    
    if (!preferences.includeFaust) {
      setIsSkipped(true);
    }
  }, [setCurrentPhase, preferences.includeFaust]);

  useEffect(() => {
    if (isSkipped) {
      const timer = setTimeout(() => {
        router.push('/setup/8');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSkipped, router]);

  const handleSuccess = () => {
    completePhase(7);
    setTimeout(() => {
      router.push('/setup/8');
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
      router.push('/setup/8');
    }, 500);
  };

  if (isSkipped) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <PhaseStepper currentPhase={7} />

          <div className="bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⊘</div>
              <h1 className="text-2xl font-bold text-gray-300 mb-4">Phase 7: Faust Installation</h1>
              <p className="text-gray-400 mb-8">
                Skipping - You chose not to install Faust in Phase 0.
              </p>
              <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded">
                Redirecting to next phase...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <PhaseStepper currentPhase={7} />

        <div className="bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700">
          <h1 className="text-2xl font-bold mb-2">Phase 7: Faust Installation</h1>
          <p className="text-gray-400 mb-6">
            Install Faust DSP compiler.
          </p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">What we're doing:</h2>
            <p className="text-gray-300 mb-4">{explanation}</p>
          </div>

          <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded">
            <h3 className="font-medium text-green-300 mb-2">Optional</h3>
            <p className="text-gray-300">
              Faust is a functional programming language for signal processing. It enables HISE to compile Faust scripts at runtime for dynamic DSP algorithms. You can skip this if you don't need Faust support.
            </p>
          </div>

          <CommandBlock command={command} />

          <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded">
            <h3 className="font-medium text-blue-300 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Copy command above using the "Copy" button</li>
              <li>Open your terminal (Command Prompt or PowerShell)</li>
              <li>Paste and run the command to download and run the Faust installer</li>
              <li>During installation, use the default path: C:\Program Files\Faust\</li>
              <li>Wait for installation to complete</li>
              <li>Return here and click "Success" or "Skip" if you prefer not to install Faust</li>
            </ol>
          </div>

          {!stepFailed ? (
            <div className="flex gap-4">
              <button
                onClick={handleSuccess}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded"
              >
                Success
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded"
              >
                Skip
              </button>
              <button
                onClick={handleFailure}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded"
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
