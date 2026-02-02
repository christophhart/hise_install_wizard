export type Platform = 'windows' | 'macos' | 'linux' | null;
export type Architecture = 'x64' | 'arm64' | null;
export type ExplanationMode = 'easy' | 'dev';

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
  
  // UI Settings
  explanationMode: ExplanationMode; // 'easy' = beginner-friendly, 'dev' = concise technical
}

export interface GenerateScriptRequest {
  platform: Exclude<Platform, null>;
  architecture: Exclude<Architecture, null>;
  installPath: string;
  includeFaust: boolean;
  includeIPP: boolean;
  skipPhases: number[];
  targetCommit?: string; // If provided, checkout this specific commit instead of latest
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

// ============================================
// Update Mode Types
// ============================================

// Detection result from the path detection script
export interface DetectionResult {
  path: string | null;
  status: 'valid' | 'invalid' | 'not_found';
  hasFaust: boolean;
  architecture?: Architecture;  // Only populated for macOS
}

// Config for update script generation
export interface UpdateScriptConfig {
  platform: Exclude<Platform, null>;
  architecture: Exclude<Architecture, null>;
  hisePath: string;
  hasFaust: boolean;
  targetCommit?: string; // If provided, checkout this specific commit instead of latest
}

export interface UpdateScriptResponse {
  script: string;
  filename: string;
  warnings: string[];
}

// Helper function to parse detection script output
// Format: "<path>,<status>,<hasFaust>[,<architecture>]" or "not_found"
export function parseDetectionResult(
  output: string, 
  platform: Exclude<Platform, null>
): DetectionResult {
  const trimmed = output.trim();
  
  if (trimmed === 'not_found' || trimmed === '') {
    return { path: null, status: 'not_found', hasFaust: false };
  }
  
  const parts = trimmed.split(',');
  const path = parts[0] || null;
  const status = (parts[1] as 'valid' | 'invalid') || 'invalid';
  const hasFaust = parts[2] === 'faust';
  
  // Architecture is only present for macOS (4th element)
  // Convert uname -m output to our Architecture type
  let architecture: Architecture | undefined;
  if (platform === 'macos' && parts[3]) {
    architecture = parts[3] === 'arm64' ? 'arm64' : 'x64';
  }
  
  return { path, status, hasFaust, architecture };
}
