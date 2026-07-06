"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapIcon, Code2, Globe, Database, Smartphone, Cloud, Shield, Cpu, BookOpen, X, ExternalLink, Network } from "lucide-react";
import type { Skill, SkillCategory, SkillGraphData } from "@/lib/types";

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("web") || n.includes("frontend")) return <Globe className="w-5 h-5" />;
  if (n.includes("back") || n.includes("database") || n.includes("sql")) return <Database className="w-5 h-5" />;
  if (n.includes("mobile")) return <Smartphone className="w-5 h-5" />;
  if (n.includes("cloud") || n.includes("devops")) return <Cloud className="w-5 h-5" />;
  if (n.includes("security")) return <Shield className="w-5 h-5" />;
  if (n.includes("ai") || n.includes("machine") || n.includes("data")) return <Cpu className="w-5 h-5" />;
  if (n.includes("programming") || n.includes("language")) return <Code2 className="w-5 h-5" />;
  return <Network className="w-5 h-5" />;
};

export function SkillsSection({ graph }: { graph: SkillGraphData }) {
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);

  // Group skills by category
  const skillsByCategory = graph.categories.sort((a, b) => a.display_order - b.display_order).map(cat => ({
    ...cat,
    skills: graph.skills.filter(s => s.category_id === cat.id).sort((a, b) => a.name.localeCompare(b.name))
  })).filter(cat => cat.skills.length > 0);

  return (
    <section id="skills" className="py-24 px-4 md:px-8 bg-background relative">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <p className="font-bold uppercase tracking-widest text-primary text-xs mb-2">Technical Index</p>
            <h2 className="font-bold text-4xl md:text-5xl text-foreground tracking-tight flex items-center gap-4">
               Skills
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md font-medium text-sm">
            A comprehensive index of technologies, languages, and frameworks I work with.
          </p>
        </motion.div>

        <div className="grid gap-12">
          {skillsByCategory.map((category, idx) => (
            <motion.div 
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: Math.min(idx * 0.1, 0.4) }}
            >
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3 border-b-2 border-border/30 pb-3">
                <span className="text-primary">{getCategoryIcon(category.name)}</span>
                {category.name}
              </h3>
              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => setActiveSkill(skill)}
                    className="flex items-center gap-2 px-4 py-2 bg-card border-2 border-border rounded-md hover:border-primary hover:bg-secondary/10 hover:-translate-y-1 hover:shadow-[4px_4px_0px_hsl(var(--primary))] transition-all group"
                  >
                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{skill.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeSkill && (
          <SkillModal skill={activeSkill} graph={graph} onClose={() => setActiveSkill(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

function SkillModal({ skill, graph, onClose }: { skill: Skill; graph: SkillGraphData; onClose: () => void }) {
  const projects = graph.projectLinks.filter(link => link.skill_id === skill.id);
  const parentIds = graph.relationships.filter(r => r.child_skill_id === skill.id).map(r => r.parent_skill_id);
  const childIds = graph.relationships.filter(r => r.parent_skill_id === skill.id).map(r => r.child_skill_id);
  const relatedSkillIds = new Set([...parentIds, ...childIds]);
  const relatedSkills = graph.skills.filter(s => relatedSkillIds.has(s.id));
  const category = graph.categories.find(c => c.id === skill.category_id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] bg-card border-2 border-border rounded-xl shadow-[8px_8px_0px_hsl(var(--border))] overflow-hidden flex flex-col relative"
      >
        <div className="flex items-start justify-between p-6 md:p-8 border-b-2 border-border/30 bg-muted/30">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-2">
              {getCategoryIcon(category?.name || "")}
              {category?.name || "Skill"}
            </div>
            <h2 className="text-3xl font-bold text-foreground">{skill.name}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-8 bg-background">
          <p className="text-base text-foreground leading-relaxed">
            {skill.description || "No detailed description available for this technology."}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b-2 border-border/20">
                Related Projects
              </h3>
              {projects.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {projects.map(p => {
                    const href = p.entries?.demo_url ?? p.entries?.github_url ?? "#";
                    return (
                      <li key={p.id}>
                        <a href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between p-3 bg-card border-2 border-border rounded-md hover:border-primary transition-all">
                          <span className="font-bold text-sm text-foreground">{p.entries?.title ?? "Unknown Project"}</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No related projects found.</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b-2 border-border/20">
                Related Technologies
              </h3>
              {relatedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {relatedSkills.map(s => (
                    <div key={s.id} className="px-3 py-1.5 bg-muted border border-border/50 rounded-md text-xs font-bold text-foreground">
                      {s.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No specific related technologies mapped.</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
