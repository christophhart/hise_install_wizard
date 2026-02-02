'use client';

import { Platform, DetectedComponents } from '@/types/wizard';
import Checkbox from '@/components/ui/Checkbox';
import CodeBlock from '@/components/ui/CodeBlock';
import Button from '@/components/ui/Button';
import { ChevronDown, ChevronUp, CheckCircle, Download, PlayCircle, Wand2, HelpCircle, ClipboardPaste, X } from 'lucide-react';
import { useState } from 'react';

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
function formatPath(basePath: string, subPath: string, platform: Exclude<Platform, null>): string {
  if (platform === 'windows') {
    // Ensure Windows-style paths
    const winBase = basePath.replace(/\//g, '\\');
    const winSub = subPath.replace(/\//g, '\\');
    return `${winBase}${winSub}`;
  }
  // Unix-style paths
  const unixBase = basePath.replace(/\\/g, '/');
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

// Generate a detection script that outputs comma-separated list of installed components
function generateDetectionScript(
  platform: Exclude<Platform, null>,
  installPath: string
): string {
  // Get all components for this platform
  const platformComponents = componentInfoList.filter((c) => c.platforms.includes(platform));
  
  if (platform === 'windows') {
    // PowerShell script
    const checks = platformComponents.map((c) => {
      const cmd = c.getVerifyCommand(installPath, platform);
      return `if (${cmd}) { $r += "${c.key}," }`;
    }).join('\n');
    
    return `$r = ""\n${checks}\nif ($r) { $r.TrimEnd(",") } else { "none" }`;
  } else {
    // Bash script for macOS/Linux
    const checks = platformComponents.map((c) => {
      const cmd = c.getVerifyCommand(installPath, platform);
      return `[ "$(${cmd})" = "True" ] && r="\${r}${c.key},"`;
    }).join('\n');
    
    return `r=""\n${checks}\n[ -n "$r" ] && echo "\${r%,}" || echo "none"`;
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
    description: 'Visual Studio 2022 (Windows), Xcode (macOS), or GCC (Linux)',
    getVerifyCommand: (_, platform) => {
      const commands = {
        // Check for MSBuild in VS2022 installation directory
        windows: 'Test-Path "C:\\Program Files\\Microsoft Visual Studio\\2022\\*\\MSBuild\\Current\\Bin\\MSBuild.exe"',
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
      return `test -d "${path}/.git" && echo "True" || echo "False"`;
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
    getVerifyCommand: (_, platform) => {
      const commands = {
        // Check default Faust installation locations
        windows: 'Test-Path "C:\\Program Files\\Faust\\bin\\faust.exe"',
        macos: 'test -f /usr/local/bin/faust && echo "True" || echo "False"',
        linux: 'test -f /usr/local/bin/faust && echo "True" || echo "False"',
      };
      return commands[platform];
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
}: ComponentChecklistProps) {
  const [showVerifyCommands, setShowVerifyCommands] = useState(false);
  const [showAutoDetect, setShowAutoDetect] = useState(false);
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [detectionInput, setDetectionInput] = useState('');
  const [detectionApplied, setDetectionApplied] = useState(false);
  
  // Filter components for current platform
  const filteredComponents = componentInfoList.filter(
    (c) => c.platforms.includes(platform)
  );
  
  const requiredComponents = filteredComponents.filter(c => c.category === 'required');
  const optionalComponents = filteredComponents.filter(c => c.category === 'optional');
  
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
    const isChecked = components[component.key];
    const isFaust = component.key === 'faust';
    const isIPP = component.key === 'intelIPP';
    
    return (
      <div key={component.key} className="space-y-2">
        <Checkbox
          label={component.label}
          description={component.description}
          checked={isChecked}
          onChange={(e) => onChange(component.key, e.target.checked)}
        />
        
        {/* Install toggle for optional components when not already installed */}
        {component.isOptional && !isChecked && (
          <div className="ml-8 mt-2">
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
          <div className="ml-8 space-y-2">
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          What do you already have installed?
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
      
      {/* Auto-Detect Section */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white">Auto-Detect Components</span>
            <button
              type="button"
              onClick={() => setShowHelpPopup(!showHelpPopup)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowAutoDetect(!showAutoDetect)}
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            {showAutoDetect ? (
              <>Hide <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Show <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        </div>
        
        {/* Help Popup */}
        {showHelpPopup && (
          <div className="relative bg-background border border-border rounded-lg p-4 text-sm">
            <button
              type="button"
              onClick={() => setShowHelpPopup(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-gray-300 mb-2">
              <strong>How it works:</strong>
            </p>
            <ol className="list-decimal list-inside text-gray-400 space-y-1 text-xs">
              <li>Copy the detection script below</li>
              <li>Run it in your terminal ({platform === 'windows' ? 'PowerShell' : 'Terminal'})</li>
              <li>Copy the output (e.g., <code className="text-accent">git,compiler,hiseRepo</code>)</li>
              <li>Paste it in the input field below and click Apply</li>
              <li>The checkboxes will be automatically ticked based on the result</li>
            </ol>
          </div>
        )}
        
        {showAutoDetect && (
          <div className="space-y-4">
            {/* Detection Script */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                1. Run this command in {platform === 'windows' ? 'PowerShell' : 'Terminal'}:
              </p>
              <CodeBlock code={detectionScript} className="text-xs" />
            </div>
            
            {/* Paste Input */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                2. Paste the output here:
              </p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={detectionInput}
                    onChange={(e) => setDetectionInput(e.target.value)}
                    placeholder="e.g., git,compiler,hiseRepo,juce,sdks"
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
        )}
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
