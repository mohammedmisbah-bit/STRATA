-- MOIL mine roster seed.
--
-- Mirrors FALLBACK_MINES in src/services/mineService.ts. Column names match
-- what normalizeRow() reads, so the dashboard picks these rows up unchanged.
--
-- Provenance:
--   depth_m, mine_type, ore_profile, operational_note — approximate figures from
--     MOIL SEBI / NSE corporate filings and IBM Indian Minerals Yearbook.
--     Rounded; re-check against the latest MOIL annual report.
--   latitude / longitude — approximate mine centroids.
--   monthly_target_tonnes — placeholders (MOIL does not publish per-mine targets).
--
-- Idempotent: safe to re-run. Existing tables keyed by UUID are extended, not
-- replaced. Row Level Security is NOT configured here; add a read policy for the
-- anon role separately if the browser client reads this table.

create table if not exists public.mines (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

alter table public.mines add column if not exists slug text;
alter table public.mines add column if not exists district text;
alter table public.mines add column if not exists state text;
alter table public.mines add column if not exists mine_type text;
alter table public.mines add column if not exists depth_m numeric;
alter table public.mines add column if not exists latitude numeric;
alter table public.mines add column if not exists longitude numeric;
alter table public.mines add column if not exists monthly_target_tonnes numeric;
alter table public.mines add column if not exists ore_profile text;
alter table public.mines add column if not exists official_source text;
alter table public.mines add column if not exists operational_note text;

create unique index if not exists mines_slug_key on public.mines (slug);

insert into public.mines (
  slug, name, district, state, mine_type, depth_m, latitude, longitude,
  monthly_target_tonnes, ore_profile, official_source, operational_note
) values
  ('balaghat', 'Balaghat Mine', 'Balaghat', 'Madhya Pradesh', 'underground', 385,
   21.8083, 80.1833, 25000, 'High-grade Mn > 44%',
   'MOIL SEBI / NSE Corporate Filings', 'Deepest underground manganese mine in Asia'),
  ('dongri-buzurg', 'Dongri Buzurg Mine', 'Bhandara', 'Maharashtra', 'opencast', 120,
   21.3833, 79.6167, 18000, 'Manganese dioxide (MnO₂) ore',
   'MOIL SEBI / NSE Corporate Filings', 'Opencast-to-underground transition'),
  ('chikla', 'Chikla Mine', 'Bhandara', 'Maharashtra', 'underground', 180,
   21.2500, 79.6500, 9500, 'Manganese ore (Sausar Group)',
   'MOIL SEBI / NSE Corporate Filings', null),
  ('kandri', 'Kandri Mine', 'Nagpur', 'Maharashtra', 'underground', 160,
   21.3167, 79.1500, 6800, 'Manganese ore (Sausar Group)',
   'MOIL SEBI / NSE Corporate Filings', null),
  ('ukwa', 'Ukwa Mine', 'Balaghat', 'Madhya Pradesh', 'underground', 150,
   21.9333, 80.4167, 7200, 'Manganese ore (Sausar Group)',
   'MOIL SEBI / NSE Corporate Filings', 'Underground slope (incline) mine')
on conflict (slug) do update set
  name = excluded.name,
  district = excluded.district,
  state = excluded.state,
  mine_type = excluded.mine_type,
  depth_m = excluded.depth_m,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  monthly_target_tonnes = excluded.monthly_target_tonnes,
  ore_profile = excluded.ore_profile,
  official_source = excluded.official_source,
  operational_note = excluded.operational_note;
