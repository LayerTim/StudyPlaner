create table if not exists public.plans (
  owner uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.plans enable row level security;

drop policy if exists "Users can read own plan" on public.plans;
create policy "Users can read own plan"
on public.plans for select
using (auth.uid() = owner);

drop policy if exists "Users can create own plan" on public.plans;
create policy "Users can create own plan"
on public.plans for insert
with check (auth.uid() = owner);

drop policy if exists "Users can update own plan" on public.plans;
create policy "Users can update own plan"
on public.plans for update
using (auth.uid() = owner)
with check (auth.uid() = owner);

drop policy if exists "Users can delete own plan" on public.plans;
create policy "Users can delete own plan"
on public.plans for delete
using (auth.uid() = owner);
