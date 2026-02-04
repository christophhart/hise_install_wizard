// macOS detection script generator

import {
  generateDetectHeaderBash,
  generateSpinnerBash,
  generateResultsOutputBash,
  generateDetectFooterBash,
} from './common';

export function generateMacOSDetectScript(): string {
  const sections: string[] = [];

  // Header with reassurance messaging
  sections.push(generateDetectHeaderBash());

  // Spinner setup
  sections.push(generateSpinnerBash());

  // Search logic
  sections.push(`# Perform the search
# Normalize paths by:
# 1. Stripping /System/Volumes/Data prefix (APFS firmlinks - realpath doesn't resolve these)
# 2. Using realpath for symlinks
# Then sort -u to deduplicate results
results=$(find / -type f -name "HISE Standalone.jucer" 2>/dev/null | while read -r jucer; do
    raw_path=$(echo "$jucer" | sed 's|/projects/standalone/HISE Standalone.jucer||')
    # Strip APFS firmlink prefix if present (macOS Catalina+)
    raw_path=$(echo "$raw_path" | sed 's|^/System/Volumes/Data||')
    # Then resolve any remaining symlinks
    hise_path=$(realpath "$raw_path" 2>/dev/null || echo "$raw_path")
    if [ -d "$hise_path" ]; then
        # Check for Faust installation
        if [ -f "$hise_path/tools/faust/lib/libfaust.dylib" ] || [ -d "$hise_path/tools/faust" ]; then
            echo "$hise_path|faust"
        else
            echo "$hise_path|nofaust"
        fi
    fi
done | sort -u)
`);

  // Results output
  sections.push(generateResultsOutputBash());

  // Footer
  sections.push(generateDetectFooterBash());

  return sections.join('\n');
}
