'use client';

import { useState } from 'react';
import { Platform, DetectionResult, parseDetectionResult } from '@/types/wizard';
import { useExplanation } from '@/hooks/useExplanation';
import { updatePage } from '@/lib/content/explanations';
import Collapsible from '@/components/ui/Collapsible';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import CodeBlock from '@/components/ui/CodeBlock';
import { Search, CheckCircle2, AlertCircle, XCircle, ClipboardPaste } from 'lucide-react';

interface HisePathDetectorProps {
  platform: Exclude<Platform, null>;
  onDetectionResult: (result: DetectionResult) => void;
  detectionStatus: 'valid' | 'invalid' | 'not_found' | null;
  detectedPath: string;
  hasFaust: boolean;
}

// Detection command for all platforms.
// HISE get_update_info outputs the detection info and copies it to clipboard automatically.
// Format: <path>|<status>|<faust>|<arch>
// Example: C:\HISE|valid|faust|x64
const detectionScripts: Record<Exclude<Platform, null>, string> = {
  windows: `HISE get_update_info`,
  macos: `HISE get_update_info`,
  linux: `HISE get_update_info`,
};

export default function HisePathDetector({
  platform,
  onDetectionResult,
  detectionStatus,
  detectedPath,
  hasFaust,
}: HisePathDetectorProps) {
  const { get } = useExplanation();
  const [pasteValue, setPasteValue] = useState('');
  const [clipboardError, setClipboardError] = useState<string | null>(null);
  
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
    } catch (err) {
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
          {/* Detection Script */}
          <div>
            <p className="text-sm text-gray-400 mb-2">
              {get(updatePage.detectSection.description)}
            </p>
            <CodeBlock code={detectionScripts[platform]} />
          </div>
          
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
