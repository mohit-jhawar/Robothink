-- RoboThink Collin County — Supabase schema
-- Safe to run multiple times (idempotent) — paste into Supabase SQL Editor
-- (Project > SQL Editor > New Query) and run any time you pull schema changes.

create extension if not exists "pgcrypto";

-- ==========================================================================
-- leads: free-trial signups, general inquiries, school partnership requests
-- ==========================================================================
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('trial', 'inquiry', 'school')),
  status text not null default 'new' check (status in ('new', 'contacted', 'enrolled', 'closed')),
  name text not null,
  email text not null,
  phone text,
  city text,
  message text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_type_idx on leads (type);
create index if not exists leads_status_idx on leads (status);

-- Widened to also accept the FLL team signup and theme-workshop inquiry forms.
alter table leads drop constraint if exists leads_type_check;
alter table leads add constraint leads_type_check check (type in ('trial', 'inquiry', 'school', 'fll_team_inquiry', 'theme_workshop_inquiry'));

-- ==========================================================================
-- pricing_plans: membership pricing (parents.html) & party packages (camps-parties.html)
-- ==========================================================================
create table if not exists pricing_plans (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'membership' check (category in ('membership', 'party')),
  name text not null,
  price_cents integer not null,
  billing_period text not null, -- e.g. 'cycle', 'mo', 'party'
  price_note text,
  features jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  cta_label text not null default 'Get Started',
  cta_href text not null default 'contact.html',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- billing_type: 'one_time' -> Stripe Checkout in payment mode.
--               'recurring' -> Stripe Checkout in subscription mode (monthly).
-- purchasable: false for cards that are just a navigational teaser (e.g. the
--              "Camps & Parties" card on parents.html that links out to
--              camps-parties.html instead of charging a fixed price).
alter table pricing_plans add column if not exists billing_type text not null default 'one_time' check (billing_type in ('one_time', 'recurring'));
alter table pricing_plans add column if not exists purchasable boolean not null default true;

create index if not exists pricing_plans_category_idx on pricing_plans (category, sort_order);

-- ==========================================================================
-- schedule_locations: class schedule table (parents.html)
-- ==========================================================================
create table if not exists schedule_locations (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  venue text not null,
  program text not null,
  day_time text not null,
  ages text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists schedule_locations_sort_idx on schedule_locations (sort_order);

-- ==========================================================================
-- program_sessions: dated, one-off sessions (camp weeks, FLL team sign-up
-- windows, themed workshop dates) shown as "Upcoming Dates" on the site and
-- managed from the admin dashboard. Distinct from schedule_locations, which
-- is the recurring weekly class grid.
-- ==========================================================================
create table if not exists program_sessions (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('camp', 'fll', 'workshop')),
  theme_slug text, -- only used for category='workshop'; matches ThemeDetailPage's :themeId
  title text not null,
  start_date date not null,
  end_date date,
  city text,
  venue text,
  ages text,
  spots_note text,
  registration_open boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Full detail-page content: a longer description and a photo, shown on the
-- dedicated /programs/:id page and as the card image on the Home page.
alter table program_sessions add column if not exists description text;
alter table program_sessions add column if not exists image_url text;

-- Online-registration fields (guest Stripe checkout).
--   price_cents: null => inquiry-only (no "Register & Pay" button, links to /contact).
--   capacity:    null => unlimited / no seat counter shown.
alter table program_sessions add column if not exists price_cents integer;
alter table program_sessions add column if not exists capacity integer;

create index if not exists program_sessions_category_idx on program_sessions (category, start_date);
create index if not exists program_sessions_theme_slug_idx on program_sessions (theme_slug);

-- ==========================================================================
-- registrations: guest (no-account) enrollments into a dated program_session,
-- paid via Stripe Checkout. Source of truth for "paid" is the Stripe webhook,
-- exactly like `orders`. "Seats left" = capacity − paid − recent-pending holds.
-- ==========================================================================
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references program_sessions(id) on delete cascade,
  parent_name text not null,
  parent_email text not null,
  parent_phone text,
  child_name text not null,
  child_age integer,
  city text,
  amount_cents integer not null,
  currency text not null default 'usd',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists registrations_session_idx on registrations (session_id, status);
create index if not exists registrations_checkout_idx on registrations (stripe_checkout_session_id);
create index if not exists registrations_created_idx on registrations (created_at desc);

alter table registrations enable row level security;

-- Public storage bucket for program_sessions.image_url uploads (admin dashboard
-- image picker uploads here via the service-role key; files are served publicly
-- since these are just marketing photos, not sensitive data).
insert into storage.buckets (id, name, public)
values ('program-images', 'program-images', true)
on conflict (id) do nothing;

-- ==========================================================================
-- profiles: one row per Supabase Auth user (parent or admin), extending
-- auth.users with app-specific fields. role is what requireAdmin checks.
-- ==========================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'parent' check (role in ('parent', 'admin')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on profiles (role);
create index if not exists profiles_stripe_customer_idx on profiles (stripe_customer_id);

-- ==========================================================================
-- children: kids a parent has added to their account (shown in the portal
-- and optionally attached to an order/subscription at checkout).
-- ==========================================================================
create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  age integer,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists children_parent_idx on children (parent_id);

-- ==========================================================================
-- orders: one-time purchases (8-week cycles, camps, birthday parties).
-- Source of truth is the Stripe webhook, not the checkout-session request.
-- ==========================================================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles(id) on delete cascade,
  plan_id uuid references pricing_plans(id) on delete set null,
  child_id uuid references children(id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_cents integer not null,
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_parent_idx on orders (parent_id, created_at desc);

-- ==========================================================================
-- subscriptions: recurring monthly memberships, mirrored from Stripe.
-- ==========================================================================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles(id) on delete cascade,
  plan_id uuid references pricing_plans(id) on delete set null,
  child_id uuid references children(id) on delete set null,
  stripe_subscription_id text unique not null,
  stripe_customer_id text not null,
  status text not null default 'incomplete' check (status in ('incomplete', 'active', 'past_due', 'canceled', 'trialing', 'unpaid')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_parent_idx on subscriptions (parent_id, created_at desc);

-- ==========================================================================
-- Row Level Security: lock every table down. All access goes through the
-- Express API using the service_role key, which bypasses RLS by design.
-- No policies are defined, so anon/authenticated clients get zero direct access.
-- ==========================================================================
alter table leads enable row level security;
alter table pricing_plans enable row level security;
alter table program_sessions enable row level security;
alter table schedule_locations enable row level security;
alter table profiles enable row level security;
alter table children enable row level security;
alter table orders enable row level security;
alter table subscriptions enable row level security;

-- ==========================================================================
-- Seed data — matches the placeholder content already on the live pages.
-- Wrapped so it only runs once ever, even if this script is re-run.
-- Replace/edit anytime from the admin dashboard.
-- ==========================================================================
do $$
begin
  if not exists (select 1 from pricing_plans) then
    insert into pricing_plans (category, name, price_cents, billing_period, price_note, features, featured, cta_label, cta_href, sort_order, billing_type, purchasable) values
      ('membership', '8-Week Cycle', 14900, 'cycle', 'One weekly class · 8 sessions', '["Robotics or Coding track","All materials & kits included","End-of-cycle showcase"]', false, 'Get Started', 'contact.html', 1, 'one_time', true),
      ('membership', 'Monthly Membership', 11900, 'mo', 'Ongoing weekly class · cancel anytime', '["Continuous curriculum progression","Priority scheduling","No long-term contract"]', true, 'Get Started', 'contact.html', 2, 'recurring', true),
      ('membership', 'Camps & Parties', 5900, 'day', 'Summer camps & birthday packages', '["Themed weekly camps","Robot battle birthday parties","Flexible group sizes"]', false, 'See Details', 'camps-parties.html', 3, 'one_time', false),
      ('party', 'Robot Battle Party', 29900, 'party', 'Up to 10 kids · 90 minutes', '["Build & battle mini robots","Dedicated party host","Take-home robot favor"]', false, 'Book Now', 'contact.html', 1, 'one_time', true),
      ('party', 'Coding Challenge Party', 27900, 'party', 'Up to 12 kids · 90 minutes', '["Team coding relay games","Custom game design activity","Digital certificate & prizes"]', true, 'Book Now', 'contact.html', 2, 'one_time', true),
      ('party', 'Ultimate STEM Party', 34900, 'party', 'Up to 14 kids · 2 hours', '["Robotics + coding combo","Extra host & extended time","Party favors for every guest"]', false, 'Book Now', 'contact.html', 3, 'one_time', true);
  end if;

  if not exists (select 1 from schedule_locations) then
    insert into schedule_locations (city, venue, program, day_time, ages, sort_order) values
      ('Allen', 'Allen Community Center', 'Robotics', 'Tuesdays · 4:30–5:30 PM', '7–10', 1),
      ('McKinney', 'McKinney ISD Partner Elementary', 'Coding & Game Design', 'Wednesdays · 3:15–4:15 PM', '8–12', 2),
      ('Prosper', 'Prosper Community Center', 'Jr. Engineering', 'Thursdays · 4:00–5:00 PM', '5–7', 3),
      ('Allen', 'Allen Learning Studio', 'Robotics', 'Mondays · 5:00–6:00 PM', '9–14', 4),
      ('Little Elm', 'Little Elm Rec Center', 'Coding', 'Saturdays · 10:00–11:00 AM', '6–10', 5),
      ('Celina', 'Celina Community Hall', 'Robotics', 'Fridays · 4:30–5:30 PM', '8–13', 6);
  end if;

  -- Sample purchasable session so guest checkout is testable out of the box.
  -- Dated a month out with a price + capacity; edit/remove from the admin dashboard.
  if not exists (select 1 from program_sessions) then
    insert into program_sessions (category, title, description, start_date, end_date, city, venue, ages, spots_note, price_cents, capacity, registration_open, sort_order) values
      ('camp', 'Summer Robotics Camp — Battle Bots Week',
       'A full week of hands-on engineering: campers build and program their own battle robots, then compete in a friendly arena tournament. All kits and materials included; every child takes home their build.',
       current_date + 30, current_date + 34,
       'Allen', 'Allen Community Center', '7–12', 'Limited to 12 campers', 24900, 12, true, 1);
  end if;
end $$;
