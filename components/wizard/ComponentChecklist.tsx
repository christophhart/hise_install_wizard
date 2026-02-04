'use client';

import { Platform, DetectedComponents, ExplanationMode } from '@/types/wizard';
import Checkbox from '@/components/ui/Checkbox';
import CodeBlock from '@/components/ui/CodeBlock';
import Button from '@/components/ui/Button';
import { ChevronDown, ChevronUp, CheckCircle, Download, PlayCircle, Wand2, ClipboardPaste } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Collapsible from '@/components/ui/Collapsible';
import { useState } from 'react';
import { components as componentContent, autoDetect, setupPage } from '@/lib/content/explanations';

interface ComponentChecklistProps {
  platform: Exclude<Platform, null>;
  installPath: string;
  components: DetectedComponents;
  onChange: (key: keyof DetectedComponents, value: boolean) => void;
  // Install toggles for optional components
  installFaust: boolean;
  installIPP: boolean;
  onInstallFaustChange: (install: boolean) => void;
  onInstallIPPChange: (install: boolean) => void;
  // Explanation mode
  explanationMode: ExplanationMode;
}

interface ComponentInfo {
  key: keyof DetectedComponents;
  label: string;
  description: string;
  // Function that returns a command outputting True/False
  getVerifyCommand: (path: string, platform: Exclude<Platform, null>) => string;
  platforms: Exclude<Platform, null>[];
  isOptional?: boolean;
  category: 'required' | 'optional';
}

