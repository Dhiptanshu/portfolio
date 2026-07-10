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

  // Rectangle target dimensions
  const rectX = useMotionValue(-100);
  const rectY = useMotionValue(-100);
  const rectW = useMotionValue(FREE_SIZE);
  const rectH = useMotionValue(FREE_SIZE);
  
  // Opacity of center dot
  const dotOpacity = useMotionValue(1);

  // Springs for smooth movement
  const springConfig = { stiffness: 450, damping: 28, mass: 0.4 };
  const dotSpringConfig = { stiffness: 600, damping: 30, mass: 0.2 };

  const x = useSpring(rectX, springConfig);
  const y = useSpring(rectY, springConfig);
  const w = useSpring(rectW, springConfig);
  const h = useSpring(rectH, springConfig);

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

      // If we're not hovering an interactive element, center the bounding box on the mouse
      if (!activeElementRef.current) {
        rectX.set(e.clientX - FREE_SIZE / 2);
        rectY.set(e.clientY - FREE_SIZE / 2);
      }
    };

    const updateSnapping = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      rectX.set(rect.left - PADDING);
      rectY.set(rect.top - PADDING);
      rectW.set(rect.width + PADDING * 2);
      rectH.set(rect.height + PADDING * 2);
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
        rectW.set(FREE_SIZE);
        rectH.set(FREE_SIZE);
        rectX.set(e.clientX - FREE_SIZE / 2);
        rectY.set(e.clientY - FREE_SIZE / 2);
        dotOpacity.set(1);
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
  }, [mouseX, mouseY, rectX, rectY, rectW, rectH, dotOpacity]);

  if (isTouch || prefersReduced) return null;

  return (
    <>
      {/* Target Reticle Container */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{
          x,
          y,
          width: w,
          height: h,
        }}
      >
        {/* Top-Left Corner */}
        <div
          className="absolute top-0 left-0 border-t-2 border-l-2"
          style={{
            width: CORNER_SIZE,
            height: CORNER_SIZE,
            borderColor: "hsl(var(--primary))",
          }}
        />
        {/* Top-Right Corner */}
        <div
          className="absolute top-0 right-0 border-t-2 border-r-2"
          style={{
            width: CORNER_SIZE,
            height: CORNER_SIZE,
            borderColor: "hsl(var(--primary))",
          }}
        />
        {/* Bottom-Left Corner */}
        <div
          className="absolute bottom-0 left-0 border-b-2 border-l-2"
          style={{
            width: CORNER_SIZE,
            height: CORNER_SIZE,
            borderColor: "hsl(var(--primary))",
          }}
        />
        {/* Bottom-Right Corner */}
        <div
          className="absolute bottom-0 right-0 border-b-2 border-r-2"
          style={{
            width: CORNER_SIZE,
            height: CORNER_SIZE,
            borderColor: "hsl(var(--primary))",
          }}
        />
      </motion.div>

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
