import { AchievementAdmin } from "@/features/admin/achievement-admin";
import { getAchievements, getEntries, getSkillGraph } from "@/lib/data";

export default async function AdminAchievementsPage() {
  const [achievementData, entries, skillGraph] = await Promise.all([
    getAchievements({ admin: true }),
    getEntries(),
    getSkillGraph({ admin: true })
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl">Achievement system</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage RPG-style unlocks, rarities, XP rewards, linked projects, linked skills, and reveal rules.</p>
      <div className="mt-8">
        <AchievementAdmin initialData={achievementData} entries={entries} skills={skillGraph.skills} />
      </div>
    </div>
  );
}
