-- Cebu-focused scholarship seed data for GrantGo
-- Safe to run multiple times.

-- 0) Categories
insert into public.categories (category_name)
values
  ('STEM'),
  ('Business'),
  ('Public Service'),
  ('Need-Based'),
  ('Merit-Based'),
  ('Leadership'),
  ('Community Service'),
  ('Research')
on conflict (category_name) do nothing;

-- 1) Regions
insert into public.regions (region_name)
values
  ('Cebu City'),
  ('Mandaue City'),
  ('Lapu-Lapu City'),
  ('Cebu Province')
on conflict (region_name) do nothing;

-- 2) Providers
insert into public.providers (name, description, website_url, logo_url)
values
  (
    'Cebu City Government',
    'Local government unit scholarship and education assistance programs for Cebu City residents.',
    'https://www.cebucity.gov.ph',
    null
  ),
  (
    'Cebu Provincial Government',
    'Provincial scholarship grants and educational support for qualified Cebu Province students.',
    'https://cebu.gov.ph',
    null
  ),
  (
    'Aboitiz Foundation',
    'Corporate foundation supporting leadership, STEM, and community-focused tertiary education.',
    'https://aboitizfoundation.org',
    null
  ),
  (
    'DOST Region VII',
    'Science and technology scholarship programs administered by DOST for Central Visayas.',
    'https://region7.dost.gov.ph',
    null
  )
on conflict (name) do update
set
  description = excluded.description,
  website_url = excluded.website_url,
  logo_url = excluded.logo_url,
  updated_at = timezone('utc', now());

-- 3) Scholarships (at least 5 realistic entries)
with scholarship_data as (
  select
    p.id as provider_id,
    s.title,
    s.description,
    s.amount::numeric(12,2) as amount,
    s.deadline::date as deadline,
    s.application_link,
    s.status::public.scholarship_status as status
  from (
    values
      (
        'Cebu City Government',
        'Cebu City College Scholarship',
        'Tuition and allowance support for academically qualified Cebu City residents enrolled in partner colleges and universities.',
        50000,
        '2025-06-30',
        'https://www.cebucity.gov.ph/scholarship/college',
        'active'
      ),
      (
        'Cebu Provincial Government',
        'Cebu Province Educational Assistance Grant',
        'Financial aid for underprivileged but deserving students from municipalities across Cebu Province.',
        40000,
        '2025-07-15',
        'https://cebu.gov.ph/education-assistance',
        'active'
      ),
      (
        'Aboitiz Foundation',
        'Aboitiz College Leaders Program',
        'Leadership and academic scholarship for high-potential Cebuano students in priority degree programs.',
        75000,
        '2025-08-31',
        'https://aboitizfoundation.org/programs/college-leaders',
        'active'
      ),
      (
        'DOST Region VII',
        'DOST Science and Tech Scholarship - Region VII',
        'Merit scholarship for students pursuing priority science, engineering, and technology courses in Central Visayas.',
        80000,
        '2025-09-15',
        'https://region7.dost.gov.ph/scholarships',
        'active'
      ),
      (
        'Cebu City Government',
        'Cebu City STEM Excellence Scholarship',
        'Scholarship support for Cebu City students taking STEM-related undergraduate programs.',
        60000,
        '2025-10-15',
        'https://www.cebucity.gov.ph/scholarship/stem',
        'active'
      ),
      (
        'Cebu Provincial Government',
        'Governor''s Scholarship for Public Service',
        'Academic grant for students committed to public service and community leadership in Cebu Province.',
        55000,
        '2025-11-30',
        'https://cebu.gov.ph/governors-scholarship',
        'draft'
      )
  ) as s(provider_name, title, description, amount, deadline, application_link, status)
  join public.providers p on p.name = s.provider_name
),
upsert_scholarships as (
  insert into public.scholarships (
    provider_id,
    title,
    description,
    amount,
    deadline,
    application_link,
    status
  )
  select
    provider_id,
    title,
    description,
    amount,
    deadline,
    application_link,
    status
  from scholarship_data sd
  where not exists (
    select 1
    from public.scholarships existing
    where existing.title = sd.title
      and existing.provider_id = sd.provider_id
  )
  returning id, title
)
select count(*) as inserted_scholarships from upsert_scholarships;

