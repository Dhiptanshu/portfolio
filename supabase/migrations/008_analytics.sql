create type analytics_event_type as enum (
  'page_view', 
  'project_click', 
  'skill_click', 
  'achievement_view', 
  'journey_view', 
  'recruiter_mode_toggle', 
  'resume_download', 
  'social_click', 
  'search_query'
);

create table analytics_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_hash text not null, -- Privacy-friendly hashed identifier
  is_returning boolean not null default false,
  start_time timestamptz not null default now(),
  last_ping timestamptz not null default now(), -- Updated periodically to calculate duration
  user_agent text,
  country text,
  device_type text
);

create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references analytics_sessions(id) on delete cascade,
  event_type analytics_event_type not null,
  path text not null,
  resource_id text,
  resource_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_sessions_hash_idx on analytics_sessions (visitor_hash);
create index analytics_sessions_time_idx on analytics_sessions (start_time desc);
create index analytics_events_session_idx on analytics_events (session_id);
create index analytics_events_type_idx on analytics_events (event_type);
create index analytics_events_time_idx on analytics_events (created_at desc);

alter table analytics_sessions enable row level security;
alter table analytics_events enable row level security;

create policy "Admins can manage analytics_sessions" on analytics_sessions for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage analytics_events" on analytics_events for all using (public.is_admin()) with check (public.is_admin());
