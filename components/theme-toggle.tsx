"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [wipe, setWipe] = React.useState<{ x: number; y: number; toTheme: string } | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const prefersReduced = useReducedMotion();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    const nextTheme = isDark ? "light" : "dark";

    if (prefersReduced || !buttonRef.current) {
      setTheme(nextTheme);
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    setWipe({ x: cx, y: cy, toTheme: nextTheme });
  };

  const handleWipeComplete = () => {
    if (wipe) {
      setTheme(wipe.toTheme);
      // Small delay to let the theme class apply before removing overlay
      setTimeout(() => setWipe(null), 50);
    }
  };

  // Calculate max radius needed to cover the full viewport from the wipe origin
  const maxRadius = wipe
    ? Math.ceil(
        Math.sqrt(
          Math.max(wipe.x, window.innerWidth - wipe.x) ** 2 +
            Math.max(wipe.y, window.innerHeight - wipe.y) ** 2
        )
      )
    : 0;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="rpg-panel rpg-panel-interactive flex items-center justify-center p-2 rounded-md bg-card text-foreground group"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-5 w-5 group-hover:text-primary transition-colors" />
        ) : (
          <Moon className="h-5 w-5 group-hover:text-primary transition-colors" />
        )}
      </button>

      <AnimatePresence>
        {wipe && (
          <motion.div
            key="theme-wipe"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 9998,
              pointerEvents: "none",
              backgroundColor: wipe.toTheme === "dark" ? "#14111c" : "#ECE4D4",
              clipPath: `circle(0px at ${wipe.x}px ${wipe.y}px)`,
            }}
            animate={{
              clipPath: `circle(${maxRadius}px at ${wipe.x}px ${wipe.y}px)`,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              clipPath: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.2, delay: 0.1 },
            }}
            onAnimationComplete={handleWipeComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}
