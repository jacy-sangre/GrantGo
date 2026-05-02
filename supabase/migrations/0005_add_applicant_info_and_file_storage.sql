-- Add applicant info and file storage support to applications

alter table public.applications
  add column if not exists applicant_info jsonb default '{}'::jsonb,
  add column if not exists uploaded_files jsonb default '[]'::jsonb;

-- Create storage bucket for application documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'application-documents',
  'application-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

-- RLS policy for application documents storage
drop policy if exists "users can upload their own application documents" on storage.objects;
create policy "users can upload their own application documents"
on storage.objects
for insert
with check (bucket_id = 'application-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "users can read their own application documents" on storage.objects;
create policy "users can read their own application documents"
on storage.objects
for select
using (bucket_id = 'application-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "admins can read all application documents" on storage.objects;
create policy "admins can read all application documents"
on storage.objects
for select
using (bucket_id = 'application-documents' AND public.is_admin());