-- 4) Scholarship-to-region mapping
with mapping_data as (
  select *
  from (
    values
      ('Cebu City College Scholarship', 'Cebu City'),
      ('Cebu City College Scholarship', 'Mandaue City'),
      ('Cebu Province Educational Assistance Grant', 'Cebu Province'),
      ('Cebu Province Educational Assistance Grant', 'Lapu-Lapu City'),
      ('Aboitiz College Leaders Program', 'Cebu City'),
      ('Aboitiz College Leaders Program', 'Mandaue City'),
      ('Aboitiz College Leaders Program', 'Lapu-Lapu City'),
      ('Aboitiz College Leaders Program', 'Cebu Province'),
      ('DOST Science and Tech Scholarship - Region VII', 'Cebu City'),
      ('DOST Science and Tech Scholarship - Region VII', 'Mandaue City'),
      ('DOST Science and Tech Scholarship - Region VII', 'Lapu-Lapu City'),
      ('DOST Science and Tech Scholarship - Region VII', 'Cebu Province'),
      ('Cebu City STEM Excellence Scholarship', 'Cebu City'),
      ('Cebu City STEM Excellence Scholarship', 'Lapu-Lapu City'),
      ('Governor''s Scholarship for Public Service', 'Cebu Province')
  ) as m(scholarship_title, region_name)
),
resolved_mapping as (
  select
    s.id as scholarship_id,
    r.id as region_id
  from mapping_data m
  join public.scholarships s on s.title = m.scholarship_title
  join public.regions r on r.region_name = m.region_name
)
insert into public.scholarship_regions (scholarship_id, region_id)
select scholarship_id, region_id
from resolved_mapping
on conflict (scholarship_id, region_id) do nothing;

-- 5) Scholarship-to-category mapping
with category_mapping as (
  select *
  from (
    values
      ('Cebu City College Scholarship', 'Need-Based'),
      ('Cebu City College Scholarship', 'Merit-Based'),
      ('Cebu City College Scholarship', 'Community Service'),
      ('Cebu Province Educational Assistance Grant', 'Need-Based'),
      ('Cebu Province Educational Assistance Grant', 'Public Service'),
      ('Aboitiz College Leaders Program', 'Leadership'),
      ('Aboitiz College Leaders Program', 'Business'),
      ('Aboitiz College Leaders Program', 'Merit-Based'),
      ('DOST Science and Tech Scholarship - Region VII', 'STEM'),
      ('DOST Science and Tech Scholarship - Region VII', 'Research'),
      ('DOST Science and Tech Scholarship - Region VII', 'Merit-Based'),
      ('Cebu City STEM Excellence Scholarship', 'STEM'),
      ('Cebu City STEM Excellence Scholarship', 'Merit-Based'),
      ('Governor''s Scholarship for Public Service', 'Public Service'),
      ('Governor''s Scholarship for Public Service', 'Leadership')
  ) as x(scholarship_title, category_name)
),
resolved_category_mapping as (
  select
    s.id as scholarship_id,
    c.id as category_id
  from category_mapping m
  join public.scholarships s on s.title = m.scholarship_title
  join public.categories c on c.category_name = m.category_name
)
insert into public.scholarship_categories (scholarship_id, category_id)
select scholarship_id, category_id
from resolved_category_mapping
on conflict (scholarship_id, category_id) do nothing;

-- 6) Optional helper checks (read-only outputs)
-- Uncomment and run separately if needed:
-- select count(*) as total_regions from public.regions;
-- select count(*) as total_categories from public.categories;
-- select count(*) as total_providers from public.providers;
-- select count(*) as total_scholarships from public.scholarships;
-- select count(*) as total_scholarship_regions from public.scholarship_regions;
-- select count(*) as total_scholarship_categories from public.scholarship_categories;
