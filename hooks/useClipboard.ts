'use client';

import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  /** Duration in ms before copied state resets (default: 2000) */
  timeout?: number;
}

interface UseClipboardReturn {
  /** Whether content was recently copied */
  copied: boolean;
  /** Copy text to clipboard */
  copy: (text: string) => Promise<void>;
}

/**
 * Hook for clipboard operations with visual feedback.
 * Handles the copied state automatically with a configurable timeout.
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000 } = options;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [timeout]);

  return { copied, copy };
}
