'use client';

import { useState } from 'react';
import { Platform, HiseInstallation, DetectScriptResponse } from '@/types/wizard';
import { useExplanation } from '@/hooks/useExplanation';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Collapsible from '@/components/ui/Collapsible';
import InlineCopy from '@/components/ui/InlineCopy';
import Alert from '@/components/ui/Alert';
import { Download, Folder, Trash2, Info, Terminal, ClipboardPaste } from 'lucide-react';
import { downloadAsFile, generateUniqueFilename } from '@/lib/utils/download';

interface HiseInstallationDetectorProps {
  platform: Exclude<Platform, null>;
  installations: HiseInstallation[];
  onInstallationsChange: (installations: HiseInstallation[]) => void;
}

// Parse detection output into installations array
function parseDetectionOutput(output: string): HiseInstallation[] {
  const lines = output.trim().split('\n').filter(line => {
    // Filter out status messages and empty lines
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('Searching')) return false;
    if (trimmed.startsWith('Found')) return false;
    if (trimmed.startsWith('No HISE')) return false;
    if (trimmed.startsWith('#')) return false;
    if (trimmed.startsWith('=')) return false;
    if (trimmed.startsWith('COPY')) return false;
    if (trimmed.startsWith('SEARCH')) return false;
    if (trimmed.includes('HISE INSTALLATION DETECTOR')) return false;
    if (trimmed.includes('ONLY SEARCHES')) return false;
    if (trimmed.includes('NOT delete')) return false;
    if (trimmed.includes('may take')) return false;
    if (trimmed.includes('No files were')) return false;
    if (trimmed.includes('Setup Wizard')) return false;
    if (trimmed.includes('Search complete')) return false;
    if (trimmed.includes('installation(s)')) return false;
    // Filter out box drawing characters
    if (/^[╔╗╚╝╠╣║═\s]+$/.test(trimmed)) return false;
    // Filter out lines that are just the checkmark
    if (/^[✓]\s/.test(trimmed)) return false;
    return true;
  });
  
  return lines.map(line => {
    // Handle both formats: "path|faust" and just "path"
    const parts = line.split('|');
    const path = parts[0]?.trim() || '';
    const hasFaust = parts[1]?.trim() === 'faust';
    
    return {
      path,
      hasFaust,
      selected: true, // Default to selected
    };
  }).filter(inst => inst.path.length > 0);
}

// Get run command for each platform
function getRunCommand(platform: Exclude<Platform, null>, filename: string): string {
  switch (platform) {
    case 'windows':
      return `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; & "$HOME\\Downloads\\${filename}"`;
    case 'macos':
    case 'linux':
      return `chmod +x ~/Downloads/${filename} && ~/Downloads/${filename}`;
  }
}

