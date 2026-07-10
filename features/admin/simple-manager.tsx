"use client";

import { useState, useEffect, useRef } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";
import type { Entry, Section, SocialLink } from "@/lib/types";

type Item = Section | Entry | SocialLink;

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="rounded-lg border border-border bg-card p-4">
      <div className="flex gap-3">
        <button className="mt-2 text-muted-foreground" {...attributes} {...listeners} aria-label="Drag to reorder"><GripVertical className="h-4 w-4" /></button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function SectionManager({ initialItems }: { initialItems: Section[] }) {
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");

  async function create() {
    const body = { title, slug: slugify(title), type: "custom", display_order: items.length, is_visible: true };
    const response = await fetch("/api/sections", { method: "POST", body: JSON.stringify(body) });
    if (response.ok) {
      setItems([...items, await response.json()]);
      toast.success("Section created");
    }
    setTitle("");
  }

  return <CrudList items={items} setItems={setItems} endpoint="/api/sections" createControl={<><Input placeholder="New section title" value={title} onChange={(e) => setTitle(e.target.value)} /><Button onClick={create} disabled={!title}><Plus className="h-4 w-4" />Create</Button></>} />;
}

import { SocialIcon } from "@/components/social-icon";

export function SocialManager({ initialItems }: { initialItems: SocialLink[] }) {
  const [items, setItems] = useState(initialItems);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  async function create() {
    const response = await fetch("/api/socials", { method: "POST", body: JSON.stringify({ name, url, display_order: items.length, is_visible: true }) });
    if (response.ok) {
      setItems([...items, await response.json()]);
      toast.success("Social link created");
    }
    setName("");
    setUrl("");
  }

  return <CrudList 
    items={items} 
    setItems={setItems} 
    endpoint="/api/socials" 
    iconRenderer={(item) => "name" in item ? <div className="p-2 bg-secondary text-secondary-foreground rounded border border-border"><SocialIcon name={item.name} className="w-5 h-5" /></div> : null}
    createControl={<><Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /><Input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} /><Button onClick={create} disabled={!name || !url}><Plus className="h-4 w-4" />Create</Button></>} 
  />;
}

