-- Split full_name into first_name and last_name for better data management

-- Add new columns with defaults
alter table if exists public.profiles
  add column if not exists first_name text default 'User',
  add column if not exists last_name text default 'Account';

-- Migrate existing data from full_name to first_name and last_name
update public.profiles
set 
  first_name = coalesce(nullif(split_part(full_name, ' ', 1), ''), 'User'),
  last_name = coalesce(
    nullif(ltrim(substr(full_name, length(split_part(full_name, ' ', 1)) + 2)), ''),
    split_part(full_name, ' ', 1),
    'Account'
  )
where full_name is not null;

-- Ensure no null values remain
update public.profiles
set first_name = 'User'
where first_name is null;

update public.profiles
set last_name = 'Account'
where last_name is null;

-- Add NOT NULL constraint after migration
alter table public.profiles
  alter column first_name set not null,
  alter column last_name set not null;

-- Create index for searching by name
create index if not exists idx_profiles_first_name on public.profiles(first_name);
create index if not exists idx_profiles_last_name on public.profiles(last_name);
