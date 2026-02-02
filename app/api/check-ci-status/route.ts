import { NextResponse } from 'next/server';
import { fetchCIStatus, CIStatus, CIStatusResponse } from '@/lib/github';

// In-memory cache for CI status
let cache: {
  data: CIStatus | null;
  fetchedAt: number;
} = { data: null, fetchedAt: 0 };

// Cache TTL: 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET(): Promise<NextResponse<CIStatusResponse>> {
  const now = Date.now();
  
  // Return cached data if fresh
  if (cache.data && (now - cache.fetchedAt) < CACHE_TTL_MS) {
    return NextResponse.json({
      status: 'ok',
      data: cache.data,
    });
  }
  
  // Fetch fresh data from GitHub
  try {
    const data = await fetchCIStatus();
    cache = { data, fetchedAt: now };
    
    return NextResponse.json({
      status: 'ok',
      data,
    });
  } catch (error) {
    console.error('Failed to fetch CI status:', error);
    
    // If we have stale cache, return it with a warning
    if (cache.data) {
      return NextResponse.json({
        status: 'ok',
        data: cache.data,
        warning: 'Using cached data (GitHub API unavailable)',
      });
    }
    
    // No cache available, return error
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch CI status from GitHub',
      },
      { status: 500 }
    );
  }
}
