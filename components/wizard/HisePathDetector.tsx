'use client';

import { useState } from 'react';
import { Platform, DetectionResult, parseDetectionResult } from '@/types/wizard';
import { useExplanation } from '@/hooks/useExplanation';
import { updatePage } from '@/lib/content/explanations';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { CheckCircle2, AlertCircle, XCircle, ClipboardPaste, ChevronDown, ChevronUp } from 'lucide-react';

interface HisePathDetectorProps {
  platform: Exclude<Platform, null>;
  onDetectionResult: (result: DetectionResult) => void;
  detectionStatus: 'valid' | 'invalid' | 'not_found' | null;
  detectedPath: string;
  hasFaust: boolean;
  commitHash?: string | null;
}

export default function HisePathDetector({
  platform,
  onDetectionResult,
  detectionStatus,
  detectedPath,
  hasFaust,
  commitHash,
}: HisePathDetectorProps) {
  const { get } = useExplanation();
  const [pasteValue, setPasteValue] = useState('');
  const [clipboardError, setClipboardError] = useState<string | null>(null);
  const [showManualPaste, setShowManualPaste] = useState(false);
  
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
        setClipboardError('Clipboard is empty. Use Help → Update HISE in HISE first.');
      }
    } catch {
      // Clipboard API failed - likely permission denied or not supported
      setClipboardError('Could not access clipboard. Please use manual paste below.');
      setShowManualPaste(true);
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
      {/* Instructions */}
      <p className="text-sm text-gray-400">
        {get(updatePage.detectSection.description)}
      </p>
      
      {/* Main Paste Button */}
      <Button 
        onClick={handlePasteAndApply}
        variant="secondary"
        className="w-full"
      >
        <ClipboardPaste className="w-4 h-4" />
        Paste Update Info
      </Button>
      
      {/* Error message */}
      {clipboardError && (
        <p className="text-sm text-warning">{clipboardError}</p>
      )}
      
      {/* Manual paste toggle */}
      <button 
        onClick={() => setShowManualPaste(!showManualPaste)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-400 transition-colors"
      >
        Manual paste
        {showManualPaste ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      {/* Manual paste (hidden by default) */}
      {showManualPaste && (
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
      )}
      
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
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                    <span>
                      {hasFaust 
                        ? get(updatePage.faustStatus.enabled)
                        : get(updatePage.faustStatus.disabled)
                      }
                    </span>
                    {commitHash && (
                      <span className="font-mono" title={commitHash}>
                        Build: {commitHash.substring(0, 7)}
                      </span>
                    )}
                  </div>
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
