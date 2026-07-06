"use client";

import { motion } from "framer-motion";
import { Gamepad2, ScrollText, Swords, Trophy, Users, Star, Code, Zap, Database, Cloud } from "lucide-react";
import type { SocialLink } from "@/lib/types";

const Icons: Record<string, any> = {
  Swords, ScrollText, Trophy, Users, Star, Code, Zap, Database, Cloud
};

const defaultStats = [
  { value: "Lv. 2", label: "Years Exp", icon: "Swords" },
  { value: "15+", label: "Projects", icon: "ScrollText" },
  { value: "2×", label: "Finalist", icon: "Trophy" },
  { value: "150+", label: "Users", icon: "Users" },
];

export function HeroSection({ socials = [], heroData }: { socials?: SocialLink[], heroData?: any }) {
  const data = {
    class_name: "Full-Stack Class",
    title: "Dhiptanshu Malik",
    subtitle: "A motivated Computer Science student with hands-on experience in full-stack, mobile development, cloud technologies, and AI-driven solutions.",
    level: "Lv. 99",
    avatar_url: "",
    stats: defaultStats,
    ...heroData
  };

  const githubUsername = socials
    .find((s) => s.name.toLowerCase() === "github")
    ?.url.split("/")
    .pop();
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col justify-center px-4 md:px-8 pt-32 pb-16 overflow-hidden world-map-grid"
    >
      <div className="mx-auto w-full max-w-5xl relative z-10">
        
        {/* Main Character Profile Card */}
        <motion.div 
          className="rpg-panel bg-card p-6 md:p-10 lg:p-12 relative overflow-hidden"
          style={{ backgroundImage: 'linear-gradient(rgba(139, 115, 85, 0.05) 1px, transparent 1px)', backgroundSize: '100% 2rem', backgroundPositionY: '0.2rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header Banner */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-primary" />
          
          <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start pt-4">
            
            {/* Avatar Placeholder */}
            <motion.div 
              className="w-40 h-40 md:w-56 md:h-56 shrink-0 rounded-lg border-4 border-border bg-muted flex items-center justify-center relative shadow-[8px_8px_0px_hsl(var(--border))] overflow-hidden"
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              {data.avatar_url ? (
                <img 
                  src={data.avatar_url} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : githubUsername ? (
                <img 
                  src={`https://github.com/${githubUsername}.png`} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Gamepad2 className="w-16 h-16 text-muted-foreground opacity-50" />
              )}
              <div className="absolute -bottom-2 -right-2 z-10 rpg-badge px-3 py-1 bg-accent text-accent-foreground text-sm border-2 border-border rotate-3 shadow-[2px_2px_0px_hsl(var(--border))]">
                {data.level}
              </div>
            </motion.div>

            {/* Character Info */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-secondary-foreground font-bold text-xs rounded uppercase tracking-wider mb-4 border-2 border-border shadow-[2px_2px_0px_hsl(var(--border))]">
                  {data.class_name}
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-2 drop-shadow-sm">
                  {data.title}
                </h1>
                
                <p className="text-lg md:text-xl font-medium text-muted-foreground mb-8 max-w-2xl">
                  {data.subtitle}
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-wrap justify-center lg:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <a
                  href="#journey"
                  className="rpg-panel rpg-panel-interactive bg-primary text-primary-foreground px-6 py-3 font-bold uppercase tracking-wider text-sm flex items-center gap-2"
                >
                  <Swords className="w-4 h-4" /> View Journey
                </a>
                <a
                  href="#projects"
                  className="rpg-panel rpg-panel-interactive bg-card text-foreground px-6 py-3 font-bold uppercase tracking-wider text-sm flex items-center gap-2"
                >
                  <ScrollText className="w-4 h-4" /> View Projects
                </a>
              </motion.div>
            </div>
          </div>

          {/* Stats Bar */}
          <motion.div 
            className="mt-12 pt-8 border-t-4 border-dashed border-muted grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {data.stats.map((stat: any, idx: number) => {
              const Icon = Icons[stat.icon] || Swords;
              return (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-md bg-background border-2 border-border shadow-[2px_2px_0px_hsl(var(--border))]">
                  <div className="p-2 bg-secondary text-secondary-foreground rounded border-2 border-border">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xl text-foreground">{stat.value}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