export default function HiseInstallationDetector({
  platform,
  installations,
  onInstallationsChange,
}: HiseInstallationDetectorProps) {
  const { mode } = useExplanation();
  const [pasteValue, setPasteValue] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedFilename, setDownloadedFilename] = useState<string | null>(null);
  const [clipboardError, setClipboardError] = useState<string | null>(null);
  
  const handleDownloadScript = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/generate-detect-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate detection script');
      }
      
      const result: DetectScriptResponse = await response.json();
      const uniqueFilename = generateUniqueFilename(result.filename);
      downloadAsFile(result.script, uniqueFilename);
      setDownloadedFilename(uniqueFilename);
    } catch (error) {
      console.error('Error downloading detection script:', error);
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleApplyResults = (text: string) => {
    if (!text.trim()) return;
    
    const parsed = parseDetectionOutput(text);
    onInstallationsChange(parsed);
    setHasApplied(true);
  };
  
  const handlePasteAndApply = async () => {
    setClipboardError(null);
    
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setPasteValue(text.trim());
        handleApplyResults(text.trim());
      } else {
        setClipboardError('Clipboard is empty.');
      }
    } catch {
      setClipboardError('Could not access clipboard. Please paste manually into the text field.');
    }
  };
  
  const handleToggleInstallation = (path: string) => {
    const updated = installations.map(inst =>
      inst.path === path ? { ...inst, selected: !inst.selected } : inst
    );
    onInstallationsChange(updated);
  };
  
  const handleSelectAll = () => {
    const updated = installations.map(inst => ({ ...inst, selected: true }));
    onInstallationsChange(updated);
  };
  
  const handleDeselectAll = () => {
    const updated = installations.map(inst => ({ ...inst, selected: false }));
    onInstallationsChange(updated);
  };

  // Determine filename for run command
  const runFilename = downloadedFilename || (platform === 'windows' ? 'hise-detect-*.ps1' : 'hise-detect-*.sh');
  
  return (
    <div className="space-y-4">
      {/* Reassurance Alert */}
      <Alert variant="info" className="border-accent/30 bg-accent/5">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            The detection script <strong>ONLY SEARCHES</strong> for HISE installations - it does not delete or modify any files.
          </p>
        </div>
      </Alert>
      
      {/* Intro text */}
      <p className="text-sm text-gray-400">
        Run the detection script to find all HISE installations, or paste the path directly if you know where HISE is installed.
      </p>
      
      {/* Step 1: Download (optional) */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">
          1. Download the detection script <span className="text-gray-500 font-normal">(optional)</span>
        </h4>
        <Button 
          onClick={handleDownloadScript}
          disabled={isDownloading}
          variant="secondary"
          className="w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? 'Generating...' : downloadedFilename ? `Downloaded ${downloadedFilename}` : 'Download Detection Script'}
        </Button>
      </div>
      
      {/* Step 2: Run */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">
          2. Run it in {platform === 'windows' ? 'PowerShell' : 'Terminal'}
        </h4>
        
        {platform === 'windows' && (
          <p className="text-xs text-warning">
            Run PowerShell as Administrator for best results.
          </p>
        )}
        
        <Collapsible
          title="How to run"
          icon={<Terminal className="w-4 h-4 text-accent" />}
          defaultOpen={true}
        >
          <div className="space-y-3 text-sm text-gray-400">
            <div>
              <p className="mb-2">
                {platform === 'windows' 
                  ? 'Open PowerShell as Administrator and run:'
                  : 'Open Terminal and run:'}
              </p>
              <InlineCopy text={getRunCommand(platform, runFilename)} />
            </div>
            {mode === 'easy' && (
              <p className="text-xs text-gray-500">
                The script will search your entire system for HISE installations. This may take 1-3 minutes.
              </p>
            )}
          </div>
        </Collapsible>
      </div>
      
      {/* Step 3: Paste Results */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">
          3. Paste the results <span className="text-gray-500 font-normal">(or paste path directly)</span>
        </h4>
        
        <div className="flex gap-2 items-start">
          <Textarea
            value={pasteValue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPasteValue(e.target.value)}
            placeholder={platform === 'windows' 
              ? 'e.g. C:\\HISE or script output' 
              : 'e.g. /Users/yourname/HISE or script output'}
            rows={3}
            className="font-mono text-sm flex-1 min-w-0"
          />
          <Button 
            onClick={handlePasteAndApply}
            variant="secondary"
            className="flex-shrink-0"
            title="Paste from clipboard and apply"
          >
            <ClipboardPaste className="w-4 h-4" />
            Paste
          </Button>
        </div>
        
        {/* Clipboard error message */}
        {clipboardError && (
          <p className="text-sm text-warning">{clipboardError}</p>
        )}
        
        {/* Manual apply button (in case paste button doesn't work) */}
        {pasteValue.trim() && installations.length === 0 && (
          <Button 
            onClick={() => handleApplyResults(pasteValue)}
            variant="ghost"
            size="sm"
          >
            Apply
          </Button>
        )}
      </div>
      
      {/* Found Installations */}
      {installations.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">
              Found Installations ({installations.length})
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs text-gray-500 hover:text-gray-400"
              >
                Select all
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={handleDeselectAll}
                className="text-xs text-gray-500 hover:text-gray-400"
              >
                Deselect all
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            {installations.map((inst) => (
              <label
                key={inst.path}
                className={`
                  flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                  ${inst.selected 
                    ? 'border-border bg-surface' 
                    : 'border-border bg-surface/50 opacity-60'}
                `}
              >
                <input
                  type="checkbox"
                  checked={inst.selected}
                  onChange={() => handleToggleInstallation(inst.path)}
                  className="mt-1 accent-error"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="font-mono text-sm truncate" title={inst.path}>
                      {inst.path}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    {inst.hasFaust && platform === 'macos' && (
                      <span className="text-warning">Includes Faust</span>
                    )}
                    {inst.selected && (
                      <span className="text-error flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        Will be removed
                      </span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
          
          {/* Selection summary */}
          <div className="text-sm text-gray-500">
            {installations.filter(i => i.selected).length} of {installations.length} installations selected for removal
          </div>
        </div>
      )}
      
      {/* No installations found message */}
      {hasApplied && installations.length === 0 && (
        <div className="border border-warning rounded-lg p-4 bg-warning/10">
          <p className="text-warning text-sm">
            No valid HISE installation paths found. Make sure you pasted a valid path or the script output.
          </p>
        </div>
      )}
    </div>
  );
}
