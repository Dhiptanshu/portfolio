import { EmptyState } from "@/components/empty-state";
import { SectionManager } from "@/features/admin/simple-manager";
import { getSections } from "@/lib/data";

export default async function SectionsPage() {
  const sections = await getSections();
  return (
    <div>
      <h1 className="font-serif text-3xl">Sections</h1>
      <p className="mt-2 text-sm text-muted-foreground">Create, edit, hide, delete, and reorder homepage sections.</p>
      {sections.length === 0 ? <EmptyState title="No sections" description="Create the first section to begin shaping the homepage." /> : null}
      <SectionManager initialItems={sections} />
    </div>
  );
}
