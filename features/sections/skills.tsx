"use client";

import { motion } from "framer-motion";
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

const getSearchContext = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes("programming")) return "language";
  if (name.includes("framework")) return "framework";
  if (name.includes("database")) return "database";
  if (name.includes("cloud") || name.includes("devops")) return "devops";
  if (name.includes("tool")) return "tool";
  if (name.includes("ai") || name.includes("ml")) return "machine learning";
  return categoryName;
};

export function SkillsSection({ graph }: { graph: SkillGraphData }) {

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
            <h2 className="font-display text-4xl md:text-5xl text-foreground tracking-tight flex items-center gap-4 uppercase">
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
                  <a
                    key={skill.id}
                    href={`https://www.google.com/search?q=${encodeURIComponent(skill.name + ' ' + getSearchContext(category.name))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-card border-2 border-border rounded-md hover:border-primary hover:bg-secondary/10 hover:-translate-y-1 hover:shadow-[4px_4px_0px_hsl(var(--primary))] transition-all group"
                  >
                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{skill.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
