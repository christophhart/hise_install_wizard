// GitHub API utilities for checking HISE CI status

const HISE_REPO = 'christophhart/HISE';
const BRANCH = 'develop';
const API_BASE = 'https://api.github.com';
const STALE_THRESHOLD_DAYS = 30;
const CI_WORKFLOW_ID = 39324714; // "CI Build" workflow

// Types for GitHub Actions API response
interface GitHubWorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | 'neutral' | null;
  created_at: string;
  updated_at: string;
  head_commit: {
    id: string;
    message: string;
    timestamp: string;
  };
}

interface GitHubActionsResponse {
  total_count: number;
  workflow_runs: GitHubWorkflowRun[];
}

// Our CI status types
export interface CICommitInfo {
  sha: string;
  shortSha: string;
  message: string;
  date: string;
}

export interface CIStatus {
  latestCommit: CICommitInfo & {
    conclusion: 'success' | 'failure' | 'pending' | 'unknown';
  };
  lastPassingCommit: CICommitInfo | null;
  isLatestPassing: boolean;
  isStale: boolean;
  daysBehind: number;
  checkedAt: string;
}

export interface CIStatusResponse {
  status: 'ok' | 'error';
  data?: CIStatus;
  warning?: string;
  message?: string;
}

/**
 * Calculate the number of days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Truncate a commit message to a reasonable length
 */
function truncateMessage(message: string, maxLength: number = 50): string {
  const firstLine = message.split('\n')[0];
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.substring(0, maxLength - 3) + '...';
}

/**
 * Map GitHub conclusion to our simplified status
 */
function mapConclusion(
  status: GitHubWorkflowRun['status'],
  conclusion: GitHubWorkflowRun['conclusion']
): 'success' | 'failure' | 'pending' | 'unknown' {
  if (status !== 'completed') return 'pending';
  if (conclusion === 'success') return 'success';
  if (conclusion === 'failure') return 'failure';
  return 'unknown';
}

/**
 * Fetch CI status from GitHub Actions API
 */
// ============================================
// Faust Version Fetching
// ============================================

export interface FaustVersionResponse {
  status: 'ok' | 'error';
  version?: string;
  warning?: string;
  message?: string;
}

const FAUST_REPO = 'grame-cncm/faust';

/**
 * Fetch the latest Faust release version from GitHub
 */
export async function fetchLatestFaustVersion(): Promise<string> {
  const url = `${API_BASE}/repos/${FAUST_REPO}/releases/latest`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'HISE-Setup-Wizard',
    },
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Tag name is like "2.75.7" or "v2.75.7"
  const tagName = data.tag_name as string;
  return tagName.replace(/^v/, ''); // Remove leading 'v' if present
}

// ============================================
// CI Status Fetching
// ============================================

export async function fetchCIStatus(): Promise<CIStatus> {
  // Fetch recent workflow runs for the develop branch (filtered to CI Build workflow only)
  const runsUrl = `${API_BASE}/repos/${HISE_REPO}/actions/workflows/${CI_WORKFLOW_ID}/runs?branch=${BRANCH}&per_page=50`;
  
  const response = await fetch(runsUrl, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'HISE-Setup-Wizard',
    },
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  const data: GitHubActionsResponse = await response.json();
  
  if (data.workflow_runs.length === 0) {
    throw new Error('No workflow runs found for develop branch');
  }
  
  // Get the latest run
  const latestRun = data.workflow_runs[0];
  const latestConclusion = mapConclusion(latestRun.status, latestRun.conclusion);
  
  const latestCommit: CIStatus['latestCommit'] = {
    sha: latestRun.head_sha,
    shortSha: latestRun.head_sha.substring(0, 7),
    message: truncateMessage(latestRun.head_commit.message),
    date: latestRun.created_at,
    conclusion: latestConclusion,
  };
  
  // If latest is passing, we're done
  if (latestConclusion === 'success') {
    return {
      latestCommit,
      lastPassingCommit: null,
      isLatestPassing: true,
      isStale: false,
      daysBehind: 0,
      checkedAt: new Date().toISOString(),
    };
  }
  
  // Find the most recent passing commit
  const passingRun = data.workflow_runs.find(
    run => run.status === 'completed' && run.conclusion === 'success'
  );
  
  if (!passingRun) {
    // No passing commits found in recent history
    return {
      latestCommit,
      lastPassingCommit: null,
      isLatestPassing: false,
      isStale: true,
      daysBehind: -1, // Indicates no passing commit found
      checkedAt: new Date().toISOString(),
    };
  }
  
  const lastPassingCommit: CICommitInfo = {
    sha: passingRun.head_sha,
    shortSha: passingRun.head_sha.substring(0, 7),
    message: truncateMessage(passingRun.head_commit.message),
    date: passingRun.created_at,
  };
  
  const daysBehind = daysBetween(
    new Date(passingRun.created_at),
    new Date(latestRun.created_at)
  );
  
  const isStale = daysBehind >= STALE_THRESHOLD_DAYS;
  
  return {
    latestCommit,
    lastPassingCommit,
    isLatestPassing: false,
    isStale,
    daysBehind,
    checkedAt: new Date().toISOString(),
  };
}
