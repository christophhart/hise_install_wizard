'use client';

import { useState, useRef, useEffect } from 'react';
import { ExplanationMode } from '@/types/wizard';
import { BookOpen, Code2, Info } from 'lucide-react';

interface ExplanationModeSelectorProps {
  value: ExplanationMode;
  onChange: (mode: ExplanationMode) => void;
}

export default function ExplanationModeSelector({ 
  value, 
  onChange 
}: ExplanationModeSelectorProps) {
  const [showInfo, setShowInfo] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const isDevMode = value === 'dev';
  
  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current && 
        buttonRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowInfo(false);
      }
    }
    
    if (showInfo) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showInfo]);
  
  const handleToggle = () => {
    onChange(isDevMode ? 'easy' : 'dev');
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Toggle Container */}
      <div className="flex items-center gap-2">
        {/* Easy Mode Icon & Label */}
        <button
          type="button"
          onClick={() => onChange('easy')}
          className={`flex items-center gap-1 text-xs transition-colors ${
            !isDevMode ? 'text-accent' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="font-medium">Easy</span>
        </button>
        
        {/* iOS-style Toggle */}
        <button
          type="button"
          onClick={handleToggle}
          className={`
            relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
            ${isDevMode ? 'bg-accent' : 'bg-gray-600'}
          `}
          role="switch"
          aria-checked={isDevMode}
        >
          {/* Toggle Knob */}
          <span
            className={`
              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
              transition-transform duration-200 ease-in-out
              ${isDevMode ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
        
        {/* Dev Mode Icon & Label */}
        <button
          type="button"
          onClick={() => onChange('dev')}
          className={`flex items-center gap-1 text-xs transition-colors ${
            isDevMode ? 'text-accent' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="font-medium">Dev</span>
        </button>
      </div>
      
      {/* Info Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className={`
            p-1 rounded-full transition-colors
            ${showInfo 
              ? 'text-accent bg-accent/10' 
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'
            }
          `}
          aria-label="Mode information"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
        
        {/* Info Popup */}
        {showInfo && (
          <div
            ref={popupRef}
            className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-lg shadow-xl z-50"
          >
            {/* Arrow */}
            <div className="absolute -top-1.5 right-3 w-3 h-3 bg-surface border-l border-t border-border rotate-45" />
            
            <div className="p-3 space-y-3">
              {/* Easy Mode */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-accent">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-sm font-medium">Easy Mode</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Detailed explanations designed for users new to development environments and terminal usage.
                </p>
              </div>
              
              {/* Divider */}
              <hr className="border-border" />
              
              {/* Dev Mode */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-accent">
                  <Code2 className="w-3.5 h-3.5" />
                  <span className="text-sm font-medium">Dev Mode</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Concise, technical information for experienced developers who are familiar with terminal commands.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
