import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ 
  label, 
  error, 
  className = '', 
  id,
  ...props 
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  // Extract flex-related classes for the wrapper div
  const flexClasses = className.split(' ').filter(c => 
    c.startsWith('flex-') || c === 'flex' || c.startsWith('min-w-') || c.startsWith('w-')
  ).join(' ');
  
  // Keep remaining classes for the textarea
  const textareaClasses = className.split(' ').filter(c => 
    !c.startsWith('flex-') && c !== 'flex' && !c.startsWith('min-w-') && !c.startsWith('w-')
  ).join(' ');
  
  return (
    <div className={`space-y-1 ${flexClasses}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full px-3 py-2 
          bg-code-bg text-white 
          border border-border rounded 
          focus:outline-none focus:border-accent 
          placeholder:text-gray-500
          font-mono text-sm
          resize-y min-h-[120px]
          ${error ? 'border-error' : ''}
          ${textareaClasses}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}
