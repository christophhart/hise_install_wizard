import Link from 'next/link';
import Image from 'next/image';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowRight, Monitor, Apple, Terminal, Zap, Shield, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <PageContainer className="py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo_new.png"
            alt="HISE Logo"
            width={80}
            height={80}
            className="w-20 h-20"
          />
        </div>
        <h1 className="text-4xl font-bold mb-4">
          HISE Setup Wizard
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Get your development environment ready to compile HISE and export 
          professional audio plugins in minutes.
        </p>
        <Link href="/setup">
          <Button size="lg">
            Start Setup
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
      
      {/* Platforms */}
      <div className="mb-16">
        <h2 className="text-center text-lg font-medium text-gray-400 mb-6">
          Supported Platforms
        </h2>
        <div className="flex justify-center gap-8">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Monitor className="w-10 h-10" />
            <span>Windows</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Apple className="w-10 h-10" />
            <span>macOS</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Terminal className="w-10 h-10" />
            <span>Linux</span>
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Card>
          <CardContent className="pt-6">
            <Zap className="w-10 h-10 text-accent mb-4" />
            <h3 className="font-bold text-lg mb-2">Automated Setup</h3>
            <p className="text-gray-400 text-sm">
              Generates a customized setup script based on your system and preferences. 
              No manual configuration required.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <Shield className="w-10 h-10 text-accent mb-4" />
            <h3 className="font-bold text-lg mb-2">Smart Detection</h3>
            <p className="text-gray-400 text-sm">
              Detects what you already have installed and skips unnecessary steps. 
              Resume setup where you left off.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <Clock className="w-10 h-10 text-accent mb-4" />
            <h3 className="font-bold text-lg mb-2">Time Saving</h3>
            <p className="text-gray-400 text-sm">
              Complete setup in 15-30 minutes instead of hours of manual configuration 
              and troubleshooting.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* What it does */}
      <Card className="mb-16">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">What the wizard sets up</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>Git and HISE repository</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>C++ compiler (VS2022 / Xcode / GCC)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>JUCE framework (juce6 branch)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>ASIO and VST3 SDKs</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>HISE standalone compilation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>PATH environment configuration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span className="text-gray-400">Intel IPP (optional, Windows)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span className="text-gray-400">Faust DSP compiler (optional)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* CTA */}
      <div className="text-center">
        <p className="text-gray-400 mb-4">
          Ready to build your first audio plugin?
        </p>
        <Link href="/setup">
          <Button size="lg">
            Start Setup
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
}
