'use client';

import { useState } from 'react';

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
          className="px-3 py-1 bg-surface hover:bg-gray-700 rounded text-sm border border-border"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="bg-background text-accent p-4 rounded font-mono text-sm overflow-x-auto border border-border">
        {command}
      </div>
    </div>
  );
}
