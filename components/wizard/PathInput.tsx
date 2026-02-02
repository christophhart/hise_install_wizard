'use client';

import { Platform, DEFAULT_PATHS } from '@/types/wizard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { RotateCcw, Clipboard, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

interface PathInputProps {
  value: string;
  onChange: (path: string) => void;
  platform: Exclude<Platform, null>;
}

// Path validation regex patterns
const PATH_PATTERNS = {
  // Windows: Drive letter followed by backslash, then valid path characters
  // Allows: C:\Users\Name\HISE, D:\Development\HISE modules, etc.
  windows: /^[A-Za-z]:\\(?:[^<>:"|?*\n]+\\?)*$/,
  
  // macOS/Linux: Starts with / or ~, then valid path characters
  // Allows: /Users/name/HISE, ~/Development/HISE, /home/user/my projects, etc.
  macos: /^(?:~|\/)[^<>:"|?*\n]*$/,
  linux: /^(?:~|\/)[^<>:"|?*\n]*$/,
};

function validatePath(path: string, platform: Exclude<Platform, null>): { valid: boolean; error?: string } {
  if (!path.trim()) {
    return { valid: false, error: 'Path is required' };
  }
  
  const pattern = PATH_PATTERNS[platform];
  
  if (!pattern.test(path)) {
    if (platform === 'windows') {
      return { 
        valid: false, 
        error: 'Invalid Windows path. Must start with drive letter (e.g., C:\\)' 
      };
    } else {
      return { 
        valid: false, 
        error: 'Invalid path. Must start with / or ~' 
      };
    }
  }
  
  return { valid: true };
}

export default function PathInput({ value, onChange, platform }: PathInputProps) {
  const defaultPath = DEFAULT_PATHS[platform];
  const isDefault = value === defaultPath;
  const [pasted, setPasted] = useState(false);
  
  // Validate current path
  const validation = useMemo(() => validatePath(value, platform), [value, platform]);
  
  const handleReset = () => {
    onChange(defaultPath);
  };
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text.trim());
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      }
    } catch (err) {
      console.log('Clipboard access denied');
    }
  };
  
  // Get example path for current platform
  const examplePath = platform === 'windows' 
    ? 'D:\\Development\\HISE' 
    : '~/Development/HISE';
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Installation Path
      </label>
      <div className="flex items-stretch gap-2">
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={defaultPath}
            className={`h-full ${!validation.valid && value ? 'border-error focus:border-error' : ''}`}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={handlePaste}
          title="Paste from clipboard"
        >
          <Clipboard className="w-4 h-4" />
          {pasted ? 'Pasted!' : 'Paste'}
        </Button>
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
      
      {/* Validation error message */}
      {!validation.valid && value && (
        <div className="flex items-center gap-2 text-error text-xs">
          <AlertCircle className="w-3 h-3" />
          <span>{validation.error}</span>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Default: <code className="text-accent">{defaultPath}</code>
      </p>
      <p className="text-xs text-gray-400">
        Enter the full path where HISE will be installed (e.g., <code className="text-gray-500">{examplePath}</code>)
      </p>
      {platform === 'windows' && (
        <Alert variant="info" className="mt-3">
          In File Explorer, click the address bar and copy the path, then paste it here.
        </Alert>
      )}
    </div>
  );
}

// Export validation function for use in other components
export { validatePath };
