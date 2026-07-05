import { EntryManager } from "@/features/admin/simple-manager";
import { getEntries, getSections } from "@/lib/data";

export default async function ContentPage() {
  const [sections, entries] = await Promise.all([getSections(), getEntries()]);
  return (
    <div>
      <h1 className="font-serif text-3xl">Content</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage entries inside portfolio sections with persisted display order.</p>
      <EntryManager sections={sections} initialItems={entries} />
    </div>
  );
}
