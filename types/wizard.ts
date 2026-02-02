export type Platform = 'windows' | 'macos' | 'linux' | null;
export type Architecture = 'x64' | 'arm64' | null;

export interface DetectedComponents {
  git: boolean;
  compiler: boolean; // VS2026 on Windows, Xcode on macOS, GCC on Linux
  faust: boolean;
  intelIPP: boolean; // Windows only
  hiseRepo: boolean;
  sdks: boolean;
  juce: boolean;
}

export interface WizardState {
  // Phase 0: Detection
  platform: Platform;
  architecture: Architecture;
  detectedComponents: DetectedComponents;
  
  // Phase 1: Configuration
  installPath: string;
  includeFaust: boolean;
  includeIPP: boolean; // Windows only
}

export interface GenerateScriptRequest {
  platform: Exclude<Platform, null>;
  architecture: Exclude<Architecture, null>;
  installPath: string;
  includeFaust: boolean;
  includeIPP: boolean;
  skipPhases: number[];
}

// Alias for internal script generation use
export type ScriptConfig = GenerateScriptRequest;

export interface GenerateScriptResponse {
  script: string;
  filename: string;
  warnings: string[];
}

export interface ParseErrorRequest {
  error: string;
  platform: Exclude<Platform, null>;
  phase?: number;
  command?: string;
}

export interface ParseErrorResponse {
  cause: string;
  fixCommands: string[];
  explanation: string;
  severity: 'low' | 'medium' | 'high';
  canContinue: boolean;
}

export const DEFAULT_PATHS: Record<Exclude<Platform, null>, string> = {
  windows: 'C:\\HISE',
  macos: '~/HISE',
  linux: '~/HISE',
};

export const PLATFORM_LABELS: Record<Exclude<Platform, null>, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
};
