/**
 * Expands tilde (~) to $HOME in a path for use in bash scripts.
 * This ensures paths work correctly when quoted in shell commands.
 */
export function expandHomePath(path: string): string {
  return path.startsWith('~') ? path.replace('~', '$HOME') : path;
}
