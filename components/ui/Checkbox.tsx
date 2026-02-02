'use client';

import { InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

export default function Checkbox({ 
  label, 
  description,
  className = '',
  checked,
  onChange,
  id,
  disabled,
  ...props 
}: CheckboxProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <label 
      htmlFor={inputId} 
      className={`
        flex items-start gap-3 cursor-pointer group
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div className={`
          w-5 h-5 rounded border-2 
          flex items-center justify-center
          transition-colors duration-200
          ${checked 
            ? 'bg-accent border-accent' 
            : 'bg-transparent border-border group-hover:border-gray-400'
          }
          ${disabled ? '' : 'peer-focus:ring-2 peer-focus:ring-accent/50'}
        `}>
          {checked && <Check className="w-3 h-3 text-background" strokeWidth={3} />}
        </div>
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-white">{label}</span>
        {description && (
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}
