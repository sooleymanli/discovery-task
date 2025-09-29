-- Calculator quote logs table to persist each server-side calculation
create table if not exists public.calculator_quote_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null references auth.users(id) on delete set null,
  config_id uuid null references public.calculator_config(id) on delete set null,
  config_version text null,
  age int not null,
  gender text not null check (gender in ('male','female')),
  coverage_amount numeric not null,
  term_years int not null,
  smoker boolean not null default false,
  premium numeric not null,
  source text null
);

alter table public.calculator_quote_logs enable row level security;

-- RLS policies
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'calculator_quote_logs' and policyname = 'quote_logs_insert'
  ) then
    create policy quote_logs_insert on public.calculator_quote_logs for insert with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'calculator_quote_logs' and policyname = 'quote_logs_select_own'
  ) then
    create policy quote_logs_select_own on public.calculator_quote_logs for select using (
      user_id is null or user_id = auth.uid()
    );
  end if;
end $$;

grant select, insert on public.calculator_quote_logs to anon, authenticated;

