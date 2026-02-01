'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import CommandBlock from '@/components/wizard/CommandBlock';
import ErrorAssistant from '@/components/wizard/ErrorAssistant';
import { MOCK_COMMANDS } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase10Page() {
  const router = useRouter();
  const { setCurrentPhase, completePhase } = useWizard();
  const [stepFailed, setStepFailed] = useState(false);

  const phaseData = MOCK_COMMANDS.find(c => c.phase === 10);
  const command = phaseData?.command || '';
  const explanation = phaseData?.explanation || '';

  useEffect(() => {
    setCurrentPhase(10);
  }, [setCurrentPhase]);

  const handleSuccess = () => {
    completePhase(10);
    setTimeout(() => {
      router.push('/setup/11');
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

      <div className="flex-1 flex flex-col items-center w-full">
        <div className="p-4 w-full" style={{ maxWidth: '900px' }}>
          <PhaseStepper currentPhase={10} />
        </div>

        <div className="flex-1 px-4 pb-4 w-full" style={{ maxWidth: '900px' }}>
          <div className="bg-surface p-8 border border-border" style={{ borderRadius: "3px" }}>
          <h1 className="text-2xl font-bold mb-2">Phase 10: Verify Build Configuration</h1>
          <p className="text-gray-400 mb-6">
            Run HISE get_build_flags to verify build.
          </p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">What we're doing:</h2>
            <p className="text-gray-300 mb-4">{explanation}</p>
          </div>

          <CommandBlock command={command} />

          <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded">
            <h3 className="font-medium text-blue-300 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Copy command above using the "Copy" button</li>
              <li>Open your terminal (Command Prompt or PowerShell)</li>
              <li>Paste and run the command</li>
              <li>Review of output to verify build configuration:</li>
              <li className="ml-4">- Build Configuration should contain "Release"</li>
              <li className="ml-4">- Faust Support should match your Phase 0 selection</li>
              <li className="ml-4">- IPP Support should match your Phase 0 selection</li>
              <li>Click "Success" or "Failure" based on the result</li>
            </ol>
          </div>

           {!stepFailed ? (
             <div className="flex gap-4">
               <button
                 onClick={handleSuccess}
                 className="flex-1 px-6 py-3 bg-accent hover:bg-green-400 text-background font-semibold rounded border border-border flex items-center justify-center gap-2"
               >
                 <CheckCircle size={18} />
                 Success
               </button>
               <button
                 onClick={handleFailure}
                 className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded border border-border flex items-center justify-center gap-2"
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
