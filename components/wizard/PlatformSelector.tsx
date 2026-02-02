'use client';

import { Platform, PLATFORM_LABELS } from '@/types/wizard';
import { Monitor, Apple, Terminal } from 'lucide-react';

interface PlatformSelectorProps {
  value: Platform;
  onChange: (platform: Platform) => void;
  detectedPlatform?: Platform;
}

const platformIcons: Record<Exclude<Platform, null>, typeof Monitor> = {
  windows: Monitor,
  macos: Apple,
  linux: Terminal,
};

export default function PlatformSelector({ 
  value, 
  onChange,
  detectedPlatform 
}: PlatformSelectorProps) {
  const platforms: Exclude<Platform, null>[] = ['windows', 'macos', 'linux'];
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Select your operating system
        {detectedPlatform && (
          <span className="ml-2 text-accent text-xs">
            (Detected: {PLATFORM_LABELS[detectedPlatform]})
          </span>
        )}
      </label>
      
      <div className="grid grid-cols-3 gap-3">
        {platforms.map((platform) => {
          const Icon = platformIcons[platform];
          const isSelected = value === platform;
          const isDetected = detectedPlatform === platform;
          
          return (
            <button
              key={platform}
              type="button"
              onClick={() => onChange(platform)}
              className={`
                p-4 rounded border flex flex-col items-center gap-2
                transition-all duration-200
                ${isSelected
                  ? 'border-accent bg-accent/10 text-white'
                  : 'border-border hover:border-gray-400 text-gray-400 hover:text-white'
                }
              `}
            >
              <Icon className="w-8 h-8" />
              <span className="text-sm font-medium">{PLATFORM_LABELS[platform]}</span>
              {isDetected && !isSelected && (
                <span className="text-xs text-accent">Detected</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
