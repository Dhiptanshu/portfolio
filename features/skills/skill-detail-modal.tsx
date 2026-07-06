"use client";

import { X, ExternalLink, Activity } from "lucide-react";
import type { Skill, SkillGraphData, SkillProjectLink } from "@/lib/types";

export function SkillDetailModal({ skill, graph, onClose }: { skill: Skill | null; graph: SkillGraphData; onClose: () => void }) {
  if (!skill) return null;
  const projects = graph.projectLinks.filter((link) => link.skill_id === skill.id);
  const parents = linkedSkills(graph, graph.relationships.filter((relationship) => relationship.child_skill_id === skill.id).map((relationship) => relationship.parent_skill_id));
  const children = linkedSkills(graph, graph.relationships.filter((relationship) => relationship.parent_skill_id === skill.id).map((relationship) => relationship.child_skill_id));
  const isMastered = skill.level >= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="rpg-panel max-h-[88vh] w-full max-w-2xl overflow-auto bg-card p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded border-2 border-border shadow-[4px_4px_0px_hsl(var(--border))] ${isMastered ? 'bg-accent text-accent-foreground' : 'bg-background'}`}>
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{skill.skill_categories?.name ?? "Skill Class"}</p>
              <h2 className="font-black text-3xl text-foreground mt-1">{skill.name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded bg-background border-2 border-border text-foreground hover:bg-muted shadow-[2px_2px_0px_hsl(var(--border))]">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="bg-muted p-4 rounded border-2 border-border/50 shadow-inner mb-6">
          <p className="font-medium text-sm text-foreground">{skill.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border-2 border-border rounded p-3 bg-background flex flex-col items-center justify-center shadow-[2px_2px_0px_hsl(var(--border))]">
            <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Skill Level</span>
            <span className="font-black text-xl text-primary">Lv. {skill.level}</span>
          </div>
          <div className="border-2 border-border rounded p-3 bg-background flex flex-col items-center justify-center shadow-[2px_2px_0px_hsl(var(--border))]">
            <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Experience Points</span>
            <span className="font-black text-xl text-primary">{skill.xp.toLocaleString()} EXP</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <DetailList title="Prerequisites" items={parents.map((item) => item.name)} />
          <DetailList title="Unlocks" items={children.map((item) => item.name)} />
        </div>
        
        {projects.length > 0 && (
          <div className="border-t-4 border-dashed border-border/20 pt-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Linked Quests</h3>
            <div className="grid gap-2">
              {projects.map((project) => <ProjectLink key={project.id} link={project} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rpg-panel p-4 bg-background">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b-2 border-border/20 pb-2 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.length ? items.map((item) => (
          <span key={item} className="bg-card border-2 border-border px-2 py-1 text-[9px] font-bold uppercase text-muted-foreground shadow-[1px_1px_0px_hsl(var(--border))]">
            {item}
          </span>
        )) : <span className="text-[10px] font-bold text-muted-foreground">None</span>}
      </div>
    </div>
  );
}

function ProjectLink({ link }: { link: SkillProjectLink }) {
  const href = link.entries?.demo_url ?? link.entries?.github_url ?? "#";
  return (
    <a href={href} target="_blank" rel="noreferrer" className="rpg-panel flex items-center justify-between p-3 bg-background hover:bg-muted transition-colors">
      <span className="font-bold text-sm text-foreground">{link.entries?.title ?? "Unknown Quest"}</span>
      <ExternalLink className="h-4 w-4 text-primary" />
    </a>
  );
}

function linkedSkills(graph: SkillGraphData, ids: string[]) {
  const idSet = new Set(ids);
  return graph.skills.filter((skill) => idSet.has(skill.id));
}
