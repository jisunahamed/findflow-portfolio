create extension if not exists pgcrypto;

create table if not exists public.site_sections (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id text primary key,
  title text not null,
  status text not null default 'published',
  category text not null default 'others',
  featured boolean not null default false,
  tags text[] not null default '{}',
  image_url text not null default '',
  image_urls jsonb not null default '[]'::jsonb,
  description text not null default '',
  full_description text not null default '',
  project_link text not null default '',
  youtube_url text not null default '',
  "order" integer not null default 999,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  is_owner boolean not null default false,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null default '',
  service_key text not null,
  service_label text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'reviewed')),
  source text not null default 'website',
  webhook_delivery_status text not null default 'not_configured' check (webhook_delivery_status in ('not_configured', 'pending', 'delivered', 'failed')),
  webhook_delivered_at timestamptz,
  webhook_error text not null default '',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create table if not exists public.webhook_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  event_type text not null default 'contact_submission',
  endpoint_url text not null default '',
  method text not null default 'POST' check (method in ('GET', 'POST')),
  enabled boolean not null default false,
  secret_header text not null default '',
  notes text not null default '',
  last_triggered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_site_sections_updated_at on public.site_sections;
create trigger trg_site_sections_updated_at
before update on public.site_sections
for each row
execute function public.set_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at
before update on public.admin_users
for each row
execute function public.set_updated_at();

drop trigger if exists trg_webhook_settings_updated_at on public.webhook_settings;
create trigger trg_webhook_settings_updated_at
before update on public.webhook_settings
for each row
execute function public.set_updated_at();

alter table public.site_sections enable row level security;
alter table public.projects enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_access_requests enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.webhook_settings enable row level security;
