"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  FileText,
  MapPin,
  Play,
  X,
  Scroll,
  Shield,
  Search,
  ExternalLink
} from "lucide-react";
import { MarkdownView } from "@/components/markdown-view";
import type { Journey } from "@/lib/types";

export function JourneySection({
  journeys,
  categories,
}: {
  journeys: Journey[];
  categories: string[];
  tags: string[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Journey | null>(null);

  const filtered = useMemo(
    () =>
      journeys.filter((journey) => {
        const haystack =
          `${journey.title} ${journey.subtitle ?? ""} ${journey.description ?? ""} ${journey.tech_stack.join(" ")}`.toLowerCase();
        const matchesSearch = haystack.includes(query.toLowerCase());
        const matchesCategory =
          category === "all" || journey.category === category;
        return matchesSearch && matchesCategory;
      }),
    [journeys, query, category]
  );

  return (
    <section id="journey" className="relative py-24 px-4 md:px-8 bg-background world-map-grid">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="p-3 bg-accent text-accent-foreground rounded border-2 border-border shadow-[4px_4px_0px_hsl(var(--border))]">
            <Scroll className="w-8 h-8" />
          </div>
          <div>
            <p className="font-bold uppercase tracking-widest text-primary text-xs">Journey</p>
            <h2 className="font-display text-3xl md:text-5xl text-foreground uppercase">
              Timeline
            </h2>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <div className="rpg-panel p-4 md:p-6 mb-12 bg-card">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-2/3">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                className="h-11 w-full rounded border-2 border-border bg-background pl-10 pr-4 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none shadow-[2px_2px_0px_hsl(var(--border))] inset-shadow"
                placeholder="Search entries..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className="h-11 w-full md:w-1/3 rounded border-2 border-border bg-background px-4 text-sm font-bold text-foreground focus:outline-none shadow-[2px_2px_0px_hsl(var(--border))]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Entries</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quest List */}
        <div className="grid gap-6 relative">
          {/* Decorative left line */}
          <div className="hidden md:block absolute left-8 top-0 bottom-0 w-2 bg-border/20 rounded-full" />

          {filtered.map((journey, index) => (
            <motion.div
              key={journey.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25) }}
              className="relative md:pl-20"
            >
              <div className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card rounded-full border-4 border-border shadow-[4px_4px_0px_hsl(var(--border))] items-center justify-center z-10">
                <Shield className="w-4 h-4 text-primary" />
              </div>

              <button
                onClick={() => setSelected(journey)}
                className="rpg-panel rpg-panel-interactive w-full bg-card p-0 flex flex-col lg:flex-row overflow-hidden text-left group"
              >
                {journey.cover_image && (
                  <div className="w-full lg:w-48 xl:w-64 h-48 lg:h-auto shrink-0 border-b-2 lg:border-b-0 lg:border-r-2 border-border">
                    <img 
                      src={journey.cover_image} 
                      alt={journey.title}
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all"
                    />
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col justify-center relative">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="relative px-3 py-1 bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-widest border-2 border-border shadow-[2px_2px_0px_hsl(var(--border))] before:absolute before:-right-2 before:top-1/2 before:w-3 before:h-3 before:-translate-y-1/2 before:bg-card before:rotate-45 before:border-l-2 before:border-b-2 before:border-border">
                      {journey.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                      <CalendarDays className="w-3 h-3" /> {formatRange(journey.start_date, journey.end_date)}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                    {journey.title}
                  </h3>
                  
                  <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                    {journey.subtitle ?? journey.description}
                  </p>
                  
                  {journey.location && (
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary">
                      <MapPin className="w-4 h-4" /> {journey.location}
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rpg-panel py-20 text-center bg-card mt-8 relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
             <Scroll className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
             <h3 className="font-bold text-xl text-foreground uppercase tracking-widest mb-2">No Entries Found</h3>
             <p className="font-medium text-sm text-muted-foreground max-w-sm mx-auto">
              The next chapter of this journey is still being written. Keep exploring.
             </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <QuestModal
            journey={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function QuestModal({
  journey,
  onClose,
}: {
  journey: Journey;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-auto bg-foreground/60 p-4 backdrop-blur-sm flex items-center py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="mx-auto w-full max-w-4xl rpg-panel bg-card overflow-hidden my-auto"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary text-primary-foreground p-4 border-b-4 border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scroll className="w-6 h-6" />
            <h2 className="font-bold text-xl uppercase tracking-widest drop-shadow-sm">Entry Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-background text-foreground hover:bg-muted border-2 border-border shadow-[2px_2px_0px_hsl(var(--border))]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 md:p-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 order-2 md:order-1">
              <span className="inline-block px-3 py-1 rounded bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-widest border-2 border-border shadow-[2px_2px_0px_hsl(var(--border))] mb-4">
                {journey.category}
              </span>
              <h1 className="font-bold text-3xl md:text-5xl text-foreground mb-5 leading-tight">
                {journey.title}
              </h1>
              <p className="text-lg font-medium text-muted-foreground bg-muted p-4 rounded border-2 border-border/50 shadow-inner mb-8">
                {journey.description}
              </p>

              {/* Action Links */}
              <div className="flex flex-wrap gap-3 mb-8">
                {journey.github_url && (
                  <ActionLink href={journey.github_url} icon={<ExternalLink className="w-4 h-4" />}>
                    Source Code
                  </ActionLink>
                )}
                {journey.demo_url && (
                  <ActionLink href={journey.demo_url} icon={<ExternalLink className="w-4 h-4" />} primary>
                    Live Demo
                  </ActionLink>
                )}
                {journey.video_links.map((url, i) => (
                  <ActionLink key={url} href={url} icon={<Play className="w-4 h-4" />}>
                    Media Record {i + 1}
                  </ActionLink>
                ))}
                {journey.documents.map((doc) => (
                  <ActionLink key={doc.url} href={doc.url} icon={<FileText className="w-4 h-4" />}>
                    {doc.title}
                  </ActionLink>
                ))}
              </div>

              {journey.content_markdown && (
                <div className="prose prose-neutral max-w-none border-t-4 border-dashed border-border/20 pt-8">
                  <h3 className="font-black text-xl mb-4">Journey Entries</h3>
                  <div className="bg-background p-6 rounded border-2 border-border">
                    <MarkdownView value={journey.content_markdown} />
                  </div>
                </div>
              )}

              {journey.journey_media && journey.journey_media.length > 0 && (
                <div className="border-t-4 border-dashed border-border/20 pt-8 mt-8">
                  <h3 className="font-black text-xl mb-4 uppercase tracking-widest text-primary">Media Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {journey.journey_media.map((media) => (
                      <div key={media.id} className="relative aspect-video rounded border-2 border-border overflow-hidden bg-muted group">
                        {media.type === 'image' || media.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                          <img src={media.url} alt={media.title || 'Gallery image'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        ) : media.type === 'video' || media.url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={media.url} controls className="w-full h-full object-cover" />
                        ) : media.type === 'pdf' || media.url.match(/\.pdf$/i) ? (
                          <a href={media.url} target="_blank" rel="noreferrer" className="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:bg-background transition-colors hover:text-foreground">
                            <FileText className="w-8 h-8 mb-2" />
                            <span className="text-sm font-bold uppercase tracking-widest">{media.title || 'View PDF'}</span>
                          </a>
                        ) : (
                          <a href={media.url} target="_blank" rel="noreferrer" className="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:bg-background transition-colors hover:text-foreground">
                            <ExternalLink className="w-8 h-8 mb-2" />
                            <span className="text-sm font-bold uppercase tracking-widest">{media.title || 'External Link'}</span>
                          </a>
                        )}
                        {(media.title || media.caption) && (
                          <div className="absolute inset-x-0 bottom-0 bg-background/90 border-t-2 border-border p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                            {media.title && <p className="text-xs font-bold truncate text-foreground">{media.title}</p>}
                            {media.caption && <p className="text-[10px] text-muted-foreground truncate">{media.caption}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Stats */}
            <div className="w-full md:w-64 shrink-0 order-1 md:order-2 flex flex-col gap-6">
              {journey.cover_image && (
                <div className="w-full aspect-video rounded border-4 border-border shadow-[4px_4px_0px_hsl(var(--border))] overflow-hidden bg-muted">
                  <img src={journey.cover_image} className="w-full h-full object-cover" alt="" />
                </div>
              )}
              
              <div className="bg-background rounded border-2 border-border p-4 shadow-inner">
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Timeframe</p>
                  <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-primary" /> {formatRange(journey.start_date, journey.end_date)}
                  </p>
                </div>
                {journey.location && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Location</p>
                    <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" /> {journey.location}
                    </p>
                  </div>
                )}
              </div>

              {journey.tech_stack.length > 0 && (
                <div className="bg-background rounded border-2 border-border p-4 shadow-inner">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-3">Skills Utilized</p>
                  <div className="flex flex-wrap gap-2">
                    {journey.tech_stack.map(tech => (
                      <span key={tech} className="px-2 py-1 rounded bg-muted text-muted-foreground border border-border/50 text-[9px] font-bold uppercase">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ActionLink({
  href,
  children,
  icon,
  primary = false
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`rpg-panel rpg-panel-interactive px-4 py-2 font-bold uppercase tracking-wider text-[10px] flex items-center gap-2 ${
        primary ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
      }`}
    >
      {icon} {children}
    </a>
  );
}

function formatRange(start: string, end: string | null) {
  const startDate = new Date(start).toLocaleDateString("en", {
    month: "short",
    year: "numeric",
  });
  if (!end) return startDate;
  return `${startDate} – ${new Date(end).toLocaleDateString("en", { month: "short", year: "numeric" })}`;
}
