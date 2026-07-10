"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Lock,
  Trophy,
  X,
  Star,
  Swords,
  ChevronRight
} from "lucide-react";
import type {
  Achievement,
  AchievementData,
  AchievementRarity,
} from "@/lib/types";

const rarities: AchievementRarity[] = [
  "Common",
  "Rare",
  "Epic",
  "Legendary",
  "Mythic",
];

// Map rarities to our RPG palette
const rarityAccent: Record<AchievementRarity, string> = {
  Common: "bg-muted text-muted-foreground",
  Rare: "bg-secondary text-secondary-foreground",
  Epic: "bg-primary text-primary-foreground",
  Legendary: "bg-accent text-accent-foreground",
  Mythic: "bg-[#966ec8] text-white",
};

export function AchievementsSection({ data }: { data: AchievementData }) {
  const [rarity, setRarity] = useState<"all" | AchievementRarity>("all");
  const [selected, setSelected] = useState<Achievement | null>(null);

  const filtered = useMemo(
    () =>
      data.achievements.filter(
        (a) => rarity === "all" || a.rarity === rarity
      ),
    [data.achievements, rarity]
  );

  const unlocked = data.achievements.filter((a) => Boolean(a.unlock_date));
  const totalXp = data.achievements.reduce((sum, a) => sum + a.xp_reward, 0);

  return (
    <section id="achievements" className="py-24 px-4 md:px-8 bg-background">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="p-3 bg-primary text-primary-foreground rounded border-2 border-border shadow-[4px_4px_0px_hsl(var(--border))]">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <p className="font-bold uppercase tracking-widest text-primary text-xs">Achievements</p>
            <h2 className="font-display text-3xl md:text-5xl text-foreground uppercase">
              Certificates & Awards
            </h2>
          </div>
        </motion.div>

        {/* Player Stats Bar */}
        <div className="rpg-panel p-4 md:p-6 mb-10 flex flex-col sm:flex-row gap-6 justify-around bg-card">
          <StatCard label="Unlocked" value={`${unlocked.length}/${data.achievements.length}`} />
          <div className="hidden sm:block w-0.5 bg-border/20" />
          <StatCard label="Total EXP" value={totalXp.toLocaleString()} />
          <div className="hidden sm:block w-0.5 bg-border/20" />
          <StatCard
            label="Special Awards"
            value={data.achievements
              .filter((a) => a.rarity === "Mythic")
              .length.toString()}
          />
        </div>

        {/* Filter Menu */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setRarity("all")}
            className={`rpg-panel px-4 py-2 text-[10px] uppercase font-bold tracking-wider transition-colors ${
              rarity === "all"
                ? "bg-foreground text-background border-border"
                : "bg-card text-muted-foreground hover:bg-background"
            }`}
            style={{ boxShadow: rarity === 'all' ? '2px 2px 0px hsl(var(--border))' : 'none', transform: rarity === 'all' ? 'translate(-2px, -2px)' : 'none' }}
          >
            All Achievements
          </button>
          {rarities.map((r) => (
            <button
              key={r}
              onClick={() => setRarity(r)}
              className={`rpg-panel px-4 py-2 text-[10px] uppercase font-bold tracking-wider transition-colors ${
                rarity === r
                  ? `${rarityAccent[r]} border-border`
                  : "bg-card text-muted-foreground hover:bg-background"
              }`}
              style={{ boxShadow: rarity === r ? '2px 2px 0px hsl(var(--border))' : 'none', transform: rarity === r ? 'translate(-2px, -2px)' : 'none' }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((achievement, index) => (
            <motion.button
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.25) }}
              onClick={() => setSelected(achievement)}
              className="rpg-panel flex items-stretch text-left hover:translate-x-2 transition-transform bg-card overflow-hidden group"
            >
              <div className={`w-20 sm:w-24 shrink-0 flex items-center justify-center border-r-2 border-border ${achievement.is_secret ? 'bg-muted' : (achievement.unlock_date ? rarityAccent[achievement.rarity].split(' ')[0] : 'bg-muted')}`}>
                <div className={`p-2 rounded-full border-2 border-border bg-background shadow-inner w-14 h-14 flex items-center justify-center overflow-hidden ${achievement.is_secret || !achievement.unlock_date ? 'opacity-50' : 'text-foreground'}`}>
                  {achievement.icon ? (
                    <img src={achievement.icon} alt="Achievement Icon" className="w-full h-full object-cover" />
                  ) : achievement.is_secret ? (
                    <Lock className="w-8 h-8" />
                  ) : (
                    <Trophy className="w-8 h-8" />
                  )}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-black text-lg ${achievement.unlock_date ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {achievement.is_secret ? "???" : achievement.title}
                  </h3>
                  {achievement.unlock_date && (
                    <span className="text-[9px] font-bold uppercase text-primary border-2 border-primary/30 px-1.5 py-0.5 rounded bg-primary/10">
                      Unlocked
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-muted-foreground line-clamp-2">
                  {achievement.is_secret ? "Unlock condition unknown." : achievement.description}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border-2 border-border ${rarityAccent[achievement.rarity]}`}>
                    {achievement.rarity}
                  </span>
                  <span className="text-[10px] font-bold text-foreground">
                    +{achievement.xp_reward} EXP
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <AchievementModal
            achievement={selected}
            data={data}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function AchievementModal({
  achievement,
  data,
  onClose,
}: {
  achievement: Achievement;
  data: AchievementData;
  onClose: () => void;
}) {
  const projects = data.projectLinks.filter(
    (l) => l.achievement_id === achievement.id
  );
  
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-auto bg-foreground/60 p-4 backdrop-blur-sm flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg rpg-panel bg-card overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-6 border-b-4 border-border flex items-center gap-6 ${achievement.unlock_date ? rarityAccent[achievement.rarity].split(' ')[0] : 'bg-muted'}`}>
          <div className="w-20 h-20 p-2 rounded-full border-4 border-border bg-background shadow-inner flex items-center justify-center overflow-hidden shrink-0">
            {achievement.icon ? (
              <img src={achievement.icon} alt="Badge Icon" className="w-full h-full object-cover" />
            ) : achievement.is_secret ? (
              <Lock className="w-10 h-10 text-muted-foreground" />
            ) : (
              <Trophy className="w-10 h-10 text-foreground" />
            )}
          </div>
          <div>
            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase border-2 border-border mb-2 ${rarityAccent[achievement.rarity]} bg-background`}>
              {achievement.rarity} Achievement
            </span>
            <h2 className="font-black text-2xl md:text-3xl text-foreground stroke-background drop-shadow-md">
              {achievement.is_secret ? "Secret Achievement" : achievement.title}
            </h2>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="bg-muted p-4 rounded border-2 border-border/50 mb-6 shadow-inner text-sm font-medium text-foreground">
            {achievement.is_secret ? "This achievement exists, but its true condition is hidden." : achievement.description}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border-2 border-border rounded p-3 bg-background flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">EXP Gain</span>
              <span className="font-black text-xl text-primary">+{achievement.xp_reward}</span>
            </div>
            <div className="border-2 border-border rounded p-3 bg-background flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Status</span>
              <span className="font-black text-sm text-foreground flex items-center gap-1">
                {achievement.unlock_date ? <CalendarDays className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                {achievement.unlock_date ? achievement.unlock_date : "Locked"}
              </span>
            </div>
          </div>

          {projects.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Swords className="w-4 h-4" /> Related Projects
              </h4>
              <div className="space-y-2">
                {projects.map((p) => {
                  const href = p.entries?.demo_url ?? p.entries?.github_url;
                  return href ? (
                    <a
                      key={p.id}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="rpg-panel flex items-center justify-between p-3 bg-background hover:bg-muted text-sm font-bold transition-colors"
                    >
                      <span>{p.entries?.title ?? "Project"}</span>
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </a>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="mt-8 w-full rpg-panel rpg-panel-interactive bg-primary text-primary-foreground py-3 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" /> Close Menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">
        {label}
      </p>
      <p className="font-black text-3xl text-foreground drop-shadow-sm">{value}</p>
    </div>
  );
}
