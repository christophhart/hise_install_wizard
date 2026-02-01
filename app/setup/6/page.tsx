'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, SkipForward } from 'lucide-react';
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
              <PhaseStepper currentPhase={6} />
            </div>

            <div className="flex-1 px-4 pb-4 w-full" style={{ maxWidth: '900px' }}>
              <div className="bg-surface p-8 border border-border" style={{ backgroundColor: '#333', borderColor: '#444', borderRadius: '3px' }}>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⊘</div>
                  <h1 className="text-2xl font-bold mb-4" style={{ color: '#999' }}>Phase 6: Intel IPP Installation</h1>
                  <p className="mb-8" style={{ color: '#999' }}>
                    Skipping - You chose not to install Intel IPP in Phase 0.
                  </p>
                  <div className="inline-block px-4 py-2 rounded border border-border" style={{ backgroundColor: '#333', color: '#999', borderColor: '#444' }}>
                    Redirecting to next phase...
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface p-4 flex gap-4 justify-center border-t border-border" style={{ backgroundColor: '#333', borderColor: '#444', borderTopLeftRadius: "3px", borderTopRightRadius: "3px" }}>
            <button
              onClick={() => router.push('/setup/7')}
              className="px-6 py-3 font-semibold rounded border border-border flex items-center gap-2"
              style={{ backgroundColor: '#333', color: '#999', borderColor: '#444' }}
            >
              Skip This Step
            </button>
          </div>
        </div>
      );
    }

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
            <PhaseStepper currentPhase={6} />
          </div>

          <div className="flex-1 px-4 pb-4 w-full" style={{ maxWidth: '900px' }}>
            <div className="bg-surface p-8 border border-border" style={{ backgroundColor: '#333', borderColor: '#444', borderRadius: '3px' }}>
              <h1 className="text-2xl font-bold mb-2">Phase 6: Intel IPP Installation</h1>
              <p className="mb-6" style={{ color: '#999' }}>
                Install Intel IPP oneAPI for performance optimization.
              </p>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">What we're doing:</h2>
                <p className="mb-4" style={{ color: '#999' }}>{explanation}</p>
              </div>

              <div className="mb-6 p-4 border border-border" style={{ backgroundColor: '#111', borderColor: '#444', borderRadius: '3px' }}>
                <h3 className="font-medium mb-2" style={{ color: '#90FFB1' }}>Optional</h3>
                <p style={{ color: '#999' }}>
                  Intel IPP provides optimized math functions that can significantly improve HISE performance. You can skip this phase if you prefer to build without IPP.
                </p>
              </div>

              <CommandBlock command={command} />

              <div className="mb-6 p-4 border border-border" style={{ backgroundColor: '#111', borderColor: '#444', borderRadius: '3px' }}>
                <h3 className="font-medium mb-2" style={{ color: '#90FFB1' }}>Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1" style={{ color: '#999' }}>
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
                    style={{ color: '#90FFB1' }}
                  >
                    Download Intel IPP oneAPI 2022.3.1.10
                  </a>
                </div>
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
                    onClick={handleSkip}
                    className="flex-1 px-6 py-3 font-semibold rounded border border-border flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#333', color: '#999', borderColor: '#444' }}
                  >
                    <SkipForward size={18} />
                    Skip
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

        <div className="bg-surface p-4 flex gap-4 justify-center border-t border-border" style={{ backgroundColor: '#333', borderColor: '#444', borderTopLeftRadius: "3px", borderTopRightRadius: "3px" }}>
          <button
            onClick={() => router.push('/setup/7')}
            className="px-6 py-3 font-semibold rounded border border-border flex items-center gap-2"
            style={{ backgroundColor: '#333', color: '#999', borderColor: '#444' }}
          >
            Skip This Step
          </button>
        </div>
      </div>
    );
}
