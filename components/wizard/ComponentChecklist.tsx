'use client';

import { Platform, DetectedComponents } from '@/types/wizard';
import Checkbox from '@/components/ui/Checkbox';
import CodeBlock from '@/components/ui/CodeBlock';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ComponentChecklistProps {
  platform: Exclude<Platform, null>;
  components: DetectedComponents;
  onChange: (key: keyof DetectedComponents, value: boolean) => void;
}

interface ComponentInfo {
  key: keyof DetectedComponents;
  label: string;
  description: string;
  verifyCommand: Record<Exclude<Platform, null>, string>;
  successExample: Record<Exclude<Platform, null>, string>;
  platforms: Exclude<Platform, null>[];
}

const componentInfoList: ComponentInfo[] = [
  {
    key: 'git',
    label: 'Git',
    description: 'Version control system',
    verifyCommand: {
      windows: 'git --version',
      macos: 'git --version',
      linux: 'git --version',
    },
    successExample: {
      windows: 'git version 2.43.0.windows.1',
      macos: 'git version 2.39.2 (Apple Git-143)',
      linux: 'git version 2.34.1',
    },
    platforms: ['windows', 'macos', 'linux'],
  },
  {
    key: 'compiler',
    label: 'C++ Compiler',
    description: 'Visual Studio 2022 (Windows), Xcode (macOS), or GCC (Linux)',
    verifyCommand: {
      windows: 'cl',
      macos: 'xcodebuild -version',
      linux: 'gcc --version',
    },
    successExample: {
      windows: 'Microsoft (R) C/C++ Optimizing Compiler Version 19.38.33130 for x64',
      macos: 'Xcode 15.0\nBuild version 15A240d',
      linux: 'gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0',
    },
    platforms: ['windows', 'macos', 'linux'],
  },
  {
    key: 'hiseRepo',
    label: 'HISE Repository',
    description: 'HISE source code already cloned',
    verifyCommand: {
      windows: 'cd C:\\HISE && dir /b .git',
      macos: 'cd ~/HISE && ls .git',
      linux: 'cd ~/HISE && ls .git',
    },
    successExample: {
      windows: 'config\nHEAD\nhooks\nobjects\nrefs',
      macos: 'HEAD    config    hooks    objects    refs',
      linux: 'HEAD  config  hooks  objects  refs',
    },
    platforms: ['windows', 'macos', 'linux'],
  },
  {
    key: 'juce',
    label: 'JUCE Submodule',
    description: 'JUCE framework initialized on juce6 branch',
    verifyCommand: {
      windows: 'cd C:\\HISE\\JUCE && git branch --show-current',
      macos: 'cd ~/HISE/JUCE && git branch --show-current',
      linux: 'cd ~/HISE/JUCE && git branch --show-current',
    },
    successExample: {
      windows: 'juce6',
      macos: 'juce6',
      linux: 'juce6',
    },
    platforms: ['windows', 'macos', 'linux'],
  },
  {
    key: 'sdks',
    label: 'SDKs Extracted',
    description: 'ASIO and VST3 SDKs in tools/SDK/',
    verifyCommand: {
      windows: 'dir C:\\HISE\\tools\\SDK',
      macos: 'ls ~/HISE/tools/SDK',
      linux: 'ls ~/HISE/tools/SDK',
    },
    successExample: {
      windows: 'ASIOSDK2.3\nVST3 SDK',
      macos: 'ASIOSDK2.3    VST3 SDK',
      linux: 'ASIOSDK2.3  VST3 SDK',
    },
    platforms: ['windows', 'macos', 'linux'],
  },
  {
    key: 'faust',
    label: 'Faust',
    description: 'Faust DSP compiler (optional)',
    verifyCommand: {
      windows: 'faust --version',
      macos: 'faust --version',
      linux: 'faust --version',
    },
    successExample: {
      windows: 'FAUST Version 2.54.9\nEmbedded backends: ...',
      macos: 'FAUST Version 2.54.9\nEmbedded backends: ...',
      linux: 'FAUST Version 2.54.9\nEmbedded backends: ...',
    },
    platforms: ['windows', 'macos', 'linux'],
  },
  {
    key: 'intelIPP',
    label: 'Intel IPP',
    description: 'Intel Performance Primitives (optional, Windows only)',
    verifyCommand: {
      windows: 'dir "C:\\Program Files (x86)\\Intel\\oneAPI\\ipp\\latest"',
      macos: '',
      linux: '',
    },
    successExample: {
      windows: 'include\nlib\nredist',
      macos: '',
      linux: '',
    },
    platforms: ['windows'],
  },
];

export default function ComponentChecklist({ 
  platform, 
  components, 
  onChange 
}: ComponentChecklistProps) {
  const [showVerifyCommands, setShowVerifyCommands] = useState(false);
  
  // Filter components for current platform
  const filteredComponents = componentInfoList.filter(
    (c) => c.platforms.includes(platform)
  );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          What do you already have installed?
        </label>
        <button
          type="button"
          onClick={() => setShowVerifyCommands(!showVerifyCommands)}
          className="text-xs text-accent hover:underline flex items-center gap-1"
        >
          {showVerifyCommands ? (
            <>Hide verification commands <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Show verification commands <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      </div>
      
      <div className="space-y-3">
        {filteredComponents.map((component) => (
          <div key={component.key} className="space-y-2">
            <Checkbox
              label={component.label}
              description={component.description}
              checked={components[component.key]}
              onChange={(e) => onChange(component.key, e.target.checked)}
            />
            {showVerifyCommands && component.verifyCommand[platform] && (
              <div className="ml-8 space-y-2">
                {/* Verification command */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Run this command:</p>
                  <CodeBlock 
                    code={component.verifyCommand[platform]} 
                    className="text-xs"
                  />
                </div>
                
                {/* Success example */}
                {component.successExample[platform] && (
                  <div className="bg-success/5 border border-success/20 rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-3 h-3 text-success" />
                      <p className="text-xs text-success font-medium">Success looks like:</p>
                    </div>
                    <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                      {component.successExample[platform]}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
