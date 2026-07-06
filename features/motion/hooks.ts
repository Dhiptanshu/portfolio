'use client';

import { useState, useEffect } from 'react';
import { useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return mousePosition;
}

export function useSmoothScroll(offset: [number, number] = [0, 1]) {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return smoothProgress;
}

export function useParallax(distance: number = 50) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  
  // Return a static value if reduced motion is preferred
  const y = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : distance]);
  
  return y;
}
