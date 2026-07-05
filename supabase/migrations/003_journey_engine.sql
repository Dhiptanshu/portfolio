create table journeys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  subtitle text,
  description text,
  content_markdown text,
  start_date date not null,
  end_date date,
  category text not null default 'Project',
  location text,
  tech_stack text[] not null default '{}',
  linked_skill_ids uuid[] not null default '{}',
  linked_achievements text[] not null default '{}',
  cover_image text,
  video_links text[] not null default '{}',
  github_url text,
  demo_url text,
  documents jsonb not null default '[]'::jsonb,
  display_order integer not null default 0,
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table journey_media (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references journeys(id) on delete cascade,
  url text not null,
  type text not null default 'image' check (type in ('image', 'video', 'pdf', 'embed')),
  title text,
  caption text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table journey_tags (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references journeys(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint journey_tags_unique unique (journey_id, name)
);

create index journeys_visible_order_idx on journeys (is_visible, display_order, start_date desc);
create index journeys_category_idx on journeys (category);
create index journeys_start_date_idx on journeys (start_date desc);
create index journeys_featured_idx on journeys (is_featured);
create index journey_media_journey_order_idx on journey_media (journey_id, display_order);
create index journey_tags_name_idx on journey_tags (name);
create index journey_tags_journey_idx on journey_tags (journey_id);

create trigger journeys_updated_at before update on journeys for each row execute function set_updated_at();
create trigger journey_media_updated_at before update on journey_media for each row execute function set_updated_at();

alter table journeys enable row level security;
alter table journey_media enable row level security;
alter table journey_tags enable row level security;

create policy "Public can read visible journeys" on journeys for select using (is_visible = true or public.is_admin());
create policy "Admins can manage journeys" on journeys for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read visible journey media" on journey_media
for select using (
  public.is_admin()
  or exists (
    select 1 from journeys
    where journeys.id = journey_media.journey_id
      and journeys.is_visible = true
  )
);
create policy "Admins can manage journey media" on journey_media for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read visible journey tags" on journey_tags
for select using (
  public.is_admin()
  or exists (
    select 1 from journeys
    where journeys.id = journey_tags.journey_id
      and journeys.is_visible = true
  )
);
create policy "Admins can manage journey tags" on journey_tags for all using (public.is_admin()) with check (public.is_admin());

insert into journeys (
  title,
  slug,
  subtitle,
  description,
  content_markdown,
  start_date,
  end_date,
  category,
  location,
  tech_stack,
  linked_achievements,
  cover_image,
  video_links,
  github_url,
  demo_url,
  documents,
  display_order,
  is_featured,
  is_visible
) values
  (
    'Portfolio Operating System',
    'portfolio-operating-system',
    'Dynamic CMS, skill tree, and journey engine',
    'A personal platform that turns a portfolio into an editable operating system.',
    '## Why it matters\n\nThis project replaces static resume pages with database-driven storytelling, admin editing, media libraries, and interactive exploration.\n\n- Dynamic public rendering\n- Supabase-backed content\n- Premium admin workflows',
    current_date - interval '30 days',
    current_date,
    'Project',
    'Remote',
    array['Next.js', 'Supabase', 'TypeScript', 'TailwindCSS'],
    array['Built dynamic CMS foundation', 'Added graph-based skill tree'],
    null,
    '{}',
    'https://github.com/Dhiptanshu',
    null,
    '[]'::jsonb,
    0,
    true,
    true
  );

insert into journey_tags (journey_id, name)
select id, tag
from journeys
cross join unnest(array['CMS', 'Portfolio', 'Full Stack']) as tag
where slug = 'portfolio-operating-system';
