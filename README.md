# Dynamic Portfolio OS

A production-oriented portfolio foundation built with Next.js 15 App Router, TypeScript, TailwindCSS, shadcn-style UI primitives, Framer Motion-ready structure, Supabase Auth, Supabase Postgres, Supabase Storage, React Hook Form/Zod-ready validation, and dnd-kit ordering.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`.

3. In Supabase, run `supabase/migrations/001_foundation.sql`.

4. Create a public storage bucket named `portfolio-media`.

5. Create an auth user for yourself, then insert its id into `profiles`:

```sql
insert into profiles (id, email, full_name, role)
values ('AUTH_USER_ID', 'you@example.com', 'Your Name', 'admin');
```

6. Run locally:

```bash
npm run dev
```

Open `/` for the public portfolio and `/admin/login` for the CMS.

## Structure

- `app/` public routes, admin routes, API route handlers, loading and error states.
- `features/admin/` admin management components.
- `components/` reusable shell and UI primitives.
- `lib/` Supabase clients, typed domain models, validation, data access.
- `supabase/migrations/` database schema, indexes, seed data, RLS policies.

## Phase 1 Coverage

- Dynamic homepage from visible database sections and entries.
- Admin authentication via Supabase Auth middleware.
- Dashboard stats.
- Section, entry, and social CRUD APIs.
- dnd-kit ordering for sections, entries, and socials.
- Media upload/delete metadata flow for Supabase Storage.
- RLS for public visible reads and admin CRUD.

## Phase 2 Skill Tree

Run `supabase/migrations/002_skill_tree.sql` after the foundation migration.

The skill engine adds:

- `skill_categories`, `skills`, `skill_relationships`, and `skill_project_links`.
- Generated skill levels from XP: `floor(sqrt(xp / 100))`.
- DAG relationships with cycle prevention.
- Public `/skills` cinematic React Flow explorer.
- Admin `/admin/skills` graph editor with node dragging, connection creation, double-click edge deletion, CRUD, duplication, visibility toggles, categories, and project links.
- Public RLS read access for visible skills and admin CRUD policies.

Skill APIs:

- `/api/skills`
- `/api/skill-categories`
- `/api/skill-relationships`
- `/api/skill-project-links`

## Journey Engine

Run `supabase/migrations/003_journey_engine.sql` after the foundation and skill migrations.

The journey engine adds:

- `journeys`, `journey_media`, and `journey_tags`.
- Admin `/admin/journey` for CRUD, drag ordering, filters, tags, linked skills, markdown content, uploads, documents, and nested galleries.
- Public `/journey` premium animated timeline with search, category filters, tag filters, expanding detail views, galleries, embeds, documents, GitHub, and demo links.
- Public RLS read access for visible journeys and admin CRUD policies.

Journey APIs:

- `/api/journeys`
- `/api/journey-media`
- `/api/journey-tags`
- `/api/journey-upload`

## Achievement System

Run `supabase/migrations/004_achievement_system.sql` after the previous migrations.

The achievement system adds:

- `achievement_categories`, `achievements`, `achievement_project_links`, and `achievement_skill_links`.
- Admin `/admin/achievements` for CRUD, hide/show, reorder, duplicate, category management, icon/cover uploads, project links, and skill links.
- Public `/achievements` RPG-style gallery with rarity filtering, animated unlock cards, detail modal, linked projects, linked skills, and unlock timeline.
- Rarities: `Common`, `Rare`, `Epic`, `Legendary`, `Mythic`.
- Public RLS read access for visible achievements and admin CRUD policies.

Achievement APIs:

- `/api/achievements`
- `/api/achievement-categories`
- `/api/achievement-project-links`
- `/api/achievement-skill-links`
- `/api/achievement-upload`
