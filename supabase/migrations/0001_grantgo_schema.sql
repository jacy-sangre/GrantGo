-- GrantGo foundational schema
create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'student');
  end if;

  if not exists (select 1 from pg_type where typname = 'scholarship_status') then
    create type public.scholarship_status as enum ('active', 'draft');
  end if;
end $$;

-- Timestamp helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Core lookups
create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  region_name text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  category_name text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  website_url text,
  logo_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Profiles tied to Supabase auth users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.app_role not null default 'student',
  region_id uuid references public.regions(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_profiles_region_id on public.profiles(region_id);
create index if not exists idx_profiles_role on public.profiles(role);

-- Scholarships
create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete restrict,
  title text not null,
  description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  deadline date,
  application_link text,
  status public.scholarship_status not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_scholarships_provider_id on public.scholarships(provider_id);
create index if not exists idx_scholarships_status on public.scholarships(status);
create index if not exists idx_scholarships_deadline on public.scholarships(deadline);
create index if not exists idx_scholarships_amount on public.scholarships(amount);
create index if not exists idx_scholarships_status_deadline on public.scholarships(status, deadline);

-- Many-to-many mappings
create table if not exists public.scholarship_regions (
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  region_id uuid not null references public.regions(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (scholarship_id, region_id)
);

create index if not exists idx_scholarship_regions_region_id on public.scholarship_regions(region_id);

create table if not exists public.scholarship_categories (
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (scholarship_id, category_id)
);

create index if not exists idx_scholarship_categories_category_id on public.scholarship_categories(category_id);

-- Saved scholarships
create table if not exists public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, scholarship_id)
);

create index if not exists idx_bookmarks_scholarship_id on public.bookmarks(scholarship_id);

-- Auto-updated timestamps
drop trigger if exists set_regions_updated_at on public.regions;
create trigger set_regions_updated_at
before update on public.regions
for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists set_providers_updated_at on public.providers;
create trigger set_providers_updated_at
before update on public.providers
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_scholarships_updated_at on public.scholarships;
create trigger set_scholarships_updated_at
before update on public.scholarships
for each row execute function public.set_updated_at();

-- Auth helper
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- Create profile row after signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'student'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS enablement
alter table public.regions enable row level security;
alter table public.categories enable row level security;
alter table public.providers enable row level security;
alter table public.profiles enable row level security;
alter table public.scholarships enable row level security;
alter table public.scholarship_regions enable row level security;
alter table public.scholarship_categories enable row level security;
alter table public.bookmarks enable row level security;

-- Regions policies
drop policy if exists "regions are readable by everyone" on public.regions;
create policy "regions are readable by everyone"
on public.regions
for select
using (true);

drop policy if exists "regions are writable by admins" on public.regions;
create policy "regions are writable by admins"
on public.regions
for all
using (public.is_admin())
with check (public.is_admin());

-- Categories policies
drop policy if exists "categories are readable by everyone" on public.categories;
create policy "categories are readable by everyone"
on public.categories
for select
using (true);

drop policy if exists "categories are writable by admins" on public.categories;
create policy "categories are writable by admins"
on public.categories
for all
using (public.is_admin())
with check (public.is_admin());

-- Providers policies
drop policy if exists "providers are readable by everyone" on public.providers;
create policy "providers are readable by everyone"
on public.providers
for select
using (true);

drop policy if exists "providers are writable by admins" on public.providers;
create policy "providers are writable by admins"
on public.providers
for all
using (public.is_admin())
with check (public.is_admin());

-- Profiles policies
drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "admins can read all profiles" on public.profiles;
create policy "admins can read all profiles"
on public.profiles
for select
using (public.is_admin());

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "admins can manage profiles" on public.profiles;
create policy "admins can manage profiles"
on public.profiles
for all
using (public.is_admin())
with check (public.is_admin());

-- Scholarships policies
drop policy if exists "active scholarships are public" on public.scholarships;
create policy "active scholarships are public"
on public.scholarships
for select
using (status = 'active');

drop policy if exists "admins can read all scholarships" on public.scholarships;
create policy "admins can read all scholarships"
on public.scholarships
for select
using (public.is_admin());

drop policy if exists "admins can manage scholarships" on public.scholarships;
create policy "admins can manage scholarships"
on public.scholarships
for all
using (public.is_admin())
with check (public.is_admin());

-- Scholarship regions policies
drop policy if exists "scholarship regions are readable by everyone" on public.scholarship_regions;
create policy "scholarship regions are readable by everyone"
on public.scholarship_regions
for select
using (true);

drop policy if exists "admins can manage scholarship regions" on public.scholarship_regions;
create policy "admins can manage scholarship regions"
on public.scholarship_regions
for all
using (public.is_admin())
with check (public.is_admin());

-- Scholarship categories policies
drop policy if exists "scholarship categories are readable by everyone" on public.scholarship_categories;
create policy "scholarship_categories are readable by everyone"
on public.scholarship_categories
for select
using (true);

drop policy if exists "admins can manage scholarship categories" on public.scholarship_categories;
create policy "admins can manage scholarship categories"
on public.scholarship_categories
for all
using (public.is_admin())
with check (public.is_admin());

-- Bookmarks policies
drop policy if exists "users can read own bookmarks" on public.bookmarks;
create policy "users can read own bookmarks"
on public.bookmarks
for select
using (auth.uid() = user_id);

drop policy if exists "users can insert own bookmarks" on public.bookmarks;
create policy "users can insert own bookmarks"
on public.bookmarks
for insert
with check (auth.uid() = user_id);

drop policy if exists "users can delete own bookmarks" on public.bookmarks;
create policy "users can delete own bookmarks"
on public.bookmarks
for delete
using (auth.uid() = user_id);

drop policy if exists "admins can read all bookmarks" on public.bookmarks;
create policy "admins can read all bookmarks"
on public.bookmarks
for select
using (public.is_admin());
