import { z } from "zod";

export const sectionSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z.string().min(1).max(140).regex(/^[a-z0-9-]+$/),
  description: z.string().max(600).nullable().optional(),
  type: z.enum(["projects", "hackathons", "internships", "extracurriculars", "grades", "about", "custom"]),
  display_order: z.coerce.number().int().min(0).default(0),
  is_visible: z.coerce.boolean().default(true),
  icon: z.string().max(80).nullable().optional()
});

export const entrySchema = z.object({
  section_id: z.string().uuid(),
  title: z.string().min(1).max(160),
  short_description: z.string().max(400).nullable().optional(),
  long_description: z.string().nullable().optional(),
  cover_image: z.string().url().nullable().optional().or(z.literal("")),
  gallery_images: z.array(z.string().url()).default([]),
  video_url: z.string().url().nullable().optional().or(z.literal("")),
  github_url: z.string().url().nullable().optional().or(z.literal("")),
  demo_url: z.string().url().nullable().optional().or(z.literal("")),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  tags: z.array(z.string().min(1)).default([]),
  display_order: z.coerce.number().int().min(0).default(0),
  is_visible: z.coerce.boolean().default(true)
});

export const socialSchema = z.object({
  name: z.string().min(1).max(80),
  logo: z.string().max(240).nullable().optional(),
  url: z.string().url(),
  display_order: z.coerce.number().int().min(0).default(0),
  is_visible: z.coerce.boolean().default(true)
});

export const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1)
});

export const skillCategorySchema = z.object({
  name: z.string().min(1).max(80),
  icon: z.string().max(80).nullable().optional(),
  display_order: z.coerce.number().int().min(0).default(0)
});

export const skillSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(140).regex(/^[a-z0-9-]+$/),
  icon: z.string().max(80).nullable().optional(),
  description: z.string().max(1200).nullable().optional(),
  xp: z.coerce.number().int().min(0).default(0),
  color_theme: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#dec89c"),
  node_x: z.coerce.number().default(0),
  node_y: z.coerce.number().default(0),
  category_id: z.string().uuid().nullable().optional(),
  is_visible: z.coerce.boolean().default(true)
});

export const skillRelationshipSchema = z.object({
  parent_skill_id: z.string().uuid(),
  child_skill_id: z.string().uuid()
}).refine((value) => value.parent_skill_id !== value.child_skill_id, "A skill cannot depend on itself.");

export const skillProjectLinkSchema = z.object({
  skill_id: z.string().uuid(),
  entry_id: z.string().uuid()
});

const optionalUrl = z.string().url().nullable().optional().or(z.literal(""));

export const journeyDocumentSchema = z.object({
  title: z.string().min(1).max(120),
  url: z.string().url(),
  type: z.enum(["pdf", "link"]).optional()
});

export const journeySchema = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().min(1).max(180).regex(/^[a-z0-9-]+$/),
  subtitle: z.string().max(220).nullable().optional(),
  description: z.string().max(800).nullable().optional(),
  content_markdown: z.string().nullable().optional(),
  start_date: z.string().min(1),
  end_date: z.string().nullable().optional(),
  category: z.string().min(1).max(80).default("Project"),
  location: z.string().max(160).nullable().optional(),
  tech_stack: z.array(z.string().min(1)).default([]),
  linked_skill_ids: z.array(z.string().uuid()).default([]),
  linked_achievements: z.array(z.string().min(1)).default([]),
  cover_image: optionalUrl,
  video_links: z.array(z.string().url()).default([]),
  github_url: optionalUrl,
  demo_url: optionalUrl,
  documents: z.array(journeyDocumentSchema).default([]),
  display_order: z.coerce.number().int().min(0).default(0),
  is_featured: z.coerce.boolean().default(false),
  is_visible: z.coerce.boolean().default(true)
});

export const journeyMediaSchema = z.object({
  journey_id: z.string().uuid(),
  url: z.string().url(),
  type: z.enum(["image", "video", "pdf", "embed"]).default("image"),
  title: z.string().max(120).nullable().optional(),
  caption: z.string().max(260).nullable().optional(),
  display_order: z.coerce.number().int().min(0).default(0)
});

export const journeyTagSchema = z.object({
  journey_id: z.string().uuid(),
  name: z.string().min(1).max(60)
});

export const achievementCategorySchema = z.object({
  name: z.string().min(1).max(80),
  icon: z.string().max(80).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#dec89c"),
  display_order: z.coerce.number().int().min(0).default(0)
});

export const achievementSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(160),
  slug: z.string().min(1).max(180).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).nullable().optional(),
  icon: z.string().max(240).nullable().optional(),
  rarity: z.enum(["Common", "Rare", "Epic", "Legendary", "Mythic"]).default("Common"),
  xp_reward: z.coerce.number().int().min(0).default(0),
  unlock_date: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#dec89c"),
  is_secret: z.coerce.boolean().default(false),
  is_visible: z.coerce.boolean().default(true),
  cover_image: optionalUrl,
  display_order: z.coerce.number().int().min(0).default(0)
});

export const achievementProjectLinkSchema = z.object({
  achievement_id: z.string().uuid(),
  entry_id: z.string().uuid()
});

export const achievementSkillLinkSchema = z.object({
  achievement_id: z.string().uuid(),
  skill_id: z.string().uuid()
});
