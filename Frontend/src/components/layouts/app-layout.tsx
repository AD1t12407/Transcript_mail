import { ReactNode } from 'react';
import { Header } from '@/components/header';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  centered?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

export function AppLayout({
  children,
  centered = false,
  maxWidth = 'full',
  className
}: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Map maxWidth to Tailwind classes - only used when not full
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    'full': ''
  };
  
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Header />
      <main className={cn(
        "flex-1 w-full",
        className
      )}>
        <div className={cn(
          "w-full", 
          maxWidth === 'full' ? "px-4 sm:px-8" : cn("mx-auto px-4 sm:px-6 lg:px-8", maxWidthClasses[maxWidth]),
          centered && "flex flex-col items-center justify-center"
        )}>
          {children}
        </div>
      </main>
      <footer className="w-full py-6 border-t">
        <div className={cn(
          "w-full text-center text-sm text-muted-foreground",
          maxWidth === 'full' ? "px-4 sm:px-8" : cn("mx-auto px-4 sm:px-6 lg:px-8", maxWidthClasses[maxWidth])
        )}>
          <p>© {new Date().getFullYear()} ConvoInsight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}