'use client';

import { ChangeEvent } from 'react';
import { AlertTriangle, GitCommit, Clock, ExternalLink } from 'lucide-react';
import { CIStatus } from '@/lib/github';
import Checkbox from '@/components/ui/Checkbox';

interface CIStatusAlertProps {
  ciStatus: CIStatus;
  useLatestOverride: boolean;
  onOverrideChange: (checked: boolean) => void;
  isEasyMode?: boolean;
}

/**
 * Wrapper to convert React onChange event to boolean
 */
function handleCheckboxChange(
  onChange: (checked: boolean) => void
): (e: ChangeEvent<HTMLInputElement>) => void {
  return (e) => onChange(e.target.checked);
}

/**
 * Format a date string to a human-readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format days behind into a human-readable string
 */
function formatDaysBehind(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return '1 month ago';
  return `${Math.floor(days / 30)} months ago`;
}

export default function CIStatusAlert({
  ciStatus,
  useLatestOverride,
  onOverrideChange,
  isEasyMode = false,
}: CIStatusAlertProps) {
  // Don't render if CI is passing
  if (ciStatus.isLatestPassing) {
    return null;
  }

  const { latestCommit, lastPassingCommit, isStale, daysBehind } = ciStatus;
  const hasPassingCommit = lastPassingCommit !== null;

  return (
    <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-yellow-500">CI Build Failing</h4>
          <p className="text-sm text-gray-300 mt-1">
            {hasPassingCommit
              ? (isEasyMode 
                  ? 'The CI build is currently failing on the latest commit. For a stable experience, this script will use the last known working commit instead.'
                  : 'CI failing on latest. Using last passing commit.')
              : (isEasyMode
                  ? 'The CI build is currently failing and no recent passing builds were found. The build may fail.'
                  : 'CI failing. No recent passing builds found.')}
          </p>
        </div>
      </div>

      {/* Commit comparison */}
      {hasPassingCommit && (
        <div className="bg-background/50 rounded-md p-3 space-y-2 text-sm font-mono">
          {/* Latest commit (failing) */}
          <div className="flex items-start gap-2">
            <GitCommit className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-gray-500">Latest: </span>
              <span className="text-red-400">{latestCommit.shortSha}</span>
              <span className="text-gray-500"> ({formatDate(latestCommit.date)}) </span>
              <span className="text-gray-400 truncate block">"{latestCommit.message}"</span>
            </div>
          </div>

          {/* Passing commit (using) */}
          <div className="flex items-start gap-2">
            <GitCommit className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-gray-500">Using: </span>
              <span className="text-green-400">{lastPassingCommit.shortSha}</span>
              <span className="text-gray-500"> ({formatDate(lastPassingCommit.date)}) </span>
              <span className="text-gray-400 truncate block">"{lastPassingCommit.message}"</span>
            </div>
          </div>

          {/* Time indicator */}
          <div className="flex items-center gap-2 text-gray-500 pt-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">
              Last working commit is {formatDaysBehind(daysBehind)}
            </span>
          </div>
        </div>
      )}

      {/* Stale warning */}
      {isStale && hasPassingCommit && (
        <div className="flex items-start gap-2 text-sm text-yellow-400 bg-yellow-900/30 rounded-md p-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            The last working commit is over 30 days old. Consider checking the{' '}
            <a
              href="https://forum.hise.audio"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-yellow-300 inline-flex items-center gap-1"
            >
              HISE forum
              <ExternalLink className="w-3 h-3" />
            </a>{' '}
            for updates.
          </span>
        </div>
      )}

      {/* No passing commit warning */}
      {!hasPassingCommit && (
        <div className="flex items-start gap-2 text-sm text-red-400 bg-red-900/30 rounded-md p-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            No passing builds found in recent history. Check the{' '}
            <a
              href="https://github.com/christophhart/HISE/actions"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-red-300 inline-flex items-center gap-1"
            >
              GitHub Actions page
              <ExternalLink className="w-3 h-3" />
            </a>{' '}
            for current status.
          </span>
        </div>
      )}

      {/* Override checkbox - only shown in dev mode */}
      {hasPassingCommit && !isEasyMode && (
        <div className="pt-2 border-t border-yellow-600/30">
          <Checkbox
            id="use-latest-override"
            checked={useLatestOverride}
            onChange={handleCheckboxChange(onOverrideChange)}
            label="Use latest commit anyway (advanced users only)"
          />
        </div>
      )}
    </div>
  );
}
