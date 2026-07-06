"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Eye, EyeOff, GripVertical, Plus, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/features/admin/markdown-editor";
import { slugify } from "@/lib/utils";
import type { Journey, JourneyMedia, Skill } from "@/lib/types";

const categories = ["Internship", "Hackathon", "Project", "Research Paper", "Competition", "Certification", "Volunteer Work", "Leadership", "Extracurricular"];

export function JourneyAdmin({ initialJourneys, skills }: { initialJourneys: Journey[]; skills: Skill[] }) {
  const [journeys, setJourneys] = useState(initialJourneys);
  const [selectedId, setSelectedId] = useState(initialJourneys[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const selected = journeys.find((journey) => journey.id === selectedId) ?? null;
  const visibleCount = journeys.filter((journey) => journey.is_visible).length;
  const allTags = useMemo(() => Array.from(new Set(journeys.flatMap((journey) => journey.journey_tags?.map((tag) => tag.name) ?? []))).sort(), [journeys]);
  const filtered = journeys.filter((journey) => {
    const matchesSearch = `${journey.title} ${journey.subtitle ?? ""} ${journey.description ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || journey.category === category;
    return matchesSearch && matchesCategory;
  });

  async function createJourney() {
    const title = "New Journey Entry";
    const response = await fetch("/api/journeys", {
      method: "POST",
      body: JSON.stringify({
        title,
        slug: `${slugify(title)}-${Date.now()}`,
        subtitle: "Short context for this milestone",
        description: "A concise timeline summary.",
        content_markdown: "## Story\n\nDescribe the work, proof, decisions, and outcome.",
        start_date: new Date().toISOString().slice(0, 10),
        category: "Project",
        tech_stack: [],
        linked_skill_ids: [],
        linked_achievements: [],
        video_links: [],
        documents: [],
        display_order: journeys.length,
        is_visible: true,
        is_featured: false
      })
    });
    if (!response.ok) return;
    const journey = (await response.json()) as Journey;
    setJourneys([...journeys, journey]);
    setSelectedId(journey.id);
    toast.success("Journey entry created");
  }

  async function updateJourney(id: string, patch: Partial<Journey>) {
    const response = await fetch("/api/journeys", { method: "PATCH", body: JSON.stringify({ id, ...patch }) });
    if (!response.ok) return;
    const updated = (await response.json()) as Journey;
    setJourneys(journeys.map((journey) => (journey.id === id ? updated : journey)));
    toast.success("Journey updated successfully");
  }

  async function deleteJourney(id: string) {
    const response = await fetch("/api/journeys", { method: "DELETE", body: JSON.stringify({ id }) });
    if (!response.ok) return;
    const next = journeys.filter((journey) => journey.id !== id);
    setJourneys(next);
    setSelectedId(next[0]?.id ?? "");
    toast.success("Journey deleted");
  }

  async function duplicateJourney(journey: Journey) {
    const response = await fetch("/api/journeys", {
      method: "POST",
      body: JSON.stringify({
        ...journey,
        title: `${journey.title} Copy`,
        slug: `${journey.slug}-copy-${Date.now()}`,
        display_order: journeys.length
      })
    });
    if (!response.ok) return;
    const copy = (await response.json()) as Journey;
    setJourneys([...journeys, copy]);
    setSelectedId(copy.id);
  }

  async function onDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIndex = journeys.findIndex((journey) => journey.id === event.active.id);
    const newIndex = journeys.findIndex((journey) => journey.id === event.over?.id);
    const next = arrayMove(journeys, oldIndex, newIndex);
    setJourneys(next);
    await fetch("/api/journeys", { method: "PATCH", body: JSON.stringify({ ids: next.map((journey) => journey.id) }) });
    toast.success("Reordered successfully");
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Entries" value={journeys.length.toString()} />
        <Stat label="Visible" value={visibleCount.toString()} />
        <Stat label="Categories" value={new Set(journeys.map((journey) => journey.category)).size.toString()} />
        <Stat label="Tags" value={allTags.length.toString()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="grid max-h-[760px] gap-4 overflow-auto rounded-lg border border-border bg-card p-4">
          <div className="grid gap-3">
            <Input placeholder="Search timeline" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <Button onClick={createJourney}><Plus className="h-4 w-4" />Create entry</Button>
          </div>
          <DndContext onDragEnd={onDragEnd}>
            <SortableContext items={journeys.map((journey) => journey.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-2">
                {filtered.map((journey) => <JourneyListItem key={journey.id} journey={journey} selected={journey.id === selectedId} onSelect={() => setSelectedId(journey.id)} />)}
              </div>
            </SortableContext>
          </DndContext>
        </aside>
        {selected ? (
          <JourneyEditor
            journey={selected}
            skills={skills}
            onUpdate={updateJourney}
            onDelete={deleteJourney}
            onDuplicate={duplicateJourney}
            onLocalUpdate={(journey) => setJourneys(journeys.map((item) => (item.id === journey.id ? journey : item)))}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">Create a journey entry to begin.</div>
        )}
      </div>
    </div>
  );
}

function JourneyListItem({ journey, selected, onSelect }: { journey: Journey; selected: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: journey.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`rounded-md border ${selected ? "border-primary bg-secondary" : "border-border bg-background"}`}>
      <div className="flex gap-2 p-3">
        <button className="text-muted-foreground" {...attributes} {...listeners} aria-label="Drag to reorder"><GripVertical className="h-4 w-4" /></button>
        <button className="min-w-0 flex-1 text-left" onClick={onSelect}>
          <p className="truncate text-sm font-medium">{journey.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{journey.category} · {journey.start_date}</p>
        </button>
      </div>
    </div>
  );
}

function JourneyEditor({ journey, skills, onUpdate, onDelete, onDuplicate, onLocalUpdate }: { journey: Journey; skills: Skill[]; onUpdate: (id: string, patch: Partial<Journey>) => void; onDelete: (id: string) => void; onDuplicate: (journey: Journey) => void; onLocalUpdate: (journey: Journey) => void }) {
  const [draft, setDraft] = useState(journey);
  const [tag, setTag] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [techStackStr, setTechStackStr] = useState(journey.tech_stack.join(", "));

  useEffect(() => {
    setDraft(journey);
    setTechStackStr(journey.tech_stack.join(", "));
  }, [journey]);

  function patch(value: Partial<Journey>) {
    setDraft({ ...draft, ...value });
  }

  async function save() {
    // Auto-create missing skills from tech_stack
    for (const tech of draft.tech_stack) {
      const exists = skills.some(s => s.name.toLowerCase() === tech.toLowerCase());
      if (!exists) {
        await fetch("/api/skills", {
          method: "POST",
          body: JSON.stringify({
             name: tech,
             slug: slugify(tech),
             level: 1,
             xp: 100,
             color_theme: "primary",
             node_x: 0,
             node_y: 0,
             is_visible: true
          })
        }).catch(() => {});
      }
    }

    await onUpdate(draft.id, {
      title: draft.title,
      slug: draft.slug,
      subtitle: draft.subtitle,
      description: draft.description,
      content_markdown: draft.content_markdown,
      start_date: draft.start_date,
      end_date: draft.end_date,
      category: draft.category,
      location: draft.location,
      tech_stack: draft.tech_stack,
      linked_skill_ids: draft.linked_skill_ids,
      linked_achievements: draft.linked_achievements,
      cover_image: draft.cover_image,
      video_links: draft.video_links,
      github_url: draft.github_url,
      demo_url: draft.demo_url,
      documents: draft.documents,
      is_visible: draft.is_visible,
      is_featured: draft.is_featured
    });
    
    toast.success("Journey entry saved");
  }

  async function upload(file: File, target: "cover" | "gallery" | "document") {
    const form = new FormData();
    form.set("file", file);
    const response = await fetch("/api/journey-upload", { method: "POST", body: form });
    if (!response.ok) return;
    const uploaded = await response.json() as { url: string; file_name: string; mime_type: string };
    if (target === "cover") patch({ cover_image: uploaded.url });
    if (target === "document") patch({ documents: [...draft.documents, { title: uploaded.file_name, url: uploaded.url, type: "pdf" }] });
    if (target === "gallery") await addMedia(uploaded.url, uploaded.mime_type.startsWith("video/") ? "video" : uploaded.mime_type === "application/pdf" ? "pdf" : "image");
  }

  async function addMedia(url = mediaUrl, type: JourneyMedia["type"] = "image") {
    if (!url) return;
    const response = await fetch("/api/journey-media", { method: "POST", body: JSON.stringify({ journey_id: draft.id, url, type, display_order: draft.journey_media?.length ?? 0 }) });
    if (!response.ok) return;
    const media = await response.json() as JourneyMedia;
    const updated = { ...draft, journey_media: [...(draft.journey_media ?? []), media] };
    setDraft(updated);
    onLocalUpdate(updated);
    setMediaUrl("");
  }

  async function deleteMedia(id: string) {
    const response = await fetch("/api/journey-media", { method: "DELETE", body: JSON.stringify({ id }) });
    if (!response.ok) return;
    const updated = { ...draft, journey_media: (draft.journey_media ?? []).filter((media) => media.id !== id) };
    setDraft(updated);
    onLocalUpdate(updated);
  }

  async function addTag() {
    if (!tag) return;
    const response = await fetch("/api/journey-tags", { method: "POST", body: JSON.stringify({ journey_id: draft.id, name: tag }) });
    if (!response.ok) return;
    const journeyTag = await response.json();
    const updated = { ...draft, journey_tags: [...(draft.journey_tags ?? []), journeyTag] };
    setDraft(updated);
    onLocalUpdate(updated);
    setTag("");
  }

  async function removeTag(id: string) {
    const response = await fetch("/api/journey-tags", { method: "DELETE", body: JSON.stringify({ id }) });
    if (!response.ok) return;
    const updated = { ...draft, journey_tags: (draft.journey_tags ?? []).filter((item) => item.id !== id) };
    setDraft(updated);
    onLocalUpdate(updated);
  }

  return (
    <section className="grid gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">Edit journey</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => patch({ is_visible: !draft.is_visible })}>{draft.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{draft.is_visible ? "Hide" : "Show"}</Button>
          <Button variant="outline" onClick={() => onDuplicate(draft)}><Copy className="h-4 w-4" />Duplicate</Button>
          <Button onClick={save}><Save className="h-4 w-4" />Save</Button>
          <Button variant="destructive" onClick={() => onDelete(draft.id)}><Trash2 className="h-4 w-4" />Delete</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Input value={draft.title} onChange={(event) => patch({ title: event.target.value, slug: slugify(event.target.value) })} />
        <Input value={draft.slug} onChange={(event) => patch({ slug: slugify(event.target.value) })} />
        <Input value={draft.subtitle ?? ""} placeholder="Subtitle" onChange={(event) => patch({ subtitle: event.target.value })} />
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={draft.category} onChange={(event) => patch({ category: event.target.value })}>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <Input type="date" value={draft.start_date} onChange={(event) => patch({ start_date: event.target.value })} />
        <Input type="date" value={draft.end_date ?? ""} onChange={(event) => patch({ end_date: event.target.value || null })} />
        <Input value={draft.location ?? ""} placeholder="Location" onChange={(event) => patch({ location: event.target.value })} />
        <Input value={techStackStr} placeholder="Tech stack, comma separated" onChange={(event) => setTechStackStr(event.target.value)} onBlur={() => patch({ tech_stack: splitList(techStackStr) })} />
        <Input value={draft.github_url ?? ""} placeholder="GitHub URL" onChange={(event) => patch({ github_url: event.target.value })} />
        <Input value={draft.demo_url ?? ""} placeholder="Demo URL" onChange={(event) => patch({ demo_url: event.target.value })} />
        <Textarea className="md:col-span-2" value={draft.description ?? ""} placeholder="Timeline summary" onChange={(event) => patch({ description: event.target.value })} />
      </div>

      <div className="grid gap-3">
        <p className="text-sm font-semibold">Rich content</p>
        <MarkdownEditor value={draft.content_markdown ?? ""} onChange={(value) => patch({ content_markdown: value })} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="Cover and uploads">
          <Input value={draft.cover_image ?? ""} placeholder="Cover image URL" onChange={(event) => patch({ cover_image: event.target.value })} />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary">
            <Upload className="h-4 w-4" />Upload cover<input className="hidden" type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], "cover")} />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary">
            <Upload className="h-4 w-4" />Attach document<input className="hidden" type="file" accept="application/pdf" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], "document")} />
          </label>
        </Panel>
        <Panel title="Tags and skills">
          <div className="flex gap-2"><Input value={tag} placeholder="Add tag" onChange={(event) => setTag(event.target.value)} /><Button size="icon" onClick={addTag} aria-label="Add tag"><Plus className="h-4 w-4" /></Button></div>
          <div className="flex flex-wrap gap-2">{draft.journey_tags?.map((item) => <button key={item.id} className="rounded-full bg-secondary px-3 py-1 text-xs" onClick={() => removeTag(item.id)}>{item.name}</button>)}</div>
          <select multiple className="min-h-28 rounded-md border border-input bg-background p-2 text-sm" value={draft.linked_skill_ids} onChange={(event) => patch({ linked_skill_ids: Array.from(event.target.selectedOptions).map((option) => option.value) })}>
            {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
          </select>
        </Panel>
      </div>

      <Panel title="Nested gallery">
        <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
          <Input value={mediaUrl} placeholder="Image, video, PDF, or embed URL" onChange={(event) => setMediaUrl(event.target.value)} />
          <Button variant="outline" onClick={() => addMedia(mediaUrl, "image")}>Add URL</Button>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary">
            <Upload className="h-4 w-4" />Upload<input className="hidden" type="file" accept="image/*,video/*,application/pdf" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], "gallery")} />
          </label>
        </div>
        <div className="grid gap-2 md:grid-cols-2">{draft.journey_media?.map((media) => <div key={media.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm"><span className="truncate">{media.url}</span><Button variant="destructive" size="icon" onClick={() => deleteMedia(media.id)} aria-label="Delete media"><Trash2 className="h-4 w-4" /></Button></div>)}</div>
      </Panel>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="grid gap-3 rounded-lg border border-border bg-background p-4"><p className="text-sm font-semibold">{title}</p>{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold text-primary">{value}</p></div>;
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
