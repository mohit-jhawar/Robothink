# RoboThink Collin County — Feature Implementation Plan

**Date:** 2026-08-14
**Constraints:** No customer login/signup. Guest Stripe checkout (pay online, no account). Keep the staff `/admin` dashboard.

---

## 0. Guiding decisions (locked)

| Decision | Choice |
|---|---|
| Customer accounts | **Removed.** Delete the "My Account" login UI + `/account/*` route + `AccountPage.jsx`. Keep `/admin` (real Supabase auth) untouched. |
| Online registration | **Guest checkout.** New public `/api/register` endpoint → Stripe Checkout in `payment` mode, no `requireAuth`. |
| Seat tracking | New `registrations` table; "spots left" = `capacity − (paid + recent-pending holds)`. |
| Email | Reuse existing Brevo helper (`server/email.js`); add a registration-confirmation template. |

### Current state (already built — do **not** rebuild)
- `/api/leads` already stores to Supabase **and** sends parent-confirmation + admin-notification email via Brevo. ✅
- FAQ accordion already exists on `/parents` (inline). Needs extraction + reuse on `/contact`. ⚠️ partial
- Static testimonials already on Home. Reviews feature = upgrade, not new. ⚠️ partial
- `program_sessions` (dated camps/FLL/workshops) and `schedule_locations` (weekly grid) tables exist. The ParentsPage schedule table is **hardcoded** and does not read `schedule_locations` yet. ⚠️
- Existing `/checkout/session` is **account-gated** and tied to `pricing_plans`/`children`/`profiles`. We leave it in place but the guest flow is a **separate** new endpoint.

---

## Phase 1 — Safe wins (no DB, no payment risk)

### 1.1 Custom 404 page + Global Error Boundary
**Files:**
- `src/pages/NotFoundPage.jsx` (new) — child-friendly "Oops! This robot lost its way 🤖", link home + to Programs.
- `src/components/ErrorBoundary.jsx` (new) — React class component with `componentDidCatch`; friendly fallback + "Reload" button.
- `src/App.jsx` — add catch-all `<Route path="*" element={<NotFoundPage />} />` as the **last** route; wrap `<Routes>` in `<ErrorBoundary>`.

**Note:** `netlify.toml` already needs an SPA redirect (`/* → /index.html 200`) for client 404s to render. Verify it exists; add if missing.

### 1.2 Sticky Mobile CTA bar
**Files:**
- `src/components/StickyMobileCTA.jsx` (new) — fixed bottom bar, mobile only: "🤖 Claim Free Trial Class →" → `/contact?type=trial`.
- `src/App.jsx` — render once, below `<Footer/>`.
- `styles.css` — `.sticky-mobile-cta { position: fixed; bottom: 0; … }` shown only under `@media (max-width: 768px)`; hide on `/contact` (the form is already there) via a `useLocation` check; add `padding-bottom` to `.app-container` on mobile so it never covers the footer.

### 1.3 FAQ Accordion component (extract + reuse)
**Files:**
- `src/components/FaqAccordion.jsx` (new) — lift the existing accordion markup/logic out of `ParentsPage.jsx`; props: `faqs=[{q,a}]`, optional `defaultOpen`. Uses existing `.accordion*` CSS classes (already styled).
- `src/pages/ParentsPage.jsx` — replace inline accordion with `<FaqAccordion faqs={parentFaqs} />`.
- `src/pages/ContactPage.jsx` — add a new FAQ section using `<FaqAccordion faqs={contactFaqs} />` (makeup classes, age flexibility, sibling discounts, safety/background checks, refund policy).

### 1.4 Reviews / Social-proof upgrade
Two-tier, ship the static tier first:
- **Tier A (now):** `src/components/ReviewsStrip.jsx` — a "Google-style" reviews row (★ 4.9 badge, avatar initials, city, verified pill) fed from a local array. Add to Home (replace/augment current testimonials) and `/parents`.
- **Tier B (optional, needs API key):** backend proxy `server/routes/reviews.js` → `GET /api/reviews` calls Google Places Details API server-side (key stays server-side), caches ~12h in memory. Env: `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`. Frontend fetches `/api/reviews`, falls back to Tier A static data on error.

