'use client';

import { useRef } from 'react';
import { Platform, DEFAULT_PATHS } from '@/types/wizard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { RotateCcw, FolderOpen } from 'lucide-react';

interface PathInputProps {
  value: string;
  onChange: (path: string) => void;
  platform: Exclude<Platform, null>;
}

export default function PathInput({ value, onChange, platform }: PathInputProps) {
  const defaultPath = DEFAULT_PATHS[platform];
  const isDefault = value === defaultPath;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleReset = () => {
    onChange(defaultPath);
  };
  
  const handleBrowse = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Get the directory path from the selected file
      // The webkitRelativePath gives us the folder name
      const file = files[0];
      if (file.webkitRelativePath) {
        const folderName = file.webkitRelativePath.split('/')[0];
        // We can't get the full absolute path in browsers for security reasons
        // So we'll use a different approach - show folder name and let user confirm
        onChange(folderName);
      }
    }
  };
  
  // For modern browsers that support the File System Access API
  const handleDirectoryPicker = async () => {
    try {
      // Check if the File System Access API is available
      if ('showDirectoryPicker' in window) {
        // @ts-expect-error - showDirectoryPicker is not in TypeScript types yet
        const dirHandle = await window.showDirectoryPicker({
          mode: 'read',
        });
        // Use the directory name - browsers don't expose full path for security
        // We'll show a message about this limitation
        onChange(dirHandle.name);
      } else {
        // Fallback: show file input (won't work perfectly but gives feedback)
        fileInputRef.current?.click();
      }
    } catch (err) {
      // User cancelled or API not supported
      console.log('Directory picker cancelled or not supported');
    }
  };
  
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
            className="h-full"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={handleDirectoryPicker}
          title="Browse for folder"
        >
          <FolderOpen className="w-4 h-4" />
          Browse
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
      
      {/* Hidden file input as fallback */}
      <input
        ref={fileInputRef}
        type="file"
        // @ts-expect-error - webkitdirectory is not in TypeScript types
        webkitdirectory=""
        directory=""
        className="hidden"
        onChange={handleFileSelect}
      />
      
      <p className="text-xs text-gray-500">
        Default: <code className="text-accent">{defaultPath}</code>
      </p>
      <p className="text-xs text-gray-400">
        Type the full path where you want to install HISE, or browse to select a folder.
      </p>
    </div>
  );
}
