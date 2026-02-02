'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ExplanationModeSelector from '@/components/wizard/ExplanationModeSelector';
import { useExplanationMode } from '@/hooks/useExplanationMode';

export default function Header() {
  const pathname = usePathname();
  const { mode, setMode } = useExplanationMode();
  
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
            value={mode}
            onChange={setMode}
          />
        )}
      </div>
    </header>
  );
}
