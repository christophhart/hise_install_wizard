'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExplanationMode } from '@/types/wizard';
import ExplanationModeSelector from '@/components/wizard/ExplanationModeSelector';

// Local storage key for shared explanation mode preference
const EXPLANATION_MODE_KEY = 'hise-wizard-explanation-mode';

export default function Header() {
  const pathname = usePathname();
  const [explanationMode, setExplanationModeState] = useState<ExplanationMode>('easy');
  
  // Load explanation mode from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(EXPLANATION_MODE_KEY);
      if (stored === 'easy' || stored === 'dev') {
        setExplanationModeState(stored);
      }
    }
  }, []);
  
  // Listen for storage changes (from other tabs or context updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === EXPLANATION_MODE_KEY && (e.newValue === 'easy' || e.newValue === 'dev')) {
        setExplanationModeState(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const handleModeChange = (mode: ExplanationMode) => {
    setExplanationModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(EXPLANATION_MODE_KEY, mode);
      // Dispatch a custom event so contexts can sync
      window.dispatchEvent(new CustomEvent('explanationModeChange', { detail: mode }));
    }
  };
  
  // Show mode selector on setup and update pages (not on landing page)
  const showModeSelector = pathname?.startsWith('/setup') || pathname?.startsWith('/update');
  
  return (
    <header className="bg-black border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/images/logo_new.png"
            alt="HISE Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="font-bold text-lg">HISE Setup Wizard</span>
        </Link>
        
        {showModeSelector && (
          <ExplanationModeSelector
            value={explanationMode}
            onChange={handleModeChange}
          />
        )}
      </div>
    </header>
  );
}
