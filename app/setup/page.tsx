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
import SectionBadge from '@/components/ui/SectionBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ArrowRight } from 'lucide-react';
import { useExplanation } from '@/hooks/useExplanation';
import { setupPage } from '@/lib/content/explanations';
import { detectPlatform } from '@/lib/utils/platform';

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
  const { get } = useExplanation();
  
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>(null);
  
  // Auto-detect platform on mount
  useEffect(() => {
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
          <CardTitle>{get(setupPage.title)}</CardTitle>
          <CardDescription>
            {get(setupPage.description)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Section 1: Platform Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <SectionBadge number={1} />
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
                  <SectionBadge number={2} />
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
                  <SectionBadge number={3} />
                  Components
                </h3>
                
                <p className="text-sm text-gray-400">
                  {get(setupPage.componentsSection.description)}
                </p>
                
                <ComponentChecklist
                  platform={state.platform}
                  installPath={state.installPath}
                  components={state.detectedComponents}
                  onChange={setDetectedComponent}
                  installFaust={state.includeFaust}
                  installIPP={state.includeIPP}
                  onInstallFaustChange={setIncludeFaust}
                  onInstallIPPChange={setIncludeIPP}
                  explanationMode={state.explanationMode}
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
