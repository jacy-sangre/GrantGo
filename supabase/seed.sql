insert into public.regions (region_name)
values
  ('NCR'),
  ('CAR'),
  ('Region I'),
  ('Region II'),
  ('Region III'),
  ('Region IV-A'),
  ('Region IV-B'),
  ('Region V'),
  ('Region VI'),
  ('Region VII'),
  ('Region VIII'),
  ('Region IX'),
  ('Region X'),
  ('Region XI'),
  ('Region XII'),
  ('Region XIII'),
  ('BARMM')
on conflict (region_name) do nothing;

insert into public.categories (category_name)
values
  ('STEM'),
  ('Arts and Humanities'),
  ('Business'),
  ('Athletics'),
  ('Community Service'),
  ('Research'),
  ('Need-Based'),
  ('Merit-Based')
on conflict (category_name) do nothing;
