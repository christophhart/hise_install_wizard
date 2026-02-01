'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import CommandBlock from '@/components/wizard/CommandBlock';
import ErrorAssistant from '@/components/wizard/ErrorAssistant';
import { MOCK_COMMANDS } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase2Page() {
  const { setCurrentPhase, completePhase } = useWizard();
  const [stepFailed, setStepFailed] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const phaseData = MOCK_COMMANDS.find(c => c.phase === 2);
  const command = phaseData?.command || '';
  const explanation = phaseData?.explanation || '';

  useEffect(() => {
    setCurrentPhase(2);
  }, [setCurrentPhase]);

  const handleSuccess = () => {
    completePhase(2);
    setSetupComplete(true);
  };

  const handleFailure = () => {
    setStepFailed(true);
  };

  const handleRetry = () => {
    setStepFailed(false);
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 p-8 rounded-lg shadow-md text-center border border-gray-700">
            <div className="mb-6">
              <div className="text-6xl mb-4">✓</div>
              <h1 className="text-3xl font-bold text-green-400 mb-4">Setup Complete!</h1>
            </div>

            <p className="text-lg text-gray-300 mb-6">
              Your HISE development environment has been configured successfully.
            </p>

            <div className="bg-green-900/30 border border-green-700 rounded p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
              <div className="text-left space-y-2 text-gray-300">
                <p>• HISE is now available from your terminal</p>
                <p>• Run <code className="bg-gray-700 px-2 py-1 rounded">HISE --help</code> to see available commands</p>
                <p>• Create your first HISE project</p>
                <p>• Visit the HISE documentation: <a href="https://docs.hise.dev" className="text-blue-400 hover:underline">https://docs.hise.dev</a></p>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-700 rounded p-6">
              <h3 className="font-semibold mb-2">Note</h3>
              <p className="text-gray-300">
                This is the MVP demo. In the full version, this will complete all 10 phases of the setup process.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <PhaseStepper currentPhase={2} />

        <div className="bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700">
          <h1 className="text-2xl font-bold mb-2">Phase 2: Git Setup</h1>
          <p className="text-gray-400 mb-6">
            Install Git, clone the HISE repository, and initialize the JUCE submodule.
          </p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">What we're doing:</h2>
            <p className="text-gray-300 mb-4">{explanation}</p>
          </div>

          <CommandBlock command={command} />

          <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded">
            <h3 className="font-medium text-blue-300 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Copy the command above using the "Copy" button</li>
              <li>Open your terminal (Command Prompt or PowerShell)</li>
              <li>Paste and run the command</li>
              <li>Wait for the clone and submodule initialization to complete</li>
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
