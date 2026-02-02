'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export default function CodeBlock({ 
  code, 
  language = 'bash',
  filename,
  className = '' 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded border border-border overflow-hidden ${className}`}>
      {filename && (
        <div className="bg-surface px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm text-gray-400 font-mono">{filename}</span>
          <span className="text-xs text-gray-500 uppercase">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="bg-code-bg p-4 overflow-x-auto code-block">
          <code className="text-code-text text-sm font-mono whitespace-pre">
            {code}
          </code>
        </pre>
        <button
          onClick={handleCopy}
          className={`
            absolute top-2 right-2 p-2 rounded
            transition-colors duration-200
            ${copied 
              ? 'bg-success/20 text-success' 
              : 'bg-surface/80 text-gray-400 hover:text-white hover:bg-surface'
            }
          `}
          title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
