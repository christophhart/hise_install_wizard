/**
 * Centralized style constants for the HISE Setup Wizard
 * Use these instead of hardcoding values throughout the app
 */

export const colors = {
  background: '#222',
  surface: '#333',
  border: '#444',
  topBar: '#050505',
  accent: '#90FFB1',
  error: '#BB3434',
  success: '#4E8E35',
  warning: '#FFBA00',
  codeBackground: '#111',
  codeText: '#999',
  text: {
    primary: '#FFF',
    secondary: '#CCC',
    muted: '#999',
  },
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
} as const;

export const radius = {
  standard: '3px',
} as const;

export const borders = {
  standard: `1px solid ${colors.border}`,
} as const;

export const buttonStyles = {
  success: {
    backgroundColor: colors.success,
    color: '#fff',
    borderRadius: radius.standard,
  },
  failure: {
    backgroundColor: colors.error,
    color: '#fff',
    borderRadius: radius.standard,
  },
  skip: {
    backgroundColor: colors.surface,
    color: colors.codeText,
    borderRadius: radius.standard,
  },
  primary: {
    backgroundColor: colors.accent,
    color: colors.background,
    borderRadius: radius.standard,
  },
} as const;

export const containerStyles = {
  standard: {
    backgroundColor: colors.surface,
    border: borders.standard,
    borderRadius: radius.standard,
  },
  instruction: {
    backgroundColor: colors.codeBackground,
    border: borders.standard,
    borderRadius: radius.standard,
  },
} as const;

export const fonts = {
  body: "'Lato', sans-serif",
  mono: "'Source Code Pro', monospace",
} as const;
