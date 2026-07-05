export type SectionType = "projects" | "hackathons" | "internships" | "extracurriculars" | "grades" | "about" | "custom";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "admin";
  created_at: string;
  updated_at: string;
};

export type Section = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: SectionType;
  display_order: number;
  is_visible: boolean;
  icon: string | null;
  created_at: string;
  updated_at: string;
};

export type Entry = {
  id: string;
  section_id: string;
  title: string;
  short_description: string | null;
  long_description: string | null;
  cover_image: string | null;
  gallery_images: string[];
  video_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  start_date: string | null;
  end_date: string | null;
  tags: string[];
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type SocialLink = {
  id: string;
  name: string;
  logo: string | null;
  url: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type MediaAsset = {
  id: string;
  file_name: string;
  file_path: string;
  public_url: string;
  mime_type: string;
  size_bytes: number;
  bucket: string;
  created_at: string;
  updated_at: string;
};

export type EntryWithSection = Entry & { sections?: Pick<Section, "title" | "slug"> | null };
export type SectionWithEntries = Section & { entries: Entry[] };

export type SkillCategory = {
  id: string;
  name: string;
  icon: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Skill = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  level: number;
  xp: number;
  color_theme: string;
  node_x: number;
  node_y: number;
  category_id: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  skill_categories?: Pick<SkillCategory, "id" | "name" | "icon"> | null;
};

export type SkillRelationship = {
  id: string;
  parent_skill_id: string;
  child_skill_id: string;
  created_at: string;
};

export type SkillProjectLink = {
  id: string;
  skill_id: string;
  entry_id: string;
  created_at: string;
  entries?: Pick<Entry, "id" | "title" | "short_description" | "demo_url" | "github_url"> | null;
};

export type SkillGraphData = {
  skills: Skill[];
  relationships: SkillRelationship[];
  categories: SkillCategory[];
  projectLinks: SkillProjectLink[];
};

export type JourneyDocument = {
  title: string;
  url: string;
  type?: "pdf" | "link";
};

export type Journey = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  content_markdown: string | null;
  start_date: string;
  end_date: string | null;
  category: string;
  location: string | null;
  tech_stack: string[];
  linked_skill_ids: string[];
  linked_achievements: string[];
  cover_image: string | null;
  video_links: string[];
  github_url: string | null;
  demo_url: string | null;
  documents: JourneyDocument[];
  display_order: number;
  is_featured: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  journey_media?: JourneyMedia[];
  journey_tags?: JourneyTag[];
};

export type JourneyMedia = {
  id: string;
  journey_id: string;
  url: string;
  type: "image" | "video" | "pdf" | "embed";
  title: string | null;
  caption: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type JourneyTag = {
  id: string;
  journey_id: string;
  name: string;
  created_at: string;
};

export type AchievementRarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

export type AchievementCategory = {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Achievement = {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  rarity: AchievementRarity;
  xp_reward: number;
  unlock_date: string | null;
  color: string;
  is_secret: boolean;
  is_visible: boolean;
  cover_image: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  achievement_categories?: Pick<AchievementCategory, "id" | "name" | "icon" | "color"> | null;
};

export type AchievementProjectLink = {
  id: string;
  achievement_id: string;
  entry_id: string;
  created_at: string;
  entries?: Pick<Entry, "id" | "title" | "short_description" | "demo_url" | "github_url"> | null;
};

export type AchievementSkillLink = {
  id: string;
  achievement_id: string;
  skill_id: string;
  created_at: string;
  skills?: Pick<Skill, "id" | "name" | "slug" | "level" | "xp" | "color_theme"> | null;
};

export type AchievementData = {
  achievements: Achievement[];
  categories: AchievementCategory[];
  projectLinks: AchievementProjectLink[];
  skillLinks: AchievementSkillLink[];
};
