# RoboThink Collin County — Backend Setup

This site is full-stack: static frontend + an Express API running as a single Netlify
Function, backed by Supabase (Postgres + Auth), Brevo (transactional email), and Stripe
(payments — one-time checkout for camps/parties/8-week cycles, subscriptions for monthly
membership). There are two separate logins: `/admin` for you, `/account` for parents.

## 1. Create a Supabase project

1. Go to https://supabase.com, create a free project.
2. Open **SQL Editor > New Query**, paste the contents of `scripts/schema.sql`, and run it.
   It's idempotent — safe to re-run any time you pull schema changes. It creates:
   - `leads`, `pricing_plans`, `schedule_locations` — same as before
   - `profiles` — one row per Supabase Auth user, with a `role` of `admin` or `parent`
   - `children`, `orders`, `subscriptions` — the parent portal's data
   All tables have RLS enabled with **no policies**, so only the server (via the
   service-role key) can touch them.
3. Go to **Project Settings > API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — server-side only)
4. **Authentication > Providers > Email**: turn **off** "Confirm email" (or leave it on and
   just know parent self-registration still works because the server creates accounts with
   `email_confirm: true` directly — either way, no email-confirmation flow is required).

## 2. Create a Brevo account (transactional email)

1. Go to https://www.brevo.com, create a free account.
2. **Senders, Domains & Dedicated IPs** → add and verify the email address you want to send
   from (e.g. `hello@yourdomain.com`). Brevo requires this before it will send on your behalf.
3. **Settings > SMTP & API > API Keys** → create a key → `BREVO_API_KEY`.

## 3. Create a Stripe account (payments)

1. Go to https://stripe.com, create an account. Stay in **test mode** until you're ready to
   take real payments (the toggle is in the dashboard sidebar).
2. **Developers > API keys** → copy the **Secret key** → `STRIPE_SECRET_KEY`.
3. **Developers > Webhooks > Add endpoint**:
   - Endpoint URL: `https://your-site.netlify.app/api/webhooks/stripe` (once deployed)
   - Events to send: `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted`
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`
4. To test webhooks locally before you've deployed, install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
   and run:
   ```
   stripe listen --forward-to localhost:8888/api/webhooks/stripe
   ```
   It prints a `whsec_...` value — use that as `STRIPE_WEBHOOK_SECRET` for local dev.

No pre-created Stripe Products/Prices are needed — checkout builds them on the fly from
whatever's in `pricing_plans` (via the admin dashboard), so pricing changes take effect
immediately with no Stripe-side syncing step.

## 4. Configure environment variables

Copy `.env.example` to `.env` and fill in the real values:

```
cp .env.example .env
```

| Variable | Where it's used |
|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Database, admin auth, parent auth |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` | Sending emails |
| `ADMIN_NOTIFICATION_EMAIL` | Where new-lead alerts get sent |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used once by `npm run seed:admin` to create your admin login |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout + subscription billing |
| `APP_BASE_URL` | Fallback base URL for Stripe redirect links (local dev only) |

## 5. Install dependencies & create your admin login

```
npm install
npm run seed:admin
```

This creates (or updates) a Supabase Auth user with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from
`.env`, **and** gives it a `profiles` row with `role = 'admin'` — that role check is what
gates `/admin/*`. That's what you'll use to sign into `/admin/login.html`.

Parents don't need this script — they self-register at `/account/register.html`, which
automatically creates a `role = 'parent'` profile.

## 6. Run it locally

```
npm run dev
```

Serves the whole site (frontend + API) at http://localhost:8888, mirroring exactly how it
runs on Netlify (`/api/*` → the Express app).

- Admin dashboard: http://localhost:8888/admin/login.html
- Parent portal: http://localhost:8888/account/login.html (or `/account/register.html` to sign up)

To test a real purchase end-to-end locally, run `stripe listen` (step 3.4) in a separate
terminal alongside `npm run dev`, register/sign in a parent account, and click through a
pricing card. Stripe's test mode gives you fake card numbers (e.g. `4242 4242 4242 4242`,
any future expiry, any CVC) — see https://stripe.com/docs/testing.

## 7. Deploy to Netlify

1. Push this project to a GitHub/GitLab repo, then in Netlify: **Add new site > Import an
   existing project** and pick it. Netlify will read `netlify.toml` automatically
   (build command `npm install`, publish dir `.`, functions dir `netlify/functions`).
2. In **Site configuration > Environment variables**, add every variable from `.env` except
   `ADMIN_EMAIL`/`ADMIN_PASSWORD` (those are only used by the local seed script — run
   `npm run seed:admin` from your machine pointed at the same Supabase project instead).
3. Deploy, then go back to Stripe's webhook settings (step 3.3) and update the endpoint URL
   to your real Netlify domain if you hadn't set it yet, and re-copy the signing secret into
   Netlify's env vars if it changed.
4. Once live: forms post to `/api/leads`, pricing/schedule sections pull live data, checkout
   goes through Stripe, and `/admin/dashboard.html` / `/account/dashboard.html` are where you
   and your parents manage things day to day.

## How the money flows

- **Camps, parties, 8-week cycles** → Stripe Checkout in `payment` mode (one-time charge) →
  `checkout.session.completed` webhook writes a row to `orders` with `status = 'paid'`.
- **Monthly membership** → Stripe Checkout in `subscription` mode → the same webhook creates
  the initial `subscriptions` row, and `customer.subscription.updated` /
  `customer.subscription.deleted` keep its `status` and `current_period_end` in sync as Stripe
  bills it each month, fails a payment, or a parent cancels.
- Parents can cancel their own subscription from `/account/dashboard.html` (sets
  `cancel_at_period_end` in Stripe — it stays active through the period they already paid for).
- The **"Camps & Parties" teaser card** on `parents.html` is intentionally not purchasable —
  it just links to `camps-parties.html`. Every other pricing card is real checkout.

## What's still a placeholder

- Pricing numbers, class schedule/venues, and the phone/email on the Contact page were seeded
  as illustrative placeholders (clearly marked in the code). Update pricing and schedule
  entries directly from the admin dashboard — no code changes or redeploys needed.
- Phone number and email address on `contact.html` are still hardcoded placeholders; update
  those two spots directly in the HTML when you have real ones.
- Stripe is in test mode until you flip your Stripe account to live mode and swap in live API
  keys / a live webhook signing secret.
