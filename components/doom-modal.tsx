"use client";

import { motion } from "framer-motion";
import { X, Smartphone } from "lucide-react";
import { useEffect } from "react";

export function DoomModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Prevent scrolling and hide custom cursor when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("doom-open");
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove("doom-open");
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("doom-open");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-background/90 backdrop-blur">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl h-[80vh] bg-black rounded-lg border-4 border-primary shadow-[0_0_40px_hsl(var(--primary))]/30 flex flex-col overflow-hidden rpg-panel"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-primary text-primary-foreground">
          <h2 className="font-display uppercase tracking-wider text-sm">DOOM (1993)</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/20 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Rotate Phone Overlay for Mobile Portrait */}
        <div className="md:hidden absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center text-white landscape:hidden">
          <Smartphone className="w-16 h-16 animate-pulse mb-6 rotate-90" />
          <h2 className="font-display text-2xl uppercase tracking-widest text-center">Rotate Phone</h2>
          <p className="mt-2 text-sm text-gray-400 font-mono text-center px-8">
            Please turn your device horizontally for the best experience.
          </p>
        </div>

        <div className="flex-1 w-full h-full bg-black relative z-10">
          <iframe
            src="/doom.html"
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
