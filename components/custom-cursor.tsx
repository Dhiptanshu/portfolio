"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

const CORNER_SIZE = 10;
const CORNER_THICKNESS = 2;
const PADDING = 6;
const FREE_SIZE = 28;

export function CustomCursor() {
  const [isTouch, setIsTouch] = useState(true);
  const prefersReduced = useReducedMotion();

  // Mouse positions (raw)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Individual corner positions (MotionValues)
  const tlX = useMotionValue(-100);
  const tlY = useMotionValue(-100);
  const trX = useMotionValue(-100);
  const trY = useMotionValue(-100);
  const blX = useMotionValue(-100);
  const blY = useMotionValue(-100);
  const brX = useMotionValue(-100);
  const brY = useMotionValue(-100);
  
  // Opacity of center dot
  const dotOpacity = useMotionValue(1);

  // Springs for smooth movement on the GPU (transform: translate3d)
  const springConfig = { stiffness: 450, damping: 28, mass: 0.4 };
  const dotSpringConfig = { stiffness: 600, damping: 30, mass: 0.2 };

  const sTlX = useSpring(tlX, springConfig);
  const sTlY = useSpring(tlY, springConfig);
  const sTrX = useSpring(trX, springConfig);
  const sTrY = useSpring(trY, springConfig);
  const sBlX = useSpring(blX, springConfig);
  const sBlY = useSpring(blY, springConfig);
  const sBrX = useSpring(brX, springConfig);
  const sBrY = useSpring(brY, springConfig);

  const dotX = useSpring(mouseX, dotSpringConfig);
  const dotY = useSpring(mouseY, dotSpringConfig);

  const activeElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouch(true);
      return;
    }
    setIsTouch(false);

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // If we're not hovering an interactive element, position corners around mouse cursor
      if (!activeElementRef.current) {
        const x = e.clientX;
        const y = e.clientY;
        const half = FREE_SIZE / 2;

        tlX.set(x - half);
        tlY.set(y - half);
        trX.set(x + half - CORNER_SIZE);
        trY.set(y - half);
        blX.set(x - half);
        blY.set(y + half - CORNER_SIZE);
        brX.set(x + half - CORNER_SIZE);
        brY.set(y + half - CORNER_SIZE);
      }
    };

    const updateSnapping = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const lx = rect.left - PADDING;
      const rx = rect.left + rect.width + PADDING;
      const ty = rect.top - PADDING;
      const by = rect.top + rect.height + PADDING;

      tlX.set(lx);
      tlY.set(ty);
      trX.set(rx - CORNER_SIZE);
      trY.set(ty);
      blX.set(lx);
      blY.set(by - CORNER_SIZE);
      brX.set(rx - CORNER_SIZE);
      brY.set(by - CORNER_SIZE);
      
      dotOpacity.set(0); // Hide center dot when snapped
    };

    const onMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive =
        t.closest("a") ||
        t.closest("button") ||
        t.closest("[role='button']") ||
        t.closest(".rpg-panel-interactive");

      if (interactive instanceof HTMLElement) {
        activeElementRef.current = interactive;
        updateSnapping(interactive);
      } else {
        activeElementRef.current = null;
        dotOpacity.set(1);

        const x = e.clientX;
        const y = e.clientY;
        const half = FREE_SIZE / 2;

        tlX.set(x - half);
        tlY.set(y - half);
        trX.set(x + half - CORNER_SIZE);
        trY.set(y - half);
        blX.set(x - half);
        blY.set(y + half - CORNER_SIZE);
        brX.set(x + half - CORNER_SIZE);
        brY.set(y + half - CORNER_SIZE);
      }
    };

    const onScroll = () => {
      if (activeElementRef.current) {
        updateSnapping(activeElementRef.current);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("scroll", onScroll);
    };
  }, [mouseX, mouseY, tlX, tlY, trX, trY, blX, blY, brX, brY, dotOpacity]);

  if (isTouch || prefersReduced) return null;

  return (
    <>
      {/* Top-Left Corner */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block border-t-2 border-l-2"
        style={{
          x: sTlX,
          y: sTlY,
          width: CORNER_SIZE,
          height: CORNER_SIZE,
          borderColor: "hsl(var(--primary))",
        }}
      />
      {/* Top-Right Corner */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block border-t-2 border-r-2"
        style={{
          x: sTrX,
          y: sTrY,
          width: CORNER_SIZE,
          height: CORNER_SIZE,
          borderColor: "hsl(var(--primary))",
        }}
      />
      {/* Bottom-Left Corner */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block border-b-2 border-l-2"
        style={{
          x: sBlX,
          y: sBlY,
          width: CORNER_SIZE,
          height: CORNER_SIZE,
          borderColor: "hsl(var(--primary))",
        }}
      />
      {/* Bottom-Right Corner */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block border-b-2 border-r-2"
        style={{
          x: sBrX,
          y: sBrY,
          width: CORNER_SIZE,
          height: CORNER_SIZE,
          borderColor: "hsl(var(--primary))",
        }}
      />

      {/* Center Crosshair Dot */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] hidden md:block"
        style={{
          x: dotX,
          y: dotY,
          width: 4,
          height: 4,
          marginLeft: -2,
          marginTop: -2,
          backgroundColor: "hsl(var(--primary))",
          opacity: dotOpacity,
        }}
      />
    </>
  );
}
