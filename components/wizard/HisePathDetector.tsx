'use client';

import { useState } from 'react';
import { Platform, DetectionResult, parseDetectionResult } from '@/types/wizard';
import { useExplanation } from '@/hooks/useExplanation';
import { updatePage, pathDetection } from '@/lib/content/explanations';
import Collapsible from '@/components/ui/Collapsible';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Input from '@/components/ui/Input';
import CodeBlock from '@/components/ui/CodeBlock';
import { Search, CheckCircle2, AlertCircle, XCircle, ClipboardPaste, FolderOpen, ArrowLeft, Info } from 'lucide-react';

interface HisePathDetectorProps {
  platform: Exclude<Platform, null>;
  onDetectionResult: (result: DetectionResult) => void;
  onCustomBinaryFolderChange?: (folder: string | null) => void;
  detectionStatus: 'valid' | 'invalid' | 'not_found' | null;
  detectedPath: string;
  hasFaust: boolean;
  customBinaryFolder?: string | null;
}

// Build detection command based on platform and optional custom folder path
function buildDetectionCommand(platform: Exclude<Platform, null>, folderPath?: string | null): string {
  if (!folderPath) {
    return 'HISE get_update_info';
  }
  
  // Remove trailing slash/backslash
  const trimmed = folderPath.trim().replace(/[\/\\]$/, '');
  
  switch (platform) {
    case 'windows':
      return `"${trimmed}\\HISE.exe" get_update_info`;
    case 'macos':
    case 'linux':
      return `"${trimmed}/HISE" get_update_info`;
  }
}

// Platform-specific instructions for finding the HISE binary folder
function getFolderInstructions(platform: Exclude<Platform, null>): { easy: string; dev: string } {
  switch (platform) {
    case 'windows':
      return {
        easy: 'Navigate to the folder containing HISE.exe in File Explorer (usually ends with ...\\Builds\\VisualStudio2022\\x64\\Release\\App or ...\\Release with Faust\\App), then copy the path from the address bar.',
        dev: 'Copy path to folder containing HISE.exe',
      };
    case 'macos':
      return {
        easy: 'In Finder, navigate to HISE.app, right-click and select "Show Package Contents", then go to Contents/MacOS. Copy the folder path.',
        dev: 'Path to HISE.app/Contents/MacOS',
      };
    case 'linux':
      return {
        easy: 'Navigate to the folder containing the HISE binary (usually ends with .../Builds/LinuxMakefile/build), then copy the path.',
        dev: 'Copy path to folder containing HISE binary',
      };
  }
}

