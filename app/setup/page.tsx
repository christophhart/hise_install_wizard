'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '@/contexts/WizardContext';
import { Platform } from '@/types/wizard';
import PageContainer from '@/components/layout/PageContainer';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import PlatformSelector from '@/components/wizard/PlatformSelector';
import ArchitectureSelector from '@/components/wizard/ArchitectureSelector';
import PathInput, { validatePath } from '@/components/wizard/PathInput';
import ComponentChecklist from '@/components/wizard/ComponentChecklist';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { ArrowRight } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const { 
    state, 
    setPlatform, 
    setArchitecture,
    setInstallPath,
    setDetectedComponent,
    setIncludeFaust,
    setIncludeIPP,
  } = useWizard();
  
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>(null);
  
  // Auto-detect platform on mount
  useEffect(() => {
    const detectPlatform = (): Platform => {
      if (typeof navigator === 'undefined') return null;
      
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('win')) return 'windows';
      if (userAgent.includes('mac')) return 'macos';
      if (userAgent.includes('linux')) return 'linux';
      return null;
    };
    
    const detected = detectPlatform();
    setDetectedPlatform(detected);
    
    // Auto-select if not already selected
    if (!state.platform && detected) {
      setPlatform(detected);
    }
  }, [state.platform, setPlatform]);
  
  // Validate that we have platform, valid path, and architecture (for macOS)
  const pathValidation = state.platform ? validatePath(state.installPath, state.platform) : { valid: false };
  const canProceed = state.platform !== null && 
    pathValidation.valid &&
    (state.platform !== 'macos' || state.architecture !== null);
  
  const handleGenerate = () => {
    router.push('/setup/generate');
  };
  
  return (
    <PageContainer>
      <PhaseStepper currentPhase={0} className="mb-8" />
      
      <Card>
        <CardHeader>
          <CardTitle>Setup Configuration</CardTitle>
          <CardDescription>
            Configure your system and preferences to generate a customized setup script.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Section 1: Platform Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent text-background text-xs font-bold flex items-center justify-center">1</span>
              Platform
            </h3>
            <PlatformSelector
              value={state.platform}
              onChange={setPlatform}
              detectedPlatform={detectedPlatform}
            />
            
            {/* Architecture Selection (macOS only) */}
            {state.platform === 'macos' && (
              <ArchitectureSelector
                value={state.architecture}
                onChange={setArchitecture}
                platform={state.platform}
              />
            )}
          </div>
          
          {/* Section 2: Installation Path */}
          {state.platform && (
            <>
              <hr className="border-border" />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-background text-xs font-bold flex items-center justify-center">2</span>
                  Installation Path
                </h3>
                <PathInput
                  value={state.installPath}
                  onChange={setInstallPath}
                  platform={state.platform}
                />
              </div>
            </>
          )}
          
          {/* Section 3: Component Checklist */}
          {state.platform && state.installPath && (
            <>
              <hr className="border-border" />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-background text-xs font-bold flex items-center justify-center">3</span>
                  Components
                </h3>
                
                <Alert variant="info">
                  Check any components you already have installed. The script will skip those steps.
                  For optional components (Faust, Intel IPP), check &quot;Install during setup&quot; if you want them included.
                </Alert>
                
                <ComponentChecklist
                  platform={state.platform}
                  installPath={state.installPath}
                  components={state.detectedComponents}
                  onChange={setDetectedComponent}
                  installFaust={state.includeFaust}
                  installIPP={state.includeIPP}
                  onInstallFaustChange={setIncludeFaust}
                  onInstallIPPChange={setIncludeIPP}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-end mt-6">
        <Button 
          onClick={handleGenerate}
          disabled={!canProceed}
          size="lg"
        >
          Generate Script
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </PageContainer>
  );
}
