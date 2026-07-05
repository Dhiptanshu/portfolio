import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats } from "@/lib/data";

export default async function AdminPage() {
  const stats = await getAdminStats();
  const cards = [
    ["Total sections", stats.totalSections],
    ["Total entries", stats.totalEntries],
    ["Uploaded media", stats.totalMedia],
    ["Visible sections", stats.visibleSections]
  ];
  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">Content health for the dynamic portfolio engine.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-semibold text-primary">{value}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
