'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CommandBlockProps {
  command: string;
}

export default function CommandBlock({ command }: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">Terminal Command</h4>
        <button
           onClick={handleCopy}
           className="px-3 py-1 bg-surface hover:bg-gray-700 text-sm border border-border flex items-center gap-1"
           style={{ borderRadius: '3px' }}
         >
          {copied ? (
            <>
              <Check size={16} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="p-4 font-mono text-sm overflow-x-auto border border-border" style={{ backgroundColor: '#111', color: '#999', borderRadius: '3px' }}>
        {command}
      </div>
    </div>
  );
}
