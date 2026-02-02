'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-surface border-b border-border">
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
        
        <nav className="flex items-center gap-4">
          <Link 
            href="/help" 
            className="text-sm text-gray-400 hover:text-accent transition-colors"
          >
            Need Help?
          </Link>
        </nav>
      </div>
    </header>
  );
}
