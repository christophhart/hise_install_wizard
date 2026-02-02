'use client';

import { Architecture } from '@/types/wizard';
import RadioGroup from '@/components/ui/RadioGroup';

interface ArchitectureSelectorProps {
  value: Architecture;
  onChange: (arch: Architecture) => void;
  platform: 'macos' | null;
}

export default function ArchitectureSelector({ 
  value, 
  onChange,
  platform 
}: ArchitectureSelectorProps) {
  // Only show for macOS
  if (platform !== 'macos') {
    return null;
  }
  
  const options = [
    {
      value: 'arm64',
      label: 'Apple Silicon (M1/M2/M3)',
      description: 'For Macs with Apple Silicon processors',
    },
    {
      value: 'x64',
      label: 'Intel (x64)',
      description: 'For Macs with Intel processors',
    },
  ];
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Select your Mac architecture
      </label>
      <RadioGroup
        name="architecture"
        options={options}
        value={value}
        onChange={(v) => onChange(v as Architecture)}
      />
    </div>
  );
}
