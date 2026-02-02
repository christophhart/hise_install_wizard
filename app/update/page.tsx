'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdate } from '@/contexts/UpdateContext';
import { Platform, PLATFORM_LABELS } from '@/types/wizard';
import PageContainer from '@/components/layout/PageContainer';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import HisePathDetector from '@/components/wizard/HisePathDetector';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ArrowRight, Monitor, Apple, Terminal } from 'lucide-react';
import { useExplanation } from '@/hooks/useExplanation';
import { updatePage } from '@/lib/content/explanations';

// Platform icons
const PlatformIcon = ({ platform }: { platform: Exclude<Platform, null> }) => {
  switch (platform) {
    case 'windows':
      return <Monitor className="w-5 h-5" />;
    case 'macos':
      return <Apple className="w-5 h-5" />;
    case 'linux':
      return <Terminal className="w-5 h-5" />;
  }
};

export default function UpdatePage() {
  const router = useRouter();
  const { 
    state, 
    applyDetectionResult,
    canGenerate,
  } = useUpdate();
  const { get } = useExplanation();
  
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>(null);
  
  // Auto-detect platform on mount (redundant with context but ensures consistency)
  useEffect(() => {
    const detectPlatform = (): Platform => {
      if (typeof navigator === 'undefined') return null;
      
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('win')) return 'windows';
      if (userAgent.includes('mac')) return 'macos';
      if (userAgent.includes('linux')) return 'linux';
      return null;
    };
    
    setDetectedPlatform(detectPlatform());
  }, []);
  
  const handleGenerate = () => {
    router.push('/update/generate');
  };
  
  // Wait for platform detection
  if (!state.platform) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <span className="text-gray-400">Detecting platform...</span>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PhaseStepper currentPhase={0} mode="update" className="mb-8" />
      
      <Card>
        <CardHeader>
          <CardTitle>{get(updatePage.title)}</CardTitle>
          <CardDescription>
            {get(updatePage.description)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Platform Display */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent text-background text-xs font-bold flex items-center justify-center">1</span>
              Platform
            </h3>
            
            <div className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <PlatformIcon platform={state.platform} />
              </div>
              <div>
                <p className="font-medium">{PLATFORM_LABELS[state.platform]}</p>
                <p className="text-xs text-gray-500">
                  {detectedPlatform === state.platform ? 'Auto-detected' : 'Selected'}
                </p>
              </div>
            </div>
          </div>
          
          <hr className="border-border" />
          
          {/* HISE Path Detection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent text-background text-xs font-bold flex items-center justify-center">2</span>
              HISE Installation
            </h3>
            
            <HisePathDetector
              platform={state.platform}
              onDetectionResult={applyDetectionResult}
              detectionStatus={state.detectionStatus}
              detectedPath={state.hisePath}
              hasFaust={state.hasFaust}
            />
          </div>
          
          {/* Architecture display for macOS */}
          {state.platform === 'macos' && state.detectionStatus === 'valid' && state.architecture && (
            <>
              <hr className="border-border" />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-background text-xs font-bold flex items-center justify-center">3</span>
                  Architecture
                </h3>
                
                <div className="p-4 bg-background border border-border rounded-lg">
                  <p className="font-medium">
                    {state.architecture === 'arm64' ? 'Apple Silicon (ARM64)' : 'Intel (x64)'}
                  </p>
                  <p className="text-xs text-gray-500">Auto-detected from system</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-end mt-6">
        <Button 
          onClick={handleGenerate}
          disabled={!canGenerate}
          size="lg"
        >
          Generate Update Script
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </PageContainer>
  );
}
