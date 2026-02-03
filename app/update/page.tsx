'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdate } from '@/contexts/UpdateContext';
import { Platform, PLATFORM_LABELS } from '@/types/wizard';
import PageContainer from '@/components/layout/PageContainer';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import HisePathDetector from '@/components/wizard/HisePathDetector';
import MigrationWarning from '@/components/wizard/MigrationWarning';
import Button from '@/components/ui/Button';
import SectionBadge from '@/components/ui/SectionBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ArrowRight, Monitor, Apple, Terminal, GitBranch, HardDrive, Cpu } from 'lucide-react';
import { useExplanation } from '@/hooks/useExplanation';
import { updatePage, migrationPage } from '@/lib/content/explanations';
import { detectPlatform } from '@/lib/utils/platform';

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
    setKeepBackup,
    setCustomBinaryFolder,
    canGenerate,
  } = useUpdate();
  const { get } = useExplanation();
  
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>(null);
  
  // Auto-detect platform on mount (redundant with context but ensures consistency)
  useEffect(() => {
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
  
  // Check if we're in migration mode (invalid detection status)
  const isMigrationMode = state.detectionStatus === 'invalid' && state.migrationMode;
  
  return (
    <PageContainer>
      <PhaseStepper currentPhase={0} mode="update" className="mb-8" />
      
      <Card>
        <CardHeader>
          <CardTitle>
            {isMigrationMode ? get(migrationPage.title) : get(updatePage.title)}
          </CardTitle>
          <CardDescription>
            {isMigrationMode ? get(migrationPage.description) : get(updatePage.description)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Platform Display */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <SectionBadge number={1} />
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
              <SectionBadge number={2} />
              HISE Installation
            </h3>
            
            <HisePathDetector
              platform={state.platform}
              onDetectionResult={applyDetectionResult}
              onCustomBinaryFolderChange={setCustomBinaryFolder}
              detectionStatus={state.detectionStatus}
              detectedPath={state.hisePath}
              hasFaust={state.hasFaust}
              customBinaryFolder={state.customBinaryFolder}
            />
          </div>
          
          {/* Migration Panel - shown when status is invalid */}
          {isMigrationMode && (
            <>
              <hr className="border-border" />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <SectionBadge number={3} />
                  <GitBranch className="w-4 h-4" />
                  Migration Options
                </h3>
                
                {/* Warning about losing changes */}
                <MigrationWarning />
                
                {/* Detected configuration display */}
                <div className="border border-border rounded-lg p-4 bg-surface/50">
                  <p className="text-sm text-gray-400 mb-3">
                    {get(migrationPage.detectedConfig)}
                  </p>
                  
                  <div className="space-y-2">
                    {/* Path */}
                    <div className="flex items-center gap-2 text-sm">
                      <HardDrive className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Path:</span>
                      <span className="font-mono text-gray-300 truncate" title={state.hisePath}>
                        {state.hisePath}
                      </span>
                    </div>
                    
                    {/* Build type */}
                    <div className="flex items-center gap-2 text-sm">
                      <GitBranch className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Build type:</span>
                      <span className="text-gray-300">
                        {state.hasFaust ? 'Release with Faust' : 'Release'}
                      </span>
                    </div>
                    
                    {/* Architecture */}
                    <div className="flex items-center gap-2 text-sm">
                      <Cpu className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Architecture:</span>
                      <span className="text-gray-300">
                        {state.architecture === 'arm64' ? 'ARM64 (Apple Silicon)' : 'x64'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Backup option */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface/50 transition-colors">
                    <input
                      type="radio"
                      name="backupOption"
                      checked={state.keepBackup}
                      onChange={() => setKeepBackup(true)}
                      className="mt-1 accent-accent"
                    />
                    <div>
                      <p className="font-medium text-gray-300">
                        {get(migrationPage.backupOption)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended - allows you to recover if something goes wrong
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface/50 transition-colors">
                    <input
                      type="radio"
                      name="backupOption"
                      checked={!state.keepBackup}
                      onChange={() => setKeepBackup(false)}
                      className="mt-1 accent-accent"
                    />
                    <div>
                      <p className="font-medium text-gray-300">
                        {get(migrationPage.deleteOption)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Saves ~2GB disk space but cannot be undone
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}
          
          {/* Architecture display for macOS (valid detection only) */}
          {state.platform === 'macos' && state.detectionStatus === 'valid' && state.architecture && (
            <>
              <hr className="border-border" />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <SectionBadge number={3} />
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
          {isMigrationMode ? get(migrationPage.proceedButton) : 'Generate Update Script'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </PageContainer>
  );
}
