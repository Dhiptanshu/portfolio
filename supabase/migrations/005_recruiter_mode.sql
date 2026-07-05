create table recruiter_settings (
  id integer primary key default 1 check (id = 1),
  is_active boolean not null default true,
  estimated_reading_time integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger recruiter_settings_updated_at before update on recruiter_settings for each row execute function set_updated_at();

alter table recruiter_settings enable row level security;

create policy "Public can read recruiter settings" on recruiter_settings for select using (true);
create policy "Admins can manage recruiter settings" on recruiter_settings for all using (public.is_admin()) with check (public.is_admin());

insert into recruiter_settings (id, is_active, estimated_reading_time) values (1, true, 5) on conflict (id) do nothing;

alter table entries add column is_recruiter_featured boolean not null default false;
create index entries_recruiter_featured_idx on entries (is_recruiter_featured);

alter table skills add column is_recruiter_featured boolean not null default false;
create index skills_recruiter_featured_idx on skills (is_recruiter_featured);

alter table achievements add column is_recruiter_featured boolean not null default false;
create index achievements_recruiter_featured_idx on achievements (is_recruiter_featured);

alter table journeys add column is_recruiter_featured boolean not null default false;
create index journeys_recruiter_featured_idx on journeys (is_recruiter_featured);
