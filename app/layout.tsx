import type { Metadata } from 'next'
import './globals.css'
import { WizardProvider } from '@/contexts/WizardContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'HISE Setup Wizard',
  description: 'Setup your computer to compile HISE and export audio plugins',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <WizardProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </WizardProvider>
      </body>
    </html>
  )
}
