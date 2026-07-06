"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Map, MapPin } from "lucide-react";

const links = [
  { label: "Journey", href: "#journey" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Achievements", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "p-2 md:p-4" : "p-4 md:p-6"
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className={`mx-auto flex max-w-7xl items-center justify-between rpg-panel px-4 py-3 md:px-6 md:py-4 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur shadow-[4px_4px_0px_hsl(var(--border))]' : ''}`}>
        
        <a href="#" className="flex items-center gap-2 font-bold text-lg md:text-xl text-primary hover:scale-105 transition-transform">
          <Map className="h-5 w-5 md:h-6 md:w-6" />
          <span>Dhiptanshu<span className="text-foreground">.map</span></span>
        </a>
        
        <nav className="hidden items-center gap-2 lg:flex bg-muted p-1 rounded-md border-2 border-border/50" aria-label="Main navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-muted-foreground transition-all duration-200 hover:bg-card hover:text-foreground hover:shadow-[2px_2px_0px_hsl(var(--border))]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="rpg-panel rpg-panel-interactive px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground bg-accent flex items-center gap-2"
          >
            <MapPin className="h-3 w-3" />
            Resume
          </a>
        </div>
      </div>
    </motion.header>
  );
}
