-- Milestone 4 community layer: intentionally limited to Moments, comments and Champions.
create extension if not exists pgcrypto;

create table if not exists public.moments (
  id text primary key,
  owner_id uuid references auth.users(id) on delete set null,
  title text not null check (char_length(title) between 1 and 80),
  description text,
  creator_name text not null,
  creator_handle text not null,
  creator_initials text not null,
  video_path text not null,
  official_event_id text not null,
  official_event_label text not null,
  champion_count integer not null default 0 check (champion_count >= 0),
  comment_count integer not null default 0 check (comment_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  moment_id text not null references public.moments(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  author_handle text not null,
  author_initials text not null,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.champions (
  id uuid primary key default gen_random_uuid(),
  moment_id text not null references public.moments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (moment_id, user_id)
);

create index if not exists comments_moment_created_idx on public.comments(moment_id, created_at);
create index if not exists champions_moment_idx on public.champions(moment_id);

alter table public.moments enable row level security;
alter table public.comments enable row level security;
alter table public.champions enable row level security;

create policy "moments are publicly readable" on public.moments for select using (true);
create policy "authenticated fans can seed moments" on public.moments for insert to authenticated with check (auth.uid() = owner_id);
create policy "comments are publicly readable" on public.comments for select using (true);
create policy "fans create their own comments" on public.comments for insert to authenticated with check (auth.uid() = author_id);
create policy "champions are publicly readable" on public.champions for select using (true);
create policy "fans create their own champions" on public.champions for insert to authenticated with check (auth.uid() = user_id);
create policy "fans remove their own champions" on public.champions for delete to authenticated using (auth.uid() = user_id);

do $$ begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.champions;
exception when duplicate_object then null;
end $$;

