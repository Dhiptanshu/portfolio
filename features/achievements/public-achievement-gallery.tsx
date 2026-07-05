"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Gem, Lock, Sparkles, Star, Trophy, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Achievement, AchievementData, AchievementRarity } from "@/lib/types";

const rarities: AchievementRarity[] = ["Common", "Rare", "Epic", "Legendary", "Mythic"];
const rarityGlow: Record<AchievementRarity, string> = {
  Common: "rgba(222, 200, 156, 0.18)",
  Rare: "rgba(97, 201, 168, 0.24)",
  Epic: "rgba(122, 167, 255, 0.25)",
  Legendary: "rgba(217, 184, 108, 0.34)",
  Mythic: "rgba(183, 140, 255, 0.38)"
};

export function PublicAchievementGallery({ data }: { data: AchievementData }) {
  const [rarity, setRarity] = useState<"all" | AchievementRarity>("all");
  const [selected, setSelected] = useState<Achievement | null>(null);
  const filtered = useMemo(() => data.achievements.filter((achievement) => rarity === "all" || achievement.rarity === rarity), [data.achievements, rarity]);
  const unlocked = data.achievements.filter((achievement) => Boolean(achievement.unlock_date));
  const totalXp = data.achievements.reduce((sum, achievement) => sum + achievement.xp_reward, 0);

  return (
    <main className="min-h-screen bg-background">
      <section className="luxury-grid border-b border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs uppercase tracking-[0.24em] text-primary">Achievement Codex</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight md:text-7xl">Unlocks earned across the operating system.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">A dynamic RPG-style gallery for milestones, proof, rare wins, and hidden progress.</p>
          </motion.div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <Stat label="Unlocked" value={`${unlocked.length}/${data.achievements.length}`} />
            <Stat label="Total XP" value={totalXp.toLocaleString()} />
            <Stat label="Mythic" value={data.achievements.filter((achievement) => achievement.rarity === "Mythic").length.toString()} />
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Button variant={rarity === "all" ? "default" : "outline"} onClick={() => setRarity("all")}>All</Button>
            {rarities.map((item) => <Button key={item} variant={rarity === item ? "default" : "outline"} onClick={() => setRarity(item)}>{item}</Button>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((achievement, index) => (
            <motion.button
              key={achievement.id}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.22) }}
              onClick={() => setSelected(achievement)}
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 text-left transition duration-300 hover:-translate-y-1"
              style={{ boxShadow: `0 0 42px ${rarityGlow[achievement.rarity]}` }}
            >
              {achievement.cover_image ? <div className="absolute inset-x-0 top-0 h-32 bg-cover bg-center opacity-35" style={{ backgroundImage: `url(${achievement.cover_image})` }} /> : null}
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-background" style={{ color: achievement.color }}>
                    {achievement.is_secret ? <Lock className="h-6 w-6" /> : <Trophy className="h-6 w-6" />}
                  </div>
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs" style={{ color: achievement.color }}>{achievement.rarity}</span>
                </div>
                <h2 className="mt-6 font-serif text-2xl group-hover:text-primary">{achievement.is_secret ? "Secret Achievement" : achievement.title}</h2>
                <p className="mt-3 min-h-14 text-sm leading-6 text-muted-foreground">{achievement.is_secret ? "Details hidden until the right milestone is unlocked." : achievement.description}</p>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-primary"><Zap className="h-4 w-4" />{achievement.xp_reward.toLocaleString()} XP</span>
                  <span className="text-muted-foreground">{achievement.unlock_date ? "Unlocked" : "Locked"}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="font-serif text-3xl">Unlock timeline</h2>
          <div className="mt-6 grid gap-3">
            {unlocked.toSorted((a, b) => (b.unlock_date ?? "").localeCompare(a.unlock_date ?? "")).map((achievement) => (
              <div key={achievement.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
                <div>
                  <p className="font-medium">{achievement.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{achievement.rarity} · {achievement.xp_reward.toLocaleString()} XP</p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm text-primary"><CalendarDays className="h-4 w-4" />{achievement.unlock_date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selected ? <AchievementModal achievement={selected} data={data} onClose={() => setSelected(null)} /> : null}
      </AnimatePresence>
    </main>
  );
}

function AchievementModal({ achievement, data, onClose }: { achievement: Achievement; data: AchievementData; onClose: () => void }) {
  const projects = data.projectLinks.filter((link) => link.achievement_id === achievement.id);
  const skills = data.skillLinks.filter((link) => link.achievement_id === achievement.id);

  return (
    <motion.div className="fixed inset-0 z-50 overflow-auto bg-background/82 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="mx-auto my-8 max-w-3xl overflow-hidden rounded-lg border border-border bg-card shadow-2xl" initial={{ opacity: 0, y: 28, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }}>
        {achievement.cover_image ? <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${achievement.cover_image})` }} /> : null}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: achievement.color }}>{achievement.rarity}</p>
              <h2 className="mt-2 font-serif text-4xl">{achievement.is_secret ? "Secret Achievement" : achievement.title}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></Button>
          </div>
          <p className="mt-5 leading-7 text-muted-foreground">{achievement.is_secret ? "This achievement exists, but its true condition is hidden." : achievement.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric icon={<Zap className="h-4 w-4" />} label="XP Reward" value={achievement.xp_reward.toLocaleString()} />
            <Metric icon={<Star className="h-4 w-4" />} label="Rarity" value={achievement.rarity} />
            <Metric icon={<Gem className="h-4 w-4" />} label="Unlocked" value={achievement.unlock_date ?? "Locked"} />
          </div>
          <Linked title="Linked Projects" items={projects.map((project) => ({ label: project.entries?.title ?? "Project", href: project.entries?.demo_url ?? project.entries?.github_url }))} />
          <Linked title="Linked Skills" items={skills.map((skill) => ({ label: `${skill.skills?.name ?? "Skill"} · Lv ${skill.skills?.level ?? 0}` }))} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border bg-card/80 p-4 backdrop-blur"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold text-primary">{value}</p></div>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-lg border border-border bg-background p-3"><p className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</p><p className="mt-2 font-semibold text-primary">{value}</p></div>;
}

function Linked({ title, items }: { title: string; items: { label: string; href?: string | null }[] }) {
  return (
    <div className="mt-7">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.length ? items.map((item) => item.href ? <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:bg-secondary"><span>{item.label}</span><ArrowUpRight className="h-4 w-4 text-primary" /></a> : <div key={item.label} className="rounded-md border border-border p-3 text-sm">{item.label}</div>) : <p className="text-sm text-muted-foreground">None linked yet.</p>}
      </div>
    </div>
  );
}
