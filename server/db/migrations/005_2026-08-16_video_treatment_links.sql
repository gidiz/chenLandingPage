-- video_categories: many-to-many between clinic_videos and treatment_categories
create table if not exists video_categories (
  video_id    uuid not null references clinic_videos(id)         on delete cascade,
  category_id uuid not null references treatment_categories(id)  on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (video_id, category_id)
);

alter table video_categories disable row level security;

create index if not exists idx_video_categories_video_id
  on video_categories (video_id);

create index if not exists idx_video_categories_category_id
  on video_categories (category_id);

-- video_services: many-to-many between clinic_videos and treatment_services
create table if not exists video_services (
  video_id   uuid not null references clinic_videos(id)       on delete cascade,
  service_id uuid not null references treatment_services(id)  on delete cascade,
  created_at timestamptz not null default now(),
  primary key (video_id, service_id)
);

alter table video_services disable row level security;

create index if not exists idx_video_services_video_id
  on video_services (video_id);

create index if not exists idx_video_services_service_id
  on video_services (service_id);

-- Seed video_categories from the existing denormalized categoriesBySlug text[] column
insert into video_categories (video_id, category_id)
select
  cv.id,
  tc.id
from clinic_videos cv
cross join lateral unnest(cv."categoriesBySlug") as slug_val
join treatment_categories tc on tc.slug = slug_val
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Seed video_services based on content analysis of each video description.
-- Only services with confirmed slugs in treatment_services are included.
-- The exists() guard makes the insert a graceful no-op when the catalog has
-- not yet been seeded.
-- ---------------------------------------------------------------------------

-- service: injectables / botox-expression-lines
-- Videos clearly focused on botox wrinkle treatment / maintenance / timing.
with target_service as (
  select ts.id
  from treatment_services ts
  join treatment_categories tc on tc.id = ts.category_id
  where ts.slug = 'botox-expression-lines'
    and tc.slug  = 'injectables'
)
insert into video_services (video_id, service_id)
select cv.id, (select id from target_service)
from clinic_videos cv
where cv.url in (
  -- "באיזה גיל כדאי להתחיל בוטוקס?"
  'https://www.youtube.com/watch?v=hzniQVbtebk',
  -- "המטופלת הכי חשובה שלי: אמא בת 70" (botox + HA + morpheus combo plan)
  'https://www.youtube.com/watch?v=HrGKrquijww',
  -- "למה תחזוקה היא הסוד לתוצאה טבעית?" (botox maintenance cadence)
  'https://www.youtube.com/watch?v=bdBkI67T8Ls',
  -- "אל תחכו לרגע האחרון! בוטוקס לפני אירוע"
  'https://www.youtube.com/watch?v=xizmXliVwGk',
  -- "הקמטים חזרו! אבל יש סיבה טובה" (botox pause while breastfeeding)
  'https://www.youtube.com/watch?v=EedmwwMicDw'
)
and exists (select 1 from target_service)
on conflict do nothing;

-- service: technology / rf-microneedling  (Morpheus 8)
-- Videos focused on Morpheus 8 RF microneedling treatment.
with target_service as (
  select ts.id
  from treatment_services ts
  join treatment_categories tc on tc.id = ts.category_id
  where ts.slug = 'rf-microneedling'
    and tc.slug  = 'technology'
)
insert into video_services (video_id, service_id)
select cv.id, (select id from target_service)
from clinic_videos cv
where cv.url in (
  -- "השילוב המנצח: IPL ומורפיוס" (Morpheus8 + IPL combined protocol)
  'https://www.youtube.com/watch?v=l1q9oZDAw1g',
  -- "המטופלת הכי חשובה שלי: אמא בת 70" (Morpheus8 in treatment plan)
  'https://www.youtube.com/watch?v=HrGKrquijww'
)
and exists (select 1 from target_service)
on conflict do nothing;
