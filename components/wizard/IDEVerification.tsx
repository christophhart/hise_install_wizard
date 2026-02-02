'use client';

import { useState } from 'react';
import { Platform } from '@/types/wizard';
import { Check, AlertCircle, RefreshCw, ClipboardPaste, Terminal } from 'lucide-react';
import Button from '@/components/ui/Button';
import CodeBlock from '@/components/ui/CodeBlock';
import Alert from '@/components/ui/Alert';
import Collapsible from '@/components/ui/Collapsible';

interface IDEVerificationProps {
  platform: Exclude<Platform, null>;
  includeIPP: boolean;
  onVerificationChange: (ideVerified: boolean, ippVerified: boolean) => void;
  explanationMode: 'easy' | 'dev';
}

// Verification commands for each platform
const getVerificationCommand = (platform: Exclude<Platform, null>, includeIPP: boolean): string => {
  switch (platform) {
    case 'windows':
      const vsCheck = 'Test-Path "C:\\Program Files\\Microsoft Visual Studio\\18\\*\\MSBuild\\Current\\Bin\\MSBuild.exe"';
      const ippCheck = 'Test-Path "C:\\Program Files (x86)\\Intel\\oneAPI\\ipp\\latest"';
      
      if (includeIPP) {
        return `$vs = ${vsCheck}\n$ipp = ${ippCheck}\nif ($vs -and $ipp) { "vs,ipp" } elseif ($vs) { "vs" } elseif ($ipp) { "ipp" } else { "none" }`;
      }
      return `if (${vsCheck}) { "vs" } else { "none" }`;
      
    case 'macos':
      return `if xcode-select -p &>/dev/null; then echo "xcode"; else echo "none"; fi`;
      
    case 'linux':
      return `if command -v gcc &>/dev/null; then echo "gcc"; else echo "none"; fi`;
      
    default:
      return '';
  }
};

// Parse verification output
const parseVerificationOutput = (
  output: string, 
  platform: Exclude<Platform, null>
): { ideVerified: boolean; ippVerified: boolean } => {
  const trimmed = output.trim().toLowerCase();
  
  if (platform === 'windows') {
    return {
      ideVerified: trimmed.includes('vs'),
      ippVerified: trimmed.includes('ipp'),
    };
  }
  
  if (platform === 'macos') {
    return {
      ideVerified: trimmed.includes('xcode'),
      ippVerified: false, // No IPP on macOS
    };
  }
  
  // Linux
  return {
    ideVerified: trimmed.includes('gcc'),
    ippVerified: false, // No IPP on Linux
  };
};

// Get IDE name for platform
const getIDEName = (platform: Exclude<Platform, null>): string => {
  switch (platform) {
    case 'windows':
      return 'Visual Studio 2026';
    case 'macos':
      return 'Xcode Command Line Tools';
    case 'linux':
      return 'GCC';
    default:
      return 'C++ Compiler';
  }
};

export default function IDEVerification({
  platform,
  includeIPP,
  onVerificationChange,
  explanationMode,
}: IDEVerificationProps) {
  const [verificationInput, setVerificationInput] = useState('');
  const [ideVerified, setIdeVerified] = useState<boolean | null>(null);
  const [ippVerified, setIppVerified] = useState<boolean | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  
  const verificationCommand = getVerificationCommand(platform, includeIPP);
  const ideName = getIDEName(platform);
  
  const handleApply = () => {
    const result = parseVerificationOutput(verificationInput, platform);
    setIdeVerified(result.ideVerified);
    setIppVerified(result.ippVerified);
    setHasApplied(true);
    onVerificationChange(result.ideVerified, result.ippVerified);
  };
  
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setVerificationInput(text.trim());
      }
    } catch (err) {
      console.log('Clipboard access denied');
    }
  };
  
  const showIPP = platform === 'windows' && includeIPP;
  
  // Determine overall status
  const allVerified = ideVerified === true && (!showIPP || ippVerified === true);
  const someNotVerified = hasApplied && !allVerified;
  
  return (
    <div className="space-y-4">
      <Collapsible
        title="Verify IDE Installation"
        icon={<Terminal className="w-4 h-4 text-accent" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* Instructions */}
          <Alert variant="info">
            {explanationMode === 'easy' ? (
              <p className="text-xs">
                Before running the setup script, verify that you have installed the required development tools.
                Run the command below and paste the result to confirm your installation.
              </p>
            ) : (
              <p className="text-xs">
                Verify IDE installation before running script.
              </p>
            )}
          </Alert>
          
          {/* Verification Command */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              {explanationMode === 'easy' 
                ? '1. Copy and run this command in your terminal:'
                : 'Run:'}
            </p>
            <CodeBlock code={verificationCommand} className="text-xs" />
          </div>
          
          {/* Paste Input */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              {explanationMode === 'easy' 
                ? '2. Paste the result here:'
                : 'Paste output:'}
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  placeholder={platform === 'windows' && includeIPP ? 'e.g., vs,ipp or vs or none' : `e.g., ${platform === 'windows' ? 'vs' : platform === 'macos' ? 'xcode' : 'gcc'} or none`}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handlePasteFromClipboard}
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Apply Button */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleApply}
              disabled={!verificationInput.trim()}
            >
              <RefreshCw className="w-4 h-4" />
              Verify
            </Button>
          </div>
          
          {/* Verification Results */}
          {hasApplied && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs text-gray-500 font-medium">Verification Results:</p>
              
              {/* IDE Status */}
              <div className="flex items-center gap-2">
                {ideVerified ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-warning" />
                )}
                <span className={`text-sm ${ideVerified ? 'text-success' : 'text-warning'}`}>
                  {ideName}: {ideVerified ? 'Installed' : 'Not found'}
                </span>
              </div>
              
              {/* IPP Status (Windows only) */}
              {showIPP && (
                <div className="flex items-center gap-2">
                  {ippVerified ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-warning" />
                  )}
                  <span className={`text-sm ${ippVerified ? 'text-success' : 'text-warning'}`}>
                    Intel IPP: {ippVerified ? 'Installed' : 'Not found'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Collapsible>
      
      {/* Warning if not verified */}
      {someNotVerified && (
        <Alert variant="warning" title="Missing Development Tools">
          {!ideVerified && (
            <p className="text-xs mb-2">
              {ideName} was not detected. The script will fail if it's not installed.
              Please install it before running the setup script.
            </p>
          )}
          {showIPP && !ippVerified && (
            <p className="text-xs">
              Intel IPP was not detected. The script will continue without IPP optimization.
            </p>
          )}
          <p className="text-xs mt-2 text-gray-400">
            You can still proceed, but the script may fail if required tools are missing.
          </p>
        </Alert>
      )}
      
      {/* Success message */}
      {allVerified && (
        <Alert variant="success" title="All Tools Verified">
          <p className="text-xs">
            All required development tools are installed. You can safely run the setup script.
          </p>
        </Alert>
      )}
    </div>
  );
}
