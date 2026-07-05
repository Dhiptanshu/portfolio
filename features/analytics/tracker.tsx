'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Exclude admin paths from analytics
    if (pathname?.startsWith('/admin')) return;

    const initSession = async () => {
      try {
        const isReturning = localStorage.getItem('portfolio_visited') === 'true';
        const res = await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'init_session', is_returning }),
        });
        const data = await res.json();
        if (data.session_id) {
          sessionIdRef.current = data.session_id;
          localStorage.setItem('portfolio_visited', 'true');
          
          // Log page view
          fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'event',
              session_id: data.session_id,
              event_type: 'page_view',
              path: pathname
            }),
          });
        }
      } catch (err) {
        console.error('Analytics init failed:', err);
      }
    };

    initSession();

  }, [pathname]);

  // Ping for duration tracking
  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;

    const interval = setInterval(() => {
      if (sessionIdRef.current && document.visibilityState === 'visible') {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ping', session_id: sessionIdRef.current }),
          keepalive: true
        }).catch(() => {});
      }
    }, 15000); // Ping every 15 seconds

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
