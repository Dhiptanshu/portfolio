"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, AnimatePresence } from "framer-motion";

const CORNER_SIZE = 10;
const CORNER_THICKNESS = 2;
const PADDING = 6;
const FREE_SIZE = 28;

export function CustomCursor() {
  const [isTouch, setIsTouch] = useState(true);
  const prefersReduced = useReducedMotion();
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);

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
  const springConfig = { stiffness: 1000, damping: 30, mass: 0.1 };
  const dotSpringConfig = { stiffness: 2000, damping: 20, mass: 0.01 };

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
  const isMouseDownRef = useRef(false);
  const lastShotTimeRef = useRef(0);

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

        if (isMouseDownRef.current) {
          const now = Date.now();
          if (now - lastShotTimeRef.current > 50) {
            spawnLaser(x, y);
            lastShotTimeRef.current = now;
          }
        }
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

    const spawnLaser = (x: number, y: number) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
      const id = Date.now() + Math.random();
      setClicks((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setClicks((prev) => prev.filter((c) => c.id !== id));
      }, 600);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!activeElementRef.current) {
        const t = e.target as HTMLElement;
        const isText = t.closest("p, h1, h2, h3, h4, h5, h6, span, article, input, textarea");
        if (!isText) {
          e.preventDefault(); // Prevent text selection on background click
        }
        
        isMouseDownRef.current = true;
        spawnLaser(e.clientX, e.clientY);
        lastShotTimeRef.current = Date.now();
      }
    };

    const onMouseUp = () => {
      isMouseDownRef.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [mouseX, mouseY, tlX, tlY, trX, trY, blX, blY, brX, brY, dotOpacity]);

  if (isTouch || prefersReduced) return null;

  return (
    <>
      {/* Top-Left Corner */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block border-t-2 border-l-2 border-primary/50 transition-colors custom-cursor-element"
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
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block border-t-2 border-r-2 border-primary/50 transition-colors custom-cursor-element"
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
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block border-b-2 border-l-2 border-primary/50 transition-colors custom-cursor-element"
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
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block border-b-2 border-r-2 border-primary/50 transition-colors custom-cursor-element"
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
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-primary rounded-full pointer-events-none z-[9999] hidden md:block shadow-[0_0_10px_hsl(var(--primary))] custom-cursor-element"
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

      {/* Shooting Animations */}
      <AnimatePresence>
        {clicks.map((click) => (
          <motion.div
            key={click.id}
            className="fixed pointer-events-none z-[9998]"
            style={{ left: click.x, top: click.y }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 1, filter: "brightness(3) blur(0px)" }}
              animate={{
                scale: [0, 1.2, 1, 1, 0],
                opacity: [1, 1, 0.8, 0.8, 0],
                filter: [
                  "brightness(3) blur(0px)",
                  "brightness(2) blur(2px)",
                  "brightness(1) blur(1px)",
                  "brightness(1) blur(1px)",
                  "brightness(0.5) blur(4px)"
                ]
              }}
              transition={{ duration: 0.6, times: [0, 0.2, 0.4, 0.8, 1], ease: "easeInOut" }}
              className="absolute w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_2px_hsl(var(--primary))]"
              style={{ marginLeft: -8, marginTop: -8 }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
