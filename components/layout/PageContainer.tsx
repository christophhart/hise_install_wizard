import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 ${className}`}>
      {children}
    </div>
  );
}
