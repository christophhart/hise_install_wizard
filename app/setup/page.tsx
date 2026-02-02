'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '@/contexts/WizardContext';
import { Platform } from '@/types/wizard';
import PageContainer from '@/components/layout/PageContainer';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import PlatformSelector from '@/components/wizard/PlatformSelector';
import ArchitectureSelector from '@/components/wizard/ArchitectureSelector';
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
    setDetectedComponent 
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
  
  const canProceed = state.platform !== null && 
    (state.platform !== 'macos' || state.architecture !== null);
  
  const handleContinue = () => {
    router.push('/setup/configure');
  };
  
  return (
    <PageContainer>
      <PhaseStepper currentPhase={0} className="mb-8" />
      
      <Card>
        <CardHeader>
          <CardTitle>System Detection</CardTitle>
          <CardDescription>
            Tell us about your system so we can generate the right setup script for you.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Platform Selection */}
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
          
          {/* Component Checklist */}
          {state.platform && (
            <>
              <hr className="border-border" />
              
              <ComponentChecklist
                platform={state.platform}
                components={state.detectedComponents}
                onChange={setDetectedComponent}
              />
              
              <Alert variant="info">
                Check any components you already have installed. This helps us skip 
                unnecessary steps and create a shorter setup script.
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-end mt-6">
        <Button 
          onClick={handleContinue}
          disabled={!canProceed}
          size="lg"
        >
          Continue to Configuration
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </PageContainer>
  );
}
