-- Application messages (applicant <-> agent)
create table if not exists public.application_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  application_id uuid not null references public.applications(id) on delete cascade,
  sender text not null check (sender in ('applicant','agent')),
  body text not null,
  -- Optional metadata for admin/agent identification
  author_user_id uuid references auth.users(id),
  author_role text check (author_role in ('superadmin','agent'))
);

alter table public.application_messages enable row level security;
drop policy if exists application_messages_select on public.application_messages;
drop policy if exists application_messages_insert on public.application_messages;
create policy application_messages_select on public.application_messages for select using (true);
create policy application_messages_insert on public.application_messages for insert with check (true);

-- Application documents metadata
create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  application_id uuid not null references public.applications(id) on delete cascade,
  file_name text not null,
  storage_path text not null
);

alter table public.application_documents enable row level security;
drop policy if exists application_documents_select on public.application_documents;
drop policy if exists application_documents_insert on public.application_documents;
create policy application_documents_select on public.application_documents for select using (true);
create policy application_documents_insert on public.application_documents for insert with check (true);

-- Storage bucket note: create bucket "application-docs" in Supabase Storage with public=false

