'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, SkipForward } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import CommandBlock from '@/components/wizard/CommandBlock';
import ErrorAssistant from '@/components/wizard/ErrorAssistant';
import { MOCK_COMMANDS } from '@/lib/setup/phases';
import { useWizard } from '@/contexts/WizardContext';

export default function Phase3Page() {
  const router = useRouter();
  const { setCurrentPhase, completePhase } = useWizard();
  const [stepFailed, setStepFailed] = useState(false);

  const phaseData = MOCK_COMMANDS.find(c => c.phase === 3);
  const command = phaseData?.command || '';
  const explanation = phaseData?.explanation || '';

  useEffect(() => {
    setCurrentPhase(3);
  }, [setCurrentPhase]);

  const handleSuccess = () => {
    completePhase(3);
    setTimeout(() => {
      router.push('/setup/4');
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
          <PhaseStepper currentPhase={3} />
        </div>

        <div className="flex-1 px-4 pb-4">
          <div className="bg-surface p-8 rounded border border-border" style={{ borderRadius: '3px' }}>
          <h1 className="text-2xl font-bold mb-2">Phase 3: Visual Studio 2026 Installation</h1>
          <p className="text-gray-400 mb-6">
            Install Visual Studio 2026 Community with C++ workload.
          </p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">What we're doing:</h2>
            <p className="text-gray-300 mb-4">{explanation}</p>
          </div>

          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded">
            <h3 className="font-medium text-yellow-300 mb-2">IMPORTANT</h3>
            <p className="text-gray-300">
              Visual Studio 2026 is <strong>REQUIRED</strong> and cannot be skipped. 
              Please download and install it manually before proceeding.
            </p>
          </div>

          <CommandBlock command={command} />

          <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded">
            <h3 className="font-medium text-blue-300 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Download Visual Studio 2026 Community from the link below</li>
              <li>Run the installer and select "Desktop development with C++" workload</li>
              <li>Complete the installation (this may take 10-30 minutes)</li>
              <li>Return here and click "Success" once installation is complete</li>
            </ol>
            <div className="mt-4">
              <a
                href="https://visualstudio.microsoft.com/downloads/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Download Visual Studio 2026 Community
              </a>
            </div>
          </div>

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
                 onClick={() => router.push('/setup/4')}
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
