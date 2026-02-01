'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import CommandBlock from '@/components/wizard/CommandBlock';
import ErrorAssistant from '@/components/wizard/ErrorAssistant';
import { MOCK_COMMANDS } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase11Page() {
  const router = useRouter();
  const { setCurrentPhase, completePhase } = useWizard();
  const [stepFailed, setStepFailed] = useState(false);

  const phaseData = MOCK_COMMANDS.find(c => c.phase === 11);
  const command = phaseData?.command || '';
  const explanation = phaseData?.explanation || '';

  useEffect(() => {
    setCurrentPhase(11);
  }, [setCurrentPhase]);

  const handleSuccess = () => {
    completePhase(11);
    setTimeout(() => {
      router.push('/setup/12');
    }, 500);
  };

  const handleFailure = () => {
    setStepFailed(true);
  };

  const handleRetry = () => {
    setStepFailed(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <PhaseStepper currentPhase={11} />

        <div className="bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700">
          <h1 className="text-2xl font-bold mb-2">Phase 11: Compile Test Project</h1>
          <p className="text-gray-400 mb-6">
            Compile demo project to verify setup.
          </p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">What we're doing:</h2>
            <p className="text-gray-300 mb-4">{explanation}</p>
          </div>

          <CommandBlock command={command} />

          <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded">
            <h3 className="font-medium text-green-300 mb-2">Final Test</h3>
            <p className="text-gray-300">
              This is the final validation step. Successfully compiling the demo project confirms that your HISE development environment is fully configured and ready for use.
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded">
            <h3 className="font-medium text-blue-300 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Copy command above using the "Copy" button</li>
              <li>Open your terminal (Command Prompt or PowerShell)</li>
              <li>Paste and run the command</li>
              <li>HISE will load the demo project and export it</li>
              <li>Wait for compilation to complete</li>
              <li>Verify that no errors occurred during export</li>
              <li>Click "Success" or "Failure" based on the result</li>
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
