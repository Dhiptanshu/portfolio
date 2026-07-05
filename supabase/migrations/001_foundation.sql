create extension if not exists pgcrypto;

create type section_type as enum ('projects', 'hackathons', 'internships', 'extracurriculars', 'grades', 'about', 'custom');
create type profile_role as enum ('admin');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role profile_role not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  type section_type not null default 'custom',
  display_order integer not null default 0,
  is_visible boolean not null default true,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table entries (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references sections(id) on delete cascade,
  title text not null,
  short_description text,
  long_description text,
  cover_image text,
  gallery_images text[] not null default '{}',
  video_url text,
  github_url text,
  demo_url text,
  start_date date,
  end_date date,
  tags text[] not null default '{}',
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table social_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo text,
  url text not null,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null unique,
  public_url text not null,
  mime_type text not null,
  size_bytes bigint not null,
  bucket text not null default 'portfolio-media',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sections_visible_order_idx on sections (is_visible, display_order);
create index entries_section_visible_order_idx on entries (section_id, is_visible, display_order);
create index social_links_visible_order_idx on social_links (is_visible, display_order);
create index media_assets_created_at_idx on media_assets (created_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles for each row execute function set_updated_at();
create trigger sections_updated_at before update on sections for each row execute function set_updated_at();
create trigger entries_updated_at before update on entries for each row execute function set_updated_at();
create trigger social_links_updated_at before update on social_links for each row execute function set_updated_at();
create trigger media_assets_updated_at before update on media_assets for each row execute function set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table profiles enable row level security;
alter table sections enable row level security;
alter table entries enable row level security;
alter table social_links enable row level security;
alter table media_assets enable row level security;

create policy "Admins can read profiles" on profiles for select using (public.is_admin() or id = auth.uid());
create policy "Admins can manage profiles" on profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read visible sections" on sections for select using (is_visible = true or public.is_admin());
create policy "Admins can manage sections" on sections for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read visible entries" on entries
for select using (
  public.is_admin()
  or (
    is_visible = true
    and exists (
      select 1 from sections
      where sections.id = entries.section_id
        and sections.is_visible = true
    )
  )
);
create policy "Admins can manage entries" on entries for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read visible socials" on social_links for select using (is_visible = true or public.is_admin());
create policy "Admins can manage socials" on social_links for all using (public.is_admin()) with check (public.is_admin());

create policy "Admins can read media assets" on media_assets for select using (public.is_admin());
create policy "Admins can manage media assets" on media_assets for all using (public.is_admin()) with check (public.is_admin());

insert into sections (title, slug, description, type, display_order, icon, is_visible)
values
  ('About Me', 'about-me', 'A concise profile, principles, and current focus.', 'about', 0, 'UserRound', true),
  ('Projects', 'projects', 'Selected engineering work rendered from the CMS.', 'projects', 1, 'Sparkles', true),
  ('Hackathons', 'hackathons', 'Competitive builds, prototypes, and outcomes.', 'hackathons', 2, 'Trophy', true);

insert into entries (section_id, title, short_description, long_description, tags, display_order, is_visible)
select id, 'Portfolio OS Foundation', 'A dynamic content engine for a premium developer portfolio.', 'This initial entry is seeded by the migration so the public homepage renders real database content immediately after setup.', array['Next.js', 'Supabase', 'CMS'], 0, true
from sections where slug = 'projects';

insert into social_links (name, url, display_order, is_visible)
values
  ('Email', 'mailto:dhiptanshu@gmail.com', 0, true),
  ('LinkedIn', 'https://www.linkedin.com/in/dhiptanshu', 1, true),
  ('GitHub', 'https://github.com/Dhiptanshu', 2, true);
