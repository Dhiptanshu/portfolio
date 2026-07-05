import { SkillAdmin } from "@/features/admin/skill-admin";
import { getEntries, getSkillGraph } from "@/lib/data";

export default async function AdminSkillsPage() {
  const [graph, entries] = await Promise.all([getSkillGraph({ admin: true }), getEntries()]);

  return (
    <div>
      <h1 className="font-serif text-3xl">Skill tree</h1>
      <p className="mt-2 text-sm text-muted-foreground">Edit the technical graph, drag nodes, connect dependencies, and link skills to portfolio entries.</p>
      <div className="mt-8">
        <SkillAdmin initialGraph={graph} entries={entries} />
      </div>
    </div>
  );
}
