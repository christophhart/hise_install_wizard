'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import CommandBlock from '@/components/wizard/CommandBlock';
import ErrorAssistant from '@/components/wizard/ErrorAssistant';
import { MOCK_COMMANDS } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase8Page() {
  const router = useRouter();
  const { setCurrentPhase, completePhase } = useWizard();
  const [stepFailed, setStepFailed] = useState(false);

  const phaseData = MOCK_COMMANDS.find(c => c.phase === 8);
  const command = phaseData?.command || '';
  const explanation = phaseData?.explanation || '';

  useEffect(() => {
    setCurrentPhase(8);
  }, [setCurrentPhase]);

  const handleSuccess = () => {
    completePhase(8);
    setTimeout(() => {
      router.push('/setup/9');
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
        <PhaseStepper currentPhase={8} />

        <div className="bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700">
          <h1 className="text-2xl font-bold mb-2">Phase 8: HISE Compilation</h1>
          <p className="text-gray-400 mb-6">
            Compile HISE standalone application.
          </p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">What we're doing:</h2>
            <p className="text-gray-300 mb-4">{explanation}</p>
          </div>

          <div className="mb-6 p-4 bg-orange-900/30 border border-orange-700 rounded">
            <h3 className="font-medium text-orange-300 mb-2">⚠️ LONG RUNNING PROCESS</h3>
            <p className="text-gray-300 mb-2">
              <strong>This compilation will take 5-15 minutes</strong> depending on your system.
            </p>
            <p className="text-gray-300">
              Please be patient and do not interrupt the build process. The compiler will show progress messages.
            </p>
          </div>

          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded">
            <h3 className="font-medium text-yellow-300 mb-2">⚠️ IMPORTANT</h3>
            <p className="text-gray-300">
              After compilation completes, verify that HISE.exe is larger than 10MB. Corrupted builds from linker failures are typically around 2MB.
            </p>
          </div>

          <CommandBlock command={command} />

          <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded">
            <h3 className="font-medium text-blue-300 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Copy command above using the "Copy" button</li>
              <li>Open your terminal (Command Prompt or PowerShell)</li>
              <li>Paste and run the command</li>
              <li>Wait for Projucer to generate project files (fast)</li>
              <li>Wait for MSBuild to compile HISE (5-15 minutes)</li>
              <li>Check the final output for "Build succeeded" message</li>
              <li>Verify HISE.exe size is &gt; 10MB</li>
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
