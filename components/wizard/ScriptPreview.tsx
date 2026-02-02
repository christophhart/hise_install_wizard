'use client';

import { useState, useMemo } from 'react';
import { Copy, Check, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { downloadAsFile } from '@/lib/utils/download';

interface ScriptPreviewProps {
  script: string;
  filename: string;
  className?: string;
}

// Minimal syntax highlighting - just comments for readability
function highlightLine(line: string): React.ReactNode {
  // Skip empty lines
  if (!line.trim()) return line;
  
  // Comments (both # and REM for batch)
  if (line.trim().startsWith('#') || line.trim().toLowerCase().startsWith('rem ')) {
    return <span className="text-gray-500 italic">{line}</span>;
  }
  
  // Section headers (lines that are just ===== or -----)
  if (/^[=\-]{10,}$/.test(line.trim())) {
    return <span className="text-gray-600">{line}</span>;
  }
  
  // Regular code - no highlighting, just clean text
  return line;
}

export default function ScriptPreview({ script, filename, className = '' }: ScriptPreviewProps) {
  const { copied, copy } = useClipboard();
  const [expanded, setExpanded] = useState(false);
  
  const isPowerShell = filename.endsWith('.ps1');
  const lines = script.split('\n');
  const previewLines = expanded ? lines : lines.slice(0, 30);
  const hasMore = lines.length > 30;

  // Memoize highlighted lines
  const highlightedLines = useMemo(() => {
    return previewLines.map((line, i) => ({
      key: i,
      lineNum: i + 1,
      content: highlightLine(line),
    }));
  }, [previewLines]);

  const handleDownload = () => {
    downloadAsFile(script, filename);
  };

  return (
    <div className={`rounded border border-border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-surface px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 font-mono">{filename}</span>
          <span className="text-xs bg-code-bg text-gray-500 px-2 py-0.5 rounded">
            {isPowerShell ? 'PowerShell' : 'Bash'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => copy(script)}
            className={`
              p-2 rounded transition-colors duration-200
              ${copied 
                ? 'bg-success/20 text-success' 
                : 'text-gray-400 hover:text-white hover:bg-code-bg'
              }
            `}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded text-gray-400 hover:text-accent hover:bg-code-bg transition-colors duration-200"
            title="Download script"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Code */}
      <div className="relative">
        <pre className="bg-code-bg p-4 overflow-x-auto code-block max-h-[500px] overflow-y-auto">
          <code className="text-code-text text-sm font-mono">
            {highlightedLines.map(({ key, lineNum, content }) => (
              <div key={key} className="flex hover:bg-white/5">
                <span className="text-gray-600 select-none w-12 text-right pr-4 flex-shrink-0 border-r border-border/50 mr-4">
                  {lineNum}
                </span>
                <span className="whitespace-pre">{content}</span>
              </div>
            ))}
            {!expanded && hasMore && (
              <div className="text-gray-500 italic mt-2 pl-16">
                ... {lines.length - 30} more lines
              </div>
            )}
          </code>
        </pre>
      </div>
      
      {/* Expand/Collapse */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full bg-surface border-t border-border px-4 py-2 text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
        >
          {expanded ? (
            <>Show less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Show all {lines.length} lines <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
}
