// Common utilities for detection script generation

// ============================================
// Bash Utilities (macOS/Linux)
// ============================================

export function generateDetectHeaderBash(): string {
  return `#!/bin/bash
# HISE Installation Detector
# This script searches for HISE installations on your system.
# It does NOT delete or modify any files.

# Colors
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'
BOLD='\\033[1m'
NC='\\033[0m'

# Spinner characters
spinner=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')

# Header
echo ""
echo -e "\${CYAN}╔══════════════════════════════════════════════════════╗\${NC}"
echo -e "\${CYAN}║\${NC}  \${BOLD}HISE INSTALLATION DETECTOR\${NC}                          \${CYAN}║\${NC}"
echo -e "\${CYAN}╠══════════════════════════════════════════════════════╣\${NC}"
echo -e "\${CYAN}║\${NC}  This script \${GREEN}ONLY SEARCHES\${NC} for HISE installations.   \${CYAN}║\${NC}"
echo -e "\${CYAN}║\${NC}  It does \${GREEN}NOT delete or modify\${NC} any files.             \${CYAN}║\${NC}"
echo -e "\${CYAN}║\${NC}                                                      \${CYAN}║\${NC}"
echo -e "\${CYAN}║\${NC}  \${YELLOW}Searching may take 1-3 minutes. Please wait...\${NC}      \${CYAN}║\${NC}"
echo -e "\${CYAN}╚══════════════════════════════════════════════════════╝\${NC}"
echo ""
`;
}

export function generateSpinnerBash(): string {
  return `# Spinner functions
spin_pid=""

start_spinner() {
    local i=0
    while true; do
        printf "\\r\${CYAN}[\${spinner[\$i]}]\${NC} Searching... "
        i=$(( (i + 1) % \${#spinner[@]} ))
        sleep 0.1
    done
}

stop_spinner() {
    if [ -n "\$spin_pid" ]; then
        kill "\$spin_pid" 2>/dev/null
        wait "\$spin_pid" 2>/dev/null
        printf "\\r                              \\r"
    fi
}

# Start the spinner in background
start_spinner &
spin_pid=\$!

# Ensure spinner stops on exit
trap stop_spinner EXIT
`;
}

export function generateDetectFooterBash(): string {
  return `# Footer
echo ""
echo -e "\${CYAN}╔══════════════════════════════════════════════════════╗\${NC}"
echo -e "\${CYAN}║\${NC}  \${GREEN}SEARCH COMPLETE\${NC}                                     \${CYAN}║\${NC}"
echo -e "\${CYAN}║\${NC}  No files were modified or deleted.                  \${CYAN}║\${NC}"
echo -e "\${CYAN}║\${NC}                                                      \${CYAN}║\${NC}"
echo -e "\${CYAN}║\${NC}  Copy the paths above and paste them into the        \${CYAN}║\${NC}"
echo -e "\${CYAN}║\${NC}  HISE Setup Wizard to continue.                      \${CYAN}║\${NC}"
echo -e "\${CYAN}╚══════════════════════════════════════════════════════╝\${NC}"
echo ""
`;
}

export function generateResultsOutputBash(): string {
  return `# Stop spinner
stop_spinner

# Display results
if [ -z "\$results" ]; then
    echo -e "\${YELLOW}No HISE installations found.\${NC}"
    echo ""
    echo "If you know where HISE is installed, you can enter the path manually"
    echo "in the HISE Setup Wizard."
else
    count=\$(echo "\$results" | wc -l | tr -d ' ')
    echo -e "\${GREEN}✓\${NC} Search complete! Found \${GREEN}\${count}\${NC} installation(s)."
    echo ""
    echo -e "\${CYAN}╔══════════════════════════════════════════════════════╗\${NC}"
    echo -e "\${CYAN}║\${NC}  \${BOLD}COPY THE TEXT BELOW:\${NC}                                \${CYAN}║\${NC}"
    echo -e "\${CYAN}╚══════════════════════════════════════════════════════╝\${NC}"
    echo "\$results"
fi
`;
}

// ============================================
// PowerShell Utilities (Windows)
// ============================================

export function generateDetectHeaderPS(): string {
  return `# HISE Installation Detector
# This script searches for HISE installations on your system.
# It does NOT delete or modify any files.

$ErrorActionPreference = "SilentlyContinue"

# Header
Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  HISE INSTALLATION DETECTOR                               " -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  This script " -NoNewline
Write-Host "ONLY SEARCHES" -ForegroundColor Green -NoNewline
Write-Host " for HISE installations."
Write-Host "  It does " -NoNewline
Write-Host "NOT delete or modify" -ForegroundColor Green -NoNewline
Write-Host " any files."
Write-Host ""
Write-Host "  Searching may take 1-3 minutes. Please wait..." -ForegroundColor Yellow
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""
`;
}

export function generateDetectFooterPS(): string {
  return `# Footer
Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  SEARCH COMPLETE" -ForegroundColor Green
Write-Host "  No files were modified or deleted." -ForegroundColor White
Write-Host ""
Write-Host "  Copy the paths above and paste them into the" -ForegroundColor White
Write-Host "  HISE Setup Wizard to continue." -ForegroundColor White
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""
`;
}

export function generateResultsOutputPS(): string {
  return `# Display results
if ($results.Count -eq 0) {
    Write-Host "No HISE installations found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If you know where HISE is installed, you can enter the path manually"
    Write-Host "in the HISE Setup Wizard."
} else {
    Write-Host "Search complete! Found $($results.Count) installation(s)." -ForegroundColor Green
    Write-Host ""
    Write-Host "===========================================================" -ForegroundColor Cyan
    Write-Host "  COPY THE TEXT BELOW:" -ForegroundColor White
    Write-Host "===========================================================" -ForegroundColor Cyan
    $results | ForEach-Object { Write-Host $_ }
}
`;
}