export function EntryManager({ sections, initialItems }: { sections: Section[]; initialItems: Entry[] }) {
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [sectionId, setSectionId] = useState(sections[0]?.id ?? "");
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  async function create() {
    const response = await fetch("/api/entries", { method: "POST", body: JSON.stringify({ title, section_id: sectionId, tags: [], gallery_images: [], display_order: items.length, is_visible: true }) });
    if (response.ok) {
      setItems([...items, await response.json()]);
      toast.success("Entry created");
    }
    setTitle("");
  }

  const timeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  function update(id: string, patch: Partial<Entry>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    
    if (timeoutRef.current[id]) clearTimeout(timeoutRef.current[id]);
    timeoutRef.current[id] = setTimeout(() => {
      fetch("/api/entries", { method: "PATCH", body: JSON.stringify({ id, ...patch }) });
    }, 500);
  }

  async function remove(id: string) {
    const response = await fetch("/api/entries", { method: "DELETE", body: JSON.stringify({ id }) });
    if (response.ok) {
      setItems(items.filter((item) => item.id !== id));
      toast.success("Entry deleted");
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIndex = items.findIndex((item) => item.id === event.active.id);
    const newIndex = items.findIndex((item) => item.id === event.over?.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    await fetch("/api/entries", { method: "PATCH", body: JSON.stringify({ ids: next.map((item) => item.id) }) });
    toast.success("Entries reordered");
  }

  return (
    <div className="mt-6 grid gap-4">
      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_1fr_auto]">
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          {sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
        </select>
        <Input placeholder="Entry title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button onClick={create} disabled={!title || !sectionId}><Plus className="h-4 w-4" />Create</Button>
      </div>

      {isMounted && (
        <DndContext onDragEnd={onDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-4">
              {items.map((item) => (
                <SortableRow key={item.id} id={item.id}>
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center gap-3 w-full">
                      <Input placeholder="Title" value={item.title} onChange={(e) => update(item.id, { title: e.target.value })} className="flex-1 font-bold" />
                      <Button variant={item.is_visible ? "secondary" : "outline"} onClick={() => update(item.id, { is_visible: !item.is_visible })}>{item.is_visible ? "Visible" : "Hidden"}</Button>
                      <Button variant="destructive" size="icon" onClick={() => remove(item.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <Textarea placeholder="Short description..." value={item.short_description || ""} onChange={(e) => update(item.id, { short_description: e.target.value })} className="min-h-[80px]" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input placeholder="Cover Image URL" value={item.cover_image || ""} onChange={(e) => update(item.id, { cover_image: e.target.value })} />
                      <Input placeholder="GitHub URL (Source)" value={item.github_url || ""} onChange={(e) => update(item.id, { github_url: e.target.value })} />
                      <Input placeholder="Demo URL (Live)" value={item.demo_url || ""} onChange={(e) => update(item.id, { demo_url: e.target.value })} />
                    </div>
                  </div>
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function CrudList<T extends Item>({ items, setItems, endpoint, createControl, iconRenderer }: { items: T[]; setItems: (items: T[]) => void; endpoint: string; createControl: React.ReactNode; iconRenderer?: (item: T) => React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  
  function primaryValue(item: T) {
    return "name" in item ? item.name : item.title;
  }

  function secondaryValue(item: T) {
    if ("url" in item) return item.url;
    if ("short_description" in item) return item.short_description ?? "";
    return item.description ?? "";
  }

  function primaryPatch(value: string) {
    return ({ title: value, name: value } as unknown) as Partial<T>;
  }

  function secondaryPatch(item: T, value: string) {
    if ("url" in item) return ({ url: value } as unknown) as Partial<T>;
    if ("short_description" in item) return ({ short_description: value } as unknown) as Partial<T>;
    return ({ description: value } as unknown) as Partial<T>;
  }

  async function onDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIndex = items.findIndex((item) => item.id === event.active.id);
    const newIndex = items.findIndex((item) => item.id === event.over?.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    await fetch(endpoint, { method: "PATCH", body: JSON.stringify({ ids: next.map((item) => item.id) }) });
    toast.success("Items reordered");
  }

  const timeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  function update(id: string, patch: Partial<T>) {
    setItems(items.map((item) => (item.id === id ? { ...item, ...(patch as T) } : item)));
    
    if (timeoutRef.current[id]) clearTimeout(timeoutRef.current[id]);
    timeoutRef.current[id] = setTimeout(() => {
      fetch(endpoint, { method: "PATCH", body: JSON.stringify({ id, ...patch }) });
    }, 500);
  }

  async function remove(id: string) {
    const response = await fetch(endpoint, { method: "DELETE", body: JSON.stringify({ id }) });
    if (response.ok) {
      setItems(items.filter((item) => item.id !== id));
      toast.success("Item deleted");
    }
  }

  return (
    <div className="mt-6 grid gap-4">
      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_1fr_auto]">{createControl}</div>
      {isMounted && (
        <DndContext onDragEnd={onDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3">
              {items.map((item) => (
                <SortableRow key={item.id} id={item.id}>
                  <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto_auto]">
                    <div className="flex gap-2 items-center">
                      {iconRenderer && iconRenderer(item)}
                      <Input value={primaryValue(item)} onChange={(e) => update(item.id, primaryPatch(e.target.value))} />
                    </div>
                    <Textarea value={secondaryValue(item)} onChange={(e) => update(item.id, secondaryPatch(item, e.target.value))} />
                    <Button variant={item.is_visible ? "secondary" : "outline"} onClick={() => update(item.id, { is_visible: !item.is_visible } as Partial<T>)}>{item.is_visible ? "Visible" : "Hidden"}</Button>
                    <Button variant="destructive" size="icon" onClick={() => remove(item.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
