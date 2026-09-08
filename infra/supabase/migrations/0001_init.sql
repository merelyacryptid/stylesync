-- StyleSync initial schema
-- Applies to Supabase Postgres. auth.users is managed by Supabase Auth.

create extension if not exists "pgcrypto";

-- 1. Profiles (one row per authenticated user, extends auth.users)
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    size_profile jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- 2. Vibe profiles (style vector / selected aesthetics from onboarding)
create table if not exists public.vibe_profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles (id) on delete cascade,
    selected_vibes text[] not null default '{}',
    style_vector jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists vibe_profiles_user_id_idx on public.vibe_profiles (user_id);

-- 3. Products (curated seed catalog; schema mirrors packages/contracts/examples/product.json)
create table if not exists public.products (
    product_id text primary key,
    source_platform text not null,
    title text not null,
    brand text,
    product_url text not null,
    current_price_minor integer not null,
    original_mrp_minor integer,
    currency text not null default 'INR',
    estimated_shipping_minor integer not null default 0,
    primary_image_url text not null,
    transparent_cutout_url text,
    in_stock_sizes text[] not null default '{}',
    out_of_stock_sizes text[] not null default '{}',
    is_available boolean not null default true,
    gender text not null default 'Women',
    primary_category text not null,
    sub_category text,
    color text,
    pattern text,
    occasions text[] not null default '{}',
    source_updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (primary_category);
create index if not exists products_available_idx on public.products (is_available);

-- 4. Projects (guest-first: user_id nullable, guest_token used before sign-in)
create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles (id) on delete cascade,
    guest_token text,
    project_name text not null,
    max_budget_minor integer not null,
    currency text not null default 'INR',
    required_categories text[] not null default '{}',
    event_description text,
    status text not null default 'draft' check (status in ('draft', 'completed', 'bought')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint projects_owner_check check (user_id is not null or guest_token is not null)
);
create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_guest_token_idx on public.projects (guest_token);

-- 5. Outfit curations (generated boards + custom mixes for a project)
create table if not exists public.outfit_curations (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects (id) on delete cascade,
    item_ids text[] not null default '{}',
    total_price_minor integer not null default 0,
    shipping_total_minor integer not null default 0,
    compatibility_score numeric(5, 2) not null default 0,
    is_custom_mix boolean not null default false,
    created_at timestamptz not null default now()
);
create index if not exists outfit_curations_project_id_idx on public.outfit_curations (project_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.vibe_profiles enable row level security;
alter table public.projects enable row level security;
alter table public.outfit_curations enable row level security;
alter table public.products enable row level security;

-- Products: readable by anyone (public catalog), writes only via service role (backend/workers).
create policy products_select_all on public.products for select using (true);

-- Profiles / vibe profiles: owner only.
create policy profiles_owner on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy vibe_profiles_owner on public.vibe_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Projects: owner only when authenticated. Guest projects (user_id null) are only ever
-- read/written through the backend's service-role key, which bypasses RLS, so no guest
-- policy is defined here on purpose.
create policy projects_owner on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Curations follow their parent project's ownership.
create policy outfit_curations_owner on public.outfit_curations for all
    using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()))
    with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
