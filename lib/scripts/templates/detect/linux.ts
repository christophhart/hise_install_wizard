// Linux detection script generator

import {
  generateDetectHeaderBash,
  generateSpinnerBash,
  generateResultsOutputBash,
  generateDetectFooterBash,
} from './common';

export function generateLinuxDetectScript(): string {
  const sections: string[] = [];

  // Header with reassurance messaging
  sections.push(generateDetectHeaderBash());

  // Spinner setup
  sections.push(generateSpinnerBash());

  // Search logic (no Faust check on Linux - it's system-wide)
  sections.push(`# Perform the search
# Use realpath to normalize paths (resolves symlinks and bind mounts)
# Then sort -u to deduplicate results
results=$(find / -type f -name "HISE Standalone.jucer" 2>/dev/null | while read -r jucer; do
    raw_path=$(echo "$jucer" | sed 's|/projects/standalone/HISE Standalone.jucer||')
    # Normalize the path to its canonical form
    hise_path=$(realpath "$raw_path" 2>/dev/null || echo "$raw_path")
    if [ -d "$hise_path" ]; then
        # Faust is system-wide on Linux, so we don't check for it in the HISE folder
        echo "$hise_path|nofaust"
    fi
done | sort -u)
`);

  // Results output
  sections.push(generateResultsOutputBash());

  // Footer
  sections.push(generateDetectFooterBash());

  return sections.join('\n');
}
