'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '@/contexts/WizardContext';
import { GenerateScriptResponse } from '@/types/wizard';
import PageContainer from '@/components/layout/PageContainer';
import PhaseStepper from '@/components/wizard/PhaseStepper';
import ScriptPreview from '@/components/wizard/ScriptPreview';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import InlineCopy from '@/components/ui/InlineCopy';
import { ArrowLeft, Download, RefreshCw, Terminal } from 'lucide-react';

// Generate unique filename with timestamp
function generateUniqueFilename(baseFilename: string): string {
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);
  const ext = baseFilename.split('.').pop();
  const name = baseFilename.replace(`.${ext}`, '');
  return `${name}_${timestamp}.${ext}`;
}

export default function GeneratePage() {
  const router = useRouter();
  const { state, getSkipPhases } = useWizard();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateScriptResponse | null>(null);
  const [uniqueFilename, setUniqueFilename] = useState<string>('');
  
  // Redirect if no platform selected
  useEffect(() => {
    if (!state.platform) {
      router.push('/setup');
      return;
    }
    
    generateScript();
  }, [state.platform]);
  
  const generateScript = async () => {
    if (!state.platform) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: state.platform,
          architecture: state.architecture || 'x64',
          installPath: state.installPath,
          includeFaust: state.includeFaust,
          includeIPP: state.includeIPP,
          skipPhases: getSkipPhases(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate script');
      }
      
      const data: GenerateScriptResponse = await response.json();
      setResult(data);
      // Generate unique filename for this download
      setUniqueFilename(generateUniqueFilename(data.filename));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!result) return;
    
    const blob = new Blob([result.script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = uniqueFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Generate new unique filename for next download
    setUniqueFilename(generateUniqueFilename(result.filename));
  };
  
  const handleBack = () => {
    router.push('/setup');
  };
  
  if (!state.platform) {
    return null;
  }
  
  return (
    <PageContainer>
      <PhaseStepper currentPhase={1} className="mb-8" />
      
      <Card>
        <CardHeader>
          <CardTitle>Your Setup Script</CardTitle>
          <CardDescription>
            Download and run this script to set up HISE on your system.
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
              
              {/* Download Button */}
              <div className="flex justify-center">
                <Button onClick={handleDownload} size="lg">
                  <Download className="w-5 h-5" />
                  Download {uniqueFilename}
                </Button>
              </div>
              
              {/* Instructions */}
              <div className="bg-code-bg rounded p-4 space-y-4">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  How to run the script
                </h4>
                
                {state.platform === 'windows' ? (
                  <div className="text-sm text-gray-400 space-y-3">
                    <div>
                      <p className="mb-2">1. Open PowerShell as Administrator</p>
                    </div>
                    <div>
                      <p className="mb-2">2. Navigate to your Downloads folder:</p>
                      <InlineCopy text="cd $HOME\Downloads" />
                    </div>
                    <div>
                      <p className="mb-2">3. Allow script execution (if needed):</p>
                      <InlineCopy text="Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" />
                    </div>
                    <div>
                      <p className="mb-2">4. Run the script:</p>
                      <InlineCopy text={`.\\"${uniqueFilename}"`} />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 space-y-3">
                    <div>
                      <p className="mb-2">1. Open Terminal</p>
                    </div>
                    <div>
                      <p className="mb-2">2. Navigate to your Downloads folder:</p>
                      <InlineCopy text="cd ~/Downloads" />
                    </div>
                    <div>
                      <p className="mb-2">3. Make the script executable:</p>
                      <InlineCopy text={`chmod +x "${uniqueFilename}"`} />
                    </div>
                    <div>
                      <p className="mb-2">4. Run the script:</p>
                      <InlineCopy text={`./"${uniqueFilename}"`} />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Script Preview */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-300">Script Preview</h4>
                <ScriptPreview 
                  script={result.script} 
                  filename={result.filename}
                />
              </div>
              
              {/* Help Link */}
              <Alert variant="info">
                If you encounter any errors while running the script, visit the{' '}
                <a href="/help" className="text-accent hover:underline">Help page</a>
                {' '}to get assistance.
              </Alert>
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