export default function HisePathDetector({
  platform,
  onDetectionResult,
  onCustomBinaryFolderChange,
  detectionStatus,
  detectedPath,
  hasFaust,
  customBinaryFolder,
}: HisePathDetectorProps) {
  const { get, mode } = useExplanation();
  const [pasteValue, setPasteValue] = useState('');
  const [clipboardError, setClipboardError] = useState<string | null>(null);
  const [showCustomPath, setShowCustomPath] = useState(false);
  const [localCustomFolder, setLocalCustomFolder] = useState(customBinaryFolder || '');
  
  // Get the current detection command based on whether custom folder is set
  const detectionCommand = buildDetectionCommand(platform, showCustomPath ? localCustomFolder : null);
  const folderInstructions = getFolderInstructions(platform);
  
  // Handle paste from clipboard and apply
  const handlePasteAndApply = async () => {
    setClipboardError(null);
    
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setPasteValue(text.trim());
        const result = parseDetectionResult(text, platform);
        onDetectionResult(result);
      } else {
        setClipboardError('Clipboard is empty. Copy the script output first.');
      }
    } catch {
      // Clipboard API failed - likely permission denied or not supported
      setClipboardError('Could not access clipboard. Please paste manually below.');
    }
  };
  
  // Handle manual apply (fallback)
  const handleManualApply = () => {
    if (!pasteValue.trim()) return;
    setClipboardError(null);
    
    const result = parseDetectionResult(pasteValue, platform);
    onDetectionResult(result);
  };
  
  // Handle custom folder path change
  const handleCustomFolderChange = (value: string) => {
    setLocalCustomFolder(value);
    onCustomBinaryFolderChange?.(value || null);
  };
  
  // Toggle custom path mode
  const handleToggleCustomPath = () => {
    const newShowCustomPath = !showCustomPath;
    setShowCustomPath(newShowCustomPath);
    if (!newShowCustomPath) {
      // Reset custom folder when going back to simple mode
      setLocalCustomFolder('');
      onCustomBinaryFolderChange?.(null);
    }
  };
  
  const renderStatusIcon = () => {
    switch (detectionStatus) {
      case 'valid':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'invalid':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'not_found':
        return <XCircle className="w-5 h-5 text-error" />;
      default:
        return null;
    }
  };
  
  const renderStatusMessage = () => {
    switch (detectionStatus) {
      case 'valid':
        return (
          <span className="text-success">{get(updatePage.pathStatus.valid)}</span>
        );
      case 'invalid':
        return (
          <span className="text-warning">{get(updatePage.pathStatus.invalid)}</span>
        );
      case 'not_found':
        return (
          <span className="text-error">{get(updatePage.pathStatus.notFound)}</span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Collapsible
        title={get(updatePage.detectSection.title)}
        icon={<Search className="w-4 h-4 text-accent" />}
        defaultOpen={detectionStatus === null}
      >
        <div className="space-y-4">
          {/* Custom Path Mode */}
          {showCustomPath ? (
            <div className="space-y-4">
              {/* Back button */}
              <button
                onClick={handleToggleCustomPath}
                className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {get(pathDetection.useSimpleCommand)}
              </button>
              
              {/* Folder path input */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {mode === 'easy' ? folderInstructions.easy : folderInstructions.dev}
                </label>
                <Input
                  value={localCustomFolder}
                  onChange={(e) => handleCustomFolderChange(e.target.value)}
                  placeholder={platform === 'windows' 
                    ? 'C:\\Development\\HISE\\projects\\standalone\\Builds\\...' 
                    : '~/HISE/projects/standalone/Builds/...'}
                  className="font-mono text-sm"
                />
              </div>
              
              {/* Updated detection command */}
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  Now run this command:
                </p>
                <CodeBlock code={detectionCommand} />
              </div>
            </div>
          ) : (
            <>
              {/* Default: Simple Detection Command */}
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  {get(updatePage.detectSection.description)}
                </p>
                <CodeBlock code={detectionCommand} />
              </div>
              
              {/* "Command not working?" hint */}
              <div className="border border-border rounded-lg p-3 bg-surface/50">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-gray-400 mb-2">
                      {get(pathDetection.commandNotWorking)}
                    </p>
                    <Button
                      onClick={handleToggleCustomPath}
                      variant="ghost"
                      size="sm"
                      className="text-accent hover:text-accent/80"
                    >
                      <FolderOpen className="w-4 h-4" />
                      {get(pathDetection.locateFolder)}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Paste & Apply Button */}
          <div className="space-y-3">
            <Button 
              onClick={handlePasteAndApply}
              variant="secondary"
              className="w-full"
            >
              <ClipboardPaste className="w-4 h-4" />
              Paste & Apply
            </Button>
            
            {/* Error message */}
            {clipboardError && (
              <p className="text-sm text-warning">{clipboardError}</p>
            )}
            
            {/* Manual paste fallback */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {get(updatePage.detectSection.pasteLabel)}
              </label>
              <div className="flex gap-2">
                <Textarea
                  value={pasteValue}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPasteValue(e.target.value)}
                  placeholder={get(updatePage.detectSection.placeholder)}
                  className="flex-1 font-mono text-sm"
                  rows={1}
                />
                <Button 
                  onClick={handleManualApply}
                  disabled={!pasteValue.trim()}
                  variant="ghost"
                  title="Apply manually pasted text"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Collapsible>
      
      {/* Detection Result */}
      {detectionStatus && (
        <div className={`
          border rounded-lg p-4 
          ${detectionStatus === 'valid' ? 'border-success bg-success/10' : ''}
          ${detectionStatus === 'invalid' ? 'border-warning bg-warning/10' : ''}
          ${detectionStatus === 'not_found' ? 'border-error bg-error/10' : ''}
        `}>
          <div className="flex items-start gap-3">
            {renderStatusIcon()}
            <div className="flex-1 min-w-0">
              <div className="font-medium mb-1">
                {renderStatusMessage()}
              </div>
              
              {detectionStatus === 'valid' && (
                <>
                  <p className="text-sm text-gray-400 font-mono truncate" title={detectedPath}>
                    {detectedPath}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {hasFaust 
                      ? get(updatePage.faustStatus.enabled)
                      : get(updatePage.faustStatus.disabled)
                    }
                  </p>
                </>
              )}
              
              {detectionStatus === 'invalid' && detectedPath && (
                <p className="text-sm text-gray-400 font-mono truncate" title={detectedPath}>
                  Path: {detectedPath}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
