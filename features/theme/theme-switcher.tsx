'use client';

import { useTheme } from './theme-context';

export function ThemeSwitcher() {
  const { themes, activeTheme, setTheme, isLoading } = useTheme();

  if (isLoading || themes.length <= 1) return null;

  return (
    <select
      value={activeTheme?.slug || ''}
      onChange={(e) => setTheme(e.target.value)}
      className="flex h-9 w-[130px] items-center justify-between rounded-full border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="" disabled>Theme</option>
      {themes.map((theme) => (
        <option key={theme.slug} value={theme.slug}>
          {theme.name}
        </option>
      ))}
    </select>
  );
}
