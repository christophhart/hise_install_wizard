interface SectionBadgeProps {
  /** The section number to display */
  number: number;
  /** Optional custom size (default: 'md') */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * A numbered badge used for section headers.
 * Displays a number in a circular accent-colored badge.
 */
export default function SectionBadge({ 
  number, 
  size = 'md',
  className = '' 
}: SectionBadgeProps) {
  const sizeClasses = size === 'sm' 
    ? 'w-5 h-5 text-[10px]' 
    : 'w-6 h-6 text-xs';

  return (
    <span 
      className={`
        ${sizeClasses}
        rounded-full bg-accent text-background font-bold 
        flex items-center justify-center
        ${className}
      `}
    >
      {number}
    </span>
  );
}
