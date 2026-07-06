import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getJourneys, getJourneyFilters, getSkillGraph, getAchievements } from "@/lib/data";
import { HeroSection } from "@/features/sections/hero";
import { JourneySection } from "@/features/sections/journey";
import { ProjectsSection } from "@/features/sections/projects";
import { SkillsSection } from "@/features/sections/skills";
import { AchievementsSection } from "@/features/sections/achievements";
import { ContactSection } from "@/features/sections/contact";
import { SiteNav } from "@/features/sections/nav";
import { ScrollProgress } from "@/features/sections/scroll-progress";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  // Parallel data fetching
  const [
    journeys,
    filters,
    skillGraph,
    achievementData,
    { data: entries },
    { data: socials },
    { data: heroBlock },
  ] = await Promise.all([
    getJourneys(),
    getJourneyFilters(),
    getSkillGraph(),
    getAchievements(),
    supabase
      .from("entries")
      .select("*, sections(*)")
      .eq("is_visible", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("social_links")
      .select("*")
      .eq("is_visible", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("blocks")
      .select("content")
      .eq("type", "hero")
      .single(),
  ]);

  const projects =
    entries?.filter((entry: any) => entry.sections?.slug === "projects") || [];

  return (
    <>
      <div className="paper-grain" aria-hidden="true" />
      <ScrollProgress />
      <SiteNav />

      <main className="bg-background text-foreground">
        <HeroSection socials={socials || []} heroData={heroBlock?.content} />

        <div className="golden-line" />
        <JourneySection
          journeys={journeys}
          categories={filters.categories}
          tags={filters.tags}
        />

        <div className="golden-line" />
        <ProjectsSection projects={projects} />

        <div className="golden-line" />
        <SkillsSection graph={skillGraph} />

        <div className="golden-line" />
        <AchievementsSection data={achievementData} />

        <div className="golden-line" />
        <ContactSection socials={socials || []} />
      </main>
    </>
  );
}
