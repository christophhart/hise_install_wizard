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
  faustVersion?: string; // Latest Faust version for automated install
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

// Detection result from HISE get_update_info command or Help → Update HISE menu
export interface DetectionResult {
  path: string | null;
  status: 'valid' | 'invalid' | 'not_found';
  hasFaust: boolean;
  architecture?: Architecture;  // Populated for all platforms
  commitHash?: string;          // The baked commit hash (HEAD~1 at build time)
}

// Config for update script generation
export interface UpdateScriptConfig {
  platform: Exclude<Platform, null>;
  architecture: Exclude<Architecture, null>;
  hisePath: string;
  hasFaust: boolean;
  targetCommit?: string; // If provided, checkout this specific commit instead of latest
  faustVersion?: string; // Latest Faust version for automated install
}

export interface UpdateScriptResponse {
  script: string;
  filename: string;
  warnings: string[];
}

// Config for migration script generation (ZIP to Git workflow)
export interface MigrationScriptConfig {
  platform: Exclude<Platform, null>;
  architecture: Exclude<Architecture, null>;
  existingPath: string;          // Current HISE source folder path
  hasFaust: boolean;             // Detected from existing build
  keepBackup: boolean;           // If true, rename to HISE_pre_git; if false, delete
  targetCommit?: string;         // From CI status check - checkout specific commit
  faustVersion?: string;         // For Faust install if needed
}

// Helper function to parse HISE get_update_info output or Help → Update HISE menu output
// Format: "<path>|<status>|<faust>|<arch>|<commitHash>" (pipe-delimited)
// Example: "C:\HISE|valid|faust|x64|d385f6a01ca50ef673c1ff0021e9d486a06816c7"
// Note: commitHash is the commit BEFORE the one HISE was built from (HEAD~1 at build time)
export function parseDetectionResult(
  output: string, 
  platform: Exclude<Platform, null>
): DetectionResult {
  const trimmed = output.trim();
  
  // Handle empty output or obvious error messages (no pipe delimiter)
  if (!trimmed || !trimmed.includes('|')) {
    return { path: null, status: 'not_found', hasFaust: false };
  }
  
  const parts = trimmed.split('|');
  
  // Expect at least 4 parts: path, status, faust, arch (commitHash is 5th, optional for backwards compat)
  if (parts.length < 4) {
    return { path: null, status: 'not_found', hasFaust: false };
  }
  
  const path = parts[0] || null;
  const status = (parts[1] as 'valid' | 'invalid') || 'invalid';
  const hasFaust = parts[2] === 'faust';
  const architecture: Architecture = parts[3] === 'arm64' ? 'arm64' : 'x64';
  const commitHash = parts[4] || undefined;
  
  return { path, status, hasFaust, architecture, commitHash };
}
