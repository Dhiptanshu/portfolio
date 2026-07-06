'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { slideUp, fadeIn, staggerContainer, hoverScale } from './variants';
import { useMousePosition, useParallax } from './hooks';

interface MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: MotionProps) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay }}
      className={className}
      style={shouldReduceMotion ? { opacity: 1 } : {}}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ children, className, delay = 0 }: MotionProps) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={slideUp}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className }: MotionProps) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={staggerContainer}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCard({ children, className }: MotionProps) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={hoverScale}
      whileHover={shouldReduceMotion ? undefined : "hover"}
      whileTap={shouldReduceMotion ? undefined : "tap"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxLayer({ children, distance, className }: { children: React.ReactNode, distance: number, className?: string }) {
  const y = useParallax(distance);
  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

export function PageTransition({ children, key }: { children: React.ReactNode, key: string }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function MouseFollower() {
  const { x, y } = useMousePosition();
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-primary/50 pointer-events-none z-50 mix-blend-difference hidden md:block"
      animate={{
        x: x - 16,
        y: y - 16,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.5
      }}
    />
  );
}
