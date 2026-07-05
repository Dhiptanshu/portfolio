'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface RecruiterContextType {
  isRecruiterMode: boolean;
  enableRecruiterMode: () => void;
  disableRecruiterMode: () => void;
  readingProgress: number;
  setReadingProgress: (progress: number) => void;
  estimatedTime: number;
}

const RecruiterContext = createContext<RecruiterContextType | undefined>(undefined);

export function RecruiterProvider({ children }: { children: React.ReactNode }) {
  const [isRecruiterMode, setIsRecruiterMode] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(5);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Fetch global recruiter settings (like reading time)
    fetch('/api/recruiter-settings')
      .then(r => r.json())
      .then(d => {
        if (d.estimated_reading_time) setEstimatedTime(d.estimated_reading_time);
      })
      .catch(() => {});

    const isMode = searchParams?.get('recruiter') === 'true' || localStorage.getItem('recruiterMode') === 'true';
    if (isMode && !pathname?.startsWith('/admin')) {
      setIsRecruiterMode(true);
      localStorage.setItem('recruiterMode', 'true');
    }
  }, [searchParams, pathname]);

  const enableRecruiterMode = () => {
    setIsRecruiterMode(true);
    localStorage.setItem('recruiterMode', 'true');
    try {
      // Optional analytics ping
      const sessionId = localStorage.getItem('portfolio_visited');
      if (sessionId) {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'event', event_type: 'recruiter_mode_toggle', metadata: { state: 'enabled' } })
        });
      }
    } catch(e) {}
  };

  const disableRecruiterMode = () => {
    setIsRecruiterMode(false);
    localStorage.setItem('recruiterMode', 'false');
    router.push('/');
  };

  return (
    <RecruiterContext.Provider value={{ 
      isRecruiterMode, 
      enableRecruiterMode, 
      disableRecruiterMode, 
      readingProgress, 
      setReadingProgress,
      estimatedTime
    }}>
      {children}
    </RecruiterContext.Provider>
  );
}

export function useRecruiterMode() {
  const context = useContext(RecruiterContext);
  if (context === undefined) {
    throw new Error('useRecruiterMode must be used within a RecruiterProvider');
  }
  return context;
}
