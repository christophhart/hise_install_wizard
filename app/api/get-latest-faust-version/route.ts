import { NextResponse } from 'next/server';
import { fetchLatestFaustVersion, FaustVersionResponse } from '@/lib/github';

// In-memory cache for Faust version
let cache: {
  version: string | null;
  fetchedAt: number;
} = { version: null, fetchedAt: 0 };

// Cache TTL: 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;

// Hardcoded fallback if GitHub is unreachable
const FALLBACK_VERSION = '2.75.7';

export async function GET(): Promise<NextResponse<FaustVersionResponse>> {
  const now = Date.now();
  
  // Return cached data if fresh
  if (cache.version && (now - cache.fetchedAt) < CACHE_TTL_MS) {
    return NextResponse.json({
      status: 'ok',
      version: cache.version,
    });
  }
  
  // Fetch fresh data from GitHub
  try {
    const version = await fetchLatestFaustVersion();
    cache = { version, fetchedAt: now };
    
    return NextResponse.json({
      status: 'ok',
      version,
    });
  } catch (error) {
    console.error('Failed to fetch Faust version:', error);
    
    // If we have stale cache, return it with a warning
    if (cache.version) {
      return NextResponse.json({
        status: 'ok',
        version: cache.version,
        warning: 'Using cached version (GitHub API unavailable)',
      });
    }
    
    // No cache available, return fallback
    return NextResponse.json({
      status: 'ok',
      version: FALLBACK_VERSION,
      warning: `Using fallback version ${FALLBACK_VERSION} (GitHub API unavailable)`,
    });
  }
}
