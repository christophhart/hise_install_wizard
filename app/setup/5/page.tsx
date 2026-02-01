'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import CommandBlock from '@/components/wizard/CommandBlock';
import ErrorAssistant from '@/components/wizard/ErrorAssistant';
import { MOCK_COMMANDS } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase5Page() {
  const router = useRouter();
  const { setCurrentPhase, completePhase } = useWizard();
  const [stepFailed, setStepFailed] = useState(false);

  const phaseData = MOCK_COMMANDS.find(c => c.phase === 5);
  const command = phaseData?.command || '';
  const explanation = phaseData?.explanation || '';

  useEffect(() => {
    setCurrentPhase(5);
  }, [setCurrentPhase]);

  const handleSuccess = () => {
    completePhase(5);
    setTimeout(() => {
      router.push('/setup/6');
    }, 500);
  };

  const handleFailure = () => {
    setStepFailed(true);
  };

  const handleRetry = () => {
    setStepFailed(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="bg-surface px-4 py-3 flex items-center border-b border-border" style={{ backgroundColor: '#333', borderColor: '#444' }}>
        <img
          src="/images/logo_new.png"
          alt="HISE Logo"
          className="h-8 w-auto"
        />
        <span className="ml-3 text-lg font-semibold">HISE Install Wizard</span>
      </div>

      <div className="flex-1 flex flex-col items-center w-full">
        <div className="p-4 w-full" style={{ maxWidth: '900px' }}>
          <PhaseStepper currentPhase={5} />
        </div>

        <div className="flex-1 px-4 pb-4 w-full" style={{ maxWidth: '900px' }}>
          <div className="bg-surface p-8 border border-border" style={{ backgroundColor: '#333', borderColor: '#444', borderRadius: '3px' }}>
            <h1 className="text-2xl font-bold mb-2">Phase 5: SDK Installation</h1>
            <p className="mb-6" style={{ color: '#999' }}>
              Extract ASIO SDK 2.3 and VST3 SDK.
            </p>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">What we're doing:</h2>
              <p className="mb-4" style={{ color: '#999' }}>{explanation}</p>
            </div>

            <CommandBlock command={command} />

            <div className="mb-6 p-4 border border-border" style={{ backgroundColor: '#111', borderColor: '#444', borderRadius: '3px' }}>
              <h3 className="font-medium mb-2" style={{ color: '#90FFB1' }}>Instructions:</h3>
              <ol className="list-decimal list-inside space-y-1" style={{ color: '#999' }}>
                <li>Copy command above using the "Copy" button</li>
                <li>Open your terminal (Command Prompt or PowerShell)</li>
                <li>Paste and run the command</li>
                <li>Verify that tools/SDK/ASIOSDK2.3/ and tools/SDK/VST3 SDK/ directories exist</li>
                <li>Click "Success" or "Failure" based on the result</li>
              </ol>
            </div>

            {!stepFailed ? (
              <div className="flex gap-4">
                <button
                  onClick={handleSuccess}
                  className="flex-1 px-6 py-3 font-semibold rounded border border-border flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#4E8E35', color: '#fff', borderColor: '#444' }}
                >
                  <CheckCircle size={18} />
                  Success
                </button>
                <button
                  onClick={handleFailure}
                  className="flex-1 px-6 py-3 font-semibold rounded border border-border flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#BB3434', color: '#fff', borderColor: '#444' }}
                >
                  <XCircle size={18} />
                  Failure
                </button>
              </div>
            ) : (
              <ErrorAssistant onRetry={handleRetry} />
            )}
          </div>
        </div>
       </div>
     </div>
   );
}
