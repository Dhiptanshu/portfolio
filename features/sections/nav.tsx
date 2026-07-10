"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Code2, MapPin, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { DoomModal } from "@/components/doom-modal";

const links = [
  { label: "Experience", href: "#experience" },
  { label: "Journey", href: "#journey" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Achievements", href: "#achievements" },
  { label: "Doom", href: "#doom" },
  { label: "Contact", href: "#contact" },
];

export function SiteNav({ resumeUrl, hiddenSections = [] }: { resumeUrl?: string, hiddenSections?: string[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDoomOpen, setIsDoomOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
    if (latest < 150) {
      setActiveSection("");
    }
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    // Timeout ensures DOM elements are rendered before observing
    const timeout = setTimeout(() => {
      links.forEach((link) => {
        const el = document.getElementById(link.href.slice(1));
        if (el) observer.observe(el);
      });
    }, 500);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [hiddenSections]);

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
        
        <a href="#" className="flex items-center gap-2 font-display text-sm md:text-base text-primary hover:scale-105 transition-transform uppercase truncate mr-2">
          <Code2 className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
          <span className="truncate">Dhiptanshu <span className="text-foreground hidden sm:inline">Malik</span></span>
        </a>
        
        <nav className="hidden items-center gap-2 lg:flex bg-muted p-1 rounded-md border-2 border-border/50" aria-label="Main navigation">
          {links.filter(l => !hiddenSections.includes(l.label.toLowerCase())).map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (link.href === "#doom") {
                    e.preventDefault();
                    setIsDoomOpen(true);
                  }
                }}
                className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-card text-foreground shadow-[2px_2px_0px_hsl(var(--border))] border border-border"
                    : "text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-[2px_2px_0px_hsl(var(--border))]"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <a
            href={resumeUrl || "/resume.pdf"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex rpg-panel rpg-panel-interactive px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary bg-transparent border-2 border-primary hover:bg-primary/10 items-center gap-2"
          >
            <MapPin className="h-3 w-3" />
            Resume
          </a>
          
          <button 
            className="lg:hidden p-2 bg-muted rounded-md border-2 border-border/50 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-[110%] left-4 right-4 rpg-panel bg-card p-4 shadow-xl flex flex-col gap-2"
          >
            {links.filter(l => !hiddenSections.includes(l.label.toLowerCase())).map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    if (link.href === "#doom") {
                      e.preventDefault();
                      setIsDoomOpen(true);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? "bg-muted text-foreground shadow-[2px_2px_0px_hsl(var(--border))] border border-border"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-[2px_2px_0px_hsl(var(--border))]"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <a
              href={resumeUrl || "/resume.pdf"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex rpg-panel rpg-panel-interactive px-4 py-3 text-sm font-bold uppercase tracking-wider text-primary bg-transparent border-2 border-primary hover:bg-primary/10 items-center justify-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Resume
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        <DoomModal isOpen={isDoomOpen} onClose={() => setIsDoomOpen(false)} />
      </AnimatePresence>
    </motion.header>
  );
}
