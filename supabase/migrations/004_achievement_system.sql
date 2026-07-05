create type achievement_rarity as enum ('Common', 'Rare', 'Epic', 'Legendary', 'Mythic');

create table achievement_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  color text not null default '#dec89c',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table achievements (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references achievement_categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text,
  icon text,
  rarity achievement_rarity not null default 'Common',
  xp_reward integer not null default 0 check (xp_reward >= 0),
  unlock_date date,
  color text not null default '#dec89c',
  is_secret boolean not null default false,
  is_visible boolean not null default true,
  cover_image text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table achievement_project_links (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references achievements(id) on delete cascade,
  entry_id uuid not null references entries(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint achievement_project_links_unique unique (achievement_id, entry_id)
);

create table achievement_skill_links (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references achievements(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint achievement_skill_links_unique unique (achievement_id, skill_id)
);

create index achievement_categories_order_idx on achievement_categories (display_order);
create index achievements_visible_order_idx on achievements (is_visible, display_order);
create index achievements_rarity_idx on achievements (rarity);
create index achievements_unlock_date_idx on achievements (unlock_date desc);
create index achievements_category_idx on achievements (category_id);
create index achievement_project_links_achievement_idx on achievement_project_links (achievement_id);
create index achievement_project_links_entry_idx on achievement_project_links (entry_id);
create index achievement_skill_links_achievement_idx on achievement_skill_links (achievement_id);
create index achievement_skill_links_skill_idx on achievement_skill_links (skill_id);

create trigger achievement_categories_updated_at before update on achievement_categories for each row execute function set_updated_at();
create trigger achievements_updated_at before update on achievements for each row execute function set_updated_at();

alter table achievement_categories enable row level security;
alter table achievements enable row level security;
alter table achievement_project_links enable row level security;
alter table achievement_skill_links enable row level security;

create policy "Public can read achievement categories" on achievement_categories for select using (true);
create policy "Admins can manage achievement categories" on achievement_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read visible achievements" on achievements for select using (is_visible = true or public.is_admin());
create policy "Admins can manage achievements" on achievements for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read visible achievement project links" on achievement_project_links
for select using (
  public.is_admin()
  or exists (
    select 1 from achievements
    where achievements.id = achievement_project_links.achievement_id
      and achievements.is_visible = true
  )
);
create policy "Admins can manage achievement project links" on achievement_project_links for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read visible achievement skill links" on achievement_skill_links
for select using (
  public.is_admin()
  or exists (
    select 1 from achievements
    where achievements.id = achievement_skill_links.achievement_id
      and achievements.is_visible = true
  )
);
create policy "Admins can manage achievement skill links" on achievement_skill_links for all using (public.is_admin()) with check (public.is_admin());

insert into achievement_categories (name, icon, color, display_order)
values
  ('Engineering', 'Code2', '#61c9a8', 0),
  ('Competition', 'Trophy', '#d9b86c', 1),
  ('Leadership', 'Crown', '#b78cff', 2),
  ('Research', 'ScrollText', '#7aa7ff', 3),
  ('Community', 'UsersRound', '#f28b82', 4)
on conflict (name) do nothing;

insert into achievements (
  category_id,
  title,
  slug,
  description,
  icon,
  rarity,
  xp_reward,
  unlock_date,
  color,
  is_secret,
  is_visible,
  cover_image,
  display_order
) values
  (
    (select id from achievement_categories where name = 'Engineering'),
    'System Architect',
    'system-architect',
    'Designed a portfolio operating system with dynamic content, skill graph, and journey engines.',
    'Network',
    'Legendary',
    5000,
    current_date,
    '#dec89c',
    false,
    true,
    null,
    0
  ),
  (
    (select id from achievement_categories where name = 'Competition'),
    'Prototype Sprint',
    'prototype-sprint',
    'Built and shipped high-signal prototypes under time pressure.',
    'Zap',
    'Epic',
    2500,
    current_date - interval '14 days',
    '#7aa7ff',
    false,
    true,
    null,
    1
  ),
  (
    (select id from achievement_categories where name = 'Research'),
    'Hidden Depths',
    'hidden-depths',
    'A secret achievement reserved for deeper portfolio milestones.',
    'EyeOff',
    'Mythic',
    8000,
    null,
    '#b78cff',
    true,
    true,
    null,
    2
  )
on conflict (slug) do nothing;
