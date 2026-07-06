create table themes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_default boolean not null default false,
  is_active boolean not null default true,
  variables jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure only one default theme
create unique index themes_default_idx on themes (is_default) where is_default = true;

alter table themes enable row level security;

create policy "Themes are viewable by everyone" on themes for select using (true);
create policy "Admins can manage themes" on themes for all using (public.is_admin()) with check (public.is_admin());

-- Insert predefined themes
insert into themes (name, slug, is_default, variables) values
('Luxury', 'luxury', true, '{
  "background": "220 18% 5%",
  "foreground": "42 30% 92%",
  "primary": "38 42% 72%",
  "primary-foreground": "220 18% 6%",
  "muted": "218 14% 14%",
  "muted-foreground": "42 10% 62%",
  "border": "42 18% 18%",
  "radius": "0.5rem",
  "font-family": "Inter, sans-serif"
}'),
('Classic', 'classic', false, '{
  "background": "0 0% 100%",
  "foreground": "222.2 84% 4.9%",
  "primary": "221.2 83.2% 53.3%",
  "primary-foreground": "210 40% 98%",
  "muted": "210 40% 96.1%",
  "muted-foreground": "215.4 16.3% 46.9%",
  "border": "214.3 31.8% 91.4%",
  "radius": "0.5rem",
  "font-family": "system-ui, sans-serif"
}'),
('Cyberpunk', 'cyberpunk', false, '{
  "background": "285 5% 7%",
  "foreground": "320 100% 70%",
  "primary": "55 100% 50%",
  "primary-foreground": "285 5% 7%",
  "muted": "285 5% 12%",
  "muted-foreground": "320 50% 50%",
  "border": "320 100% 30%",
  "radius": "0rem",
  "font-family": "monospace"
}'),
('Terminal', 'terminal', false, '{
  "background": "0 0% 0%",
  "foreground": "120 100% 50%",
  "primary": "120 100% 50%",
  "primary-foreground": "0 0% 0%",
  "muted": "0 0% 10%",
  "muted-foreground": "120 50% 30%",
  "border": "120 100% 20%",
  "radius": "0rem",
  "font-family": "Consolas, monospace"
}');
