import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getJourneys, getJourneyFilters, getSkillGraph, getAchievements, getExperiences } from "@/lib/data";
import { HeroSection } from "@/features/sections/hero";
import { JourneySection } from "@/features/sections/journey";
import { ProjectsSection } from "@/features/sections/projects";
import { SkillsSection } from "@/features/sections/skills";
import { AchievementsSection } from "@/features/sections/achievements";
import { ContactSection } from "@/features/sections/contact";
import { SiteNav } from "@/features/sections/nav";
import { ScrollProgress } from "@/features/sections/scroll-progress";
import { ExperienceSection } from "@/features/sections/experience";

export const revalidate = 60;

export async function generateMetadata() {
  const supabase = await createSupabaseServerClient();
  let className = "Engineer & Builder";
  
  if (supabase) {
    const { data: heroBlock } = await supabase
      .from("blocks")
      .select("content")
      .eq("type", "hero")
      .single();
    if (heroBlock?.content?.class_name) {
      className = heroBlock.content.class_name;
    }
  }

  return {
    title: `Dhiptanshu Malik — ${className}`,
    openGraph: {
      title: `Dhiptanshu Malik — ${className}`,
    }
  };
}

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  
  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center flex-col gap-4">
        <h1 className="text-3xl font-bold text-red-500">Missing Database Connection</h1>
        <p>This deployment is missing the Supabase environment variables.</p>
        <p className="text-sm text-muted-foreground">Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel project settings.</p>
      </div>
    );
  }

  // Parallel data fetching
  const [
    journeys,
    experiences,
    filters,
    skillGraph,
    achievementData,
    { data: entries },
    { data: socials },
    { data: heroBlock },
  ] = await Promise.all([
    getJourneys(),
    getExperiences(),
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

  const heroData = heroBlock?.content || {};
  const hiddenSections = heroData.hidden_sections || [];
  const wipMode = heroData.wip_mode || false;
  const wipMessage = heroData.wip_message || "🚧 SYSTEM UNDER CONSTRUCTION 🚧 PROCEED WITH CAUTION 🚧";

  return (
    <>
      <div className="paper-grain" aria-hidden="true" />
      
      {wipMode && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-8 bg-[#ffcc00] border-b-4 border-black overflow-hidden flex items-center shadow-lg"
             style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #ffcc00 25%, #ffcc00 75%, #000 75%, #000)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px', opacity: 0.9 }}>
          <div className="bg-black/80 w-full h-full absolute inset-0 mix-blend-multiply" />
          <div className="animate-marquee whitespace-nowrap text-white font-black uppercase tracking-[0.3em] text-xs px-4 relative z-10 drop-shadow-md flex items-center">
             <span className="mx-4">{wipMessage}</span>
             <span className="mx-4">{wipMessage}</span>
             <span className="mx-4">{wipMessage}</span>
             <span className="mx-4">{wipMessage}</span>
          </div>
        </div>
      )}

      <ScrollProgress />
      <SiteNav resumeUrl={heroData.resume_url} hiddenSections={hiddenSections} />

      <main className="bg-background text-foreground">
        <HeroSection socials={socials || []} heroData={heroData} />

        {!hiddenSections.includes("experience") && (
          <ExperienceSection experiences={experiences as any[]} />
        )}

        <div className="golden-line" />
        
        {!hiddenSections.includes("journey") && (
          <JourneySection
            journeys={journeys}
            categories={filters?.categories || []}
            tags={filters?.tags || []}
          />
        )}

        <div className="golden-line" />
        
        {!hiddenSections.includes("projects") && (
          <ProjectsSection projects={projects as any[]} />
        )}

        <div className="golden-line" />
        
        {!hiddenSections.includes("skills") && (
          <SkillsSection graph={skillGraph} />
        )}

        <div className="golden-line" />
        
        {!hiddenSections.includes("achievements") && (
          <AchievementsSection data={achievementData} />
        )}

        <div className="golden-line" />
        
        {!hiddenSections.includes("contact") && (
          <ContactSection socials={socials || []} contactOptions={heroData.contact_options} />
        )}
      </main>
    </>
  );
}
