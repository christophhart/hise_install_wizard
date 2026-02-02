'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import CodeBlock from '@/components/ui/CodeBlock';
import RadioGroup from '@/components/ui/RadioGroup';
import Input from '@/components/ui/Input';
import { Send, RefreshCw, ExternalLink } from 'lucide-react';
import { ParseErrorResponse } from '@/types/wizard';

function HelpPageContent() {
  const searchParams = useSearchParams();
  
  // Pre-fill from URL params (when redirected from script error)
  const initialPlatform = searchParams.get('platform') || '';
  const initialPhase = searchParams.get('phase') || '';
  
  const [platform, setPlatform] = useState(initialPlatform);
  const [phase, setPhase] = useState(initialPhase);
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParseErrorResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    if (!errorText.trim()) return;
    
    setLoading(true);
    setApiError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/parse-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: errorText,
          platform: platform || 'windows',
          phase: phase ? parseInt(phase, 10) : undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze error');
      }
      
      const data: ParseErrorResponse = await response.json();
      setResult(data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setErrorText('');
    setResult(null);
    setApiError(null);
  };
  
  const severityColors = {
    low: 'text-success',
    medium: 'text-warning',
    high: 'text-error',
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Need Help?</CardTitle>
        <CardDescription>
          Paste your error message below and we&apos;ll help you fix it.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Context (optional) */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Platform (optional)
            </label>
            <RadioGroup
              name="platform"
              options={[
                { value: 'windows', label: 'Windows' },
                { value: 'macos', label: 'macOS' },
                { value: 'linux', label: 'Linux' },
              ]}
              value={platform}
              onChange={setPlatform}
            />
          </div>
          
          <div>
            <Input
              label="Phase number (optional)"
              type="number"
              min={2}
              max={11}
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              placeholder="e.g., 7"
            />
            <p className="text-xs text-gray-500 mt-1">
              The phase number shown in the script output
            </p>
          </div>
        </div>
        
        {/* Error Input */}
        <Textarea
          label="Error message"
          value={errorText}
          onChange={(e) => setErrorText(e.target.value)}
          placeholder="Paste the error message or terminal output here..."
          rows={8}
        />
        
        {/* Submit */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSubmit}
            disabled={!errorText.trim() || loading}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Analyze Error
              </>
            )}
          </Button>
          
          {(result || errorText) && (
            <Button variant="ghost" onClick={handleReset}>
              Clear
            </Button>
          )}
        </div>
        
        {/* API Error */}
        {apiError && (
          <Alert variant="error" title="Analysis Failed">
            {apiError}
          </Alert>
        )}
        
        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-bold text-lg">Analysis Result</h3>
            
            {/* Severity */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Severity:</span>
              <span className={`font-medium capitalize ${severityColors[result.severity]}`}>
                {result.severity}
              </span>
              {result.canContinue && (
                <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded">
                  Can continue after fix
                </span>
              )}
            </div>
            
            {/* Cause */}
            <div>
              <h4 className="font-medium text-white mb-2">Cause</h4>
              <p className="text-gray-300">{result.cause}</p>
            </div>
            
            {/* Explanation */}
            <div>
              <h4 className="font-medium text-white mb-2">Explanation</h4>
              <p className="text-gray-300">{result.explanation}</p>
            </div>
            
            {/* Fix Commands */}
            {result.fixCommands.length > 0 && (
              <div>
                <h4 className="font-medium text-white mb-2">Suggested Fix</h4>
                <div className="space-y-2">
                  {result.fixCommands.map((cmd, i) => (
                    <CodeBlock key={i} code={cmd} />
                  ))}
                </div>
              </div>
            )}
            
            {/* What to do next */}
            <Alert variant="info" title="What to do next">
              {result.canContinue ? (
                <p>After applying the fix, re-run the setup script from where it left off.</p>
              ) : (
                <p>This issue may require manual intervention. See the HISE documentation or forum for more help.</p>
              )}
            </Alert>
          </div>
        )}
        
        {/* Manual Resources */}
        <div className="pt-4 border-t border-border">
          <h3 className="font-medium text-gray-300 mb-3">Additional Resources</h3>
          <div className="flex flex-wrap gap-3">
            <a 
              href="https://docs.hise.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              Documentation <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://forum.hise.audio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              Forum <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://github.com/christophhart/HISE/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              GitHub Issues <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingFallback() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Need Help?</CardTitle>
        <CardDescription>Loading...</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function HelpPage() {
  return (
    <PageContainer>
      <Suspense fallback={<LoadingFallback />}>
        <HelpPageContent />
      </Suspense>
    </PageContainer>
  );
}
