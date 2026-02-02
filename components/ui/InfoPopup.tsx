'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { Info } from 'lucide-react';

interface InfoPopupProps {
  children: ReactNode;
  className?: string;
}

export default function InfoPopup({ children, className = '' }: InfoPopupProps) {
  const [showInfo, setShowInfo] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowInfo(!showInfo)}
        className={`
          p-1.5 rounded-full transition-colors
          ${showInfo
            ? 'text-accent bg-accent/10'
            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'
          }
        `}
        aria-label="More information"
      >
        <Info className="w-4 h-4" />
      </button>

      {/* Info Popup */}
      {showInfo && (
        <div
          ref={popupRef}
          className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded-lg shadow-xl z-50"
        >
          {/* Arrow */}
          <div className="absolute -top-1.5 right-3 w-3 h-3 bg-surface border-l border-t border-border rotate-45" />

          <div className="p-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
