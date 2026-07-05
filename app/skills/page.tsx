import { EmptyState } from "@/components/empty-state";
import { PublicSkillTree } from "@/features/skills/public-skill-tree";
import { getSkillGraph } from "@/lib/data";

export default async function SkillsPage() {
  const graph = await getSkillGraph();

  if (graph.skills.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <EmptyState title="No visible skills yet" description="Publish skills from the admin dashboard to activate the skill tree." />
      </main>
    );
  }

  return <PublicSkillTree graph={graph} />;
}
