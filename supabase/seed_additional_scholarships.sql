-- Add 15+ additional scholarships for pagination testing
-- This script adds realistic scholarship data to support pagination (6 items per page)
-- Safe to run multiple times - uses "ON CONFLICT ... DO NOTHING"

-- Insert additional scholarships
with scholarship_data as (
  select *
  from (
    values
      (
        'Cebu City Government',
        'Cebu City Health Sciences Scholarship',
        'Scholarship support for Cebu City residents pursuing nursing, medicine, and allied health programs at accredited institutions.',
        65000,
        '2025-05-30',
        'https://www.cebucity.gov.ph/scholarship/health',
        'active'
      ),
      (
        'Cebu City Government',
        'Cebu City Education Scholarship Program',
        'Educational grant for Cebu City residents majoring in education and teacher training programs.',
        45000,
        '2025-06-15',
        'https://www.cebucity.gov.ph/scholarship/education',
        'active'
      ),
      (
        'Cebu Provincial Government',
        'Cebu Province Engineering Excellence Grant',
        'Scholarship for deserving students taking civil, electrical, mechanical, and computer engineering programs across Cebu Province.',
        85000,
        '2025-08-20',
        'https://cebu.gov.ph/engineering-grant',
        'active'
      ),
      (
        'Cebu Provincial Government',
        'Provincial Agriculture Development Scholarship',
        'Financial assistance for students pursuing agricultural science, agribusiness, and environmental management in Cebu Province.',
        50000,
        '2025-09-10',
        'https://cebu.gov.ph/agriculture-scholarship',
        'active'
      ),
      (
        'Cebu Provincial Government',
        'Cebu Province Women Empowerment Scholarship',
        'Dedicated scholarship program for women students from underprivileged backgrounds in Cebu Province.',
        55000,
        '2025-10-05',
        'https://cebu.gov.ph/women-empowerment',
        'active'
      ),
      (
        'Aboitiz Foundation',
        'Aboitiz Energy Sustainability Scholarship',
        'Merit-based scholarship for students pursuing renewable energy, environmental science, and sustainability studies.',
        70000,
        '2025-07-30',
        'https://aboitizfoundation.org/energy-scholarship',
        'active'
      ),
      (
        'Aboitiz Foundation',
        'Aboitiz Tech Innovation Scholars',
        'Scholarship for outstanding students in computer science, information technology, and software engineering programs.',
        80000,
        '2025-08-15',
        'https://aboitizfoundation.org/tech-scholars',
        'active'
      ),
      (
        'Aboitiz Foundation',
        'Aboitiz Financial Inclusion Scholarship',
        'Grants for students pursuing business, accounting, and financial management with community impact focus.',
        60000,
        '2025-09-01',
        'https://aboitizfoundation.org/financial-scholarship',
        'active'
      ),
      (
        'DOST Region VII',
        'DOST Engineering and Construction Technology Scholarship',
        'Specialized scholarship for students in construction technology, civil engineering, and project management.',
        90000,
        '2025-10-30',
        'https://region7.dost.gov.ph/engineering-scholarship',
        'active'
      ),
      (
        'DOST Region VII',
        'DOST Information Technology Excellence Program',
        'Merit scholarship for high-performing IT students pursuing software development and systems engineering in Central Visayas.',
        85000,
        '2025-11-15',
        'https://region7.dost.gov.ph/it-excellence',
        'active'
      ),
      (
        'Cebu City Government',
        'Cebu City Sports Excellence Scholarship',
        'Athletic scholarship for outstanding student-athletes from Cebu City competing in recognized sports programs.',
        40000,
        '2026-01-10',
        'https://www.cebucity.gov.ph/scholarship/sports',
        'active'
      ),
      (
        'Cebu City Government',
        'Cebu City Arts and Culture Scholarship',
        'Support for talented students pursuing music, visual arts, performing arts, and cultural studies.',
        35000,
        '2026-02-20',
        'https://www.cebucity.gov.ph/scholarship/arts',
        'active'
      ),
      (
        'Cebu Provincial Government',
        'Provincial Tourism and Hospitality Scholarship',
        'Educational grants for students in hospitality management, culinary arts, and tourism programs.',
        48000,
        '2026-03-15',
        'https://cebu.gov.ph/tourism-hospitality',
        'active'
      ),
      (
        'Aboitiz Foundation',
        'Aboitiz Legal and Governance Scholars Program',
        'Scholarship for law, political science, and public administration students committed to nation-building.',
        75000,
        '2026-04-25',
        'https://aboitizfoundation.org/legal-governance',
        'active'
      ),
      (
        'DOST Region VII',
        'DOST Applied Physics and Materials Science Scholarship',
        'Research-focused scholarship for students pursuing physics, materials science, and advanced engineering applications.',
        95000,
        '2026-05-30',
        'https://region7.dost.gov.ph/physics-scholarship',
        'active'
      ),
      (
        'Cebu City Government',
        'Cebu City Social Work Leadership Scholarship',
        'Grants for social work and psychology students from Cebu City committed to community development.',
        42000,
        '2026-06-10',
        'https://www.cebucity.gov.ph/scholarship/social-work',
        'active'
      ),
      (
        'Cebu Provincial Government',
        'Cebu Province Environmental Conservation Scholarship',
        'Scholarship for environmental science, forestry, and conservation-focused undergraduate programs.',
        52000,
        '2026-07-05',
        'https://cebu.gov.ph/environment-conservation',
        'active'
      )
  ) as s(provider_name, title, description, amount, deadline, application_link, status)
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
    p.id as provider_id,
    s.title,
    s.description,
    s.amount::numeric(12,2),
    s.deadline::date,
    s.application_link,
    s.status::public.scholarship_status
  from scholarship_data s
  join public.providers p on p.name = s.provider_name
  where not exists (
    select 1
    from public.scholarships existing
    where existing.title = s.title
      and existing.provider_id = p.id
  )
  returning id, title, provider_id
)
select 
  count(*) as new_scholarships_inserted,
  now() as timestamp
