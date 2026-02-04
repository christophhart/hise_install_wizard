'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNuke } from '@/contexts/NukeContext';
import { NukeScriptResponse } from '@/types/wizard';
import PageContainer from '@/components/layout/PageContainer';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import ScriptPreview from '@/components/wizard/ScriptPreview';
import NukeSummary from '@/components/wizard/NukeSummary';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import InlineCopy from '@/components/ui/InlineCopy';
import Collapsible from '@/components/ui/Collapsible';
import { ArrowLeft, Download, RefreshCw, Terminal, AlertTriangle } from 'lucide-react';
import { useExplanation } from '@/hooks/useExplanation';
import { downloadAsFile, generateUniqueFilename } from '@/lib/utils/download';

// How to run instructions per platform
const howToRun = {
  windows: {
    steps: [
      {
        title: 'Open PowerShell as Administrator',
        command: null,
      },
      {
        title: 'Navigate to Downloads folder',
        command: (filename: string) => 'cd $HOME\\Downloads',
      },
      {
        title: 'Run the script',
        command: (filename: string) => `.\\${filename}`,
      },
      {
        title: 'Type NUKE when prompted to confirm',
        command: null,
      },
    ],
  },
  macos: {
    steps: [
      {
        title: 'Open Terminal',
        command: null,
      },
      {
        title: 'Navigate to Downloads folder',
        command: () => 'cd ~/Downloads',
      },
      {
        title: 'Make executable and run',
        command: (filename: string) => `chmod +x ${filename} && ./${filename}`,
      },
      {
        title: 'Type NUKE when prompted to confirm',
        command: null,
      },
    ],
  },
  linux: {
    steps: [
      {
        title: 'Open Terminal',
        command: null,
      },
      {
        title: 'Navigate to Downloads folder',
        command: () => 'cd ~/Downloads',
      },
      {
        title: 'Make executable and run',
        command: (filename: string) => `chmod +x ${filename} && ./${filename}`,
      },
      {
        title: 'Type NUKE when prompted to confirm',
        command: null,
      },
    ],
  },
};

export default function NukeGeneratePage() {
  const router = useRouter();
  const { state, canGenerate, selectedInstallations } = useNuke();
  const { isEasyMode } = useExplanation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NukeScriptResponse | null>(null);
  const [uniqueFilename, setUniqueFilename] = useState<string>('');
  const [hasDownloaded, setHasDownloaded] = useState(false);
  
  // Redirect if no valid selection, generate script on mount
  useEffect(() => {
    if (!canGenerate) {
      router.push('/nuke');
      return;
    }
    
    generateScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canGenerate, router]);
  
  const generateScript = async () => {
    if (!state.platform) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-nuke-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: state.platform,
          installationPaths: selectedInstallations.map(i => i.path),
          removeSettings: state.removeSettings,
          removePathEntries: state.removePathEntries,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate nuke script');
      }
      
      const data: NukeScriptResponse = await response.json();
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
    setHasDownloaded(true);
  };
  
  const handleRegenerate = async () => {
    await generateScript();
    setHasDownloaded(false);
  };
  
  const handleBack = () => {
    router.push('/nuke');
  };
  
  if (!canGenerate) {
    return null;
  }
  
  const platformSteps = state.platform ? howToRun[state.platform].steps : [];
  
  return (
    <PageContainer>
      <PhaseStepper currentPhase={1} mode="nuke" className="mb-8" />
      
      {/* Danger Zone Warning */}
      <div className="mb-6 p-4 border-2 border-error rounded-lg bg-error/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-error mb-1">Danger Zone</h3>
            <p className="text-sm text-gray-300">
              You are about to permanently delete all HISE files from your system. 
              This action <strong>CANNOT</strong> be undone. The script will ask you to type &quot;NUKE&quot; to confirm before proceeding.
            </p>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gray-300" />
            Removal Script Ready
          </CardTitle>
          <CardDescription>
            Download and run the script to remove HISE from your system
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-error animate-spin" />
              <span className="ml-3 text-gray-400">Generating removal script...</span>
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
              
              {/* What Will Be Removed Summary */}
              <div className="bg-background border border-error/30 rounded-lg p-4">
                <NukeSummary 
                  platform={state.platform!}
                  installations={selectedInstallations}
                  removeSettings={state.removeSettings}
                  removePathEntries={state.removePathEntries}
                  isEasyMode={isEasyMode}
                />
              </div>
              
              {/* Download Button */}
              <div className="flex items-center justify-center gap-3">
                <Button 
                  onClick={handleDownload} 
                  size="lg"
                  className="bg-error hover:bg-error/90 border-white/30 text-white"
                  disabled={hasDownloaded}
                >
                  <Download className="w-5 h-5" />
                  Download {uniqueFilename}
                </Button>
                
                {hasDownloaded && (
                  <Button 
                    onClick={handleRegenerate}
                    variant="secondary"
                    size="lg"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                )}
              </div>
              
              {/* How to Run Instructions */}
              <Collapsible
                title="How to run the script"
                icon={<Terminal className="w-4 h-4 text-gray-400" />}
                defaultOpen={true}
              >
                <div className="text-sm text-gray-400 space-y-3">
                  {state.platform === 'windows' && (
                    <Alert variant="warning">
                      Run PowerShell as Administrator for the script to work correctly.
                    </Alert>
                  )}
                  
                  {platformSteps.map((step, index) => (
                    <div key={index}>
                      <p className="mb-2">
                        {index + 1}. {step.title}
                      </p>
                      {step.command && (
                        <InlineCopy text={step.command(uniqueFilename)} />
                      )}
                    </div>
                  ))}
                </div>
              </Collapsible>
              
              {/* Script Preview */}
              <Collapsible
                title="Script Preview"
                icon={<Terminal className="w-4 h-4 text-gray-500" />}
                defaultOpen={!isEasyMode}
              >
                <ScriptPreview 
                  script={result.script} 
                  filename={result.filename}
                />
              </Collapsible>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-start mt-6">
        <Button 
          onClick={handleBack}
          variant="secondary"
          size="lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
    </PageContainer>
  );
}
