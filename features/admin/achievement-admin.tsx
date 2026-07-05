"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Eye, EyeOff, GripVertical, Plus, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";
import type { Achievement, AchievementCategory, AchievementData, AchievementProjectLink, AchievementRarity, AchievementSkillLink, Entry, Skill } from "@/lib/types";

const rarities: AchievementRarity[] = ["Common", "Rare", "Epic", "Legendary", "Mythic"];

export function AchievementAdmin({ initialData, entries, skills }: { initialData: AchievementData; entries: Entry[]; skills: Skill[] }) {
  const [data, setData] = useState(initialData);
  const [selectedId, setSelectedId] = useState(initialData.achievements[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("all");
  const [categoryName, setCategoryName] = useState("");
  const selected = data.achievements.find((achievement) => achievement.id === selectedId) ?? null;
  const visibleCount = data.achievements.filter((achievement) => achievement.is_visible).length;
  const totalXp = data.achievements.reduce((sum, achievement) => sum + achievement.xp_reward, 0);
  const filtered = data.achievements.filter((achievement) => {
    const matchesSearch = `${achievement.title} ${achievement.description ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesRarity = rarity === "all" || achievement.rarity === rarity;
    return matchesSearch && matchesRarity;
  });

  async function createAchievement() {
    const title = "New Achievement";
    const response = await fetch("/api/achievements", {
      method: "POST",
      body: JSON.stringify({
        title,
        slug: `${slugify(title)}-${Date.now()}`,
        description: "Describe the unlock condition and story.",
        rarity: "Common",
        xp_reward: 100,
        unlock_date: new Date().toISOString().slice(0, 10),
        color: "#dec89c",
        is_secret: false,
        is_visible: true,
        display_order: data.achievements.length,
        category_id: data.categories[0]?.id ?? null
      })
    });
    if (!response.ok) return;
    const achievement = await response.json() as Achievement;
    setData({ ...data, achievements: [...data.achievements, achievement] });
    setSelectedId(achievement.id);
  }

  async function updateAchievement(id: string, patch: Partial<Achievement>) {
    const response = await fetch("/api/achievements", { method: "PATCH", body: JSON.stringify({ id, ...patch }) });
    if (!response.ok) return;
    const updated = await response.json() as Achievement;
    setData({ ...data, achievements: data.achievements.map((achievement) => (achievement.id === id ? updated : achievement)) });
  }

  async function deleteAchievement(id: string) {
    const response = await fetch("/api/achievements", { method: "DELETE", body: JSON.stringify({ id }) });
    if (!response.ok) return;
    const next = data.achievements.filter((achievement) => achievement.id !== id);
    setData({
      ...data,
      achievements: next,
      projectLinks: data.projectLinks.filter((link) => link.achievement_id !== id),
      skillLinks: data.skillLinks.filter((link) => link.achievement_id !== id)
    });
    setSelectedId(next[0]?.id ?? "");
  }

  async function duplicateAchievement(achievement: Achievement) {
    const response = await fetch("/api/achievements", {
      method: "POST",
      body: JSON.stringify({
        ...achievement,
        title: `${achievement.title} Copy`,
        slug: `${achievement.slug}-copy-${Date.now()}`,
        display_order: data.achievements.length
      })
    });
    if (!response.ok) return;
    const copy = await response.json() as Achievement;
    setData({ ...data, achievements: [...data.achievements, copy] });
    setSelectedId(copy.id);
  }

  async function createCategory() {
    if (!categoryName) return;
    const response = await fetch("/api/achievement-categories", {
      method: "POST",
      body: JSON.stringify({ name: categoryName, color: "#dec89c", display_order: data.categories.length })
    });
    if (!response.ok) return;
    setData({ ...data, categories: [...data.categories, await response.json()] });
    setCategoryName("");
  }

  async function onDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIndex = data.achievements.findIndex((achievement) => achievement.id === event.active.id);
    const newIndex = data.achievements.findIndex((achievement) => achievement.id === event.over?.id);
    const next = arrayMove(data.achievements, oldIndex, newIndex);
    setData({ ...data, achievements: next });
    await fetch("/api/achievements", { method: "PATCH", body: JSON.stringify({ ids: next.map((achievement) => achievement.id) }) });
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Achievements" value={data.achievements.length.toString()} />
        <Stat label="Visible" value={visibleCount.toString()} />
        <Stat label="Total XP" value={totalXp.toLocaleString()} />
        <Stat label="Categories" value={data.categories.length.toString()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="grid max-h-[760px] gap-4 overflow-auto rounded-lg border border-border bg-card p-4">
          <div className="grid gap-3">
            <Input placeholder="Search achievements" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={rarity} onChange={(event) => setRarity(event.target.value)}>
              <option value="all">All rarities</option>
              {rarities.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <Button onClick={createAchievement}><Plus className="h-4 w-4" />Create achievement</Button>
          </div>

          <DndContext onDragEnd={onDragEnd}>
            <SortableContext items={data.achievements.map((achievement) => achievement.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-2">
                {filtered.map((achievement) => <AchievementListItem key={achievement.id} achievement={achievement} selected={achievement.id === selectedId} onSelect={() => setSelectedId(achievement.id)} />)}
              </div>
            </SortableContext>
          </DndContext>

          <div className="grid gap-2 border-t border-border pt-4">
            <p className="text-sm font-semibold">Category management</p>
            <div className="flex gap-2">
              <Input placeholder="Category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
              <Button size="icon" onClick={createCategory} aria-label="Create category"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </aside>

        {selected ? (
          <AchievementEditor
            achievement={selected}
            categories={data.categories}
            entries={entries}
            skills={skills}
            projectLinks={data.projectLinks.filter((link) => link.achievement_id === selected.id)}
            skillLinks={data.skillLinks.filter((link) => link.achievement_id === selected.id)}
            onUpdate={updateAchievement}
            onDelete={deleteAchievement}
            onDuplicate={duplicateAchievement}
            setData={setData}
            data={data}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">Create an achievement to begin.</div>
        )}
      </div>
    </div>
  );
}

function AchievementListItem({ achievement, selected, onSelect }: { achievement: Achievement; selected: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: achievement.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`rounded-md border ${selected ? "border-primary bg-secondary" : "border-border bg-background"}`}>
      <div className="flex gap-2 p-3">
        <button className="text-muted-foreground" {...attributes} {...listeners} aria-label="Drag to reorder"><GripVertical className="h-4 w-4" /></button>
        <button className="min-w-0 flex-1 text-left" onClick={onSelect}>
          <p className="truncate text-sm font-medium">{achievement.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{achievement.rarity} · {achievement.xp_reward.toLocaleString()} XP</p>
        </button>
      </div>
    </div>
  );
}

function AchievementEditor({ achievement, categories, entries, skills, projectLinks, skillLinks, onUpdate, onDelete, onDuplicate, setData, data }: { achievement: Achievement; categories: AchievementCategory[]; entries: Entry[]; skills: Skill[]; projectLinks: AchievementProjectLink[]; skillLinks: AchievementSkillLink[]; onUpdate: (id: string, patch: Partial<Achievement>) => void; onDelete: (id: string) => void; onDuplicate: (achievement: Achievement) => void; setData: (data: AchievementData) => void; data: AchievementData }) {
  const [draft, setDraft] = useState(achievement);

  useEffect(() => {
    setDraft(achievement);
  }, [achievement]);

  function patch(value: Partial<Achievement>) {
    setDraft({ ...draft, ...value });
  }

  async function upload(file: File, field: "icon" | "cover_image") {
    const form = new FormData();
    form.set("file", file);
    const response = await fetch("/api/achievement-upload", { method: "POST", body: form });
    if (!response.ok) return;
    const uploaded = await response.json() as { url: string };
    patch({ [field]: uploaded.url });
  }

  async function toggleProject(entryId: string, linked: boolean) {
    const response = await fetch("/api/achievement-project-links", { method: linked ? "POST" : "DELETE", body: JSON.stringify({ achievement_id: draft.id, entry_id: entryId }) });
    if (!response.ok) return;
    if (linked) setData({ ...data, projectLinks: [...data.projectLinks, await response.json()] });
    else setData({ ...data, projectLinks: data.projectLinks.filter((link) => !(link.achievement_id === draft.id && link.entry_id === entryId)) });
  }

  async function toggleSkill(skillId: string, linked: boolean) {
    const response = await fetch("/api/achievement-skill-links", { method: linked ? "POST" : "DELETE", body: JSON.stringify({ achievement_id: draft.id, skill_id: skillId }) });
    if (!response.ok) return;
    if (linked) setData({ ...data, skillLinks: [...data.skillLinks, await response.json()] });
    else setData({ ...data, skillLinks: data.skillLinks.filter((link) => !(link.achievement_id === draft.id && link.skill_id === skillId)) });
  }

  return (
    <section className="grid gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">Edit achievement</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => patch({ is_visible: !draft.is_visible })}>{draft.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{draft.is_visible ? "Hide" : "Show"}</Button>
          <Button variant="outline" onClick={() => onDuplicate(draft)}><Copy className="h-4 w-4" />Duplicate</Button>
          <Button onClick={() => onUpdate(draft.id, draft)}><Save className="h-4 w-4" />Save</Button>
          <Button variant="destructive" onClick={() => onDelete(draft.id)}><Trash2 className="h-4 w-4" />Delete</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Input value={draft.title} onChange={(event) => patch({ title: event.target.value, slug: slugify(event.target.value) })} />
        <Input value={draft.slug} onChange={(event) => patch({ slug: slugify(event.target.value) })} />
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={draft.rarity} onChange={(event) => patch({ rarity: event.target.value as AchievementRarity })}>{rarities.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={draft.category_id ?? ""} onChange={(event) => patch({ category_id: event.target.value || null })}>
          <option value="">No category</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <Input type="number" value={draft.xp_reward} onChange={(event) => patch({ xp_reward: Number(event.target.value) })} />
        <Input type="date" value={draft.unlock_date ?? ""} onChange={(event) => patch({ unlock_date: event.target.value || null })} />
        <Input type="color" value={draft.color} onChange={(event) => patch({ color: event.target.value })} />
        <Input value={draft.icon ?? ""} placeholder="Icon URL or lucide name" onChange={(event) => patch({ icon: event.target.value })} />
        <Input value={draft.cover_image ?? ""} placeholder="Cover image URL" onChange={(event) => patch({ cover_image: event.target.value })} />
        <div className="flex gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary"><Upload className="h-4 w-4" />Icon<input className="hidden" type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], "icon")} /></label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary"><Upload className="h-4 w-4" />Cover<input className="hidden" type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], "cover_image")} /></label>
        </div>
        <Textarea className="md:col-span-2" value={draft.description ?? ""} onChange={(event) => patch({ description: event.target.value })} />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.is_secret} onChange={(event) => patch({ is_secret: event.target.checked })} />Secret</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.is_visible} onChange={(event) => patch({ is_visible: event.target.checked })} />Visible</label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <LinkPanel title="Linked projects">{entries.map((entry) => <CheckRow key={entry.id} label={entry.title} checked={projectLinks.some((link) => link.entry_id === entry.id)} onChange={(checked) => toggleProject(entry.id, checked)} />)}</LinkPanel>
        <LinkPanel title="Linked skills">{skills.map((skill) => <CheckRow key={skill.id} label={`${skill.name} · Lv ${skill.level}`} checked={skillLinks.some((link) => link.skill_id === skill.id)} onChange={(checked) => toggleSkill(skill.id, checked)} />)}</LinkPanel>
      </div>
    </section>
  );
}

function LinkPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="max-h-72 overflow-auto rounded-lg border border-border bg-background p-4"><p className="mb-3 text-sm font-semibold">{title}</p><div className="grid gap-2">{children}</div></div>;
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center gap-2 rounded-md border border-border p-2 text-sm"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold text-primary">{value}</p></div>;
}
