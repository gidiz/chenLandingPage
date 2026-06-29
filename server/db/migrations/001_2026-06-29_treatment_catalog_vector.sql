create extension if not exists vector;
create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists treatment_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_title text not null,
  description text not null,
  eyebrow text not null,
  intro text not null,
  seo_title text not null,
  seo_description text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists treatment_services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references treatment_categories(id) on delete cascade,
  slug text not null,
  title text not null,
  short_title text not null,
  nav_title text not null,
  description text not null,
  short_description text not null,
  summary text not null,
  suitability text not null,
  process text not null,
  expectations text not null,
  cta_label text not null,
  seo_title text not null,
  seo_description text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

create table if not exists treatment_questions (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references treatment_services(id) on delete cascade,
  title text not null,
  answer text not null,
  display_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, display_order)
);

create table if not exists treatment_content_chunks (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references treatment_categories(id) on delete cascade,
  service_id uuid not null references treatment_services(id) on delete cascade,
  question_id uuid references treatment_questions(id) on delete cascade,
  category_slug text not null,
  service_slug text not null,
  section_type text not null,
  section_key text not null,
  source_table text not null,
  source_id uuid,
  content_text text not null,
  content_html text,
  embedding vector(1536),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, section_type, section_key)
);

alter table treatment_categories disable row level security;
alter table treatment_services disable row level security;
alter table treatment_questions disable row level security;
alter table treatment_content_chunks disable row level security;

create trigger treatment_categories_set_updated_at
before update on treatment_categories
for each row
execute function set_updated_at();

create trigger treatment_services_set_updated_at
before update on treatment_services
for each row
execute function set_updated_at();

create trigger treatment_questions_set_updated_at
before update on treatment_questions
for each row
execute function set_updated_at();

create trigger treatment_content_chunks_set_updated_at
before update on treatment_content_chunks
for each row
execute function set_updated_at();

create index if not exists idx_treatment_categories_slug
  on treatment_categories (slug);

create index if not exists idx_treatment_services_category_slug
  on treatment_services (category_id, slug);

create index if not exists idx_treatment_questions_service
  on treatment_questions (service_id);

create index if not exists idx_treatment_content_chunks_route
  on treatment_content_chunks (category_slug, service_slug, section_type);

create index if not exists idx_treatment_content_chunks_embedding
  on treatment_content_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100)
  where embedding is not null;

create or replace function match_treatment_content(
  query_embedding vector(1536),
  match_count integer default 10,
  match_category_slug text default null,
  match_service_slug text default null
)
returns table (
  id uuid,
  category_slug text,
  service_slug text,
  section_type text,
  section_key text,
  content_text text,
  similarity double precision
)
language sql
stable
as $$
  select
    c.id,
    c.category_slug,
    c.service_slug,
    c.section_type,
    c.section_key,
    c.content_text,
    1 - (c.embedding <=> query_embedding) as similarity
  from treatment_content_chunks c
  where c.embedding is not null
    and (match_category_slug is null or c.category_slug = match_category_slug)
    and (match_service_slug is null or c.service_slug = match_service_slug)
  order by c.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
