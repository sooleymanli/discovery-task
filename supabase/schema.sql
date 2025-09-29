-- Enable required extensions
create extension if not exists pgcrypto;

-- Enums
create type application_status as enum ('pending', 'assigned', 'in_progress', 'closed');
create type user_role as enum ('superadmin', 'agent');

-- Profiles (maps to auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'agent',
  full_name text,
  email text,
  phone text,
  telegram_chat_id text,
  status text not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Quotes
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  age int not null,
  gender text check (gender in ('male','female')),
  coverage_amount numeric not null,
  term_years int not null,
  smoker boolean default false,
  premium_estimate numeric,
  source text,
  utm jsonb
);

-- Applications
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  quote_id uuid references quotes(id),
  full_name text,
  email text not null,
  phone text,
  age int,
  gender text check (gender in ('male','female')),
  coverage_amount numeric,
  term_years int,
  premium_estimate numeric,
  status application_status not null default 'pending',
  assigned_agent_id uuid references profiles(id),
  status_changed_at timestamp with time zone,
  assigned_at timestamp with time zone,
  assignee_changed_by uuid references profiles(id),
  source text,
  utm jsonb,
  consent_given boolean default false,
  notes text
);

-- Calculator config
create table if not exists calculator_config (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  version text not null,
  is_active boolean default false,
  effective_from timestamp with time zone,
  effective_to timestamp with time zone,
  description text,
  config jsonb not null
);

-- Analytics
create table if not exists analytics (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  timestamp timestamp with time zone default now(),
  source text,
  user_id uuid references profiles(id),
  application_id uuid references applications(id),
  quote_id uuid references quotes(id),
  event_properties jsonb
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  type text not null check (type in ('info', 'success', 'warning', 'error')),
  title text not null,
  message text not null,
  target_user_id uuid references profiles(id) on delete cascade,
  action_url text,
  read boolean default false
);

-- RLS
alter table profiles enable row level security;
alter table applications enable row level security;
alter table quotes enable row level security;
alter table analytics enable row level security;
alter table calculator_config enable row level security;
alter table notifications enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Applications policies
create policy "Agents read assigned applications" on applications for select using (assigned_agent_id = auth.uid());
create policy "Agents update assigned applications" on applications for update using (assigned_agent_id = auth.uid());
create policy "Public can insert applications" on applications for insert with check (true);

-- Quotes policies (allow insert via anon only if needed via function)
create policy "Users may insert quotes" on quotes for insert with check (true);

-- Calculator config read-only to all authenticated
create policy "Users can read calculator config" on calculator_config for select using (true);

-- Notifications policies
create policy "Users can view own notifications" on notifications for select using (target_user_id = auth.uid());
create policy "Users can update own notifications" on notifications for update using (target_user_id = auth.uid());
create policy "Read calculator config" on calculator_config for select using (true);
