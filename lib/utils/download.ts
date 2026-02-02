/**
 * Downloads content as a file to the user's computer.
 * Creates a temporary blob URL and triggers a download.
 */
export function downloadAsFile(content: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a unique filename by appending a timestamp.
 * Example: "hise-setup.ps1" -> "hise-setup_2024-01-15_14-30-00.ps1"
 */
export function generateUniqueFilename(baseFilename: string): string {
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);
  const ext = baseFilename.split('.').pop();
  const name = baseFilename.replace(`.${ext}`, '');
  return `${name}_${timestamp}.${ext}`;
}
