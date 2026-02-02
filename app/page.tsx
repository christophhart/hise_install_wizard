import Link from 'next/link';
import Image from 'next/image';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Monitor, 
  Apple, 
  Terminal, 
  Download,
  Settings,
  CheckCircle2,
  RefreshCw,
  PackagePlus
} from 'lucide-react';

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
        <div className="flex gap-6 justify-center flex-wrap">
          <Link href="/setup" className="flex flex-col items-center gap-2 group">
            <Button size="lg">
              New Installation
              <PackagePlus className="w-5 h-5" />
            </Button>
            <p className="text-xs text-gray-500 max-w-[180px] text-center group-hover:text-gray-400 transition-colors">
              Set up HISE from scratch with all dependencies
            </p>
          </Link>
          <Link href="/update" className="flex flex-col items-center gap-2 group">
            <Button size="lg">
              Update HISE
              <RefreshCw className="w-5 h-5" />
            </Button>
            <p className="text-xs text-gray-500 max-w-[180px] text-center group-hover:text-gray-400 transition-colors">
              Pull latest working changes and recompile existing installation
            </p>
          </Link>
        </div>
      </div>
      
      {/* Platforms */}
      <div className="mb-16">
        <h2 className="text-center text-lg font-medium text-gray-400 mb-6">
          Supported Platforms
        </h2>
        <div className="flex justify-center gap-8">
          <div className="flex flex-col items-center gap-2 text-gray-400 hover:text-accent transition-colors">
            <Monitor className="w-10 h-10" />
            <span>Windows</span>
            <span className="text-xs text-gray-500">PowerShell</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-gray-400 hover:text-accent transition-colors">
            <Apple className="w-10 h-10" />
            <span>macOS</span>
            <span className="text-xs text-gray-500">x64 / ARM64</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-gray-400 hover:text-accent transition-colors">
            <Terminal className="w-10 h-10" />
            <span>Linux</span>
            <span className="text-xs text-gray-500">Bash</span>
          </div>
        </div>
      </div>
      
      {/* How it works */}
      <Card className="mb-16">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold mb-2">1. Configure</h3>
              <p className="text-gray-400 text-sm">
                Select your platform, choose an install path, and indicate which components are already installed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold mb-2">2. Download</h3>
              <p className="text-gray-400 text-sm">
                Get a script tailored to your system. Review the setup summary before running.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold mb-2">3. Run</h3>
              <p className="text-gray-400 text-sm">
                Execute the script in your terminal. It handles everything automatically with progress updates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      

    </PageContainer>
  );
}
