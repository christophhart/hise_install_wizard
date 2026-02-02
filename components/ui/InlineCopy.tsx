'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface InlineCopyProps {
  text: string;
  className?: string;
}

export default function InlineCopy({ text, className = '' }: InlineCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <code className="flex-1 bg-background px-3 py-2 rounded text-accent text-sm font-mono">
        {text}
      </code>
      <button
        onClick={handleCopy}
        className={`
          p-2 rounded transition-all duration-200
          ${copied 
            ? 'bg-success/20 text-success' 
            : 'bg-surface/50 text-gray-500 hover:text-white hover:bg-surface opacity-0 group-hover:opacity-100'
          }
        `}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
