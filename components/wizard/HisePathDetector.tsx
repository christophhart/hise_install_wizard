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

// Detection scripts for each platform.
// Windows and macOS copy output to clipboard automatically.
// Linux shows visual markers for manual copying.
// Faust detection uses "HISE get_build_flags" command, with fallback to path-based detection.
const detectionScripts: Record<Exclude<Platform, null>, string> = {
  // PowerShell: copy to clipboard + show confirmation
  // Uses "HISE get_build_flags" to detect Faust support, falls back to path-based detection
  windows: `$h=(Get-Command HISE -EA SilentlyContinue).Source;if($h){$p=Split-Path $h;$flags=(& HISE get_build_flags 2>$null) -join ' ';if($flags -match 'Faust Support: Enabled'){$f='faust'}elseif($flags){$f='nofaust'}else{$f=if($p -match 'Faust'){'faust'}else{'nofaust'}};$r=(Get-Item $h).Directory.Parent.Parent.Parent.Parent.Parent.Parent.Parent.FullName;$out=if(Test-Path "$r\\.git"){"$r,valid,$f"}else{"$r,invalid,$f"}}else{$out="not_found"};Set-Clipboard $out;"Copied to clipboard: $out"`,
  // macOS: copy to clipboard with pbcopy + show confirmation
  // Uses "HISE get_build_flags" to detect Faust support, falls back to path-based detection
  macos: `h=$(which HISE 2>/dev/null);if [ -n "$h" ];then p=$(dirname "$(realpath "$h")");flags=$(HISE get_build_flags 2>/dev/null);if echo "$flags" | grep -q "Faust Support: Enabled";then f=faust;elif [ -n "$flags" ];then f=nofaust;else f=$([[ "$p" == *"Faust"* ]] && echo faust || echo nofaust);fi;ra=$(dirname "$(dirname "$(dirname "$(dirname "$(dirname "$(dirname "$(dirname "$(dirname "$(dirname "$(dirname "$(realpath "$h")")")")")")")")")")");r=$(echo "$ra" | sed "s|^$HOME|~|");a=$(uname -m);out=$([ -d "$ra/.git" ] && echo "$r,valid,$f,$a" || echo "$r,invalid,$f,$a");else out="not_found";fi;echo "$out" | pbcopy;echo "Copied to clipboard: $out"`,
  // Linux: show visual markers for manual copying
  // Uses "HISE get_build_flags" to detect Faust support, falls back to path-based detection
  linux: `h=$(which HISE 2>/dev/null);if [ -n "$h" ];then p=$(dirname "$(realpath "$h")");flags=$(HISE get_build_flags 2>/dev/null);if echo "$flags" | grep -q "Faust Support: Enabled";then f=faust;elif [ -n "$flags" ];then f=nofaust;else f=$([[ "$p" == *"Faust"* ]] && echo faust || echo nofaust);fi;ra=$(dirname "$(dirname "$(dirname "$(dirname "$(dirname "$(dirname "$(realpath "$h")")")")")")");r=$(echo "$ra" | sed "s|^$HOME|~|");out=$([ -d "$ra/.git" ] && echo "$r,valid,$f" || echo "$r,invalid,$f");else out="not_found";fi;echo "==== COPY BELOW ====";echo "$out";echo "==== COPY ABOVE ===="`,
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
