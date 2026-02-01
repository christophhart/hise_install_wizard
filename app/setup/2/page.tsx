'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, SkipForward } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import CommandBlock from '@/components/wizard/CommandBlock';
import ErrorAssistant from '@/components/wizard/ErrorAssistant';
import { MOCK_COMMANDS } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase2Page() {
  const router = useRouter();
  const { setCurrentPhase, completePhase } = useWizard();
  const [stepFailed, setStepFailed] = useState(false);

  const phaseData = MOCK_COMMANDS.find(c => c.phase === 2);
  const command = phaseData?.command || '';
  const explanation = phaseData?.explanation || '';

  useEffect(() => {
    setCurrentPhase(2);
  }, [setCurrentPhase]);

  const handleSuccess = () => {
    completePhase(2);
    setTimeout(() => {
      router.push('/setup/3');
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
      <div className="px-4 py-3 flex items-center" style={{ backgroundColor: '#050505' }}>
        <img
          src="/images/logo_new.png"
          alt="HISE Logo"
          className="h-8 w-auto"
        />
        <span className="ml-3 text-lg font-semibold">HISE Install Wizard</span>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4">
          <PhaseStepper currentPhase={2} />
        </div>

        <div className="flex-1 px-4 pb-4">
          <div className="bg-surface p-8 border border-border flex-1" style={{ borderRadius: "3px" }}>
            <h1 className="text-2xl font-bold mb-2">Phase 2: Git Setup</h1>
            <p className="mb-6" style={{ color: '#999' }}>
              Install Git, clone the HISE repository, and initialize the JUCE submodule.
            </p>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">What we're doing:</h2>
              <p className="mb-4" style={{ color: '#999' }}>{explanation}</p>
            </div>

            <div className="mb-6 p-4 border border-border" style={{ borderRadius: "3px", backgroundColor: '#111' }}>
              <h3 className="font-medium mb-2" style={{ color: '#90FFB1' }}>Instructions:</h3>
              <ol className="list-decimal list-inside space-y-1" style={{ color: '#999' }}>
                <li>Copy the command above using the "Copy" button</li>
                <li>Open your terminal (Command Prompt or PowerShell)</li>
                <li>Paste and run the command</li>
                <li>Wait for the clone and submodule initialization to complete</li>
                <li>Click "Success" or "Failure" based on the result</li>
              </ol>
            </div>

            <CommandBlock command={command} />

            {!stepFailed ? (
               <div className="flex gap-4">
                 <button
                   onClick={handleSuccess}
                   className="flex-1 px-6 py-3 font-semibold border border-border flex items-center justify-center gap-2"
                   style={{ backgroundColor: '#4E8E35', color: '#fff', borderRadius: '3px' }}
                 >
                   <CheckCircle size={18} />
                   Success
                 </button>
                 <button
                   onClick={handleFailure}
                   className="flex-1 px-6 py-3 font-semibold border border-border flex items-center justify-center gap-2"
                   style={{ backgroundColor: '#BB3434', color: '#fff', borderRadius: '3px' }}
                 >
                   <XCircle size={18} />
                   Failure
                 </button>
                 <button
                   onClick={() => router.push('/setup/3')}
                   className="flex-1 px-6 py-3 font-semibold border border-border flex items-center justify-center gap-2"
                   style={{ backgroundColor: '#333', color: '#999', borderRadius: '3px' }}
                 >
                   <SkipForward size={18} />
                   Skip
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
