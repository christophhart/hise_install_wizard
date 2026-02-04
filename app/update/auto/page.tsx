'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUpdate } from '@/contexts/UpdateContext';
import { DetectionResult, Architecture } from '@/types/wizard';
import PageContainer from '@/components/layout/PageContainer';

/**
 * /update/auto - Auto-redirect page for HISE update wizard
 * 
 * This page receives URL parameters from HISE's "Check for Updates" feature,
 * populates the UpdateContext with the detection result, and redirects to
 * the generate page.
 * 
 * Expected URL parameters:
 * - path: HISE source folder path (URL-encoded)
 * - status: 'valid' | 'invalid' - whether .git folder exists
 * - faust: '1' | '0' - whether Faust is enabled
 * - arch: 'x64' | 'arm64' - architecture
 * - commit: Current build's commit hash
 * - target: Target commit SHA to update to (from CI status check)
 */

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </PageContainer>
  );
}

// Inner component that uses useSearchParams
function UpdateAutoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applyDetectionResult } = useUpdate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL parameters
    const path = searchParams.get('path');
    const status = searchParams.get('status');
    const faust = searchParams.get('faust');
    const arch = searchParams.get('arch');
    const commit = searchParams.get('commit');
    const target = searchParams.get('target');

    // Validate required parameters
    if (!path || !status) {
      setError('Missing required parameters. Please use the normal update flow.');
      return;
    }

    // Validate status value
    if (status !== 'valid' && status !== 'invalid') {
      setError('Invalid status parameter. Please use the normal update flow.');
      return;
    }

    // Build detection result
    const detectionResult: DetectionResult = {
      path: decodeURIComponent(path),
      status: status as 'valid' | 'invalid',
      hasFaust: faust === '1',
      architecture: (arch === 'arm64' ? 'arm64' : 'x64') as Architecture,
      commitHash: commit || undefined,
    };

    // Apply detection result to context
    applyDetectionResult(detectionResult);

    // Store target commit in sessionStorage for the generate page to use
    if (target) {
      sessionStorage.setItem('hise_update_target_commit', target);
    }

    // Redirect to generate page
    router.replace('/update/generate');
  }, [searchParams, applyDetectionResult, router]);

  // Show error if parameters are invalid
  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-red-500 text-lg font-medium">Error</div>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => router.push('/update')}
            className="text-accent hover:underline"
          >
            Go to manual update page
          </button>
        </div>
      </PageContainer>
    );
  }

  // Show loading state while processing
  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <p className="text-gray-400">Preparing update wizard...</p>
      </div>
    </PageContainer>
  );
}

// Main page component with Suspense boundary
export default function UpdateAutoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UpdateAutoContent />
    </Suspense>
  );
}
