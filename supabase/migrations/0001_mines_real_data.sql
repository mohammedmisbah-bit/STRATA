-- STRATA · 0001 · Clean the mine roster and open it for read-only public access.
--
-- Run once in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run: every step is idempotent.
--
-- What it does
--   1. Adds the provenance columns the app reads (slug, ore_profile, ...).
--   2. Removes duplicate mine rows (each mine was inserted twice).
--   3. Writes the corrected values:
--        depth / type / ore / note  → MOIL SEBI / NSE corporate filings
--        Balaghat + Chikla coords   → mapped OpenStreetMap features operated by MOIL
--        Dongri Buzurg, Kandri, Ukwa → approximate centroids
--        monthly targets            → placeholders (MOIL does not publish per-mine targets)
--   4. Row Level Security: the browser (anon key) may READ these tables and
--      nothing else. Inserts / updates / deletes only work with the
--      service-role key, which never ships to the browser.

begin;

-- 1. Columns -----------------------------------------------------------------
alter table public.mines add column if not exists slug text;
alter table public.mines add column if not exists monthly_target_tonnes numeric;
alter table public.mines add column if not exists ore_profile text;
alter table public.mines add column if not exists official_source text;
alter table public.mines add column if not exists operational_note text;
alter table public.mines add column if not exists coordinate_source text;

-- 2. Duplicates: keep one row per mine name ------------------------------------
delete from public.mines as dup
using public.mines as keep
where dup.name = keep.name
  and dup.id > keep.id;

-- 3. Corrected values ------------------------------------------------------------
update public.mines set
  slug = 'balaghat', mine_type = 'Underground', depth_meters = 385,
  latitude = 21.8502, longitude = 80.2274, monthly_target_tonnes = 25000,
  ore_profile = 'High-grade Mn > 44%',
  official_source = 'MOIL SEBI / NSE Corporate Filings',
  operational_note = 'Deepest underground manganese mine in Asia',
  coordinate_source = 'OpenStreetMap: Bharveli Manganese Mines (operator MOIL)'
where name = 'Balaghat Mine';

update public.mines set
  slug = 'dongri-buzurg', mine_type = 'Opencast', depth_meters = 120,
  latitude = 21.5583, longitude = 79.7167, monthly_target_tonnes = 18000,
  ore_profile = 'Manganese dioxide (MnO₂) ore',
  official_source = 'MOIL SEBI / NSE Corporate Filings',
  operational_note = 'Opencast-to-underground transition',
  coordinate_source = 'Approximate centroid'
where name = 'Dongri Buzurg Mine';

update public.mines set
  slug = 'chikla', mine_type = 'Underground', depth_meters = 180,
  latitude = 21.5385, longitude = 79.7523, monthly_target_tonnes = 9500,
  ore_profile = 'Manganese ore (Sausar Group)',
  official_source = 'MOIL SEBI / NSE Corporate Filings',
  operational_note = null,
  coordinate_source = 'OpenStreetMap: MOIL Chikala Mines'
where name = 'Chikla Mine';

update public.mines set
  slug = 'kandri', mine_type = 'Underground', depth_meters = 160,
  latitude = 21.3667, longitude = 79.2667, monthly_target_tonnes = 6800,
  ore_profile = 'Manganese ore (Sausar Group)',
  official_source = 'MOIL SEBI / NSE Corporate Filings',
  operational_note = null,
  coordinate_source = 'Approximate centroid'
where name = 'Kandri Mine';

update public.mines set
  slug = 'ukwa', mine_type = 'Underground', depth_meters = 150,
  latitude = 21.9667, longitude = 80.4667, monthly_target_tonnes = 7200,
  ore_profile = 'Manganese ore (Sausar Group)',
  official_source = 'MOIL SEBI / NSE Corporate Filings',
  operational_note = 'Underground slope (incline) mine',
  coordinate_source = 'Approximate centroid'
where name = 'Ukwa Mine';

create unique index if not exists mines_slug_key on public.mines (slug);

-- 4. Row Level Security: public read-only -------------------------------------------
alter table public.mines enable row level security;
alter table public.production_logs enable row level security;
alter table public.prospectivity_grid enable row level security;

drop policy if exists "Public read" on public.mines;
create policy "Public read" on public.mines
  for select to anon, authenticated using (true);

drop policy if exists "Public read" on public.production_logs;
create policy "Public read" on public.production_logs
  for select to anon, authenticated using (true);

drop policy if exists "Public read" on public.prospectivity_grid;
create policy "Public read" on public.prospectivity_grid
  for select to anon, authenticated using (true);

commit;

-- Check: should return 5 rows, one per mine.
select slug, name, mine_type, depth_meters, latitude, longitude, coordinate_source
from public.mines
order by slug;
