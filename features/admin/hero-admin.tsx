"use client";

import { useEffect, useState } from "react";
import { Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_DATA = {
  class_name: "Full-Stack Class",
  title: "Dhiptanshu Malik",
  subtitle: "A motivated Computer Science student with hands-on experience in full-stack, mobile development, cloud technologies, and AI-driven solutions.",
  level: "Lv. 99",
  college_name: "",
  cgpa: "",
  avatar_url: "",
  resume_url: "",
  wip_mode: false,
  wip_message: "🚧 SYSTEM UNDER CONSTRUCTION 🚧 PROCEED WITH CAUTION 🚧",
  hidden_sections: [] as string[],
  stats: [
    { value: "Lv. 2", label: "Years Exp", icon: "Swords" },
    { value: "15+", label: "Projects", icon: "ScrollText" },
    { value: "2×", label: "Finalist", "icon": "Trophy" },
    { value: "150+", label: "Users", icon: "Users" }
  ],
  contact_options: [
    { title: "Send Mail (Email)", value: "dhiptanshu@outlook.com", url: "mailto:dhiptanshu@outlook.com", icon: "Mail" },
    { title: "Current Region", value: "Ahmedabad, India", url: "https://www.google.com/maps/place/Ahmedabad,+Gujarat,+India", icon: "MapPin" }
  ]
};

export function HeroAdmin() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/hero")
      .then((res) => res.json())
      .then((res) => {
        if (res?.content) {
          setData({ ...DEFAULT_DATA, ...res.content });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/hero", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    setSaving(false);
  }

  async function uploadAvatar(file: File) {
    const form = new FormData();
    form.set("file", file);
    const response = await fetch("/api/achievement-upload", { method: "POST", body: form });
    if (!response.ok) return;
    const uploaded = await response.json();
    setData({ ...data, avatar_url: uploaded.url });
  }

  async function uploadResume(file: File) {
    const form = new FormData();
    form.set("file", file);
    const response = await fetch("/api/journey-upload", { method: "POST", body: form });
    if (!response.ok) return;
    const uploaded = await response.json();
    setData({ ...data, resume_url: uploaded.url });
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif">Hero Section Profile</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> Save Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="grid gap-4 rounded-lg border border-border bg-card p-6">
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Character Name</label>
            <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold">Class Title</label>
            <Input value={data.class_name} onChange={(e) => setData({ ...data, class_name: e.target.value })} />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Level</label>
            <Input value={data.level} onChange={(e) => setData({ ...data, level: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold">College Name (Optional)</label>
              <Input value={data.college_name || ""} onChange={(e) => setData({ ...data, college_name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">CGPA / Grade (Optional)</label>
              <Input value={data.cgpa || ""} onChange={(e) => setData({ ...data, cgpa: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold">Bio / Description</label>
            <Textarea rows={4} value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} />
          </div>

          <div className="grid gap-4 mt-6 pt-6 border-t border-border">
            <h3 className="font-serif font-bold text-lg">Site Settings & WIP Mode</h3>
            
            <div className="flex items-center gap-3 bg-muted p-4 rounded-lg border border-border">
              <input 
                type="checkbox" 
                id="wip_mode"
                checked={data.wip_mode} 
                onChange={(e) => setData({ ...data, wip_mode: e.target.checked })} 
                className="w-5 h-5 accent-primary"
              />
              <div className="flex flex-col">
                <label htmlFor="wip_mode" className="font-bold cursor-pointer">Enable WIP Mode (Under Construction Banner)</label>
                <p className="text-xs text-muted-foreground">Shows a yellow/black zebra marquee at the very top of the site.</p>
              </div>
            </div>

            {data.wip_mode && (
              <div className="grid gap-2 pl-8">
                <label className="text-sm font-semibold text-muted-foreground">WIP Marquee Message</label>
                <Input value={data.wip_message} onChange={(e) => setData({ ...data, wip_message: e.target.value })} />
              </div>
            )}

            <div className="grid gap-2 mt-4">
              <label className="text-sm font-semibold">Hidden Sections</label>
              <p className="text-xs text-muted-foreground mb-2">Select sections to hide from the public website.</p>
              <div className="grid grid-cols-2 gap-3">
                {['experience', 'journey', 'projects', 'skills', 'achievements', 'contact'].map(section => (
                  <label key={section} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-2 rounded border border-transparent hover:border-border">
                    <input 
                      type="checkbox" 
                      checked={data.hidden_sections?.includes(section)} 
                      onChange={(e) => {
                        const hidden = data.hidden_sections || [];
                        setData({ 
                          ...data, 
                          hidden_sections: e.target.checked 
                            ? [...hidden, section] 
                            : hidden.filter((s: string) => s !== section) 
                        });
                      }} 
                      className="accent-primary"
                    />
                    <span className="capitalize">{section}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold">Resume PDF (Optional)</label>
            <div className="flex gap-2">
              <Input value={data.resume_url || ""} onChange={(e) => setData({ ...data, resume_url: e.target.value })} placeholder="Resume URL" />
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:opacity-90">
                <Upload className="h-4 w-4" />
                <input className="hidden" type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && uploadResume(e.target.files[0])} />
              </label>
            </div>
            {data.resume_url && (
              <a href={data.resume_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                View current resume
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-4 rounded-lg border border-border bg-card p-6 h-fit">
          <label className="text-sm font-semibold">Profile Avatar (Optional Override)</label>
          {data.avatar_url && (
            <img src={data.avatar_url} alt="Avatar" className="w-full aspect-square object-cover rounded border-2 border-border" />
          )}
          <p className="text-xs text-muted-foreground mb-2">If left blank, it will pull your GitHub profile picture automatically.</p>
          <div className="flex gap-2">
            <Input value={data.avatar_url} onChange={(e) => setData({ ...data, avatar_url: e.target.value })} placeholder="Image URL" />
            <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:opacity-90">
              <Upload className="h-4 w-4" />
              <input className="hidden" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
            </label>
          </div>
        </div>
      </div>
      
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-serif mb-4">Hero Stats Bar</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {data.stats.map((stat, i) => (
            <div key={i} className="grid gap-2 p-4 bg-background border border-border rounded">
              <Input placeholder="Value (e.g. Lv. 2)" value={stat.value} onChange={(e) => {
                const newStats = [...data.stats];
                newStats[i].value = e.target.value;
                setData({ ...data, stats: newStats });
              }} />
              <Input placeholder="Label (e.g. Years Exp)" value={stat.label} onChange={(e) => {
                const newStats = [...data.stats];
                newStats[i].label = e.target.value;
                setData({ ...data, stats: newStats });
              }} />
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={stat.icon} onChange={(e) => {
                const newStats = [...data.stats];
                newStats[i].icon = e.target.value;
                setData({ ...data, stats: newStats });
              }}>
                <option value="Swords">Swords</option>
                <option value="ScrollText">ScrollText</option>
                <option value="Trophy">Trophy</option>
                <option value="Users">Users</option>
                <option value="Star">Star</option>
                <option value="Code">Code</option>
                <option value="Zap">Zap</option>
                <option value="Database">Database</option>
                <option value="Cloud">Cloud</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif">Contact Options</h2>
          <Button variant="outline" size="sm" onClick={() => {
            setData({ ...data, contact_options: [...(data.contact_options || []), { title: "", value: "", url: "", icon: "Mail" }] });
          }}>Add Option</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(data.contact_options || []).map((opt, i) => (
            <div key={i} className="grid gap-2 p-4 bg-background border border-border rounded relative group">
              <button onClick={() => {
                const newOpts = [...data.contact_options];
                newOpts.splice(i, 1);
                setData({ ...data, contact_options: newOpts });
              }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                &times;
              </button>
              <Input placeholder="Title (e.g. Phone Number)" value={opt.title} onChange={(e) => {
                const newOpts = [...data.contact_options];
                newOpts[i].title = e.target.value;
                setData({ ...data, contact_options: newOpts });
              }} />
              <Input placeholder="Value (e.g. +91 99999 99999)" value={opt.value} onChange={(e) => {
                const newOpts = [...data.contact_options];
                newOpts[i].value = e.target.value;
                setData({ ...data, contact_options: newOpts });
              }} />
              <Input placeholder="URL (e.g. tel:+919999999999)" value={opt.url} onChange={(e) => {
                const newOpts = [...data.contact_options];
                newOpts[i].url = e.target.value;
                setData({ ...data, contact_options: newOpts });
              }} />
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={opt.icon} onChange={(e) => {
                const newOpts = [...data.contact_options];
                newOpts[i].icon = e.target.value;
                setData({ ...data, contact_options: newOpts });
              }}>
                <option value="Mail">Mail</option>
                <option value="Phone">Phone</option>
                <option value="MapPin">MapPin</option>
                <option value="Globe">Globe</option>
                <option value="Link">Link</option>
                <option value="MessageCircle">Message</option>
                <option value="Linkedin">LinkedIn</option>
                <option value="Github">GitHub</option>
                <option value="Twitter">Twitter</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
