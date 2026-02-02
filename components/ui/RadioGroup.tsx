'use client';

import { ReactNode } from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
}

export default function RadioGroup({ 
  name, 
  options, 
  value, 
  onChange,
  className = '' 
}: RadioGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-start gap-3 p-3 rounded border cursor-pointer
            transition-colors duration-200
            ${value === option.value 
              ? 'border-accent bg-accent/10' 
              : 'border-border hover:border-gray-400'
            }
            ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={option.disabled}
              className="sr-only peer"
            />
            <div className={`
              w-5 h-5 rounded-full border-2
              flex items-center justify-center
              transition-colors duration-200
              ${value === option.value 
                ? 'border-accent' 
                : 'border-border'
              }
            `}>
              {value === option.value && (
                <div className="w-2.5 h-2.5 rounded-full bg-accent" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-white">{option.label}</span>
            {option.description && (
              <p className="text-sm text-gray-400 mt-0.5">{option.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}
