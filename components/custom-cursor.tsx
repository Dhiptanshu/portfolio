"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

type ReticleTarget = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const CORNER_SIZE = 10;
const CORNER_THICKNESS = 2;
const PADDING = 4;
const FREE_SIZE = 28;

export function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [target, setTarget] = useState<ReticleTarget | null>(null);
  const [isTouch, setIsTouch] = useState(true);
  const rafRef = useRef<number>(0);
  const prefersReduced = useReducedMotion();

  const updateTarget = useCallback((el: HTMLElement | null) => {
    if (!el) {
      setTarget(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setTarget({
      x: rect.left - PADDING,
      y: rect.top - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouch(true);
      return;
    }
    setIsTouch(false);

    let currentHovered: HTMLElement | null = null;

    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };

    const onMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive =
        t.closest("a") ||
        t.closest("button") ||
        t.closest("[role='button']") ||
        t.closest(".rpg-panel-interactive");

      if (interactive instanceof HTMLElement) {
        currentHovered = interactive;
        updateTarget(interactive);
      } else {
        currentHovered = null;
        setTarget(null);
      }
    };

    const onScroll = () => {
      if (currentHovered) {
        updateTarget(currentHovered);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("scroll", onScroll);
    };
  }, [updateTarget]);

  if (isTouch || prefersReduced) return null;

  const springSnap = { type: "spring" as const, stiffness: 500, damping: 35, mass: 0.4 };
  const springFree = { type: "spring" as const, stiffness: 300, damping: 20, mass: 0.3 };

  const cornerStyle = {
    position: "fixed" as const,
    pointerEvents: "none" as const,
    zIndex: 9999,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  };

  if (target) {
    // Snapped to element
    const corners = [
      { x: target.x, y: target.y, borderTop: CORNER_THICKNESS, borderLeft: CORNER_THICKNESS },
      { x: target.x + target.width - CORNER_SIZE, y: target.y, borderTop: CORNER_THICKNESS, borderRight: CORNER_THICKNESS },
      { x: target.x, y: target.y + target.height - CORNER_SIZE, borderBottom: CORNER_THICKNESS, borderLeft: CORNER_THICKNESS },
      { x: target.x + target.width - CORNER_SIZE, y: target.y + target.height - CORNER_SIZE, borderBottom: CORNER_THICKNESS, borderRight: CORNER_THICKNESS },
    ];

    return (
      <>
        {corners.map((c, i) => (
          <motion.div
            key={i}
            className="hidden md:block"
            style={{
              ...cornerStyle,
              borderColor: "hsl(var(--primary))",
              borderStyle: "solid",
              borderWidth: 0,
              borderTopWidth: c.borderTop || 0,
              borderRightWidth: c.borderRight || 0,
              borderBottomWidth: c.borderBottom || 0,
              borderLeftWidth: c.borderLeft || 0,
            }}
            animate={{ x: c.x, y: c.y }}
            transition={springSnap}
          />
        ))}
      </>
    );
  }

  // Free-floating reticle around cursor
  const half = FREE_SIZE / 2;
  const freeCorners = [
    { x: mousePos.x - half, y: mousePos.y - half, borderTop: CORNER_THICKNESS, borderLeft: CORNER_THICKNESS },
    { x: mousePos.x + half - CORNER_SIZE, y: mousePos.y - half, borderTop: CORNER_THICKNESS, borderRight: CORNER_THICKNESS },
    { x: mousePos.x - half, y: mousePos.y + half - CORNER_SIZE, borderBottom: CORNER_THICKNESS, borderLeft: CORNER_THICKNESS },
    { x: mousePos.x + half - CORNER_SIZE, y: mousePos.y + half - CORNER_SIZE, borderBottom: CORNER_THICKNESS, borderRight: CORNER_THICKNESS },
  ];

  return (
    <>
      {freeCorners.map((c, i) => (
        <motion.div
          key={i}
          className="hidden md:block"
          style={{
            ...cornerStyle,
            borderColor: "hsl(var(--primary))",
            borderStyle: "solid",
            borderWidth: 0,
            borderTopWidth: c.borderTop || 0,
            borderRightWidth: c.borderRight || 0,
            borderBottomWidth: c.borderBottom || 0,
            borderLeftWidth: c.borderLeft || 0,
          }}
          animate={{ x: c.x, y: c.y }}
          transition={springFree}
        />
      ))}
      {/* Crosshair dot */}
      <motion.div
        className="hidden md:block"
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 9999,
          width: 3,
          height: 3,
          borderRadius: "50%",
          backgroundColor: "hsl(var(--primary))",
        }}
        animate={{ x: mousePos.x - 1.5, y: mousePos.y - 1.5 }}
        transition={springFree}
      />
    </>
  );
}
