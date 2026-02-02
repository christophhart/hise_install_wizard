'use client';

import { useState, useMemo } from 'react';
import { Copy, Check, Download, ChevronDown, ChevronUp } from 'lucide-react';

interface ScriptPreviewProps {
  script: string;
  filename: string;
  className?: string;
}

// Simple syntax highlighter for bash/PowerShell
function highlightLine(line: string, isPowerShell: boolean): React.ReactNode {
  // Skip empty lines
  if (!line.trim()) return line;
  
  // Comments
  if (line.trim().startsWith('#')) {
    return <span className="text-gray-500 italic">{line}</span>;
  }
  
  // PowerShell specific
  if (isPowerShell) {
    // Variables like $HISE_PATH
    let result = line;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Match PowerShell patterns
    const patterns = [
      { regex: /(\$[\w]+)/g, className: 'text-orange-400' }, // Variables
      { regex: /(".*?")/g, className: 'text-green-400' }, // Strings
      { regex: /\b(if|else|elseif|foreach|for|while|function|param|return|try|catch|finally)\b/g, className: 'text-purple-400' }, // Keywords
      { regex: /\b(Write-Host|Write-Phase|Write-Step|Write-Success|Write-Warn|Write-Err|Test-Path|Get-Command|Get-Item|Set-Location|New-Item|Invoke-WebRequest|Start-Process|Expand-Archive)\b/g, className: 'text-blue-400' }, // Cmdlets
      { regex: /(-\w+)/g, className: 'text-cyan-400' }, // Parameters
    ];
    
    // Apply patterns sequentially (simple approach)
    for (const { regex, className } of patterns) {
      result = result.replace(regex, `<span class="${className}">$1</span>`);
    }
    
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  }
  
  // Bash specific
  let result = line;
  
  // Apply patterns
  const patterns = [
    { regex: /(\$[\w{}]+|\$\([^)]+\))/g, className: 'text-orange-400' }, // Variables
    { regex: /(".*?"|'.*?')/g, className: 'text-green-400' }, // Strings
    { regex: /\b(if|then|else|elif|fi|for|do|done|while|case|esac|function)\b/g, className: 'text-purple-400' }, // Keywords
    { regex: /\b(echo|cd|mkdir|git|make|xcodebuild|sed|test|chmod|source|export|sudo|apt-get|unzip|curl)\b/g, className: 'text-blue-400' }, // Commands
    { regex: /(--?[\w-]+)/g, className: 'text-cyan-400' }, // Flags
  ];
  
  for (const { regex, className } of patterns) {
    result = result.replace(regex, `<span class="${className}">$1</span>`);
  }
  
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}

export default function ScriptPreview({ script, filename, className = '' }: ScriptPreviewProps) {
  const [copied, setCopied] = useState(false);
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
      content: highlightLine(line, isPowerShell),
    }));
  }, [previewLines, isPowerShell]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            onClick={handleCopy}
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
