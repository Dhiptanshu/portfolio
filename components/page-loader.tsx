"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export function PageLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(timer);
  }, [prefersReduced]);

  if (prefersReduced) return <>{children}</>;

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-6"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="font-display text-lg uppercase tracking-widest text-primary">
              Loading Save File…
            </p>
            <div className="w-64 h-2 rpg-panel overflow-hidden bg-muted p-0" style={{ boxShadow: "2px 2px 0px hsl(var(--border))" }}>
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="text-xs text-muted-foreground tracking-wider uppercase">
              Press any key to skip
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </>
  );
}
