import type { Metadata } from 'next'
import './globals.css'
import { WizardProvider } from '@/contexts/WizardContext'

export const metadata: Metadata = {
  title: 'HISE Setup Wizard',
  description: 'Setup wizard for HISE development environment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-gray-100 min-h-screen">
        <WizardProvider>{children}</WizardProvider>
      </body>
    </html>
  )
}
