import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Achievement, AchievementCategory, AchievementData, AchievementProjectLink, AchievementSkillLink, Entry, Journey, JourneyMedia, JourneyTag, MediaAsset, Section, SectionWithEntries, Skill, SkillCategory, SkillGraphData, SkillProjectLink, SkillRelationship, SocialLink } from "@/lib/types";

export async function getPublicPortfolio() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { sections: [] as SectionWithEntries[], socials: [] as SocialLink[] };

  const [{ data: sections }, { data: socials }] = await Promise.all([
    supabase.from("sections").select("*, entries(*)").eq("is_visible", true).eq("entries.is_visible", true).order("display_order").order("display_order", { referencedTable: "entries" }),
    supabase.from("social_links").select("*").eq("is_visible", true).order("display_order")
  ]);

  return { sections: (sections ?? []) as SectionWithEntries[], socials: (socials ?? []) as SocialLink[] };
}

export async function getAdminStats() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { totalSections: 0, totalEntries: 0, totalMedia: 0, visibleSections: 0 };
  const [sections, entries, media, visible] = await Promise.all([
    supabase.from("sections").select("id", { count: "exact", head: true }),
    supabase.from("entries").select("id", { count: "exact", head: true }),
    supabase.from("media_assets").select("id", { count: "exact", head: true }),
    supabase.from("sections").select("id", { count: "exact", head: true }).eq("is_visible", true)
  ]);
  return {
    totalSections: sections.count ?? 0,
    totalEntries: entries.count ?? 0,
    totalMedia: media.count ?? 0,
    visibleSections: visible.count ?? 0
  };
}

export async function getSections() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [] as Section[];
  const { data } = await supabase.from("sections").select("*").order("display_order");
  return (data ?? []) as Section[];
}

export async function getEntries(sectionId?: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [] as Entry[];
  let query = supabase.from("entries").select("*").order("display_order");
  if (sectionId) query = query.eq("section_id", sectionId);
  const { data } = await query;
  return (data ?? []) as Entry[];
}

export async function getSocials() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [] as SocialLink[];
  const { data } = await supabase.from("social_links").select("*").order("display_order");
  return (data ?? []) as SocialLink[];
}

export async function getMediaAssets() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [] as MediaAsset[];
  const { data } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });
  return (data ?? []) as MediaAsset[];
}

export async function getSkillGraph({ admin = false }: { admin?: boolean } = {}): Promise<SkillGraphData> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { skills: [], relationships: [], categories: [], projectLinks: [] };

  let skillQuery = supabase.from("skills").select("*, skill_categories(id, name, icon)").order("xp", { ascending: false });
  if (!admin) skillQuery = skillQuery.eq("is_visible", true);

  const [{ data: skills }, { data: categories }, { data: relationships }, { data: projectLinks }] = await Promise.all([
    skillQuery,
    supabase.from("skill_categories").select("*").order("display_order"),
    supabase.from("skill_relationships").select("*"),
    supabase.from("skill_project_links").select("*, entries(id, title, short_description, demo_url, github_url)")
  ]);

  const visibleSkillIds = new Set((skills ?? []).map((skill) => skill.id));
  const filteredRelationships = admin
    ? relationships ?? []
    : (relationships ?? []).filter((relationship) => visibleSkillIds.has(relationship.parent_skill_id) && visibleSkillIds.has(relationship.child_skill_id));

  return {
    skills: (skills ?? []) as Skill[],
    categories: (categories ?? []) as SkillCategory[],
    relationships: filteredRelationships as SkillRelationship[],
    projectLinks: (projectLinks ?? []).filter((link) => admin || visibleSkillIds.has(link.skill_id)) as SkillProjectLink[]
  };
}

export async function getJourneys({ admin = false }: { admin?: boolean } = {}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [] as Journey[];

  let query = supabase
    .from("journeys")
    .select("*, journey_media(*), journey_tags(*)")
    .order("display_order")
    .order("display_order", { referencedTable: "journey_media" });

  if (!admin) query = query.eq("is_visible", true);
  const { data } = await query;
  return (data ?? []) as Journey[];
}

export async function getJourneyFilters() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { categories: [] as string[], tags: [] as string[] };

  const [{ data: journeys }, { data: tags }] = await Promise.all([
    supabase.from("journeys").select("category").eq("is_visible", true),
    supabase.from("journey_tags").select("name")
  ]);

  return {
    categories: Array.from(new Set((journeys ?? []).map((journey) => journey.category))).sort(),
    tags: Array.from(new Set(((tags ?? []) as JourneyTag[]).map((tag) => tag.name))).sort()
  };
}

export async function getJourneyMedia(journeyId?: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [] as JourneyMedia[];
  let query = supabase.from("journey_media").select("*").order("display_order");
  if (journeyId) query = query.eq("journey_id", journeyId);
  const { data } = await query;
  return (data ?? []) as JourneyMedia[];
}

export async function getAchievements({ admin = false }: { admin?: boolean } = {}): Promise<AchievementData> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { achievements: [], categories: [], projectLinks: [], skillLinks: [] };

  let achievementQuery = supabase
    .from("achievements")
    .select("*, achievement_categories(id, name, icon, color)")
    .order("display_order");

  if (!admin) achievementQuery = achievementQuery.eq("is_visible", true);

  const [{ data: achievements }, { data: categories }, { data: projectLinks }, { data: skillLinks }] = await Promise.all([
    achievementQuery,
    supabase.from("achievement_categories").select("*").order("display_order"),
    supabase.from("achievement_project_links").select("*, entries(id, title, short_description, demo_url, github_url)"),
    supabase.from("achievement_skill_links").select("*, skills(id, name, slug, level, xp, color_theme)")
  ]);

  const visibleAchievementIds = new Set((achievements ?? []).map((achievement) => achievement.id));

  return {
    achievements: (achievements ?? []) as Achievement[],
    categories: (categories ?? []) as AchievementCategory[],
    projectLinks: (projectLinks ?? []).filter((link) => admin || visibleAchievementIds.has(link.achievement_id)) as AchievementProjectLink[],
    skillLinks: (skillLinks ?? []).filter((link) => admin || visibleAchievementIds.has(link.achievement_id)) as AchievementSkillLink[]
  };
}
