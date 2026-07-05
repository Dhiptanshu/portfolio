create table skill_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  description text,
  level integer generated always as (floor(sqrt(greatest(xp, 0)::numeric / 100))) stored,
  xp integer not null default 0 check (xp >= 0),
  color_theme text not null default '#dec89c',
  node_x double precision not null default 0,
  node_y double precision not null default 0,
  category_id uuid references skill_categories(id) on delete set null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table skill_relationships (
  id uuid primary key default gen_random_uuid(),
  parent_skill_id uuid not null references skills(id) on delete cascade,
  child_skill_id uuid not null references skills(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint skill_relationships_unique unique (parent_skill_id, child_skill_id),
  constraint skill_relationships_no_self check (parent_skill_id <> child_skill_id)
);

create table skill_project_links (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  entry_id uuid not null references entries(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint skill_project_links_unique unique (skill_id, entry_id)
);

create index skill_categories_order_idx on skill_categories (display_order);
create index skills_visible_idx on skills (is_visible);
create index skills_category_idx on skills (category_id);
create index skills_xp_idx on skills (xp desc);
create index skill_relationships_parent_idx on skill_relationships (parent_skill_id);
create index skill_relationships_child_idx on skill_relationships (child_skill_id);
create index skill_project_links_skill_idx on skill_project_links (skill_id);
create index skill_project_links_entry_idx on skill_project_links (entry_id);

create trigger skill_categories_updated_at before update on skill_categories for each row execute function set_updated_at();
create trigger skills_updated_at before update on skills for each row execute function set_updated_at();

create or replace function prevent_skill_relationship_cycle()
returns trigger as $$
begin
  if exists (
    with recursive descendants(id) as (
      select new.child_skill_id
      union
      select sr.child_skill_id
      from skill_relationships sr
      join descendants d on d.id = sr.parent_skill_id
    )
    select 1 from descendants where id = new.parent_skill_id
  ) then
    raise exception 'Skill relationship would create a cycle';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger skill_relationships_prevent_cycle
before insert or update on skill_relationships
for each row execute function prevent_skill_relationship_cycle();

alter table skill_categories enable row level security;
alter table skills enable row level security;
alter table skill_relationships enable row level security;
alter table skill_project_links enable row level security;

create policy "Public can read skill categories" on skill_categories for select using (true);
create policy "Admins can manage skill categories" on skill_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read visible skills" on skills for select using (is_visible = true or public.is_admin());
create policy "Admins can manage skills" on skills for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read visible skill relationships" on skill_relationships
for select using (
  public.is_admin()
  or (
    exists (select 1 from skills where skills.id = skill_relationships.parent_skill_id and skills.is_visible = true)
    and exists (select 1 from skills where skills.id = skill_relationships.child_skill_id and skills.is_visible = true)
  )
);
create policy "Admins can manage skill relationships" on skill_relationships for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read visible skill project links" on skill_project_links
for select using (
  public.is_admin()
  or exists (select 1 from skills where skills.id = skill_project_links.skill_id and skills.is_visible = true)
);
create policy "Admins can manage skill project links" on skill_project_links for all using (public.is_admin()) with check (public.is_admin());

insert into skill_categories (name, icon, display_order)
values
  ('Programming', 'Code2', 0),
  ('Frontend', 'PanelsTopLeft', 1),
  ('Backend', 'Server', 2),
  ('Mobile', 'Smartphone', 3),
  ('Cloud', 'Cloud', 4),
  ('AI', 'BrainCircuit', 5),
  ('DevOps', 'Workflow', 6),
  ('Database', 'Database', 7),
  ('Security', 'ShieldCheck', 8),
  ('Tools', 'Wrench', 9),
  ('Other', 'Sparkles', 10)
on conflict (name) do nothing;

with inserted as (
  insert into skills (name, slug, icon, description, xp, color_theme, node_x, node_y, category_id, is_visible)
  values
    ('Programming', 'programming', 'Code2', 'Foundational language fluency, problem solving, and systems thinking.', 10000, '#dec89c', 0, 0, (select id from skill_categories where name = 'Programming'), true),
    ('Python', 'python', 'FileCode2', 'Backend systems, automation, data engineering, and AI tooling.', 8500, '#4fb6a9', 280, -120, (select id from skill_categories where name = 'Programming'), true),
    ('JavaScript', 'javascript', 'Braces', 'Interactive products, browser runtimes, and full-stack web applications.', 7600, '#d9b86c', 280, 120, (select id from skill_categories where name = 'Programming'), true),
    ('React', 'react', 'Atom', 'Composable interfaces, stateful product surfaces, and component architecture.', 6400, '#7aa7ff', 580, 60, (select id from skill_categories where name = 'Frontend'), true),
    ('Next.js', 'nextjs', 'Triangle', 'Production React applications with routing, server rendering, and API surfaces.', 4900, '#f1efe7', 880, 40, (select id from skill_categories where name = 'Frontend'), true),
    ('Supabase', 'supabase', 'Database', 'Postgres-backed products with auth, storage, and typed data workflows.', 3600, '#61c9a8', 880, 220, (select id from skill_categories where name = 'Database'), true),
    ('AI Tooling', 'ai-tooling', 'BrainCircuit', 'Applied AI workflows, prompt systems, and productized automation.', 4900, '#b78cff', 580, -220, (select id from skill_categories where name = 'AI'), true)
  on conflict (slug) do nothing
  returning id, slug
)
insert into skill_relationships (parent_skill_id, child_skill_id)
select parent.id, child.id
from (values
  ('programming', 'python'),
  ('programming', 'javascript'),
  ('python', 'ai-tooling'),
  ('javascript', 'react'),
  ('react', 'nextjs'),
  ('nextjs', 'supabase')
) as edges(parent_slug, child_slug)
join skills parent on parent.slug = edges.parent_slug
join skills child on child.slug = edges.child_slug
on conflict (parent_skill_id, child_skill_id) do nothing;
