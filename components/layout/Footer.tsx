import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <Link 
              href="https://hise.audio" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              hise.audio
            </Link>
            <Link 
              href="https://forum.hise.audio" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Forum
            </Link>
            <Link 
              href="https://docs.hise.dev" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Documentation
            </Link>
            <Link 
              href="https://github.com/christophhart/HISE" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              GitHub
            </Link>
          </div>
          
<div className="text-gray-500">
            {process.env.NEXT_PUBLIC_COMMIT_MESSAGE}
          </div>
        </div>
      </div>
    </footer>
  );
}
