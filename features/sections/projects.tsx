"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Github, ExternalLink, Search, Backpack } from "lucide-react";

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

type Tier = "common" | "uncommon" | "rare" | "legendary";

const TIER_CONFIG: Record<Tier, { label: string; lightColor: string; darkColor: string; stars: number }> = {
  common:    { label: "Common",    lightColor: "#8A8278", darkColor: "#6B6560", stars: 1 },
  uncommon:  { label: "Uncommon",  lightColor: "#2296C9", darkColor: "#5EB88C", stars: 2 },
  rare:      { label: "Rare",      lightColor: "#7B4FCF", darkColor: "#A87FE0", stars: 3 },
  legendary: { label: "Legendary", lightColor: "#D4A017", darkColor: "#F2B632", stars: 4 },
};

/**
 * Derive rarity tier from project attributes.
 * Projects with both demo + github + many tags = legendary.
 * Fewer signals = lower tier. Configurable per-project via admin later.
 */
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

function Stars({ count, max = 4 }: { count: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-xs" aria-label={`${count} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? "text-primary" : "text-muted-foreground/30"}>★</span>
      ))}
    </span>
  );
}

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const prefersReduced = useReducedMotion();

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

  const reveal = prefersReduced
    ? {}
    : {
        initial: { opacity: 0, rotateX: 6 },
        whileInView: { opacity: 1, rotateX: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <section id="projects" className="py-24 px-4 md:px-8" style={{ perspective: "800px" }}>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          {...reveal}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary text-secondary-foreground rounded border-2 border-border shadow-[4px_4px_0px_hsl(var(--border))]">
              <Backpack className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold uppercase tracking-widest text-primary text-xs">Inventory</p>
              <h2 className="font-display text-3xl md:text-5xl text-foreground uppercase">
                Selected Works
              </h2>
            </div>
          </div>
        </motion.div>

        {/* Search + Filters */}
        <div className="rpg-panel p-4 md:p-6 mb-12 bg-muted">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                className="h-11 w-full rounded border-2 border-border bg-card pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none shadow-[2px_2px_0px_hsl(var(--border))]"
                placeholder="Search inventory..."
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
                  style={{
                    boxShadow: activeTag === "all" ? "2px 2px 0px hsl(var(--border))" : "none",
                    transform: activeTag === "all" ? "translate(-2px, -2px)" : "none",
                  }}
                >
                  All Items
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
                    style={{
                      boxShadow: activeTag === tag ? "2px 2px 0px hsl(var(--border))" : "none",
                      transform: activeTag === tag ? "translate(-2px, -2px)" : "none",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((project, index) => {
            const tier = deriveTier(project);
            const config = TIER_CONFIG[tier];
            const isHovered = hoveredId === project.id;

            return (
              <motion.div
                key={project.id}
                {...(prefersReduced
                  ? {}
                  : {
                      initial: { opacity: 0, rotateX: 6 },
                      whileInView: { opacity: 1, rotateX: 0 },
                      viewport: { once: true, margin: "-60px" },
                      transition: { duration: 0.4, delay: Math.min(index * 0.06, 0.24) },
                    })}
                className="relative"
                style={{ perspective: "600px" }}
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Item Slot */}
                <div className="rpg-panel rpg-panel-interactive flex bg-card overflow-hidden">
                  {/* Rarity Left Bar */}
                  <div
                    className="w-2 shrink-0"
                    style={{ backgroundColor: `var(--tier-color, ${config.lightColor})` }}
                  >
                    <style>{`
                      :root { --tier-color-${project.id}: ${config.lightColor}; }
                      .dark { --tier-color-${project.id}: ${config.darkColor}; }
                    `}</style>
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: `var(--tier-color-${project.id})` }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base uppercase text-foreground truncate">
                        {project.title}
                      </h3>
                      <Stars count={config.stars} />
                    </div>

                    {project.tags && project.tags.length > 0 && (
                      <p className="text-xs text-muted-foreground truncate">
                        {project.tags.join(" · ")}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          aria-label={`${project.title} source code`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded border border-border bg-primary text-primary-foreground hover:brightness-90 transition-all"
                          aria-label={`${project.title} live demo`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tooltip — appears on hover */}
                <AnimatePresence>
                  {isHovered && (project.short_description || project.cover_image) && (
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      style={{ transformOrigin: "top" }}
                      className="absolute left-0 right-0 top-full z-30 mt-1"
                    >
                      <div className="rpg-panel bg-card p-4 flex flex-col gap-3">
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: `var(--tier-color-${project.id})` }}
                        >
                          {config.label} Item
                        </p>

                        {project.cover_image && (
                          <img
                            src={project.cover_image}
                            alt={project.title}
                            className="w-full aspect-video object-cover rounded border border-border"
                          />
                        )}

                        {project.short_description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {project.short_description}
                          </p>
                        )}

                        {project.long_description && (
                          <p className="text-xs text-muted-foreground/70 border-l-2 border-border/30 pl-3">
                            {project.long_description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rpg-panel py-20 text-center bg-card mt-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
            <Backpack className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-xl text-foreground uppercase tracking-widest mb-2">Inventory Empty</h3>
            <p className="font-medium text-sm text-muted-foreground max-w-sm mx-auto">
              No items match your search. Try different filters.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
