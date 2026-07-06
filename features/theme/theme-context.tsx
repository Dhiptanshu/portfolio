'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export interface Theme {
  id: string;
  name: string;
  slug: string;
  is_default: boolean;
  variables: Record<string, string>;
}

interface ThemeContextType {
  themes: Theme[];
  activeTheme: Theme | null;
  setTheme: (slug: string) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  themes: [],
  activeTheme: null,
  setTheme: () => {},
  isLoading: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function fetchThemes() {
      const { data } = await supabase.from('themes').select('*').eq('is_active', true);
      if (data && data.length > 0) {
        setThemes(data);
        const stored = localStorage.getItem('portfolio_theme');
        const defaultTheme = data.find(t => t.is_default) || data[0];
        
        let initialTheme = defaultTheme;
        if (stored) {
          const found = data.find(t => t.slug === stored);
          if (found) initialTheme = found;
        }
        
        setActiveTheme(initialTheme);
      }
      setIsLoading(false);
    }
    fetchThemes();
  }, [supabase]);

  const setTheme = (slug: string) => {
    const theme = themes.find(t => t.slug === slug);
    if (theme) {
      setActiveTheme(theme);
      localStorage.setItem('portfolio_theme', slug);
    }
  };

  useEffect(() => {
    if (activeTheme) {
      const root = document.documentElement;
      Object.entries(activeTheme.variables).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value as string);
      });
    }
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ themes, activeTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
