-- Enable RLS and add policies for applications table

alter table public.applications enable row level security;

-- Users can read their own applications
drop policy if exists "users can read own applications" on public.applications;
create policy "users can read own applications"
on public.applications
for select
using (auth.uid() = user_id);

-- Users can insert their own applications
drop policy if exists "users can insert own applications" on public.applications;
create policy "users can insert own applications"
on public.applications
for insert
with check (auth.uid() = user_id);

-- Users can update their own applications
drop policy if exists "users can update own applications" on public.applications;
create policy "users can update own applications"
on public.applications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Users can delete their own applications
drop policy if exists "users can delete own applications" on public.applications;
create policy "users can delete own applications"
on public.applications
for delete
using (auth.uid() = user_id);

-- Admins can read all applications
drop policy if exists "admins can read all applications" on public.applications;
create policy "admins can read all applications"
on public.applications
for select
using (public.is_admin());
