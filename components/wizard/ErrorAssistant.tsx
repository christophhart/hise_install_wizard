'use client';

import { useState } from 'react';

interface ErrorAssistantProps {
  onRetry: () => void;
}

interface MockErrorAnalysis {
  cause: string;
  fixCommands: string[];
  severity: 'low' | 'medium' | 'high';
}

export default function ErrorAssistant({ onRetry }: ErrorAssistantProps) {
  const [errorOutput, setErrorOutput] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [mockAnalysis, setMockAnalysis] = useState<MockErrorAnalysis | null>(null);

  const handleAnalyze = () => {
    const analyses: MockErrorAnalysis[] = [
      {
        cause: 'Git is not installed on your system',
        fixCommands: ['winget install Git.Git', 'git --version'],
        severity: 'high',
      },
      {
        cause: 'Visual Studio 2026 is not found',
        fixCommands: ['Download and install from: https://visualstudio.microsoft.com/downloads/'],
        severity: 'high',
      },
      {
        cause: 'Insufficient disk space',
        fixCommands: ['Free up at least 5GB of space on your installation drive'],
        severity: 'medium',
      },
    ];

    const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
    setMockAnalysis(randomAnalysis);
    setShowAnalysis(true);
  };

  const handleCloseAnalysis = () => {
    setShowAnalysis(false);
    setErrorOutput('');
  };

  return (
    <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded">
      <h4 className="font-medium text-yellow-300 mb-2">Error Detected</h4>
      
      {!showAnalysis ? (
        <>
          <textarea
            value={errorOutput}
            onChange={(e) => setErrorOutput(e.target.value)}
            placeholder="Paste the error output from your terminal here..."
            className="w-full p-3 border rounded mb-3 min-h-32 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAnalyze}
              disabled={!errorOutput.trim()}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Analyze Error
            </button>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Retry
            </button>
          </div>
        </>
      ) : (
        <div>
          <div className="bg-gray-800 p-4 rounded border border-gray-700 mb-3">
            <h5 className="font-semibold mb-2">Error Analysis</h5>
            {mockAnalysis && (
              <>
                <p className="mb-2">
                  <strong>Root Cause:</strong> {mockAnalysis.cause}
                </p>
                <p className="mb-2">
                  <strong>Severity:</strong>{' '}
                  <span
                    className={
                      mockAnalysis.severity === 'high'
                        ? 'text-red-400'
                        : mockAnalysis.severity === 'medium'
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }
                  >
                    {mockAnalysis.severity.toUpperCase()}
                  </span>
                </p>
                <div className="mb-2">
                  <strong>Fix Commands:</strong>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    {mockAnalysis.fixCommands.map((cmd, idx) => (
                      <li key={idx} className="font-mono text-sm bg-gray-700 p-1 rounded">
                        {cmd}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCloseAnalysis}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Close
            </button>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Try Fix & Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
