'use client';

import { useState, useEffect } from 'react';
import { Platform } from '@/types/wizard';
import { Check, AlertCircle, ClipboardPaste } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import CodeBlock from '@/components/ui/CodeBlock';
import {
  VerifiableTool,
  getVerificationCommand,
  parseVerificationOutput,
  getToolName,
  getOutputHint,
} from '@/lib/verification';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: Exclude<Platform, null>;
  tool: VerifiableTool;
  onVerified: (verified: boolean) => void;
  isEasyMode: boolean;
}

export default function VerificationModal({
  isOpen,
  onClose,
  platform,
  tool,
  onVerified,
  isEasyMode,
}: VerificationModalProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<boolean | null>(null);

  const toolName = getToolName(platform, tool);
  const command = getVerificationCommand(platform, tool);
  const hint = getOutputHint(platform, tool);

  const handleVerify = () => {
    const verified = parseVerificationOutput(input, platform, tool);
    setResult(verified);
    onVerified(verified);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const trimmedText = text.trim();
        setInput(trimmedText);
        // Auto-verify after paste
        const verified = parseVerificationOutput(trimmedText, platform, tool);
        setResult(verified);
        onVerified(verified);
      }
    } catch (err) {
      console.log('Clipboard access denied');
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setInput('');
    setResult(null);
    onClose();
  };

  // Auto-close modal 1 second after successful verification
  useEffect(() => {
    if (result === true) {
      const timer = setTimeout(() => {
        handleClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Verify ${toolName}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Instructions */}
        <p className="text-sm text-gray-400">
          {isEasyMode
            ? `Run this command in your terminal to check if ${toolName} is installed, then paste the result below.`
            : `Verify ${toolName} installation.`}
        </p>

        {/* Command to run */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">
            {isEasyMode ? '1. Copy and run this command:' : 'Run:'}
          </p>
          <CodeBlock code={command} className="text-xs" />
        </div>

        {/* Input */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">
            {isEasyMode ? '2. Paste the output here:' : 'Output:'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setResult(null); // Reset result when input changes
              }}
              placeholder={hint}
              className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePaste}
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Result */}
        {result !== null && (
          <div
            className={`
              flex items-center gap-2 p-3 rounded-lg border
              ${result
                ? 'bg-success/10 border-success/30 text-success'
                : 'bg-warning/10 border-warning/30 text-warning'
              }
            `}
          >
            {result ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">
              {toolName}: {result ? 'Installed' : 'Not found'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
          >
            {result !== null ? 'Done' : 'Cancel'}
          </Button>
          {result === null && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleVerify}
              disabled={!input.trim()}
            >
              Verify
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