// Helper to format path for different platforms
// Also expands ~ to $HOME for Unix platforms (tilde doesn't expand inside quotes in bash)
function formatPath(basePath: string, subPath: string, platform: Exclude<Platform, null>): string {
  if (platform === 'windows') {
    // Ensure Windows-style paths
    const winBase = basePath.replace(/\//g, '\\');
    const winSub = subPath.replace(/\//g, '\\');
    return `${winBase}${winSub}`;
  }
  // Unix-style paths - expand ~ to $HOME for bash compatibility
  let unixBase = basePath.replace(/\\/g, '/');
  if (unixBase.startsWith('~/')) {
    unixBase = '$HOME' + unixBase.slice(1);
  } else if (unixBase === '~') {
    unixBase = '$HOME';
  }
  const unixSub = subPath.replace(/\\/g, '/');
  return `${unixBase}${unixSub}`;
}

// Generate combined verification command for all checked components
function generateCombinedVerifyCommand(
  components: DetectedComponents,
  platform: Exclude<Platform, null>,
  installPath: string
): string {
  // Get all checked components that apply to this platform
  const checkedComponents = componentInfoList.filter(
    (c) => components[c.key] && c.platforms.includes(platform)
  );
  
  if (checkedComponents.length === 0) {
    return platform === 'windows' 
      ? 'Write-Host "No components selected"' 
      : 'echo "No components selected"';
  }
  
  // Get individual verify commands
  const commands = checkedComponents.map((c) => c.getVerifyCommand(installPath, platform));
  
  if (platform === 'windows') {
    // PowerShell: Chain with -and, wrap each in parentheses
    // Use a script block that outputs the result
    const conditions = commands.map((cmd) => `(${cmd})`).join(' -and ');
    return `if (${conditions}) { "All checks passed: True" } else { "Some checks failed: False" }`;
  } else {
    // Bash: Chain with && for all True, output result
    const conditions = commands.map((cmd) => `[ "$(${cmd})" = "True" ]`).join(' && ');
    return `${conditions} && echo "All checks passed: True" || echo "Some checks failed: False"`;
  }
}

// Generate a detection script that outputs comma-separated list of installed components.
// Windows and macOS copy output to clipboard automatically.
// Linux shows visual markers for manual copying.
function generateDetectionScript(
  platform: Exclude<Platform, null>,
  installPath: string
): string {
  // Get all components for this platform
  const platformComponents = componentInfoList.filter((c) => c.platforms.includes(platform));
  
  if (platform === 'windows') {
    // PowerShell script with clipboard copy
    const checks = platformComponents.map((c) => {
      const cmd = c.getVerifyCommand(installPath, platform);
      return `if (${cmd}) { $r += "${c.key}," }`;
    }).join('\n');
    
    return `$r = ""\n${checks}\n$out = if ($r) { $r.TrimEnd(",") } else { "none" }; Set-Clipboard $out; "Copied to clipboard: $out"`;
  } else if (platform === 'macos') {
    // Bash script for macOS with clipboard copy via pbcopy
    const checks = platformComponents.map((c) => {
      const cmd = c.getVerifyCommand(installPath, platform);
      return `[ "$(${cmd})" = "True" ] && r="\${r}${c.key},"`;
    }).join('\n');
    
    return `r=""\n${checks}\nout=$([ -n "$r" ] && echo "\${r%,}" || echo "none"); echo "$out" | pbcopy; echo "Copied to clipboard: $out"`;
  } else {
    // Linux: show visual markers for manual copying
    const checks = platformComponents.map((c) => {
      const cmd = c.getVerifyCommand(installPath, platform);
      return `[ "$(${cmd})" = "True" ] && r="\${r}${c.key},"`;
    }).join('\n');
    
    return `r=""\n${checks}\necho "==== COPY BELOW ===="; [ -n "$r" ] && echo "\${r%,}" || echo "none"; echo "==== COPY ABOVE ===="`;
  }
}

// All verification commands return True/False for consistent chaining
const componentInfoList: ComponentInfo[] = [
  {
    key: 'git',
    label: 'Git',
    description: 'Version control system',
    getVerifyCommand: (_, platform) => {
      // Check if git command exists and returns success
      if (platform === 'windows') {
        return '[bool](Get-Command git -ErrorAction SilentlyContinue)';
      }
      return 'command -v git >/dev/null && echo "True" || echo "False"';
    },
    platforms: ['windows', 'macos', 'linux'],
    category: 'required',
  },
  {
    key: 'compiler',
    label: 'C++ Compiler',
    description: '', // Platform-specific, set dynamically in render
    getVerifyCommand: (_, platform) => {
      const commands = {
        // Check for MSBuild in VS2026 installation directory (any edition)
        windows: '(Test-Path "C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe") -or (Test-Path "C:\\Program Files\\Microsoft Visual Studio\\18\\Professional\\MSBuild\\Current\\Bin\\MSBuild.exe") -or (Test-Path "C:\\Program Files\\Microsoft Visual Studio\\18\\Enterprise\\MSBuild\\Current\\Bin\\MSBuild.exe")',
        macos: 'xcode-select -p >/dev/null 2>&1 && echo "True" || echo "False"',
        linux: 'command -v gcc >/dev/null && echo "True" || echo "False"',
      };
      return commands[platform];
    },
    platforms: ['windows', 'macos', 'linux'],
    category: 'required',
  },
  {
    key: 'hiseRepo',
    label: 'HISE Repository',
    description: 'HISE source code already cloned',
    getVerifyCommand: (path, platform) => {
      const gitPath = formatPath(path, '/.git', platform);
      if (platform === 'windows') {
        return `Test-Path "${gitPath}"`;
      }
      return `test -d "${gitPath}" && echo "True" || echo "False"`;
    },
    platforms: ['windows', 'macos', 'linux'],
    category: 'required',
  },
  {
    key: 'juce',
    label: 'JUCE Submodule',
    description: 'JUCE framework initialized on juce6 branch',
    getVerifyCommand: (path, platform) => {
      const jucePath = formatPath(path, '/JUCE', platform);
      if (platform === 'windows') {
        // Check if JUCE dir exists AND is on juce6 branch
        return `(Test-Path "${jucePath}") -and ((git -C "${jucePath}" branch --show-current) -eq "juce6")`;
      }
      return `[ -d "${jucePath}" ] && [ "$(git -C "${jucePath}" branch --show-current)" = "juce6" ] && echo "True" || echo "False"`;
    },
    platforms: ['windows', 'macos', 'linux'],
    category: 'required',
  },
  {
    key: 'sdks',
    label: 'SDKs Extracted',
    description: 'ASIO and VST3 SDKs in tools/SDK/',
    getVerifyCommand: (path, platform) => {
      const sdkPath = formatPath(path, '/tools/SDK', platform);
      if (platform === 'windows') {
        return `Test-Path "${sdkPath}"`;
      }
      return `test -d "${sdkPath}" && echo "True" || echo "False"`;
    },
    platforms: ['windows', 'macos', 'linux'],
    category: 'required',
  },
  {
    key: 'faust',
    label: 'Faust DSP Compiler',
    description: 'Optional: Enables Faust JIT compilation for DSP development',
    getVerifyCommand: (path, platform) => {
      if (platform === 'windows') {
        // Windows uses global Faust installation
        return 'Test-Path "C:\\Program Files\\Faust\\bin\\faust.exe"';
      }
      if (platform === 'macos') {
        // macOS: Check HISE-local Faust installation (where setup script installs it)
        const faustLib = formatPath(path, '/tools/faust/lib/libfaust.dylib', platform);
        return `test -f "${faustLib}" && echo "True" || echo "False"`;
      }
      // Linux uses system-wide installation via apt-get or make install
      return 'test -f /usr/local/bin/faust && echo "True" || echo "False"';
    },
    platforms: ['windows', 'macos', 'linux'],
    isOptional: true,
    category: 'optional',
  },
  {
    key: 'intelIPP',
    label: 'Intel IPP',
    description: 'Optional: Intel Performance Primitives for optimized audio processing',
    getVerifyCommand: () => 'Test-Path "C:\\Program Files (x86)\\Intel\\oneAPI\\ipp\\latest"',
    platforms: ['windows'],
    isOptional: true,
    category: 'optional',
  },
];

export default function ComponentChecklist({ 
  platform, 
  installPath,
  components, 
  onChange,
  installFaust,
  installIPP,
  onInstallFaustChange,
  onInstallIPPChange,
  explanationMode,
}: ComponentChecklistProps) {
  // Helper to get mode-appropriate content
  const getContent = (content: { easy: string; dev: string }) => content[explanationMode];
  const [showVerifyCommands, setShowVerifyCommands] = useState(false);
  const [showAutoDetect, setShowAutoDetect] = useState(false);
  const [detectionInput, setDetectionInput] = useState('');
  const [detectionApplied, setDetectionApplied] = useState(false);
  
  // Filter components for current platform
  const filteredComponents = componentInfoList.filter(
    (c) => c.platforms.includes(platform)
  );
  
  // Components to display in the UI (exclude juce and sdks - they're handled with repo setup)
  const displayedComponents = filteredComponents.filter(
    (c) => c.key !== 'juce' && c.key !== 'sdks'
  );
  
  const requiredComponents = displayedComponents.filter(c => c.category === 'required');
  const optionalComponents = displayedComponents.filter(c => c.category === 'optional');
  
  // Generate detection script for current platform
  const detectionScript = generateDetectionScript(platform, installPath);
  
  // Apply detection result - clears all checkboxes first, then ticks detected ones
  const applyDetectionResult = () => {
    const input = detectionInput.trim().toLowerCase();
    
    if (!input || input === 'none') {
      // Clear all checkboxes
      filteredComponents.forEach((c) => onChange(c.key, false));
      setDetectionApplied(true);
      setTimeout(() => setDetectionApplied(false), 2000);
      return;
    }
    
    // Parse comma-separated list
    const detected = input.split(',').map((s) => s.trim());
    
    // Clear all checkboxes first
    filteredComponents.forEach((c) => onChange(c.key, false));
    
    // Tick detected components
    filteredComponents.forEach((c) => {
      if (detected.includes(c.key.toLowerCase())) {
        onChange(c.key, true);
      }
    });
    
    setDetectionApplied(true);
    setTimeout(() => setDetectionApplied(false), 2000);
  };
  
  // Handle paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setDetectionInput(text.trim());
      }
    } catch (err) {
      console.log('Clipboard access denied');
    }
  };
  
  const renderComponent = (component: ComponentInfo) => {
    const verifyCommand = component.getVerifyCommand(installPath, platform);
    const isInstalled = components[component.key]; // true = already installed (skip)
    const isFaust = component.key === 'faust';
    const isIPP = component.key === 'intelIPP';
    
    // Get mode-aware description if available, fallback to component's default
    const content = componentContent[component.key];
    let description = content 
      ? getContent(content.description)
      : component.description;
    
    // Platform-specific description for compiler
    if (component.key === 'compiler') {
      const compilerDescriptions = {
        windows: 'Visual Studio 2026 with C++ workload',
        macos: 'Xcode with Command Line Tools',
        linux: 'GCC (GNU Compiler Collection)',
      };
      description = compilerDescriptions[platform];
    }
    
    // Inverted display logic: toggle is ON when we WILL install (i.e., not installed)
    // For required components: toggle ON = will install, toggle OFF = already have it
    // For optional components: handled separately below
    const toggleOn = !isInstalled;
    
    // Determine what the script will actually do
    const willInstallOptional = component.isOptional && !isInstalled && (isFaust ? installFaust : isIPP ? installIPP : false);
    
    // Determine skip reason for more descriptive status badges
    type SkipReason = 'installed' | 'not-requested' | null;
    let skipReason: SkipReason = null;
    
    if (isInstalled) {
      skipReason = 'installed';
    } else if (component.isOptional && !willInstallOptional) {
      skipReason = 'not-requested';
    }
    
    return (
      <div key={component.key} className="space-y-2">
        <div className="flex items-start gap-3">
          {/* Toggle and label area */}
          <div className="flex-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              {/* iOS-style toggle */}
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={toggleOn}
                  onChange={(e) => onChange(component.key, !e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`
                  w-11 h-6 rounded-full
                  transition-colors duration-200
                  ${toggleOn 
                    ? 'bg-accent' 
                    : 'bg-gray-600'
                  }
                  peer-focus:ring-2 peer-focus:ring-accent/50
                `}>
                  <div className={`
                    absolute top-0.5 left-0.5
                    w-5 h-5 rounded-full bg-white shadow-md
                    transition-transform duration-200
                    ${toggleOn ? 'translate-x-5' : 'translate-x-0'}
                  `} />
                </div>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-white">
                  {component.label}
                </span>
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              </div>
            </label>
          </div>
          
          {/* Status badge */}
          <div className="flex-shrink-0 mt-0.5">
            {skipReason === 'installed' ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20">
                <CheckCircle className="w-3 h-3" />
                Already Installed
              </span>
            ) : skipReason === 'not-requested' ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20">
                <CheckCircle className="w-3 h-3" />
                Optional - Skipped
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-accent/10 text-accent border border-accent/20">
                <Download className="w-3 h-3" />
                Will Install
              </span>
            )}
          </div>
        </div>
        
        {/* Install toggle for optional components when marked as not installed */}
        {component.isOptional && toggleOn && (
          <div className="ml-14 mt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={isFaust ? installFaust : isIPP ? installIPP : false}
                onChange={(e) => {
                  if (isFaust) onInstallFaustChange(e.target.checked);
                  if (isIPP) onInstallIPPChange(e.target.checked);
                }}
                className="sr-only peer"
              />
              <div className={`
                w-4 h-4 rounded border flex items-center justify-center
                transition-colors duration-200
                ${(isFaust ? installFaust : isIPP ? installIPP : false)
                  ? 'bg-accent border-accent' 
                  : 'bg-transparent border-gray-500 group-hover:border-gray-400'
                }
              `}>
                {(isFaust ? installFaust : isIPP ? installIPP : false) && (
                  <Download className="w-2.5 h-2.5 text-background" />
                )}
              </div>
              <span className="text-sm text-accent">
                Install {component.label} during setup
              </span>
            </label>
          </div>
        )}
        
        {showVerifyCommands && verifyCommand && (
          <div className="ml-14 space-y-2">
            {/* Verification command */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Run this command to verify:</p>
              <CodeBlock 
                code={verifyCommand} 
                className="text-xs"
              />
            </div>
            
            {/* Success indicator - all commands return True */}
            <div className="flex items-center gap-2 text-xs text-success">
              <CheckCircle className="w-3 h-3" />
              <span>Should output: <code className="bg-success/10 px-1.5 py-0.5 rounded">True</code></span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Generate combined verification command for all checked components
  const hasCheckedComponents = Object.values(components).some(Boolean);
  const combinedCommand = hasCheckedComponents 
    ? generateCombinedVerifyCommand(components, platform, installPath)
    : null;
  
  // Helper to render a simple toggle for EZ mode optional components
  const renderSimpleToggle = (
    key: 'faust' | 'intelIPP',
    checked: boolean,
    onToggle: (value: boolean) => void,
    label: string,
    description: string
  ) => (
    <div className="flex items-start gap-3">
      <label className="flex items-start gap-3 cursor-pointer group flex-1">
        {/* iOS-style toggle */}
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className={`
            w-11 h-6 rounded-full
            transition-colors duration-200
            ${checked 
              ? 'bg-accent' 
              : 'bg-gray-600'
            }
            peer-focus:ring-2 peer-focus:ring-accent/50
          `}>
            <div className={`
              absolute top-0.5 left-0.5
              w-5 h-5 rounded-full bg-white shadow-md
              transition-transform duration-200
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `} />
          </div>
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-white">
            {label}
          </span>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </label>
    </div>
  );
  
  // EZ Mode: Simplified UI - just show intro text and optional component toggles
  if (explanationMode === 'easy') {
    const { componentsSectionEzMode, optionalToggles } = setupPage;
    
    return (
      <div className="space-y-6">
        {/* Intro text explaining script handles everything - platform specific */}
        <p className="text-sm text-gray-300">
          {componentsSectionEzMode.intro[platform]}
        </p>
        
        {/* Optional Enhancements section */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-4">
            {componentsSectionEzMode.optionalHeader}
          </p>
          
          <div className="space-y-4">
            {/* Faust toggle - all platforms */}
            {renderSimpleToggle(
              'faust',
              installFaust,
              onInstallFaustChange,
              optionalToggles.faust.label,
              optionalToggles.faust.description.easy
            )}
            
            {/* Intel IPP toggle - Windows only */}
            {platform === 'windows' && renderSimpleToggle(
              'intelIPP',
              installIPP,
              onInstallIPPChange,
              optionalToggles.intelIPP.label,
              optionalToggles.intelIPP.description.easy
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Dev Mode: Full component detection UI
  return (
    <div className="space-y-6">
      {/* Auto-Detect Section */}
      <Collapsible
        title={getContent(autoDetect.title)}
        icon={<Wand2 className="w-4 h-4 text-accent" />}
        defaultOpen={false}
      >
        <div className="space-y-4">
          {/* How it works - using Alert styling */}
          <Alert variant="info" title={autoDetect.howItWorks[explanationMode].title}>
            {autoDetect.howItWorks[explanationMode].intro && (
              <p className="text-xs mb-2">{autoDetect.howItWorks[explanationMode].intro}</p>
            )}
            <ol className="list-decimal list-inside space-y-1 text-xs">
              {autoDetect.howItWorks[explanationMode].steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </Alert>
          
          {/* Detection Script */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              {getContent(autoDetect.scriptLabel)}
            </p>
            <CodeBlock code={detectionScript} className="text-xs" />
          </div>
          
          {/* Paste Input */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              {getContent(autoDetect.pasteLabel)}
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={detectionInput}
                  onChange={(e) => setDetectionInput(e.target.value)}
                  placeholder={getContent(autoDetect.placeholder)}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handlePasteFromClipboard}
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Apply Button */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={applyDetectionResult}
              disabled={!detectionInput.trim()}
            >
              <Wand2 className="w-4 h-4" />
              {detectionApplied ? 'Applied!' : 'Apply Detection Result'}
            </Button>
            {detectionApplied && (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Checkboxes updated
              </span>
            )}
          </div>
        </div>
      </Collapsible>
      
      {/* Manual Selection Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          What needs to be installed?
        </label>
        <button
          type="button"
          onClick={() => setShowVerifyCommands(!showVerifyCommands)}
          className="text-xs text-accent hover:underline flex items-center gap-1"
        >
          {showVerifyCommands ? (
            <>Hide verification commands <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Show verification commands <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      </div>
      
      {/* Required Components */}
      <div className="space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Required</p>
        {requiredComponents.map(renderComponent)}
      </div>
      
      {/* Optional Components */}
      {optionalComponents.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Optional</p>
          {optionalComponents.map(renderComponent)}
        </div>
      )}
      
      {/* Summary */}
      {(() => {
        // Calculate counts (only for displayed components)
        const skipCount = displayedComponents.filter(c => {
          const isChecked = components[c.key];
          if (isChecked) return true;
          if (c.isOptional) {
            const isFaust = c.key === 'faust';
            const isIPP = c.key === 'intelIPP';
            const willInstallOptional = isFaust ? installFaust : isIPP ? installIPP : false;
            return !willInstallOptional;
          }
          return false;
        }).length;
        
        const installCount = displayedComponents.length - skipCount;
        
        return (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-gray-400">
                <CheckCircle className="w-4 h-4" />
                <strong>{skipCount}</strong> already installed
              </span>
              <span className="text-gray-600">|</span>
              <span className="flex items-center gap-2 text-accent">
                <Download className="w-4 h-4" />
                <strong>{installCount}</strong> {installCount === 1 ? 'component' : 'components'} will be installed
              </span>
            </div>
          </div>
        );
      })()}
      
      {/* Combined Verification Command */}
      {showVerifyCommands && combinedCommand && (
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-accent" />
            <p className="text-sm font-medium text-accent">Verify All Checked Components</p>
          </div>
          <p className="text-xs text-gray-500">
            Run this single command to verify all your checked components at once:
          </p>
          <CodeBlock 
            code={combinedCommand} 
            className="text-xs"
          />
          <div className="flex items-center gap-2 text-xs text-success">
            <CheckCircle className="w-3 h-3" />
            <span>Should output: <code className="bg-success/10 px-1.5 py-0.5 rounded">All checks passed: True</code></span>
          </div>
        </div>
      )}
    </div>
  );
}
