import { EmptyState } from "@/components/empty-state";
import { PublicAchievementGallery } from "@/features/achievements/public-achievement-gallery";
import { getAchievements } from "@/lib/data";

export default async function AchievementsPage() {
  const data = await getAchievements();

  if (data.achievements.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <EmptyState title="No achievements yet" description="Publish achievements from the admin dashboard to activate the codex." />
      </main>
    );
  }

  return <PublicAchievementGallery data={data} />;
}
