'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import CommandBlock from '@/components/wizard/CommandBlock';
import ErrorAssistant from '@/components/wizard/ErrorAssistant';
import { MOCK_COMMANDS } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase9Page() {
  const router = useRouter();
  const { setCurrentPhase, completePhase } = useWizard();
  const [stepFailed, setStepFailed] = useState(false);

  const phaseData = MOCK_COMMANDS.find(c => c.phase === 9);
  const command = phaseData?.command || '';
  const explanation = phaseData?.explanation || '';

  useEffect(() => {
    setCurrentPhase(9);
  }, [setCurrentPhase]);

  const handleSuccess = () => {
    completePhase(9);
    setTimeout(() => {
      router.push('/setup/10');
    }, 500);
  };

  const handleFailure = () => {
    setStepFailed(true);
  };

  const handleRetry = () => {
    setStepFailed(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <PhaseStepper currentPhase={9} />

        <div className="bg-surface p-8 rounded shadow-md border border-border">
          <h1 className="text-2xl font-bold mb-2">Phase 9: Add HISE to PATH</h1>
          <p className="text-gray-400 mb-6">
            Add HISE binary to system PATH.
          </p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">What we're doing:</h2>
            <p className="text-gray-300 mb-4">{explanation}</p>
          </div>

          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded">
            <h3 className="font-medium text-yellow-300 mb-2">⚠️ IMPORTANT</h3>
            <p className="text-gray-300">
              After adding HISE to PATH, you need to <strong>restart your terminal</strong> for changes to take effect. Close and reopen your terminal before testing.
            </p>
          </div>

          <CommandBlock command={command} />

          <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded">
            <h3 className="font-medium text-blue-300 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Copy command above using the "Copy" button</li>
              <li>Open your terminal (Command Prompt or PowerShell)</li>
              <li>Paste and run the command</li>
              <li>Close your terminal completely</li>
              <li>Reopen terminal</li>
              <li>Test by running: <code className="bg-gray-700 px-2 py-1 rounded">HISE --help</code></li>
              <li>Click "Success" or "Failure" based on the result</li>
            </ol>
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
