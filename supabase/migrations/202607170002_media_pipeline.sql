alter table public.moments add column if not exists match_id text;
alter table public.moments add column if not exists storage_path text;
alter table public.moments add column if not exists duration_seconds integer not null default 15 check (duration_seconds between 1 and 15);
alter table public.moments add column if not exists poster_tone text not null default 'blue' check (poster_tone in ('blue','red','violet'));
alter table public.moments add column if not exists rank integer not null default 1;
alter table public.moments add column if not exists txline_verified boolean not null default true;
create index if not exists moments_match_created_idx on public.moments(match_id, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('moments', 'moments', true, 26214400, array['video/mp4'])
on conflict (id) do update set public = true, file_size_limit = 26214400, allowed_mime_types = array['video/mp4'];

drop policy if exists "moment videos are publicly readable" on storage.objects;
drop policy if exists "fans upload own moment videos" on storage.objects;
drop policy if exists "fans remove own moment videos" on storage.objects;
drop policy if exists "fans remove own moments" on public.moments;
create policy "moment videos are publicly readable" on storage.objects for select using (bucket_id = 'moments');
create policy "fans upload own moment videos" on storage.objects for insert to authenticated
with check (bucket_id = 'moments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fans remove own moment videos" on storage.objects for delete to authenticated
using (bucket_id = 'moments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fans remove own moments" on public.moments for delete to authenticated using (auth.uid() = owner_id);

do $$ begin alter publication supabase_realtime add table public.moments; exception when duplicate_object then null; end $$;
