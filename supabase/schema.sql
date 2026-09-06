create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Teman Farad',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.households (
  user_id uuid primary key references auth.users (id) on delete cascade,
  installed_va integer not null default 1300,
  base_load_va integer not null default 308,
  reserve_fraction numeric(3, 2) not null default 0.15,
  updated_at timestamptz not null default now(),
  constraint households_installed_va_range check (installed_va between 450 and 41500),
  constraint households_base_load_positive check (base_load_va >= 0),
  constraint households_reserve_range check (reserve_fraction >= 0 and reserve_fraction <= 0.30),
  constraint households_base_below_limit check (base_load_va < installed_va * (1 - reserve_fraction))
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_date date not null,
  label text not null,
  short_label text not null,
  appliance text not null,
  icon_key text not null default 'plug',
  va integer not null,
  watts integer not null,
  duration_min integer not null,
  start_min integer not null,
  earliest_min integer not null,
  latest_min integer not null,
  flexibility text not null default 'flexible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_va_positive check (va > 0),
  constraint activities_watts_positive check (watts > 0),
  constraint activities_duration_step check (duration_min > 0 and duration_min % 15 = 0),
  constraint activities_minutes_range check (
    start_min between 0 and 1440
    and earliest_min between 0 and 1440
    and latest_min between 0 and 1440
  ),
  constraint activities_window_valid check (earliest_min < latest_min),
  constraint activities_fits_window check (
    start_min >= earliest_min and start_min + duration_min <= latest_min
  ),
  constraint activities_flexibility_known check (flexibility in ('fixed', 'flexible'))
);

create index if not exists activities_user_date_idx
  on public.activities (user_id, plan_date, start_min);

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.activities enable row level security;

drop policy if exists "profiles owner read" on public.profiles;
create policy "profiles owner read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles owner write" on public.profiles;
create policy "profiles owner write" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles owner insert" on public.profiles;
create policy "profiles owner insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "households owner all" on public.households;
create policy "households owner all" on public.households
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "activities owner all" on public.activities;
create policy "activities owner all" on public.activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists households_touch_updated_at on public.households;
create trigger households_touch_updated_at
  before update on public.households
  for each row execute function public.touch_updated_at();

drop trigger if exists activities_touch_updated_at on public.activities;
create trigger activities_touch_updated_at
  before update on public.activities
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Teman Farad')
  )
  on conflict (id) do nothing;

  insert into public.households (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles
  add column if not exists onboarded_at timestamptz;
