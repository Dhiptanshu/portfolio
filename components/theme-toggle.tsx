"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rpg-panel rpg-panel-interactive flex items-center justify-center p-2 rounded-md bg-card text-foreground group"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 group-hover:text-primary transition-colors" />
      ) : (
        <Moon className="h-5 w-5 group-hover:text-primary transition-colors" />
      )}
    </button>
  );
}
