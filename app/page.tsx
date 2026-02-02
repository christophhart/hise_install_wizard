import Link from 'next/link';
import Image from 'next/image';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Monitor, 
  Download,
  Settings,
  CheckCircle2,
  RefreshCw,
  PackagePlus,
  Shield,
  SearchCheck,
  LifeBuoy
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
      
      {/* Features */}
      <Card className="mb-16">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-6 text-center">Features</h2>
          <div className="space-y-4">
            {/* Smart Version Selection */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Smart Version Selection</h3>
                <p className="text-gray-400 text-sm">
                  Automatically checks CI build status and uses the last known working commit if the latest is broken.
                </p>
              </div>
            </div>
            
            {/* Auto-Detect Components */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <SearchCheck className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Auto-Detect Components</h3>
                <p className="text-gray-400 text-sm">
                  Detects already-installed tools like Git, compilers, and Faust, then skips unnecessary setup steps.
                </p>
              </div>
            </div>
            
            {/* Cross-Platform Support */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Monitor className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Cross-Platform Support</h3>
                <p className="text-gray-400 text-sm">
                  Native scripts for Windows (PowerShell), macOS (x64 & ARM64), and Linux (Bash). No extra tools needed.
                </p>
              </div>
            </div>
            
            {/* Built-in Error Handling */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <LifeBuoy className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Built-in Error Handling</h3>
                <p className="text-gray-400 text-sm">
                  Scripts include error detection with colored output and links to troubleshooting resources.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
