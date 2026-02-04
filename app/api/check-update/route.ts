import { NextRequest, NextResponse } from 'next/server';
import { fetchCIStatus, CIStatus } from '@/lib/github';

// Response types
interface CheckUpdateSuccessResponse {
  updateAvailable: boolean;
  updateUrl: string;
}

interface CheckUpdateErrorResponse {
  error: true;
  message: string;
}

type CheckUpdateResponse = CheckUpdateSuccessResponse | CheckUpdateErrorResponse;

// In-memory cache for CI status (shared with check-ci-status route concept)
let cache: {
  data: CIStatus | null;
  fetchedAt: number;
} = { data: null, fetchedAt: 0 };

// Cache TTL: 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * GET /api/check-update
 * 
 * Query parameters:
 * - path: URL-encoded HISE source folder path (required)
 * - status: 'valid' | 'invalid' - whether .git folder exists (required)
 * - faust: '1' | '0' - whether Faust is enabled (optional, default '0')
 * - arch: 'x64' | 'arm64' - architecture (optional, default 'x64')
 * - commit: SHA hash of current build (required)
 * 
 * Returns:
 * - updateAvailable: boolean
 * - updateUrl: string (empty if no update available)
 */
export async function GET(request: NextRequest): Promise<NextResponse<CheckUpdateResponse>> {
  const searchParams = request.nextUrl.searchParams;
  
  // Parse required parameters
  const path = searchParams.get('path');
  const status = searchParams.get('status');
  const commit = searchParams.get('commit');
  
  // Parse optional parameters with defaults
  const faust = searchParams.get('faust') || '0';
  const arch = searchParams.get('arch') || 'x64';
  
  // Validate required parameters
  if (!path || !status || !commit) {
    return NextResponse.json(
      {
        error: true,
        message: 'Missing required parameters: path, status, and commit are required',
      },
      { status: 400 }
    );
  }
  
  // Validate status value
  if (status !== 'valid' && status !== 'invalid') {
    return NextResponse.json(
      {
        error: true,
        message: 'Invalid status parameter: must be "valid" or "invalid"',
      },
      { status: 400 }
    );
  }
  
  // Validate arch value
  if (arch !== 'x64' && arch !== 'arm64') {
    return NextResponse.json(
      {
        error: true,
        message: 'Invalid arch parameter: must be "x64" or "arm64"',
      },
      { status: 400 }
    );
  }
  
  try {
    // Fetch CI status (with caching)
    const now = Date.now();
    let ciStatus: CIStatus;
    
    if (cache.data && (now - cache.fetchedAt) < CACHE_TTL_MS) {
      ciStatus = cache.data;
    } else {
      ciStatus = await fetchCIStatus();
      cache = { data: ciStatus, fetchedAt: now };
    }
    
    // Determine the target commit (latest passing)
    // If latest is passing, use its parent SHA; otherwise use lastPassingCommit's parent SHA
    let targetParentSha: string | undefined;
    let targetCommitSha: string | undefined;
    
    if (ciStatus.isLatestPassing) {
      targetParentSha = ciStatus.latestCommit.parentSha;
      targetCommitSha = ciStatus.latestCommit.sha;
    } else if (ciStatus.lastPassingCommit) {
      targetParentSha = ciStatus.lastPassingCommit.parentSha;
      targetCommitSha = ciStatus.lastPassingCommit.sha;
    }
    
    // Compare user's commit with the target's parent SHA
    // HISE bakes in HEAD~1 at build time, so we compare against the parent
    const userCommitNormalized = commit.toLowerCase().trim();
    const targetParentNormalized = targetParentSha?.toLowerCase();
    
    // Check if update is available
    // Update is available if:
    // 1. We have a target commit
    // 2. User's commit doesn't match the target's parent (meaning they're not on the latest)
    const updateAvailable = !!(
      targetParentSha && 
      targetCommitSha &&
      userCommitNormalized !== targetParentNormalized &&
      !targetParentNormalized?.startsWith(userCommitNormalized) &&
      !userCommitNormalized.startsWith(targetParentNormalized || '')
    );
    
    if (!updateAvailable) {
      return NextResponse.json({
        updateAvailable: false,
        updateUrl: '',
      });
    }
    
    // Build the update URL with all parameters
    const updateParams = new URLSearchParams({
      path: path,
      status: status,
      faust: faust,
      arch: arch,
      commit: commit,
      target: targetCommitSha!, // Safe: we checked updateAvailable which requires targetCommitSha
    });
    
    const updateUrl = `/update/auto?${updateParams.toString()}`;
    
    return NextResponse.json({
      updateAvailable: true,
      updateUrl: updateUrl,
    });
    
  } catch (error) {
    console.error('Failed to check for updates:', error);
    
    return NextResponse.json(
      {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to check for updates',
      },
      { status: 500 }
    );
  }
}