from upsert_scholarships;

-- Associate new scholarships with regions
with new_scholarship_mappings as (
  select *
  from (
    values
      ('Cebu City Health Sciences Scholarship', 'Cebu City'),
      ('Cebu City Health Sciences Scholarship', 'Mandaue City'),
      ('Cebu City Education Scholarship Program', 'Cebu City'),
      ('Cebu Province Engineering Excellence Grant', 'Cebu Province'),
      ('Cebu Province Engineering Excellence Grant', 'Lapu-Lapu City'),
      ('Provincial Agriculture Development Scholarship', 'Cebu Province'),
      ('Cebu Province Women Empowerment Scholarship', 'Cebu Province'),
      ('Aboitiz Energy Sustainability Scholarship', 'Cebu City'),
      ('Aboitiz Energy Sustainability Scholarship', 'Mandaue City'),
      ('Aboitiz Tech Innovation Scholars', 'Cebu City'),
      ('Aboitiz Tech Innovation Scholars', 'Mandaue City'),
      ('Aboitiz Tech Innovation Scholars', 'Lapu-Lapu City'),
      ('Aboitiz Financial Inclusion Scholarship', 'Cebu Province'),
      ('DOST Engineering and Construction Technology Scholarship', 'Cebu City'),
      ('DOST Engineering and Construction Technology Scholarship', 'Mandaue City'),
      ('DOST Engineering and Construction Technology Scholarship', 'Lapu-Lapu City'),
      ('DOST Information Technology Excellence Program', 'Cebu Province'),
      ('Cebu City Sports Excellence Scholarship', 'Cebu City'),
      ('Cebu City Arts and Culture Scholarship', 'Cebu City'),
      ('Provincial Tourism and Hospitality Scholarship', 'Cebu Province'),
      ('Provincial Tourism and Hospitality Scholarship', 'Lapu-Lapu City'),
      ('Aboitiz Legal and Governance Scholars Program', 'Cebu City'),
      ('DOST Applied Physics and Materials Science Scholarship', 'Cebu Province'),
      ('Cebu City Social Work Leadership Scholarship', 'Cebu City'),
      ('Cebu Province Environmental Conservation Scholarship', 'Cebu Province')
  ) as m(scholarship_title, region_name)
),
resolved_region_mapping as (
  select
    s.id as scholarship_id,
    r.id as region_id
  from new_scholarship_mappings m
  join public.scholarships s on s.title = m.scholarship_title
  join public.regions r on r.region_name = m.region_name
)
insert into public.scholarship_regions (scholarship_id, region_id)
select scholarship_id, region_id
from resolved_region_mapping
on conflict (scholarship_id, region_id) do nothing;