### 1.5 Remove customer login/signup UI
**Files:**
- `src/components/Navbar.jsx` — remove both `/account/login` links (desktop `.nav-cta` + mobile `.mobile-cta`). Keep "First Class Free".
- `src/App.jsx` — remove `AccountPage` import + `<Route path="/account/*">`. Leave `/admin/*`.
- Delete `src/pages/AccountPage.jsx`.
- The root `account/` static dir holds `checkout-success.html` / `checkout-cancel.html` used by the **old** account checkout. Guest checkout gets its own success/cancel pages (Phase 3) — leave the old files or repoint the legacy `/checkout/session` route later; not blocking.

---

## Phase 2 — Live Class & Location Search Filter

A single interactive finder combining **weekly classes** (`schedule_locations`) and **dated sessions** (`program_sessions`).

**Backend:** none required — `/api/schedule` and `/api/sessions` already exist and are public.

**Files:**
- `src/components/ClassFinder.jsx` (new):
  - On mount, `Promise.all` fetch `/api/schedule` + `/api/sessions`.
  - Normalize both into a common shape `{ kind, title, city, program, ages, when, cta }`.
  - Filter controls (dropdowns/pills): **City** (Allen, McKinney, Prosper, Celina, Little Elm, The Colony, Princeton, Anna), **Age Group** (4–6, 6–10, 9–14 — matched by numeric-range overlap against the row's `ages` string), **Program Type** (Robotics, Coding, Camps, FLL, Workshop).
  - Results as cards; each links to `/contact?type=trial&program=…` (weekly) or `/programs/:id` (dated → registration in Phase 3).
  - Empty state: "No classes match — request a class in your city →".
- `src/pages/ParentsPage.jsx` — replace the hardcoded schedule `<table>` with `<ClassFinder />` (fixes the "hardcoded, not from DB" gap too).
- `src/pages/HomePage.jsx` — add a compact `<ClassFinder compact />` section under the hero.
- `styles.css` — filter-bar + result-card styles (reuse `.pill`, `.card`, `.grid` where possible).

**Age-matching helper:** `src/lib/matchAgeGroup.js` — parse `"7–10"`, `"5-7"`, `"9–14"` into `[min,max]` and test overlap with the selected bucket.

---

## Phase 3 — Guest Registration + Stripe Checkout + Seat availability

### 3.1 Database (add to `scripts/schema.sql`, idempotent)
```sql
-- Make sessions purchasable + capacity-aware
alter table program_sessions add column if not exists price_cents integer;      -- null => inquiry-only (no online pay)
alter table program_sessions add column if not exists capacity integer;         -- null => unlimited / no counter

-- Guest registrations (no account). Source of truth for "paid" is the Stripe webhook.
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
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded','canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists registrations_session_idx on registrations (session_id, status);
alter table registrations enable row level security;  -- API uses service_role, bypasses RLS
```

### 3.2 Seat-availability helper (`server/lib/seats.js`, new)
- `seatsLeft(sessionId)` = `capacity − count(status='paid') − count(status='pending' AND created_at > now()-15min)`.
- The 15-min pending window is a **soft hold** so two parents can't both grab the last seat while mid-checkout. Accept small oversell risk (reconciled manually) — documented tradeoff for a small business; a DB transaction/locking version is possible later if needed.

### 3.3 New route `server/routes/register.js` (public, **no** `requireAuth`)
- `POST /register` body: `{ session_id, parent_name, parent_email, parent_phone, child_name, child_age, city }`.
  1. Validate payload (reuse email regex from `leads.js`).
  2. Load session; reject if `registration_open === false` or `price_cents == null` → `400 "This session isn't open for online registration."`
  3. If `capacity != null` and `seatsLeft <= 0` → `409 "This session is full."`
  4. Insert `registrations` row (`status='pending'`).
  5. Create Stripe Checkout Session, `mode:'payment'`, `customer_email: parent_email` (guest — no Customer object needed), `line_items` from `price_data` using `session.title` + `price_cents`, `metadata:{ registration_id }`, `success_url`/`cancel_url` → new SPA routes below.
  6. Save `stripe_checkout_session_id` on the row; return `{ url }`.
- `GET /register/session/:id` (optional) — lightweight status poll for the success page.
- Mount in `server/app.js`: `app.use('/register', registerRouter);`

### 3.4 Webhook extension (`server/routes/webhooks.js`)
In `checkout.session.completed`, when `metadata.registration_id` is present:
- Update that `registrations` row → `status='paid'`, set `stripe_payment_intent_id`, `updated_at`.
- Fire (fire-and-forget, `Promise.allSettled`) `sendRegistrationConfirmation(reg, sessionTitle)` to parent + `sendRegistrationNotification` to `ADMIN_NOTIFICATION_EMAIL`.
- Keep existing `mode==='payment'` account-order branch working by checking for `registration_id` first (guest) vs `parent_id` (legacy account).

### 3.5 Email (`server/email.js`)
- Add `sendRegistrationConfirmation({ parent_name, parent_email, child_name }, sessionTitle)` and `sendRegistrationNotification(...)`. Reuse `sendViaBrevo` + `escapeHtml`.

### 3.6 Expose seats on the public API (`server/routes/sessions.js`)
- In `GET /sessions` and `GET /sessions/:id`, when `capacity != null`, attach `seats_left` (batch-count paid+pending per session). Cards can then show "3 spots left" / "Full".

### 3.7 Frontend
- `src/components/RegisterModal.jsx` (new) — form (parent name/email/phone, child name/age, city prefilled from session); `POST /api/register` → on success `window.location = url` (Stripe redirect); shows "Full"/error states.
- `src/pages/ProgramDetailPage.jsx` — replace the `/contact` "Claim Your Spot" CTA with:
  - if `price_cents` set & `seats_left > 0` → **"Register & Pay — $X"** opens `<RegisterModal/>`;
  - if full → disabled "Session Full" + "Join waitlist" (→ `/contact`);
  - if no price → keep inquiry CTA to `/contact`.
- `src/pages/HomePage.jsx` — session cards show a `seats_left` badge ("3 spots left").
- New SPA routes + pages: `src/pages/RegisterSuccessPage.jsx` (`/register/success` — reads `?session_id`, shows confirmation) and `src/pages/RegisterCancelPage.jsx` (`/register/cancel`). Add both to `App.jsx`. (Cleaner than the old static `account/*.html` files.)

---

## Env vars (add to `.env` / `.env.example` / Netlify)
Already present: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BREVO_*`, `ADMIN_NOTIFICATION_EMAIL`, Supabase keys.
**New (optional, reviews Tier B):** `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`.

## Testing checklist
- [ ] `npm run build` clean; `npm run dev` + `npm run server` locally.
- [ ] 404: hit `/nonsense` → NotFoundPage. Force a render error → ErrorBoundary fallback.
- [ ] ClassFinder filters (city × age × type) incl. empty state; ParentsPage reads live `schedule_locations`.
- [ ] Guest checkout happy path with Stripe **test** card `4242…`; webhook via Stripe CLI (`stripe listen --forward-to localhost:8899/api/webhooks/stripe`) marks `paid`, decrements seats, sends emails.
- [ ] Full session → `409`; pending hold expires after 15 min.
- [ ] No "My Account" links anywhere; `/account/*` gone; `/admin` still works.
- [ ] Sticky CTA hidden on desktop & on `/contact`; doesn't cover footer.

## Suggested build order
1. Phase 1 (1.1–1.5) — low risk, immediate UX/CRO lift.
2. Phase 2 — ClassFinder (high user value, no payment risk).
3. Phase 3 — schema → backend register+webhook+email → frontend → Stripe test pass.

## Open risk notes
- **Oversell race:** soft-hold mitigates but doesn't fully prevent; acceptable for expected volume, revisit with row-locking if it becomes real.
- **Refund/cancel:** out of scope here; admin can refund in Stripe, then set `registrations.status='refunded'` manually (or add a webhook for `charge.refunded` later).
- **Legacy `/checkout/session` + `account/*.html`:** now orphaned by login removal; leave dormant or delete in a cleanup pass.
