"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink, Search, Backpack, LayoutGrid, List } from "lucide-react";
import { useTheme } from "next-themes";

type Tier = "common" | "uncommon" | "rare" | "legendary";

const TIER_COLORS: Record<Tier, { light: string; dark: string }> = {
  common:    { light: "#8A8278", dark: "#6B6560" },
  uncommon:  { light: "#2296C9", dark: "#5EB88C" },
  rare:      { light: "#7B4FCF", dark: "#A87FE0" },
  legendary: { light: "#D4A017", dark: "#F2B632" },
};

function deriveTier(project: Project): Tier {
  let score = 0;
  if (project.demo_url) score += 2;
  if (project.github_url) score += 1;
  if (project.cover_image) score += 1;
  if (project.long_description) score += 1;
  score += Math.min((project.tags?.length || 0), 4);

  if (score >= 7) return "legendary";
  if (score >= 5) return "rare";
  if (score >= 3) return "uncommon";
  return "common";
}

type Project = {
  id: string;
  title: string;
  short_description: string | null;
  long_description: string | null;
  cover_image: string | null;
  github_url: string | null;
  demo_url: string | null;
  tags: string[];
  [key: string]: any;
};

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "case-study">("case-study");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-project-view");
    if (saved === "grid" || saved === "case-study") {
      setViewMode(saved);
    }
  }, []);

  const handleSetView = (mode: "grid" | "case-study") => {
    setViewMode(mode);
    localStorage.setItem("portfolio-project-view", mode);
  };

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    projects.forEach((p) => 
      p.tags?.forEach((t: string) => {
        if (t && t.trim().length > 0) tagSet.add(t);
      })
    );
    return Array.from(tagSet).sort();
  }, [projects]);

  const filtered = useMemo(
    () =>
      projects.filter((project) => {
        const haystack =
          `${project.title} ${project.short_description ?? ""} ${(project.tags || []).join(" ")}`.toLowerCase();
        const matchesSearch = haystack.includes(query.toLowerCase());
        const matchesTag =
          activeTag === "all" || project.tags?.includes(activeTag);
        return matchesSearch && matchesTag;
      }),
    [projects, query, activeTag]
  );

  return (
    <section id="projects" className="py-24 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary text-secondary-foreground rounded border-2 border-border shadow-[4px_4px_0px_hsl(var(--border))]">
              <Backpack className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold uppercase tracking-widest text-primary text-xs">Portfolio</p>
              <h2 className="font-display text-3xl md:text-5xl text-foreground uppercase">
                Selected Works
              </h2>
            </div>
          </div>
          
          <div className="flex items-center p-1 bg-muted rounded-md border-2 border-border/50">
            <button
              onClick={() => handleSetView("case-study")}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                viewMode === "case-study" 
                  ? "bg-card text-foreground shadow-[2px_2px_0px_hsl(var(--border))] border border-border" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" /> Case Study
            </button>
            <button
              onClick={() => handleSetView("grid")}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                viewMode === "grid" 
                  ? "bg-card text-foreground shadow-[2px_2px_0px_hsl(var(--border))] border border-border" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Grid
            </button>
          </div>
        </motion.div>

        <div className="rpg-panel p-4 md:p-6 mb-12 bg-muted">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                className="h-11 w-full rounded border-2 border-border bg-card pl-10 pr-4 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none shadow-[2px_2px_0px_hsl(var(--border))]"
                placeholder="Search projects..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 w-full">
                <button
                  onClick={() => setActiveTag("all")}
                  className={`rpg-panel px-4 py-2 text-[10px] uppercase font-bold tracking-wider transition-colors ${
                    activeTag === "all"
                      ? "bg-primary text-primary-foreground border-border"
                      : "bg-card text-muted-foreground hover:bg-background"
                  }`}
                  style={{ boxShadow: activeTag === 'all' ? '2px 2px 0px hsl(var(--border))' : 'none', transform: activeTag === 'all' ? 'translate(-2px, -2px)' : 'none' }}
                >
                  All Projects
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`rpg-panel px-4 py-2 text-[10px] uppercase font-bold tracking-wider transition-colors ${
                      activeTag === tag
                        ? "bg-secondary text-secondary-foreground border-border"
                        : "bg-card text-muted-foreground hover:bg-background"
                    }`}
                    style={{ boxShadow: activeTag === tag ? '2px 2px 0px hsl(var(--border))' : 'none', transform: activeTag === tag ? 'translate(-2px, -2px)' : 'none' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project View: Case Study Mode */}
        {viewMode === "case-study" && (
          <div className="flex flex-col gap-24">
            {filtered.map((project, index) => {
              const isEven = index % 2 === 0;
              const tier = deriveTier(project);
              const colors = TIER_COLORS[tier];
              const borderLeftColor = isDark ? colors.dark : colors.light;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}
                >
                  <div className="w-full lg:w-3/5 group">
                    <div 
                      className="rpg-panel relative bg-muted overflow-hidden transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[12px_12px_0px_hsl(var(--border))] border-l-[6px]"
                      style={{ borderLeftColor }}
                    >
                      {project.cover_image ? (
                        <img
                          src={project.cover_image}
                          alt={project.title}
                          className="w-full aspect-[16/10] object-contain rounded border-2 border-border bg-card"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-[16/10] bg-card border-2 border-border flex items-center justify-center">
                          <Backpack className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-2/5 flex flex-col justify-center">
                    <h3 className="font-display text-3xl md:text-4xl text-foreground mb-4 uppercase">{project.title}</h3>
                    <p className="text-lg font-medium text-muted-foreground mb-6 leading-relaxed">
                      {project.short_description}
                    </p>
                    
                    {project.long_description && (
                      <p className="text-sm text-muted-foreground mb-6 border-l-4 border-border/20 pl-4 py-1">
                        {project.long_description}
                      </p>
                    )}

                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-8">
                        {project.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground bg-muted border border-border/50 rounded-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-4">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-3 rounded border-2 border-border bg-card text-xs font-bold uppercase tracking-widest text-foreground hover:bg-muted transition-colors shadow-[4px_4px_0px_hsl(var(--border))] hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_hsl(var(--border))]"
                        >
                          <Github className="w-4 h-4" /> Source
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-3 rounded border-[3px] border-border bg-primary text-xs font-bold uppercase tracking-widest text-primary-foreground hover:brightness-95 transition-all shadow-[4px_4px_0px_hsl(var(--border))] hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_hsl(var(--border))]"
                        >
                          <ExternalLink className="w-4 h-4" /> View Live
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Project View: Grid Mode */}
        {viewMode === "grid" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, index) => {
              const tier = deriveTier(project);
              const colors = TIER_COLORS[tier];
              const borderLeftColor = isDark ? colors.dark : colors.light;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.25) }}
                >
                  <div 
                    className="rpg-panel group flex h-full flex-col overflow-hidden bg-card hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_hsl(var(--border))] transition-all border-l-[6px]"
                    style={{ borderLeftColor }}
                  >
                  {project.cover_image ? (
                    <div className="h-48 overflow-hidden border-b-[3px] border-border bg-muted p-2 flex items-center justify-center">
                      <img
                        src={project.cover_image}
                        alt={project.title}
                        className="h-full w-full rounded object-contain"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-48 border-b-[3px] border-border bg-muted p-2 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-border to-transparent" />
                      <Backpack className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                  )}
                  
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="font-bold text-xl text-foreground mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {project.title}
                      </h3>
                      <p className="text-sm font-medium leading-relaxed text-muted-foreground bg-muted p-4 rounded border border-border/50 shadow-inner">
                        {project.short_description}
                      </p>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="relative px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-background border-2 border-border/60 rounded-sm shadow-[2px_2px_0px_hsl(var(--border))] before:absolute before:-left-1 before:top-1/2 before:w-2 before:h-2 before:-translate-y-1/2 before:bg-card before:border before:border-border before:rounded-full before:z-10"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-3 pt-5 border-t-2 border-dashed border-border/30">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded border-2 border-border bg-card text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-muted transition-colors shadow-[2px_2px_0px_hsl(var(--border))]"
                          >
                            <Github className="w-3.5 h-3.5" /> Source
                          </a>
                        )}
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded border-[3px] border-border bg-primary text-[10px] font-bold uppercase tracking-widest text-primary-foreground hover:brightness-95 transition-all shadow-[2px_2px_0px_hsl(var(--border))]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Live
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rpg-panel py-20 text-center bg-card mt-8 relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
             <Backpack className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
             <h3 className="font-bold text-xl text-foreground uppercase tracking-widest mb-2">No Projects Found</h3>
             <p className="font-medium text-sm text-muted-foreground max-w-sm mx-auto">
              Check back later to discover new projects and tools.
             </p>
          </div>
        )}
      </div>
    </section>
  );
}
