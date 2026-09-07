-- StyleSync MVP: Supabase Auth-backed profiles and private fashion projects.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  max_budget_minor bigint not null check (max_budget_minor >= 0),
  currency char(3) not null default 'INR' check (currency = upper(currency)),
  selected_vibes text[] not null default '{}',
  event_description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'bought')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_created_at_idx on public.projects (user_id, created_at desc);

create table public.saved_looks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  look_name text not null,
  total_price_minor bigint not null check (total_price_minor >= 0),
  compatibility_score smallint check (compatibility_score between 0 and 100),
  item_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index saved_looks_user_id_created_at_idx on public.saved_looks (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.saved_looks enable row level security;

create policy "Users can read their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can read their own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can create their own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update their own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete their own projects" on public.projects for delete using (auth.uid() = user_id);
create policy "Users can read their own saved looks" on public.saved_looks for select using (auth.uid() = user_id);
create policy "Users can create their own saved looks" on public.saved_looks for insert with check (auth.uid() = user_id);
create policy "Users can delete their own saved looks" on public.saved_looks for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'StyleSync friend'));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();
