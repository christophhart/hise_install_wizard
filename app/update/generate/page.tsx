'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdate } from '@/contexts/UpdateContext';
import { UpdateScriptResponse, Platform } from '@/types/wizard';
import PageContainer from '@/components/layout/PageContainer';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import ScriptPreview from '@/components/wizard/ScriptPreview';
import PathDisplay from '@/components/wizard/PathDisplay';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import InlineCopy from '@/components/ui/InlineCopy';
import Collapsible from '@/components/ui/Collapsible';
import { ArrowLeft, Download, RefreshCw, Terminal, Check } from 'lucide-react';
import { useExplanation } from '@/hooks/useExplanation';
import { updateGeneratePage, updateHowToRun, updatePhases } from '@/lib/content/explanations';
import { downloadAsFile, generateUniqueFilename } from '@/lib/utils/download';

// Update summary component
function UpdateSummary({ 
  get 
}: { 
  get: (content: { easy: string; dev: string }) => string;
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-300 text-sm">Update Phases</h4>
      <div className="space-y-2">
        {updatePhases.map((phase) => (
          <div 
            key={phase.id}
            className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg"
          >
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-xs font-medium text-accent">{phase.id}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{get(phase.name)}</p>
              <p className="text-xs text-gray-500">{get(phase.description)}</p>
            </div>
            <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-accent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Render how-to-run instructions
function renderHowToRunInstructions(
  platform: Platform,
  filename: string,
  get: (content: { easy: string; dev: string }) => string
) {
  if (!platform) return null;
  
  const steps = updateHowToRun[platform].steps;
  
  return (
    <div className="text-sm text-gray-400 space-y-3">
      {/* Windows admin alert */}
      {platform === 'windows' && (
        <Alert variant="info">
          Run PowerShell as Administrator for the script to work correctly.
        </Alert>
      )}
      
      {steps.map((step, index) => {
        const commandContent = step.command ? get(step.command).replace('hise-update', filename.replace('.ps1', '').replace('.sh', '')) : null;
        
        return (
          <div key={index}>
            <p className="mb-2">
              {index + 1}. {get(step.title)}
            </p>
            {commandContent && <InlineCopy text={commandContent} />}
          </div>
        );
      })}
    </div>
  );
}

export default function UpdateGeneratePage() {
  const router = useRouter();
  const { state, canGenerate } = useUpdate();
  const { get } = useExplanation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UpdateScriptResponse | null>(null);
  const [uniqueFilename, setUniqueFilename] = useState<string>('');
  
  // Redirect if no valid detection
  useEffect(() => {
    if (!canGenerate) {
      router.push('/update');
      return;
    }
    
    generateScript();
  }, [canGenerate, router]);
  
  const generateScript = async () => {
    if (!state.platform || !state.hisePath) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-update-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: state.platform,
          architecture: state.architecture || 'x64',
          hisePath: state.hisePath,
          hasFaust: state.hasFaust,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate update script');
      }
      
      const data: UpdateScriptResponse = await response.json();
      setResult(data);
      setUniqueFilename(generateUniqueFilename(data.filename));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!result) return;
    
    downloadAsFile(result.script, uniqueFilename);
    
    // Generate new unique filename for next download
    setUniqueFilename(generateUniqueFilename(result.filename));
  };
  
  const handleBack = () => {
    router.push('/update');
  };
  
  if (!canGenerate) {
    return null;
  }
  
  return (
    <PageContainer>
      <PhaseStepper currentPhase={1} mode="update" className="mb-8" />
      
      <Card>
        <CardHeader>
          <CardTitle>{get(updateGeneratePage.title)}</CardTitle>
          <CardDescription>
            {get(updateGeneratePage.description)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-accent animate-spin" />
              <span className="ml-3 text-gray-400">Generating script...</span>
            </div>
          )}
          
          {error && (
            <Alert variant="error" title="Generation Failed">
              {error}
              <Button 
                onClick={generateScript} 
                variant="secondary" 
                size="sm" 
                className="mt-3"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </Alert>
          )}
          
          {result && !loading && (
            <>
              {/* HISE Path Display */}
              <PathDisplay 
                path={state.hisePath}
                label="HISE Installation"
                indicator={{
                  label: state.hasFaust ? 'Faust Build' : 'Standard Build',
                  active: state.hasFaust,
                  colorScheme: 'accent',
                }}
                className="mb-6"
              />
              
              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="space-y-2">
                  {result.warnings.map((warning, i) => (
                    <Alert key={i} variant="warning">
                      {warning}
                    </Alert>
                  ))}
                </div>
              )}
              
              {/* Steps Explanation */}
              <p className="text-sm text-gray-400">
                {get(updateGeneratePage.stepsExplanation)}
              </p>
              
              {/* Update Summary */}
              <div className="bg-background border border-border rounded-lg p-4">
                <UpdateSummary get={get} />
              </div>
              
              {/* Download Button */}
              <div className="flex justify-center">
                <Button onClick={handleDownload} size="lg">
                  <Download className="w-5 h-5" />
                  Download {uniqueFilename}
                </Button>
              </div>
              
              {/* Instructions */}
              <Collapsible
                title="How to run the script"
                icon={<Terminal className="w-4 h-4 text-accent" />}
                defaultOpen={true}
              >
                {renderHowToRunInstructions(state.platform, uniqueFilename, get)}
              </Collapsible>
              
              {/* Script Preview */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-300">Script Preview</h4>
                <ScriptPreview 
                  script={result.script} 
                  filename={result.filename}
                />
              </div>
            </>
          )}
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
        
        {result && (
          <Button 
            onClick={generateScript}
            variant="ghost"
            size="lg"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
