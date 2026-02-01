'use client';

import React from 'react';

interface WizardLayoutProps {
  children: React.ReactNode;
}

export default function WizardLayout({ children }: WizardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="px-4 py-3 flex items-center" style={{ backgroundColor: '#050505' }}>
        <img
          src="/images/logo_new.png"
          alt="HISE Logo"
          className="h-8 w-auto"
        />
        <span className="ml-3 text-lg font-semibold">HISE Install Wizard</span>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
}
