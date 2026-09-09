-- Personal style and measurement preferences for a signed-in StyleSync user.
alter table public.profiles
  add column if not exists top_size text,
  add column if not exists bottom_size text,
  add column if not exists waist_inches smallint check (waist_inches between 18 and 60),
  add column if not exists inseam_inches smallint check (inseam_inches between 20 and 44),
  add column if not exists shoe_size_eu numeric(4,1) check (shoe_size_eu between 30 and 48),
  add column if not exists selected_vibes text[] not null default '{}',
  add column if not exists auto_filter_stock boolean not null default true;

-- Accounts created before the first migration also receive a profile.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

create policy "Users can create their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
