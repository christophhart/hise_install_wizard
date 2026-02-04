// Windows detection script generator

import {
  generateDetectHeaderPS,
  generateResultsOutputPS,
  generateDetectFooterPS,
} from './common';

export function generateWindowsDetectScript(): string {
  const sections: string[] = [];

  // Header with reassurance messaging
  sections.push(generateDetectHeaderPS());

  // Search logic with progress
  sections.push(`# Search for HISE installations
$results = @()
$drives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Free -ne $null }
$totalDrives = $drives.Count
$currentDrive = 0

foreach ($drive in $drives) {
    $currentDrive++
    $driveLetter = $drive.Root
    Write-Progress -Activity "Searching for HISE installations" -Status "Scanning $driveLetter" -PercentComplete (($currentDrive / $totalDrives) * 100)
    
    Get-ChildItem -Path $driveLetter -Recurse -Directory -Filter "HISE" -ErrorAction SilentlyContinue | ForEach-Object {
        $jucerPath = Join-Path $_.FullName "projects\\standalone\\HISE Standalone.jucer"
        if (Test-Path $jucerPath) {
            $faustDll = Join-Path $_.FullName "tools\\faust\\lib\\faust.dll"
            $faustDir = Join-Path $_.FullName "tools\\faust"
            if ((Test-Path $faustDll) -or (Test-Path $faustDir)) {
                $results += "$($_.FullName)|faust"
            } else {
                $results += "$($_.FullName)|nofaust"
            }
        }
    }
}

Write-Progress -Activity "Searching for HISE installations" -Completed
`);

  // Results output
  sections.push(generateResultsOutputPS());

  // Footer
  sections.push(generateDetectFooterPS());

  return sections.join('\n');
}
