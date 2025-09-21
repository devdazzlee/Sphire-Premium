// components/client-wrapper.tsx (ROBUST VERSION)
'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Loading from './loading';

interface ClientWrapperProps {
  children: React.ReactNode;
}

function ClientWrapperContent({ children }: ClientWrapperProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const failsafeRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef<boolean>(true);
  const navigationCount = useRef<number>(0);

  // Clear all timers function
  const clearAllTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (failsafeRef.current) {
      clearTimeout(failsafeRef.current);
      failsafeRef.current = null;
    }
  };

  // Force stop loading function
  const forceStopLoading = () => {
    clearAllTimers();
    setIsLoading(false);
  };

  // Handle initial page load
  useEffect(() => {
    if (isInitialMount.current) {
      // Clear any existing timers
      clearAllTimers();
      
      // Main timer
      timerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      // Failsafe timer
      failsafeRef.current = setTimeout(() => {
        forceStopLoading();
      }, 3000);

      isInitialMount.current = false;
    }

    return () => clearAllTimers();
  }, []);

  // Handle route changes
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) return;

    navigationCount.current += 1;

    // Clear any existing timers first
    clearAllTimers();
    
    // Start loading
    setIsLoading(true);

    // Main navigation timer - shorter duration
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    // Failsafe timer - always stops loading after max time
    failsafeRef.current = setTimeout(() => {
      forceStopLoading();
    }, 1500);

    return () => clearAllTimers();
  }, [pathname, searchParams]);

  // Handle special navigation from order-success page
  useEffect(() => {
    const handleSpecialNavigation = (event: CustomEvent) => {
      const { from, to } = event.detail;
      if (from === 'order-success' && to === '/') {
        // Clear all timers and stop loading immediately
        clearAllTimers();
        setIsLoading(false);
      }
    };

    window.addEventListener('specialNavigation', handleSpecialNavigation as EventListener);
    
    return () => {
      window.removeEventListener('specialNavigation', handleSpecialNavigation as EventListener);
    };
  }, []);

  // Emergency cleanup on component unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Additional safety mechanism - force stop loading after 5 seconds regardless
  useEffect(() => {
    const emergencyTimer = setTimeout(() => {
      if (isLoading) {
        forceStopLoading();
      }
    }, 5000);

    return () => clearTimeout(emergencyTimer);
  }, [isLoading]);

  const handleLoadingComplete = (): void => {
    clearAllTimers();
    setIsLoading(false);
  };

  return (
    <>
      <Loading 
        isVisible={isLoading} 
        onComplete={handleLoadingComplete}
        duration={500} // Short duration in component
      />
      
      <div 
        style={{ 
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.2s ease-in-out',
          minHeight: '100vh'
        }}
      >
        {children}
      </div>

      {/* Clean production version - no debug panel */}
    </>
  );
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <Suspense fallback={<Loading isVisible={true} onComplete={() => {}} />}>
      <ClientWrapperContent>{children}</ClientWrapperContent>
    </Suspense>
  );
}