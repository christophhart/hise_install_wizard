'use client';

import { Platform } from '@/types/wizard';
import Checkbox from '@/components/ui/Checkbox';
import Alert from '@/components/ui/Alert';

interface OptionalFeaturesProps {
  platform: Exclude<Platform, null>;
  includeFaust: boolean;
  includeIPP: boolean;
  onFaustChange: (include: boolean) => void;
  onIPPChange: (include: boolean) => void;
  faustAlreadyInstalled: boolean;
  ippAlreadyInstalled: boolean;
}

export default function OptionalFeatures({
  platform,
  includeFaust,
  includeIPP,
  onFaustChange,
  onIPPChange,
  faustAlreadyInstalled,
  ippAlreadyInstalled,
}: OptionalFeaturesProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        Optional Components
      </label>
      
      <div className="space-y-3">
        {/* Faust - Available on all platforms */}
        <Checkbox
          label="Install Faust DSP Compiler"
          description="Enables Faust JIT compilation for DSP development. Requires manual download."
          checked={includeFaust}
          onChange={(e) => onFaustChange(e.target.checked)}
          disabled={faustAlreadyInstalled}
        />
        {faustAlreadyInstalled && (
          <p className="text-xs text-success ml-8">
            Faust is already installed on your system.
          </p>
        )}
        
        {/* Intel IPP - Windows only */}
        {platform === 'windows' && (
          <>
            <Checkbox
              label="Install Intel IPP"
              description="Intel Performance Primitives for optimized audio processing. ~500MB download."
              checked={includeIPP}
              onChange={(e) => onIPPChange(e.target.checked)}
              disabled={ippAlreadyInstalled}
            />
            {ippAlreadyInstalled && (
              <p className="text-xs text-success ml-8">
                Intel IPP is already installed on your system.
              </p>
            )}
          </>
        )}
        
        {platform !== 'windows' && (
          <Alert variant="info">
            Intel IPP is only available on Windows.
          </Alert>
        )}
      </div>
      
      {includeFaust && (
        <Alert variant="warning" title="Manual Download Required">
          Faust requires a manual download. The setup script will pause and provide 
          instructions when it&apos;s time to install Faust.
        </Alert>
      )}
    </div>
  );
}
