'use client';

import { useRouter } from 'next/navigation';
import PhaseStepper from '@/components/wizard/PhaseStepper';

export default function HomePage() {
  const router = useRouter();

   const handleStartSetup = () => {
     router.push('/setup/1');
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

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#90FFB1' }}>
              HISE Setup Wizard
            </h1>
            <p className="text-lg text-gray-400">
              Automated setup for your HISE development environment on Windows
            </p>
          </div>

           <div className="bg-surface p-8 mb-6 border border-border" style={{ borderRadius: '3px' }}>
            <h2 className="text-2xl font-semibold mb-4">What this wizard will do:</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Detect your system configuration</li>
              <li>Install and configure Git</li>
              <li>Extract required SDKs (ASIO, VST3)</li>
              <li>Initialize JUCE submodule on juce6 branch</li>
              <li>Compile HISE from source</li>
              <li>Configure your environment for HISE development</li>
            </ul>
          </div>

           <div className="flex gap-4 justify-center">
             <button
               onClick={handleStartSetup}
               className="px-8 py-4 text-lg font-semibold border border-border flex items-center gap-2"
               style={{
                 backgroundColor: '#90FFB1',
                 color: '#222',
                 borderRadius: '3px'
               }}
             >
               Start Setup
             </button>
           </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Estimated time: 15-30 minutes</p>
            <p className="mt-1">Requires Windows 7+ (64-bit) and Visual Studio 2026</p>
          </div>
        </div>
       </div>
     </div>
  );
}
