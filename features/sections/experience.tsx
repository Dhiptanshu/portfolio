"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Briefcase, CalendarDays, MapPin, X } from "lucide-react";
import type { Experience } from "@/lib/types";

export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  const [selected, setSelected] = useState<Experience | null>(null);

  if (!experiences || experiences.length === 0) return null;

  return (
    <section id="experience" className="py-24 px-4 md:px-8 bg-background relative border-t-2 border-border/20">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-center justify-between"
        >
          <h2 className="font-bold text-3xl md:text-4xl text-foreground flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" />
            Experience
          </h2>
        </motion.div>

        <div className="flex flex-col gap-8 bg-card border-2 border-border rounded-xl p-6 md:p-10 shadow-[8px_8px_0px_hsl(var(--border))]">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${index !== experiences.length - 1 ? 'pb-8 border-b-2 border-border/30 mb-8' : ''}`}
            >
              <button 
                onClick={() => setSelected(exp)}
                className="w-full flex flex-col md:flex-row gap-4 md:gap-6 text-left group transition-all p-4 -m-4 rounded-xl hover:bg-secondary/20"
              >
              <div className="shrink-0 mt-1">
                {exp.logo_url ? (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-md shadow-sm border border-border bg-white flex items-center justify-center p-1">
                    <img src={exp.logo_url} alt={exp.company} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-muted border border-border rounded-md flex items-center justify-center">
                    <Building2 className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {exp.role}
                </h3>
                
                <div className="text-base text-foreground font-medium mt-1">
                  {exp.company} <span className="text-muted-foreground font-normal">· {exp.employment_type}</span>
                </div>
                
                <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-2">
                  <span>{formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Present'}</span>
                  <span>·</span>
                  <span>{calculateDuration(exp.start_date, exp.end_date)}</span>
                </div>
                
                {exp.location && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {exp.location}
                  </div>
                )}
                
                <div className="mt-4 text-base text-foreground leading-relaxed line-clamp-3">
                  {exp.description}
                </div>
              </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <ExperienceModal
            exp={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ExperienceModal({ exp, onClose }: { exp: Experience; onClose: () => void }) {
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
            <Briefcase className="w-6 h-6" />
            <h2 className="font-bold text-xl uppercase tracking-widest drop-shadow-sm">Experience Details</h2>
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
                {exp.employment_type}
              </span>
              <h1 className="font-display text-3xl md:text-5xl text-foreground mb-5 leading-tight uppercase">
                {exp.role}
              </h1>
              <div className="text-xl font-bold text-muted-foreground mb-8">
                {exp.company}
              </div>
              
              <div className="text-lg text-foreground whitespace-pre-wrap leading-relaxed">
                {exp.description}
              </div>

              {exp.media_gallery && exp.media_gallery.length > 0 && (
                <div className="border-t-4 border-dashed border-border/20 pt-8 mt-8">
                  <h3 className="font-black text-xl mb-4 uppercase tracking-widest text-primary">Media Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exp.media_gallery.map((media, i) => (
                      <div key={i} className="relative aspect-video rounded border-2 border-border overflow-hidden bg-white flex items-center justify-center p-2 group shadow-[2px_2px_0px_hsl(var(--border))]">
                        {media.type === 'image' || media.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                          <img src={media.url} alt={media.title || 'Gallery image'} className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
                        ) : media.type === 'video' || media.url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={media.url} controls className="w-full h-full object-cover" />
                        ) : media.type === 'pdf' || media.url.match(/\.pdf$/i) ? (
                          <a href={media.url} target="_blank" rel="noreferrer" className="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:bg-background transition-colors hover:text-foreground">
                            <span className="text-sm font-bold uppercase tracking-widest">{media.title || 'View PDF'}</span>
                          </a>
                        ) : (
                          <a href={media.url} target="_blank" rel="noreferrer" className="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:bg-background transition-colors hover:text-foreground">
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
              {exp.logo_url ? (
                <div className="w-full aspect-square rounded-xl border-4 border-border shadow-[4px_4px_0px_hsl(var(--border))] overflow-hidden bg-white flex items-center justify-center p-4">
                  <img src={exp.logo_url} className="w-full h-full object-contain" alt={exp.company} />
                </div>
              ) : (
                <div className="w-full aspect-square rounded-xl border-4 border-border shadow-[4px_4px_0px_hsl(var(--border))] overflow-hidden bg-muted flex items-center justify-center">
                  <Building2 className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
              
              <div className="bg-background rounded border-2 border-border p-4 shadow-inner">
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Timeframe</p>
                  <p className="font-bold text-sm text-foreground flex flex-col gap-1">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-primary" /> 
                      {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                    </span>
                    <span className="text-xs text-muted-foreground ml-5">
                      ({calculateDuration(exp.start_date, exp.end_date)})
                    </span>
                  </p>
                </div>
                {exp.location && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Location</p>
                    <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" /> {exp.location}
                    </p>
                  </div>
                )}
              </div>

              {exp.tech_stack && exp.tech_stack.length > 0 && (
                <div className="bg-background rounded border-2 border-border p-4 shadow-inner">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-3">Skills Utilized</p>
                  <div className="flex flex-wrap gap-2">
                    {exp.tech_stack.map(tech => (
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en", { month: "short", year: "numeric" });
}

function calculateDuration(start: string, end: string | null) {
  const d1 = new Date(start);
  const d2 = end ? new Date(end) : new Date();
  
  let months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  months = months <= 0 ? 1 : months;
  
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  
  const parts = [];
  if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? 's' : ''}`);
  if (mos > 0 || yrs === 0) parts.push(`${mos} mo${mos > 1 ? 's' : ''}`);
  
  return parts.join(" ");
}
