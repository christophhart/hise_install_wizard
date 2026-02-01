'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleStartSetup = () => {
    router.push('/setup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">HISE Setup Wizard</h1>
          <p className="text-lg text-gray-400">
            Automated setup for your HISE development environment on Windows
          </p>
        </div>

        <div className="bg-surface p-8 rounded shadow-md mb-6 border border-border">
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

        <div className="text-center">
          <button
            onClick={handleStartSetup}
            className="px-8 py-4 bg-accent hover:bg-green-400 text-background text-lg font-semibold rounded border border-border"
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
  );
}