-- Associate new scholarships with categories
with new_category_mappings as (
  select *
  from (
    values
      ('Cebu City Health Sciences Scholarship', 'Merit-Based'),
      ('Cebu City Health Sciences Scholarship', 'Need-Based'),
      ('Cebu City Education Scholarship Program', 'Merit-Based'),
      ('Cebu Province Engineering Excellence Grant', 'STEM'),
      ('Cebu Province Engineering Excellence Grant', 'Merit-Based'),
      ('Provincial Agriculture Development Scholarship', 'Need-Based'),
      ('Provincial Agriculture Development Scholarship', 'STEM'),
      ('Cebu Province Women Empowerment Scholarship', 'Need-Based'),
      ('Cebu Province Women Empowerment Scholarship', 'Leadership'),
      ('Aboitiz Energy Sustainability Scholarship', 'STEM'),
      ('Aboitiz Energy Sustainability Scholarship', 'Research'),
      ('Aboitiz Tech Innovation Scholars', 'STEM'),
      ('Aboitiz Tech Innovation Scholars', 'Merit-Based'),
      ('Aboitiz Financial Inclusion Scholarship', 'Business'),
      ('Aboitiz Financial Inclusion Scholarship', 'Leadership'),
      ('DOST Engineering and Construction Technology Scholarship', 'STEM'),
      ('DOST Engineering and Construction Technology Scholarship', 'Research'),
      ('DOST Information Technology Excellence Program', 'STEM'),
      ('DOST Information Technology Excellence Program', 'Merit-Based'),
      ('Cebu City Sports Excellence Scholarship', 'Leadership'),
      ('Cebu City Arts and Culture Scholarship', 'Merit-Based'),
      ('Provincial Tourism and Hospitality Scholarship', 'Business'),
      ('Provincial Tourism and Hospitality Scholarship', 'Need-Based'),
      ('Aboitiz Legal and Governance Scholars Program', 'Public Service'),
      ('Aboitiz Legal and Governance Scholars Program', 'Leadership'),
      ('DOST Applied Physics and Materials Science Scholarship', 'STEM'),
      ('DOST Applied Physics and Materials Science Scholarship', 'Research'),
      ('Cebu City Social Work Leadership Scholarship', 'Community Service'),
      ('Cebu City Social Work Leadership Scholarship', 'Public Service'),
      ('Cebu Province Environmental Conservation Scholarship', 'STEM'),
      ('Cebu Province Environmental Conservation Scholarship', 'Research')
  ) as x(scholarship_title, category_name)
),
resolved_category_mapping as (
  select
    s.id as scholarship_id,
    c.id as category_id
  from new_category_mappings m
  join public.scholarships s on s.title = m.scholarship_title
  join public.categories c on c.category_name = m.category_name
)
insert into public.scholarship_categories (scholarship_id, category_id)
select scholarship_id, category_id
from resolved_category_mapping
on conflict (scholarship_id, category_id) do nothing;

-- Display summary
select 
  count(*) as total_scholarships,
  count(case when status = 'active' then 1 end) as active_scholarships,
  count(case when status = 'draft' then 1 end) as draft_scholarships
from public.scholarships;
