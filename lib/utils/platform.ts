import { Platform } from '@/types/wizard';

/**
 * Detects the current platform based on the browser's user agent.
 * Returns null if detection fails or if running on server.
 */
export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null;
  
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('linux')) return 'linux';
  return null;
}
