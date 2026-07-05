'use client';

import { useRecruiterMode } from './recruiter-context';
import { Button } from '@/components/ui/button';
import { Briefcase, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function RecruiterButton() {
  const { isRecruiterMode, enableRecruiterMode, disableRecruiterMode, estimatedTime } = useRecruiterMode();

  return (
    <AnimatePresence>
      {!isRecruiterMode ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <Button 
            onClick={enableRecruiterMode}
            className="shadow-xl flex items-center gap-2 rounded-full px-4 h-12 bg-primary text-primary-foreground hover:scale-105 transition-transform"
          >
            <Briefcase className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Recruiter Mode</span>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-background/95 backdrop-blur border shadow-2xl p-2 rounded-full"
        >
          <div className="flex items-center gap-2 px-4 border-r">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold">Guided Tour Active</span>
            <span className="text-xs text-muted-foreground ml-2">~{estimatedTime} min read</span>
          </div>
          <Button variant="ghost" size="icon" onClick={disableRecruiterMode} className="rounded-full h-8 w-8 hover:bg-destructive hover:text-destructive-foreground">
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
