'use client';

import { Folder, Check, Zap, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PathDisplayProps {
  /** Path to display */
  path: string;
  /** Label text above the path */
  label: string;
  /** Indicator configuration */
  indicator: {
    /** Text label for the indicator */
    label: string;
    /** Whether the indicator is active/checked */
    active: boolean;
    /** Optional custom icon (defaults to Check when active) */
    icon?: ReactNode;
    /** Color scheme: 'success' (green) or 'accent' (orange) */
    colorScheme?: 'success' | 'accent';
  };
  className?: string;
}

/**
 * Displays a path with an optional status indicator.
 * Used for showing installation paths and HISE paths with status badges.
 */
export default function PathDisplay({ 
  path, 
  label,
  indicator,
  className = ''
}: PathDisplayProps) {
  const { colorScheme = 'success' } = indicator;
  
  // Determine colors based on scheme
  const activeColors = colorScheme === 'success' 
    ? 'bg-success/20 border-success' 
    : 'bg-accent/20 border-accent';
  const iconColor = colorScheme === 'success' ? 'text-success' : 'text-accent';
  
  // Default icon based on active state
  const defaultIcon = indicator.active 
    ? (colorScheme === 'success' 
        ? <Check className={`w-3 h-3 ${iconColor}`} /> 
        : <Zap className={`w-3 h-3 ${iconColor}`} />)
    : null;

  return (
    <div className={`bg-background border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Folder className="w-5 h-5 text-accent flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="font-mono text-sm text-gray-200 truncate" title={path}>
            {path}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div 
            className={`
              w-5 h-5 rounded border flex items-center justify-center
              ${indicator.active ? activeColors : 'bg-transparent border-border'}
            `}
          >
            {indicator.icon || defaultIcon}
          </div>
          <span className="text-xs text-gray-500">
            {indicator.label}
          </span>
        </div>
      </div>
    </div>
  );
}
