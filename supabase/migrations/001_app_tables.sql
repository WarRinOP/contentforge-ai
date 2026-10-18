-- ContentForge app table (additive and idempotent). RLS is on with no public policies.
create table if not exists cf_content (
  id                     uuid primary key default gen_random_uuid(),
  topic                  text not null,
  target_audience        text,
  content_type           text,
  tone                   text,
  target_keyword         text,
  secondary_keywords     jsonb not null default '[]'::jsonb,
  search_intent          text,
  recommended_word_count integer,
  outline                jsonb,
  meta_title             text,
  meta_description       text,
  og_title               text,
  og_description         text,
  full_draft             text,
  word_count             integer,
  status                 text not null default 'outlined',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists idx_cf_content_created on cf_content (created_at desc);
create index if not exists idx_cf_content_status  on cf_content (status);

alter table cf_content enable row level security;
