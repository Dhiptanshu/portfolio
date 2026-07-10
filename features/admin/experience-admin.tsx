"use client";

import { useState } from "react";
import { Briefcase, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Experience } from "@/lib/types";

export function ExperienceAdmin({ initialExperiences }: { initialExperiences: Experience[] }) {
  const [experiences, setExperiences] = useState(initialExperiences);
  const [selectedId, setSelectedId] = useState(initialExperiences[0]?.id ?? "");
  const [jsonInput, setJsonInput] = useState("");

  const selected = experiences.find((exp) => exp.id === selectedId) ?? null;

  async function createExperience() {
    const response = await fetch("/api/experiences", {
      method: "POST",
      body: JSON.stringify({
        company: "New Company",
        role: "Role",
        employment_type: "Full-time",
        start_date: new Date().toISOString().slice(0, 10),
        display_order: experiences.length,
        is_visible: true,
      }),
    });
    if (!response.ok) return;
    const exp = (await response.json()) as Experience;
    setExperiences([...experiences, exp]);
    setSelectedId(exp.id);
    setJsonInput("[]");
    toast.success("Experience created");
  }

  async function updateExperience(updates: Partial<Experience>) {
    if (!selected) return;
    const updated = { ...selected, ...updates };
    setExperiences(experiences.map((exp) => (exp.id === selected.id ? updated : exp)));
    
    // Optimistic UI, silent save
    fetch("/api/experiences", {
      method: "PUT",
      body: JSON.stringify(updated),
    });
  }

  async function deleteExperience() {
    if (!selected || !confirm("Are you sure you want to delete this experience?")) return;
    const response = await fetch(`/api/experiences?id=${selected.id}`, { method: "DELETE" });
    if (!response.ok) return;
    setExperiences(experiences.filter((exp) => exp.id !== selected.id));
    setSelectedId(experiences[0]?.id ?? "");
    toast.success("Experience deleted");
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Experiences
          </h2>
          <Button onClick={createExperience} size="sm" variant="default" className="shadow-[2px_2px_0px_hsl(var(--primary-foreground))]">
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto bg-card rounded-md border-2 border-border shadow-[4px_4px_0px_hsl(var(--border))]">
          {experiences.sort((a,b) => a.display_order - b.display_order).map((exp) => (
            <button
              key={exp.id}
              onClick={() => {
                setSelectedId(exp.id);
                setJsonInput(JSON.stringify(exp.media_gallery || [], null, 2));
              }}
              className={`w-full text-left p-3 border-b border-border transition-colors hover:bg-muted ${
                selectedId === exp.id ? "bg-muted border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="font-bold text-sm truncate">{exp.role}</div>
              <div className="text-xs text-muted-foreground truncate">{exp.company}</div>
            </button>
          ))}
          {experiences.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">No experiences yet</div>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-y-auto h-full bg-card rounded-md border-2 border-border shadow-[4px_4px_0px_hsl(var(--border))]">
        {selected ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-lg font-bold">Edit Experience</h3>
              <Button onClick={deleteExperience} variant="destructive" size="sm" className="shadow-[2px_2px_0px_hsl(var(--destructive-foreground))]">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Role</label>
                  <Input value={selected.role} onChange={(e) => updateExperience({ role: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Company</label>
                  <Input value={selected.company} onChange={(e) => updateExperience({ company: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Employment Type</label>
                  <Input value={selected.employment_type} onChange={(e) => updateExperience({ employment_type: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Location</label>
                  <Input value={selected.location || ""} onChange={(e) => updateExperience({ location: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Start Date</label>
                  <Input type="date" value={selected.start_date || ""} onChange={(e) => updateExperience({ start_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">End Date (Leave blank if Present)</label>
                  <Input type="date" value={selected.end_date || ""} onChange={(e) => updateExperience({ end_date: e.target.value || null })} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Logo URL</label>
                <Input value={selected.logo_url || ""} onChange={(e) => updateExperience({ logo_url: e.target.value })} placeholder="https://example.com/logo.png" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Description</label>
                <Textarea value={selected.description || ""} onChange={(e) => updateExperience({ description: e.target.value })} className="min-h-[100px]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Display Order</label>
                  <Input type="number" value={selected.display_order} onChange={(e) => updateExperience({ display_order: parseInt(e.target.value) })} />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="is_visible"
                    checked={selected.is_visible}
                    onChange={(e) => updateExperience({ is_visible: e.target.checked })}
                    className="w-4 h-4 text-primary bg-background border-2 border-border rounded"
                  />
                  <label htmlFor="is_visible" className="text-sm font-bold text-foreground">Visible on Website</label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Tech Stack (comma separated)</label>
                <Input 
                  value={selected.tech_stack?.join(', ') || ""} 
                  onChange={(e) => updateExperience({ tech_stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                  placeholder="React, TypeScript, Node.js" 
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Media Gallery (JSON Array)</label>
                <Textarea 
                  value={jsonInput || JSON.stringify(selected.media_gallery || [], null, 2)} 
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    try {
                      const parsed = JSON.parse(e.target.value);
                      if (Array.isArray(parsed)) {
                        updateExperience({ media_gallery: parsed });
                      }
                    } catch (err) {
                      // Let them type invalid JSON until they fix it, 
                      // but we don't update state if it's invalid.
                      // Note: A better UX would use a dedicated JSON editor or form array.
                    }
                  }} 
                  className="min-h-[150px] font-mono text-xs" 
                  placeholder='[{ "url": "https://...", "type": "image", "title": "Demo" }]'
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Format: [{`{"url": "...", "type": "image|video", "title": "Optional"}`}]
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground font-medium">
            Select or create an experience to start editing
          </div>
        )}
      </div>
    </div>
  );
}
