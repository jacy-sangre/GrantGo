-- Add student institution support and richer scholarship metadata

alter table if exists public.profiles
  add column if not exists institution text;

alter table if exists public.scholarships
  add column if not exists requirements text,
  add column if not exists application_period_start date,
  add column if not exists application_period_end date,
  add column if not exists exam_required boolean not null default false,
  add column if not exists exam_date date,
  add column if not exists deadline date,
  add column if not exists application_status text;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  status text not null default 'submitted',
  applied_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
