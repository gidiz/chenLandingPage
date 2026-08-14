create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists clinic_videos (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  title text not null,
  "desc" text not null default '',
  "shortDesc" text not null default '',
  "categoriesBySlug" text[] not null default '{}',
  "categoriesInHebrow" text[] not null default '{}',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table clinic_videos disable row level security;

drop trigger if exists clinic_videos_set_updated_at on clinic_videos;

create trigger clinic_videos_set_updated_at
before update on clinic_videos
for each row
execute function set_updated_at();

create index if not exists idx_clinic_videos_display_order
  on clinic_videos (display_order);

create index if not exists idx_clinic_videos_categories_by_slug
  on clinic_videos using gin ("categoriesBySlug");

create index if not exists idx_clinic_videos_categories_in_hebrow
  on clinic_videos using gin ("categoriesInHebrow");