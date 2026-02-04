'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNuke } from '@/contexts/NukeContext';
import { Platform, PLATFORM_LABELS, SETTINGS_PATHS, SHELL_CONFIG_FILES } from '@/types/wizard';
import PageContainer from '@/components/layout/PageContainer';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import HiseInstallationDetector from '@/components/wizard/HiseInstallationDetector';
import Button from '@/components/ui/Button';
import SectionBadge from '@/components/ui/SectionBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ArrowRight, Monitor, Apple, Terminal, AlertTriangle, Settings, Folder } from 'lucide-react';
import { useExplanation } from '@/hooks/useExplanation';
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

export default function NukePage() {
  const router = useRouter();
  const { 
    state, 
    setInstallations,
    setRemoveSettings,
    setRemovePathEntries,
    canGenerate,
    selectedInstallations,
  } = useNuke();
  const { mode } = useExplanation();
  
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>(null);
  
  // Auto-detect platform on mount
  useEffect(() => {
    setDetectedPlatform(detectPlatform());
  }, []);
  
  const handleGenerate = () => {
    router.push('/nuke/generate');
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
  
  const settingsPath = SETTINGS_PATHS[state.platform];
  const shellConfigs = SHELL_CONFIG_FILES[state.platform];
  
  return (
    <PageContainer>
      <PhaseStepper currentPhase={0} mode="nuke" className="mb-8" />
      
      {/* Warning Banner */}
      <div className="mb-6 p-4 border-2 border-error rounded-lg bg-error/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-error mb-1">Warning: Destructive Action</h3>
            <p className="text-sm text-gray-300">
              {mode === 'easy' 
                ? 'This action will permanently delete all HISE source code, compiled binaries, and settings from your system. This cannot be undone. Make sure you have backed up any custom scripts, projects, or modifications before proceeding.'
                : 'This will permanently delete all selected HISE files. Backup any custom work first.'}
            </p>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            Nuke HISE
          </CardTitle>
          <CardDescription>
            {mode === 'easy'
              ? 'Completely remove HISE and all related files from your system to start fresh'
              : 'Remove all HISE installations, settings, and PATH entries'}
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
          
          {/* HISE Installation Detection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <SectionBadge number={2} />
              HISE Installations
            </h3>
            
            <HiseInstallationDetector
              platform={state.platform}
              installations={state.installations}
              onInstallationsChange={setInstallations}
            />
          </div>
          
          {/* Additional Options */}
          {state.installations.length > 0 && (
            <>
              <hr className="border-border" />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <SectionBadge number={3} />
                  Additional Cleanup
                </h3>
                
                <div className="space-y-3">
                  {/* Remove Settings */}
                  <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={state.removeSettings}
                      onChange={(e) => setRemoveSettings(e.target.checked)}
                      className="mt-1 accent-error"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-300">Remove settings folder</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {settingsPath}
                      </p>
                      {mode === 'easy' && (
                        <p className="text-xs text-gray-600 mt-1">
                          Contains compiler settings and HISE configuration
                        </p>
                      )}
                    </div>
                  </label>
                  
                  {/* Remove PATH Entries */}
                  <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={state.removePathEntries}
                      onChange={(e) => setRemovePathEntries(e.target.checked)}
                      className="mt-1 accent-error"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-300">Clean PATH entries</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {state.platform === 'windows' 
                          ? 'User PATH environment variable'
                          : shellConfigs.join(', ')}
                      </p>
                      {mode === 'easy' && (
                        <p className="text-xs text-gray-600 mt-1">
                          Removes HISE from command-line access
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500">
          {selectedInstallations.length > 0 && (
            <span className="text-error">
              {selectedInstallations.length} installation{selectedInstallations.length !== 1 ? 's' : ''} will be removed
            </span>
          )}
        </div>
        <Button 
          onClick={handleGenerate}
          disabled={!canGenerate}
          size="lg"
          className="bg-error hover:bg-error/90 border-white/30 text-white"
        >
          Generate Removal Script
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </PageContainer>
  );
}
