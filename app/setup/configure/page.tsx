'use client';

import { useRouter } from 'next/navigation';
import { useWizard } from '@/contexts/WizardContext';
import PageContainer from '@/components/layout/PageContainer';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import PathInput from '@/components/wizard/PathInput';
import OptionalFeatures from '@/components/wizard/OptionalFeatures';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function ConfigurePage() {
  const router = useRouter();
  const { 
    state, 
    setInstallPath, 
    setIncludeFaust, 
    setIncludeIPP 
  } = useWizard();
  
  // Redirect to setup if no platform selected
  useEffect(() => {
    if (!state.platform) {
      router.push('/setup');
    }
  }, [state.platform, router]);
  
  if (!state.platform) {
    return null;
  }
  
  const handleBack = () => {
    router.push('/setup');
  };
  
  const handleGenerate = () => {
    router.push('/setup/generate');
  };
  
  const canProceed = state.installPath.trim() !== '';
  
  return (
    <PageContainer>
      <PhaseStepper currentPhase={1} className="mb-8" />
      
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Configure your HISE installation preferences.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Installation Path */}
          <PathInput
            value={state.installPath}
            onChange={setInstallPath}
            platform={state.platform}
          />
          
          <hr className="border-border" />
          
          {/* Optional Features */}
          <OptionalFeatures
            platform={state.platform}
            includeFaust={state.includeFaust}
            includeIPP={state.includeIPP}
            onFaustChange={setIncludeFaust}
            onIPPChange={setIncludeIPP}
            faustAlreadyInstalled={state.detectedComponents.faust}
            ippAlreadyInstalled={state.detectedComponents.intelIPP}
          />
          
          <hr className="border-border" />
          
          {/* Summary */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Configuration Summary
            </label>
            <div className="bg-code-bg rounded p-4 space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Platform:</span>
                <span className="text-white capitalize">{state.platform}</span>
              </div>
              {state.platform === 'macos' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Architecture:</span>
                  <span className="text-white">{state.architecture}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Install Path:</span>
                <span className="text-accent">{state.installPath}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Include Faust:</span>
                <span className={state.includeFaust ? 'text-success' : 'text-gray-500'}>
                  {state.includeFaust ? 'Yes' : 'No'}
                </span>
              </div>
              {state.platform === 'windows' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Include Intel IPP:</span>
                  <span className={state.includeIPP ? 'text-success' : 'text-gray-500'}>
                    {state.includeIPP ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <Alert variant="info">
            The next step will generate a setup script customized for your configuration.
            You&apos;ll be able to review it before downloading.
          </Alert>
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button 
          onClick={handleBack}
          variant="secondary"
          size="lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
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
