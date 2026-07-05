import { JourneyAdmin } from "@/features/admin/journey-admin";
import { getJourneys, getSkillGraph } from "@/lib/data";

export default async function AdminJourneyPage() {
  const [journeys, skillGraph] = await Promise.all([getJourneys({ admin: true }), getSkillGraph({ admin: true })]);

  return (
    <div>
      <h1 className="font-serif text-3xl">Journey engine</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage chronological experience entries, galleries, tags, skills, and rich story content.</p>
      <div className="mt-8">
        <JourneyAdmin initialJourneys={journeys} skills={skillGraph.skills} />
      </div>
    </div>
  );
}
