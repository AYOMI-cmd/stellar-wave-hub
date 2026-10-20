-- Migration 009: Add reports for project and review moderation.
-- All access goes through the Next.js API using the service-role key.

begin;

create table if not exists public.reports (
  id          bigserial primary key,
  reporter_id bigint      not null,
  target_type text        not null check (target_type in ('project', 'review')),
  target_id   bigint      not null,
  reason      text        not null,
  details     text,
  status      text        not null default 'open'
    check (status in ('open', 'resolved', 'dismissed')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by bigint,

  constraint reports_reporter_id_fkey
    foreign key (reporter_id)
    references public.users ("numericId")
    on delete cascade,
  constraint reports_resolved_by_fkey
    foreign key (resolved_by)
    references public.users ("numericId")
    on delete set null
);

create index if not exists reports_status_created_at_idx
  on public.reports (status, created_at desc);
create index if not exists reports_target_idx
  on public.reports (target_type, target_id);

alter table public.reports enable row level security;

commit;
