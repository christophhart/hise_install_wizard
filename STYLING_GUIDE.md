# HISE Setup Wizard - Styling Guide

This document explains how to use the centralized styling system to maintain consistency across the application.

## Quick Start

Instead of repeating styling code on every page, use these reusable components and utilities:

### 1. WizardLayout Component

Wraps your entire page and includes the top bar with logo.

```tsx
import WizardLayout from '@/components/wizard/WizardLayout';

export default function MyPage() {
  return (
    <WizardLayout>
      {/* Your content here */}
    </WizardLayout>
  );
}
```

### 2. SetupPageContent Component

Standardizes the layout for setup pages (phase stepper + content area).

```tsx
import SetupPageContent from '@/components/wizard/SetupPageContent';

export default function Phase1Page() {
  return (
    <WizardLayout>
      <SetupPageContent phaseNumber={1}>
        {/* Your page content here */}
      </SetupPageContent>
    </WizardLayout>
  );
}
```

### 3. Style Constants

Use the centralized style constants instead of hardcoding values:

```tsx
import { colors, radius, buttonStyles } from '@/lib/styles/constants';

// In your component:
<div style={{ backgroundColor: colors.surface, borderRadius: radius.standard }}>
  Content
</div>

<button style={buttonStyles.success}>Success</button>
```

### 4. CSS Variables

Use CSS variables in inline styles or CSS files:

```tsx
// In inline styles
<div style={{ backgroundColor: 'var(--accent)' }}>Content</div>

// In CSS files
.my-element {
  background-color: var(--background);
  border-radius: var(--border-radius);
}
```

### 5. Common CSS Classes

Predefined utility classes available in `styles/common.css`:

```tsx
// Examples:
<div className="rounded-standard">Rounded</div>
<div className="container-standard">Container</div>
<div className="instruction-box">Instructions</div>
<button className="btn-success">Success</button>
<button className="btn-failure">Failure</button>
<button className="btn-skip">Skip</button>
<button className="btn-primary">Primary Action</button>
<div className="code-block">code</div>
```

## Color System

All colors are centralized in `lib/styles/constants.ts`:

| Variable | Value | Use Case |
|----------|-------|----------|
| `colors.background` | #222 | Page background |
| `colors.surface` | #333 | Component backgrounds |
| `colors.border` | #444 | Borders |
| `colors.topBar` | #050505 | Top navigation bar |
| `colors.accent` | #90FFB1 | Primary accent (HISE green) |
| `colors.success` | #4E8E35 | Success states |
| `colors.error` | #BB3434 | Error states |
| `colors.warning` | #FFBA00 | Warning states |
| `colors.codeBackground` | #111 | Code block backgrounds |
| `colors.codeText` | #999 | Code block text |

## Common Patterns

### Setup Page Layout

```tsx
import WizardLayout from '@/components/wizard/WizardLayout';
import SetupPageContent from '@/components/wizard/SetupPageContent';
import CommandBlock from '@/components/wizard/CommandBlock';

export default function PhaseXPage() {
  return (
    <WizardLayout>
      <SetupPageContent phaseNumber={X}>
        <h1 className="text-2xl font-bold mb-2">Phase X: Title</h1>
        <p style={{ color: '#999' }}>Description</p>
        
        {/* Instructions box */}
        <div style={{ backgroundColor: '#111', border: '1px solid #444', borderRadius: '3px', padding: '1rem' }}>
          <h3 style={{ color: '#90FFB1' }}>Instructions:</h3>
          {/* content */}
        </div>
        
        <CommandBlock command={command} />
        
        {/* Buttons */}
        <div className="flex gap-4">
          <button style={buttonStyles.success}>Success</button>
          <button style={buttonStyles.failure}>Failure</button>
          <button style={buttonStyles.skip}>Skip</button>
        </div>
      </SetupPageContent>
    </WizardLayout>
  );
}
```

### Instruction/Info Box

Use the `instruction-box` class or these styles:

```tsx
<div className="instruction-box">
  <h3 style={{ color: colors.accent }}>Instructions:</h3>
  {/* content */}
</div>
```

### Button Patterns

```tsx
import { buttonStyles } from '@/lib/styles/constants';
import { CheckCircle, XCircle, SkipForward } from 'lucide-react';

<button style={{ ...buttonStyles.success, border: '1px solid #444' }}>
  <CheckCircle size={18} />
  Success
</button>

<button style={{ ...buttonStyles.failure, border: '1px solid #444' }}>
  <XCircle size={18} />
  Failure
</button>

<button style={{ ...buttonStyles.skip, border: '1px solid #444' }}>
  <SkipForward size={18} />
  Skip
</button>
```

## When to Update

- **Adding new colors**: Update `lib/styles/constants.ts` and `app/globals.css`
- **Changing border radius globally**: Update `radius.standard` in constants
- **Adding new button style**: Add to `buttonStyles` in constants
- **Adding reusable CSS class**: Add to `styles/common.css`

## Migration Checklist

When refactoring existing pages:

- [ ] Replace hardcoded colors with `colors.*` constants
- [ ] Replace border-radius with `radius.standard`
- [ ] Use `WizardLayout` wrapper
- [ ] Use `SetupPageContent` for phase pages
- [ ] Replace button styles with `buttonStyles.*`
- [ ] Use CSS variables for inline styles where appropriate

## Future Improvements

- Create more specialized components (e.g., `InstructionBox`, `CodeBlock` components)
- Add theme switching capability
- Create a Storybook for component documentation
- Add dark/light mode support using CSS variables
