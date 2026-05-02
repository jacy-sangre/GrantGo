-- Add structured application draft and requirement tracking

alter table if exists public.applications
  add column if not exists application_data jsonb default '{}'::jsonb,
  add column if not exists requirements jsonb default '{}'::jsonb;
