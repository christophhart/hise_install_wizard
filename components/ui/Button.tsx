import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-medium rounded border transition-all duration-200 inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-accent text-background border-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-surface text-white border-border hover:border-accent hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
