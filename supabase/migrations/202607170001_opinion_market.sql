create table if not exists public.opinion_contributions (
  id uuid primary key default gen_random_uuid(),
  match_id text not null,
  moment_id text not null references public.moments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  amount_lamports bigint not null check (amount_lamports in (20000000, 50000000, 100000000)),
  transaction_signature text not null unique,
  mode text not null check (mode in ('live', 'replay')),
  created_at timestamptz not null default now()
);
create index if not exists opinion_contributions_match_idx on public.opinion_contributions(match_id, created_at);
alter table public.opinion_contributions enable row level security;
create policy "opinion contributions are readable" on public.opinion_contributions for select using (true);
create policy "fans record own contributions" on public.opinion_contributions for insert to authenticated with check (auth.uid() = user_id);
do $$ begin alter publication supabase_realtime add table public.opinion_contributions; exception when duplicate_object then null; end $$;
