create table experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  employment_type text not null default 'Full-time',
  location text,
  start_date date not null,
  end_date date,
  description text,
  logo_url text,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table experiences enable row level security;

create policy "Public can read visible experiences" on experiences for select using (is_visible = true or public.is_admin());
create policy "Admins can manage experiences" on experiences for all using (public.is_admin()) with check (public.is_admin());

create trigger experiences_updated_at before update on experiences for each row execute function set_updated_at();

-- Migrate existing internship from journeys to experiences
INSERT INTO experiences (company, role, employment_type, location, start_date, end_date, description, display_order)
SELECT 
  subtitle as company,
  title as role,
  category as employment_type,
  location,
  start_date,
  end_date,
  description,
  display_order
FROM journeys 
WHERE category IN ('Internship', 'Work', 'Experience');

-- Remove them from journeys to avoid duplication
DELETE FROM journeys WHERE category IN ('Internship', 'Work', 'Experience');
