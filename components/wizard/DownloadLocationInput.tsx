'use client';

import { Platform } from '@/types/wizard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { RotateCcw, FolderDown } from 'lucide-react';
import { useMemo } from 'react';
import { useExplanation } from '@/hooks/useExplanation';

interface DownloadLocationInputProps {
  platform: Exclude<Platform, null>;
  value: string;
  onChange: (path: string) => void;
  className?: string;
}

// Default download paths per platform
export const DEFAULT_DOWNLOAD_PATHS: Record<Exclude<Platform, null>, string> = {
  windows: '$HOME\\Downloads',
  macos: '~/Downloads',
  linux: '~/Downloads',
};

// Simple path validation - just ensure it looks like a valid path
const PATH_PATTERNS: Record<Exclude<Platform, null>, RegExp> = {
  // Windows: Allow $HOME, $env:, %VAR%, or drive letter paths
  windows: /^(?:\$[\w]+|%[\w]+%|[A-Za-z]:)[\\/]?.*$/,
  // macOS: Must start with ~ or /
  macos: /^[~\/].*/,
  // Linux: Must start with ~ or /
  linux: /^[~\/].*/,
};

function validateDownloadPath(path: string, platform: Exclude<Platform, null>): boolean {
  if (!path.trim()) return false;
  return PATH_PATTERNS[platform].test(path);
}

// Mode-aware content
const content = {
  label: {
    easy: 'Download Location',
    dev: 'Download Location',
  },
  note: {
    easy: 'Make sure this path matches where your browser saves downloaded files. You can check this in your browser settings.',
    dev: 'Verify this matches your browser\'s download location',
  },
};

export default function DownloadLocationInput({ 
  platform, 
  value, 
  onChange, 
  className = '' 
}: DownloadLocationInputProps) {
  const { get } = useExplanation();
  const defaultPath = DEFAULT_DOWNLOAD_PATHS[platform];
  const isDefault = value === defaultPath;
  
  // Validate current path
  const isValid = useMemo(() => validateDownloadPath(value, platform), [value, platform]);
  
  const handleReset = () => {
    onChange(defaultPath);
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <FolderDown className="w-4 h-4 text-accent" />
        <label className="block text-sm font-medium text-gray-300">
          {get(content.label)}
        </label>
      </div>
      
      <div className="flex items-stretch gap-2">
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={defaultPath}
            className={`h-full ${!isValid && value ? 'border-warning focus:border-warning' : ''}`}
          />
        </div>
        {!isDefault && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleReset}
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <p className="text-xs text-gray-400">
        {get(content.note)}
      </p>
    </div>
  );
}
