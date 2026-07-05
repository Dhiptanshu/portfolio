"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, CalendarDays, FileText, Github, MapPin, Play, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownView } from "@/components/markdown-view";
import type { Journey } from "@/lib/types";

export function PublicJourneyTimeline({ journeys, categories, tags }: { journeys: Journey[]; categories: string[]; tags: string[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("all");
  const [selected, setSelected] = useState<Journey | null>(null);

  const filtered = useMemo(() => journeys.filter((journey) => {
    const haystack = `${journey.title} ${journey.subtitle ?? ""} ${journey.description ?? ""} ${journey.tech_stack.join(" ")}`.toLowerCase();
    const matchesSearch = haystack.includes(query.toLowerCase());
    const matchesCategory = category === "all" || journey.category === category;
    const matchesTag = tag === "all" || journey.journey_tags?.some((item) => item.name === tag);
    return matchesSearch && matchesCategory && matchesTag;
  }), [journeys, query, category, tag]);

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="luxury-grid relative border-b border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs uppercase tracking-[0.24em] text-primary">Journey Engine</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight md:text-7xl">A chronological map of proof, pressure, and progress.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Projects, internships, hackathons, leadership, research, and competitions live here as one editable timeline.</p>
          </motion.div>

          <div className="mt-10 grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search the journey" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={tag} onChange={(event) => setTag(event.target.value)}>
              <option value="all">All tags</option>
              {tags.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="absolute bottom-0 left-4 top-0 hidden w-px bg-gradient-to-b from-primary via-border to-transparent md:block" />
          <div className="grid gap-8">
            {filtered.map((journey, index) => (
              <motion.article
                key={journey.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.24) }}
                className="relative md:pl-12"
              >
                <div className="absolute left-[11px] top-8 hidden h-3 w-3 rounded-full border border-primary bg-background shadow-[0_0_22px_rgba(222,200,156,0.65)] md:block" />
                <button onClick={() => setSelected(journey)} className="group w-full overflow-hidden rounded-lg border border-border bg-card text-left transition duration-300 hover:-translate-y-1 hover:border-primary/60">
                  {journey.cover_image ? <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${journey.cover_image})` }} /> : null}
                  <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-secondary px-2 py-1 text-primary">{journey.category}</span>
                        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatRange(journey.start_date, journey.end_date)}</span>
                        {journey.location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{journey.location}</span> : null}
                      </div>
                      <h2 className="mt-4 font-serif text-2xl group-hover:text-primary">{journey.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{journey.subtitle ?? journey.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {journey.tech_stack.slice(0, 6).map((tech) => <span key={tech} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{tech}</span>)}
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      <span className="inline-flex items-center gap-2 text-sm text-primary">Open <ArrowUpRight className="h-4 w-4" /></span>
                    </div>
                  </div>
                </button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selected ? <JourneyModal journey={selected} onClose={() => setSelected(null)} /> : null}
      </AnimatePresence>
    </main>
  );
}

function JourneyModal({ journey, onClose }: { journey: Journey; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 overflow-auto bg-background/82 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="mx-auto my-8 max-w-4xl overflow-hidden rounded-lg border border-border bg-card shadow-2xl" initial={{ opacity: 0, y: 28, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }}>
        {journey.cover_image ? <div className="h-72 bg-cover bg-center" style={{ backgroundImage: `url(${journey.cover_image})` }} /> : null}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">{journey.category}</p>
              <h2 className="mt-2 font-serif text-4xl">{journey.title}</h2>
              <p className="mt-3 text-muted-foreground">{journey.description}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {journey.github_url ? <Button asChild variant="outline"><a href={journey.github_url} target="_blank" rel="noreferrer"><Github className="h-4 w-4" />GitHub</a></Button> : null}
            {journey.demo_url ? <Button asChild variant="outline"><a href={journey.demo_url} target="_blank" rel="noreferrer"><ArrowUpRight className="h-4 w-4" />Demo</a></Button> : null}
            {journey.video_links.map((url) => <Button key={url} asChild variant="outline"><a href={url} target="_blank" rel="noreferrer"><Play className="h-4 w-4" />Video</a></Button>)}
            {journey.documents.map((doc) => <Button key={doc.url} asChild variant="outline"><a href={doc.url} target="_blank" rel="noreferrer"><FileText className="h-4 w-4" />{doc.title}</a></Button>)}
          </div>

          <div className="mt-8">
            <MarkdownView value={journey.content_markdown} />
          </div>

          {journey.journey_media?.length ? (
            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {journey.journey_media.map((media) => (
                <a key={media.id} href={media.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-border bg-background">
                  {media.type === "image" ? <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${media.url})` }} /> : <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">{media.type.toUpperCase()}</div>}
                  {media.caption ? <p className="p-3 text-sm text-muted-foreground">{media.caption}</p> : null}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

function formatRange(start: string, end: string | null) {
  const startDate = new Date(start).toLocaleDateString("en", { month: "short", year: "numeric" });
  if (!end) return startDate;
  return `${startDate} - ${new Date(end).toLocaleDateString("en", { month: "short", year: "numeric" })}`;
}
