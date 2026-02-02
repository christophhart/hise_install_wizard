import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  title?: string;
  className?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; icon: typeof Info }> = {
  info: {
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    icon: Info,
  },
  success: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    icon: CheckCircle,
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    icon: AlertTriangle,
  },
  error: {
    bg: 'bg-error/10',
    border: 'border-error/30',
    icon: AlertCircle,
  },
};

const iconColors: Record<AlertVariant, string> = {
  info: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

export default function Alert({ 
  children, 
  variant = 'info', 
  title,
  className = '' 
}: AlertProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;
  
  return (
    <div className={`${styles.bg} ${styles.border} border rounded p-4 ${className}`}>
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[variant]}`} />
        <div className="flex-1">
          {title && (
            <h4 className="font-medium text-white mb-1">{title}</h4>
          )}
          <div className="text-sm text-gray-300">{children}</div>
        </div>
      </div>
    </div>
  );
}
