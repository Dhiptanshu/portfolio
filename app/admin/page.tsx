import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const [journeys, entries, skills, achievements, media, socials] =
    await Promise.all([
      supabase.from("journeys").select("id", { count: "exact", head: true }),
      supabase.from("entries").select("id", { count: "exact", head: true }),
      supabase.from("skills").select("id", { count: "exact", head: true }),
      supabase
        .from("achievements")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("media_assets")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("social_links")
        .select("id", { count: "exact", head: true }),
    ]);

  const cards = [
    { label: "Journey Entries", value: journeys.count ?? 0 },
    { label: "Projects", value: entries.count ?? 0 },
    { label: "Skills", value: skills.count ?? 0 },
    { label: "Achievements", value: achievements.count ?? 0 },
    { label: "Media Files", value: media.count ?? 0 },
    { label: "Social Links", value: socials.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Content overview for your portfolio.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-sm border border-border bg-card p-5"
          >
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2 font-serif text-3xl text-primary">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
