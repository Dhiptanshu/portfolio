create table ai_settings (
  id integer primary key default 1 check (id = 1),
  is_chat_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ai_settings_updated_at before update on ai_settings for each row execute function set_updated_at();

alter table ai_settings enable row level security;

create policy "Public can read ai settings" on ai_settings for select using (true);
create policy "Admins can manage ai settings" on ai_settings for all using (public.is_admin()) with check (public.is_admin());

insert into ai_settings (id, is_chat_enabled) values (1, true) on conflict (id) do nothing;
