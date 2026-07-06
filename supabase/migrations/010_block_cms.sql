create table pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  parent_id uuid references blocks(id) on delete cascade, -- for nested blocks
  type text not null, -- 'hero', 'markdown', 'gallery', etc.
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  content jsonb not null default '{}'::jsonb, -- Block specific data (e.g., text, image urls)
  settings jsonb not null default '{}'::jsonb, -- Responsive, spacing, animation, theme overrides
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index blocks_page_idx on blocks(page_id);
create index blocks_parent_idx on blocks(parent_id);
create index blocks_order_idx on blocks(page_id, sort_order);

alter table pages enable row level security;
alter table blocks enable row level security;

-- Public can read published pages
create policy "Public can view published pages" on pages for select using (is_published = true);
create policy "Public can view blocks of published pages" on blocks for select 
using (exists (select 1 from pages where pages.id = blocks.page_id and pages.is_published = true) and is_visible = true);

-- Admins can do everything
create policy "Admins can manage pages" on pages for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage blocks" on blocks for all using (public.is_admin()) with check (public.is_admin());

-- Insert default homepage
insert into pages (slug, title, description, is_published) values 
('home', 'Homepage', 'The main entry point.', true);
