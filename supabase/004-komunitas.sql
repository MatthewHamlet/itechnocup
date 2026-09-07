alter table public.profiles
  add column if not exists headline text,
  add column if not exists verified boolean not null default false;

comment on column public.profiles.verified is
  'Ditandai manual dari dashboard. Tidak ada kode aplikasi yang boleh menulisnya.';


create table if not exists public.community_groups (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null check (length(trim(name)) > 0),
  blurb       text        not null default '',
  art         text        not null default 'heart',
  tone        text        not null default 'forest',
  keywords    text[]      not null default '{}',
  created_by  uuid        references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.community_group_members (
  group_id   uuid        not null references public.community_groups (id) on delete cascade,
  profile_id uuid        not null references public.profiles (id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (group_id, profile_id)
);


create table if not exists public.community_posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid        not null references public.profiles (id) on delete cascade,
  group_id   uuid        references public.community_groups (id) on delete set null,
  title      text        not null check (length(trim(title)) > 0),
  body       text        not null default '',
  keywords   text[]      not null default '{}',
  tags       text[]      not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_posts_recent_idx
  on public.community_posts (created_at desc);
create index if not exists community_posts_group_idx
  on public.community_posts (group_id, created_at desc);

create table if not exists public.community_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid        not null references public.community_posts (id) on delete cascade,
  author_id  uuid        not null references public.profiles (id) on delete cascade,
  body       text        not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists community_comments_post_idx
  on public.community_comments (post_id, created_at);

create table if not exists public.community_votes (
  post_id    uuid        not null references public.community_posts (id) on delete cascade,
  profile_id uuid        not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);


create table if not exists public.community_follows (
  follower_id uuid        not null references public.profiles (id) on delete cascade,
  followee_id uuid        not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint community_follows_not_self check (follower_id <> followee_id)
);


alter table public.community_groups          enable row level security;
alter table public.community_group_members   enable row level security;
alter table public.community_posts           enable row level security;
alter table public.community_comments        enable row level security;
alter table public.community_votes           enable row level security;
alter table public.community_follows         enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'community_groups', 'community_group_members', 'community_posts',
    'community_comments', 'community_votes', 'community_follows'
  ]
  loop
    execute format($f$
      drop policy if exists "%1$s: read signed in" on public.%1$s;
      create policy "%1$s: read signed in"
        on public.%1$s for select
        to authenticated
        using ( true );
    $f$, t);
  end loop;
end $$;

drop policy if exists "community_posts: write own" on public.community_posts;
create policy "community_posts: write own"
  on public.community_posts for insert to authenticated
  with check ( author_id = (select auth.uid()) );

drop policy if exists "community_posts: edit own" on public.community_posts;
create policy "community_posts: edit own"
  on public.community_posts for update to authenticated
  using ( author_id = (select auth.uid()) ) with check ( author_id = (select auth.uid()) );

drop policy if exists "community_posts: delete own" on public.community_posts;
create policy "community_posts: delete own"
  on public.community_posts for delete to authenticated
  using ( author_id = (select auth.uid()) );

drop policy if exists "community_comments: write own" on public.community_comments;
create policy "community_comments: write own"
  on public.community_comments for insert to authenticated
  with check ( author_id = (select auth.uid()) );

drop policy if exists "community_comments: delete own" on public.community_comments;
create policy "community_comments: delete own"
  on public.community_comments for delete to authenticated
  using ( author_id = (select auth.uid()) );

drop policy if exists "community_votes: vote as self" on public.community_votes;
create policy "community_votes: vote as self"
  on public.community_votes for insert to authenticated
  with check ( profile_id = (select auth.uid()) );

drop policy if exists "community_votes: unvote own" on public.community_votes;
create policy "community_votes: unvote own"
  on public.community_votes for delete to authenticated
  using ( profile_id = (select auth.uid()) );

drop policy if exists "community_group_members: join as self" on public.community_group_members;
create policy "community_group_members: join as self"
  on public.community_group_members for insert to authenticated
  with check ( profile_id = (select auth.uid()) );

drop policy if exists "community_group_members: leave own" on public.community_group_members;
create policy "community_group_members: leave own"
  on public.community_group_members for delete to authenticated
  using ( profile_id = (select auth.uid()) );

drop policy if exists "community_groups: create" on public.community_groups;
create policy "community_groups: create"
  on public.community_groups for insert to authenticated
  with check ( created_by = (select auth.uid()) );

drop policy if exists "community_follows: follow as self" on public.community_follows;
create policy "community_follows: follow as self"
  on public.community_follows for insert to authenticated
  with check ( follower_id = (select auth.uid()) );

drop policy if exists "community_follows: unfollow own" on public.community_follows;
create policy "community_follows: unfollow own"
  on public.community_follows for delete to authenticated
  using ( follower_id = (select auth.uid()) );

drop trigger if exists community_posts_touch_updated_at on public.community_posts;
create trigger community_posts_touch_updated_at
  before update on public.community_posts
  for each row execute function public.touch_updated_at();


create table if not exists public.community_group_messages (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid        not null references public.community_groups (id) on delete cascade,
  author_id  uuid        not null references public.profiles (id) on delete cascade,
  body       text        not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists community_group_messages_idx
  on public.community_group_messages (group_id, created_at);

create or replace function public.is_group_member(p_group uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.community_group_members
    where group_id = p_group and profile_id = (select auth.uid())
  );
$$;

revoke all on function public.is_group_member(uuid) from public, anon;
grant execute on function public.is_group_member(uuid) to authenticated;

alter table public.community_group_messages enable row level security;

drop policy if exists "group messages: read as member" on public.community_group_messages;
create policy "group messages: read as member"
  on public.community_group_messages for select to authenticated
  using ( public.is_group_member(group_id) );

drop policy if exists "group messages: send as member" on public.community_group_messages;
create policy "group messages: send as member"
  on public.community_group_messages for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and public.is_group_member(group_id)
  );

drop policy if exists "group messages: delete own" on public.community_group_messages;
create policy "group messages: delete own"
  on public.community_group_messages for delete to authenticated
  using ( author_id = (select auth.uid()) );
delete from public.community_groups a
using public.community_groups b
where a.created_by = b.created_by
  and a.created_by is not null
  and a.id > b.id;

create unique index if not exists community_groups_one_per_creator
  on public.community_groups (created_by)
  where created_by is not null;

create or replace function public.join_group_creator()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by is not null then
    insert into public.community_group_members (group_id, profile_id)
    values (new.id, new.created_by)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists community_groups_join_creator on public.community_groups;
create trigger community_groups_join_creator
  after insert on public.community_groups
  for each row execute function public.join_group_creator();

insert into public.community_group_members (group_id, profile_id)
select g.id, g.created_by
from public.community_groups g
where g.created_by is not null
on conflict do nothing;

create or replace function public.is_group_admin(p_group uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.community_groups
    where id = p_group and created_by = (select auth.uid())
  );
$$;

revoke all on function public.is_group_admin(uuid) from public, anon;
grant execute on function public.is_group_admin(uuid) to authenticated;

drop policy if exists "community_group_members: leave own" on public.community_group_members;
create policy "community_group_members: leave or kick"
  on public.community_group_members for delete to authenticated
  using (
    (profile_id = (select auth.uid()) and not public.is_group_admin(group_id))
    or (public.is_group_admin(group_id) and profile_id <> (select auth.uid()))
  );

drop policy if exists "community_groups: edit own" on public.community_groups;
create policy "community_groups: edit own"
  on public.community_groups for update to authenticated
  using ( created_by = (select auth.uid()) )
  with check ( created_by = (select auth.uid()) );

drop policy if exists "community_groups: delete own" on public.community_groups;
create policy "community_groups: delete own"
  on public.community_groups for delete to authenticated
  using ( created_by = (select auth.uid()) );

alter table public.profiles
  add column if not exists headline text,
  add column if not exists verified boolean not null default false;

alter table public.community_posts
  add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('community', 'community', true)
on conflict (id) do nothing;

drop policy if exists "community image public read" on storage.objects;
create policy "community image public read" on storage.objects
  for select using (bucket_id = 'community');

drop policy if exists "community image owner insert" on storage.objects;
create policy "community image owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'community'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "community image owner update" on storage.objects;
create policy "community image owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'community'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "community image owner delete" on storage.objects;
create policy "community image owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'community'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop view if exists public.community_feed;

create view public.community_feed
with (security_invoker = true) as
  select
    p.id,
    p.author_id,
    p.group_id,
    p.title,
    p.body,
    p.image_url,
    p.keywords,
    p.tags,
    p.created_at,
    (select count(*) from public.community_comments c where c.post_id = p.id) as replies,
    (select count(*) from public.community_votes  v where v.post_id = p.id) as upvotes
  from public.community_posts p;

comment on view public.community_feed is
  'Postingan beserta jumlah balasan dan dukungannya. Jalan sebagai pemanggil,
   jadi yang mengatur aksesnya adalah policy di community_posts.';

drop policy if exists "profiles: read signed in" on public.profiles;
create policy "profiles: read signed in"
  on public.profiles for select
  to authenticated
  using ( true );

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_group_messages'
  ) then
    alter publication supabase_realtime add table public.community_group_messages;
  end if;
end $$;

alter table public.community_group_messages replica identity full;
