"use client";

import { useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";
import { Copy, Eye, EyeOff, Plus, Trash2, Tag, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";
import type { Entry, Skill, SkillCategory, SkillGraphData } from "@/lib/types";

const COMMON_ICONS = [
  "Activity", "AppWindow", "Box", "Brain", "Briefcase", "Bug", "CheckCircle", "Cloud",
  "Code", "Code2", "Cpu", "Database", "FileCode", "Flame", "Gamepad", "Globe", "Hammer",
  "HardDrive", "Image", "Layers", "Layout", "LineChart", "Monitor", "Network", 
  "PanelsTopLeft", "PenTool", "Rocket", "Server", "Shield", "Smartphone", "Sparkles", 
  "Terminal", "Users", "Wrench", "Zap"
];

export function SkillAdmin({ initialGraph, entries }: { initialGraph: SkillGraphData; entries: Entry[] }) {
  const [graph, setGraph] = useState(initialGraph);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(initialGraph.skills[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"skills" | "categories">("skills");
  
  const selectedSkill = graph.skills.find((skill) => skill.id === selectedSkillId) ?? null;

  const filteredSkills = graph.skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || skill.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  async function createSkill() {
    const baseName = "New Skill";
    const response = await fetch("/api/skills", {
      method: "POST",
      body: JSON.stringify({
        name: baseName,
        slug: `${slugify(baseName)}-${Date.now()}`,
        description: "Describe this skill.",
        xp: 100,
        color_theme: "#dec89c",
        node_x: 0,
        node_y: 0,
        category_id: graph.categories[0]?.id ?? null,
        is_visible: true
      })
    });
    if (!response.ok) return;
    const skill = (await response.json()) as Skill;
    setGraph({ ...graph, skills: [skill, ...graph.skills] });
    setSelectedSkillId(skill.id);
  }

  async function duplicateSkill(skill: Skill) {
    const response = await fetch("/api/skills", {
      method: "POST",
      body: JSON.stringify({
        ...skill,
        name: `${skill.name} Copy`,
        slug: `${skill.slug}-copy-${Date.now()}`,
      })
    });
    if (!response.ok) return;
    const copySkill = (await response.json()) as Skill;
    setGraph({ ...graph, skills: [copySkill, ...graph.skills] });
    setSelectedSkillId(copySkill.id);
  }

  async function updateSkill(id: string, patch: Partial<Skill>) {
    const response = await fetch("/api/skills", { method: "PATCH", body: JSON.stringify({ id, ...patch }) });
    if (!response.ok) return;
    const updated = (await response.json()) as Skill;
    setGraph({ ...graph, skills: graph.skills.map((skill) => (skill.id === id ? updated : skill)) });
    toast.success("Skill updated successfully");
  }

  async function deleteSkill(id: string) {
    const response = await fetch("/api/skills", { method: "DELETE", body: JSON.stringify({ id }) });
    if (!response.ok) return;
    setGraph({
      ...graph,
      skills: graph.skills.filter((skill) => skill.id !== id),
      projectLinks: graph.projectLinks.filter((link) => link.skill_id !== id)
    });
    setSelectedSkillId(graph.skills[0]?.id ?? null);
  }

  async function createCategory(name: string, icon: string) {
    const response = await fetch("/api/skill-categories", { method: "POST", body: JSON.stringify({ name, icon, display_order: graph.categories.length }) });
    if (!response.ok) return;
    setGraph({ ...graph, categories: [...graph.categories, await response.json()] });
    toast.success("Category created");
  }

  async function updateCategory(id: string, patch: Partial<SkillCategory>) {
    const response = await fetch("/api/skill-categories", { method: "PATCH", body: JSON.stringify({ id, ...patch }) });
    if (!response.ok) return;
    const updated = await response.json();
    setGraph({ ...graph, categories: graph.categories.map((c) => (c.id === id ? updated : c)) });
    toast.success("Category updated");
  }

  async function deleteCategory(id: string) {
    const response = await fetch("/api/skill-categories", { method: "DELETE", body: JSON.stringify({ id }) });
    if (!response.ok) return;
    setGraph({ ...graph, categories: graph.categories.filter((c) => c.id !== id) });
  }

  return (
    <div className="grid gap-6">
      <div className="flex gap-4">
         <Button variant={activeTab === "skills" ? "default" : "outline"} onClick={() => setActiveTab("skills")}>Manage Skills</Button>
         <Button variant={activeTab === "categories" ? "default" : "outline"} onClick={() => setActiveTab("categories")}>Manage Categories</Button>
      </div>

      {activeTab === "skills" && (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <aside className="grid max-h-[720px] gap-4 overflow-auto rounded-lg border border-border bg-card p-4">
            <div className="grid gap-3">
              <Input placeholder="Search skills" value={search} onChange={(event) => setSearch(event.target.value)} />
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">All categories</option>
                {graph.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <Button onClick={createSkill}><Plus className="h-4 w-4" />Create skill</Button>
            </div>

            <div className="grid gap-2 mt-4">
              {filteredSkills.map((skill) => {
                const category = graph.categories.find(c => c.id === skill.category_id);
                return (
                  <button key={skill.id} className={`rounded-md border p-3 text-left transition-colors ${selectedSkillId === skill.id ? 'border-primary bg-secondary' : 'border-border hover:bg-secondary/50'}`} onClick={() => setSelectedSkillId(skill.id)}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-bold">{skill.name}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground uppercase font-bold tracking-wider">{category?.name || "Uncategorized"}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-h-[720px] rounded-lg border border-border bg-background p-6">
            {selectedSkill ? (
              <SkillEditor
                skill={selectedSkill}
                categories={graph.categories}
                entries={entries}
                linkedEntryIds={graph.projectLinks.filter((link) => link.skill_id === selectedSkill.id).map((link) => link.entry_id)}
                onUpdate={updateSkill}
                onDelete={deleteSkill}
                onDuplicate={duplicateSkill}
                onLinkChange={async (entryId, linked) => {
                  const response = await fetch("/api/skill-project-links", { method: linked ? "POST" : "DELETE", body: JSON.stringify({ skill_id: selectedSkill.id, entry_id: entryId }) });
                  if (!response.ok) return;
                  if (linked) setGraph({ ...graph, projectLinks: [...graph.projectLinks, await response.json()] });
                  else setGraph({ ...graph, projectLinks: graph.projectLinks.filter((link) => !(link.skill_id === selectedSkill.id && link.entry_id === entryId)) });
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">Select a skill to edit.</div>
            )}
          </main>
        </div>
      )}

      {activeTab === "categories" && (
        <CategoryManager categories={graph.categories} onCreate={createCategory} onUpdate={updateCategory} onDelete={deleteCategory} />
      )}
    </div>
  );
}

function SkillEditor({ skill, categories, entries, linkedEntryIds, onUpdate, onDelete, onDuplicate, onLinkChange }: { skill: Skill; categories: SkillCategory[]; entries: Entry[]; linkedEntryIds: string[]; onUpdate: (id: string, patch: Partial<Skill>) => void; onDelete: (id: string) => void; onDuplicate: (skill: Skill) => void; onLinkChange: (entryId: string, linked: boolean) => void }) {
  return (
    <div className="grid gap-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-border/20 pb-4">
        <h2 className="font-bold text-3xl uppercase">{skill.name}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onUpdate(skill.id, { is_visible: !skill.is_visible })}>{skill.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{skill.is_visible ? "Hide" : "Show"}</Button>
          <Button variant="outline" onClick={() => onDuplicate(skill)}><Copy className="h-4 w-4" />Duplicate</Button>
          <Button variant="destructive" onClick={() => onDelete(skill.id)}><Trash2 className="h-4 w-4" />Delete</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Skill Name</label>
          <Input value={skill.name} onChange={(event) => onUpdate(skill.id, { name: event.target.value, slug: slugify(event.target.value) })} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium" value={skill.category_id ?? ""} onChange={(event) => onUpdate(skill.id, { category_id: event.target.value || null })}>
            <option value="">No category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
          <Textarea rows={4} value={skill.description ?? ""} onChange={(event) => onUpdate(skill.id, { description: event.target.value })} />
        </div>
      </div>
      
      <div className="mt-8 border-t-2 border-border/20 pt-6">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Related Projects</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {entries.map((entry) => {
            const linked = linkedEntryIds.includes(entry.id);
            return (
              <label key={entry.id} className={`flex items-center gap-3 rounded-md border-2 p-3 text-sm font-medium cursor-pointer transition-colors ${linked ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <input type="checkbox" className="w-4 h-4" checked={linked} onChange={(event) => onLinkChange(entry.id, event.target.checked)} />
                <span className="truncate">{entry.title}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CategoryManager({ categories, onCreate, onUpdate, onDelete }: { categories: SkillCategory[], onCreate: (name: string, icon: string) => void, onUpdate: (id: string, patch: Partial<SkillCategory>) => void, onDelete: (id: string) => void }) {
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");

  const IconPreview = ({ name }: { name: string }) => {
    const Icon = name ? (LucideIcons as any)[name] : null;
    return (
      <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded bg-secondary border border-border">
        {Icon ? <Icon className="w-5 h-5 text-primary" /> : <div className="w-5 h-5 rounded-sm border-2 border-dashed border-muted-foreground/30" />}
      </div>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="grid gap-3 content-start">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-4 bg-card border border-border p-4 rounded-lg shadow-sm">
             <div className="flex-1 grid md:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground">Name</label>
                 <Input value={cat.name} onChange={(e) => onUpdate(cat.id, { name: e.target.value })} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground">Icon (Lucide name)</label>
                 <div className="flex items-center gap-2">
                   <IconPreview name={cat.icon || ""} />
                   <select className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm font-medium" value={cat.icon || ""} onChange={(e) => onUpdate(cat.id, { icon: e.target.value })}>
                     <option value="">No Icon</option>
                     {COMMON_ICONS.map((icon) => (
                       <option key={icon} value={icon}>{icon}</option>
                     ))}
                   </select>
                 </div>
               </div>
             </div>
             <Button variant="destructive" size="icon" onClick={() => onDelete(cat.id)}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
        {categories.length === 0 && <div className="text-muted-foreground p-8 text-center border-2 border-dashed border-border rounded-lg">No categories found.</div>}
      </div>

      <div className="bg-card border border-border p-6 rounded-lg self-start">
        <h3 className="font-bold uppercase mb-4 text-primary tracking-widest border-b-2 border-border/20 pb-2">Add Category</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
             <label className="text-xs font-bold">Category Name</label>
             <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. DevOps" />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold">Icon Name (Optional)</label>
             <div className="flex items-center gap-2">
               <IconPreview name={newIcon} />
               <select className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm font-medium" value={newIcon} onChange={(e) => setNewIcon(e.target.value)}>
                 <option value="">Select an icon...</option>
                 {COMMON_ICONS.map((icon) => (
                   <option key={icon} value={icon}>{icon}</option>
                 ))}
               </select>
             </div>
          </div>
          <Button onClick={() => { onCreate(newName, newIcon); setNewName(""); setNewIcon(""); }} disabled={!newName} className="w-full mt-2"><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
        </div>
      </div>
    </div>
  );
}
