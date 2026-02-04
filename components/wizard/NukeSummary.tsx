'use client';

import { Platform, HiseInstallation, SETTINGS_PATHS, SHELL_CONFIG_FILES } from '@/types/wizard';
import { Trash2, Folder, Settings, Terminal, Check, AlertTriangle } from 'lucide-react';

interface NukePhase {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  paths?: string[];
}

interface NukeSummaryProps {
  platform: Exclude<Platform, null>;
  installations: HiseInstallation[];
  removeSettings: boolean;
  removePathEntries: boolean;
  isEasyMode: boolean;
}

export default function NukeSummary({
  platform,
  installations,
  removeSettings,
  removePathEntries,
  isEasyMode,
}: NukeSummaryProps) {
  const selectedInstallations = installations.filter(i => i.selected);
  const settingsPath = SETTINGS_PATHS[platform];
  const shellConfigs = SHELL_CONFIG_FILES[platform];
  
  // Build phases based on configuration
  const phases: NukePhase[] = [];
  
  // Phase 1: Clean PATH entries
  if (removePathEntries) {
    phases.push({
      id: 1,
      name: 'Clean PATH Entries',
      description: platform === 'windows' 
        ? 'Remove HISE entries from User PATH environment variable'
        : `Remove HISE entries from ${shellConfigs.join(', ')}`,
      icon: <Terminal className="w-4 h-4 text-error" />,
    });
  }
  
  // Phase 2: Delete settings
  if (removeSettings) {
    phases.push({
      id: 2,
      name: 'Delete Settings',
      description: 'Remove HISE application settings and compiler configuration',
      icon: <Settings className="w-4 h-4 text-error" />,
      paths: [settingsPath],
    });
  }
  
  // Phases 3+: Delete installations
  selectedInstallations.forEach((inst, index) => {
    const hasFaust = inst.hasFaust && platform === 'macos';
    phases.push({
      id: 3 + index,
      name: `Delete Installation ${selectedInstallations.length > 1 ? index + 1 : ''}`.trim(),
      description: hasFaust 
        ? 'Remove HISE source code, binaries, and Faust'
        : 'Remove HISE source code and binaries',
      icon: <Folder className="w-4 h-4 text-error" />,
      paths: [inst.path],
    });
  });
  
  // Add temp cleanup phase
  phases.push({
    id: 100,
    name: 'Clean Temp Files',
    description: platform === 'windows'
      ? 'Remove installer files from temp folder'
      : platform === 'macos'
        ? 'Remove Faust DMG files and mount points'
        : 'No temp files to clean',
    icon: <Trash2 className="w-4 h-4 text-gray-500" />,
  });
  
  // Add verification phase
  phases.push({
    id: 101,
    name: 'Verify Removal',
    description: 'Confirm HISE command is no longer available',
    icon: <Check className="w-4 h-4 text-gray-500" />,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
        <AlertTriangle className="w-4 h-4 text-error" />
        What will be removed
      </div>
      
      {/* Phase List */}
      <div className="space-y-2">
        {phases.map((phase) => {
          const isDestructive = phase.id < 100;
          
          return (
            <div
              key={phase.id}
              className={`
                flex items-start gap-3 p-3 rounded-lg border
                ${isDestructive 
                  ? 'bg-error/5 border-error/30' 
                  : 'bg-surface/50 border-border/50'
                }
              `}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {phase.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${isDestructive ? 'text-white' : 'text-gray-500'}`}>
                  Phase {phases.indexOf(phase) + 1}: {phase.name}
                </div>
                <div className={`text-xs ${isDestructive ? 'text-gray-400' : 'text-gray-600'}`}>
                  {phase.description}
                </div>
                {phase.paths && phase.paths.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {phase.paths.map((path) => (
                      <div key={path} className="text-xs font-mono text-error/80 truncate" title={path}>
                        {path}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Status */}
              <div className="flex-shrink-0">
                {isDestructive ? (
                  <span className="text-xs text-error font-medium flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Cleanup</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <Trash2 className="w-3 h-3 text-gray-500" />
          <span>{selectedInstallations.length} installation{selectedInstallations.length !== 1 ? 's' : ''}</span>
        </div>
        {removeSettings && (
          <div className="flex items-center gap-1">
            <Settings className="w-3 h-3 text-gray-500" />
            <span>Settings</span>
          </div>
        )}
        {removePathEntries && (
          <div className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-gray-500" />
            <span>PATH</span>
          </div>
        )}
      </div>
      
      {/* Faust warning for macOS */}
      {platform === 'macos' && selectedInstallations.some(i => i.hasFaust) && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-xs text-warning">
            <strong>Note:</strong> Faust is installed inside the HISE folder on macOS and will also be removed.
          </div>
        </div>
      )}
    </div>
  );
}
