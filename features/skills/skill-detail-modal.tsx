"use client";

import { X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Skill, SkillGraphData, SkillProjectLink } from "@/lib/types";

export function SkillDetailModal({ skill, graph, onClose }: { skill: Skill | null; graph: SkillGraphData; onClose: () => void }) {
  if (!skill) return null;
  const projects = graph.projectLinks.filter((link) => link.skill_id === skill.id);
  const parents = linkedSkills(graph, graph.relationships.filter((relationship) => relationship.child_skill_id === skill.id).map((relationship) => relationship.parent_skill_id));
  const children = linkedSkills(graph, graph.relationships.filter((relationship) => relationship.parent_skill_id === skill.id).map((relationship) => relationship.child_skill_id));
  const years = Math.max(1, Math.round(skill.xp / 1800));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-4 backdrop-blur-md">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-lg border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">{skill.skill_categories?.name ?? "Skill"}</p>
            <h2 className="mt-2 font-serif text-3xl">{skill.name}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close skill details"><X className="h-4 w-4" /></Button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="Level" value={String(skill.level)} />
          <Metric label="XP" value={skill.xp.toLocaleString()} />
          <Metric label="Years" value={`${years}+`} />
        </div>
        <p className="mt-6 leading-7 text-muted-foreground">{skill.description}</p>
        <DetailList title="Unlock Dependencies" items={parents.map((item) => item.name)} />
        <DetailList title="Child Skills" items={children.map((item) => item.name)} />
        <div className="mt-6">
          <h3 className="text-sm font-semibold">Related Projects</h3>
          <div className="mt-3 grid gap-2">
            {projects.length ? projects.map((project) => <ProjectLink key={project.id} link={project} />) : <p className="text-sm text-muted-foreground">No related projects linked yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border bg-background p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold text-primary">{value}</p></div>;
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? items.map((item) => <span key={item} className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">{item}</span>) : <span className="text-sm text-muted-foreground">None</span>}
      </div>
    </div>
  );
}

function ProjectLink({ link }: { link: SkillProjectLink }) {
  const href = link.entries?.demo_url ?? link.entries?.github_url ?? "#";
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:bg-secondary">
      <span>{link.entries?.title ?? "Project"}</span>
      <ArrowUpRight className="h-4 w-4 text-primary" />
    </a>
  );
}

function linkedSkills(graph: SkillGraphData, ids: string[]) {
  const idSet = new Set(ids);
  return graph.skills.filter((skill) => idSet.has(skill.id));
}
