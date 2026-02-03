'use client';

import { AlertTriangle } from 'lucide-react';
import { useExplanation } from '@/hooks/useExplanation';
import { migrationPage } from '@/lib/content/explanations';

export default function MigrationWarning() {
  const { get } = useExplanation();
  
  return (
    <div className="border-2 border-warning bg-warning/10 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-warning mb-2">Important</h3>
          <p className="text-sm text-gray-300">
            {get(migrationPage.warning)}
          </p>
        </div>
      </div>
    </div>
  );
}
