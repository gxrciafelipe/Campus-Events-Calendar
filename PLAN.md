# PLAN.md — Campus events calendar

An independent month/week/day calendar of campus events at Madonna University (Livonia, Michigan), built for residents. Web app first (installable PWA), store apps later through Capacitor.

This document is the source of truth for architecture, data and permissions. `TASKS.md` is the work queue, `DESIGN.md` governs every UI decision, `CLAUDE.md` governs how tasks are executed.

Facts about third-party limits were checked on 2026-11-15. Re-check them before launch; free tiers change.

---

## 1. Independence (non-negotiable)

The app is not run by, endorsed by or affiliated with Madonna University.

- **Wording** (one constant, `INDEPENDENCE_NOTICE`, reused everywhere): "Independent project. Not run by, endorsed by or affiliated with Madonna University."
- **Where it appears:** first-visit notice (dismissible, remembered per browser), footer of every page, About page (with who runs it and a contact address), sign-up screen, PWA/store listing description.
- **Never used:** the university's logo, wordmark, flame mark, seal, athletics marks, photos from its website, or its Garamond wordmark styling. The app icon is our own.
- **Name:** the app name must not read as an official product. "Madonna University" may appear only descriptively ("events at Madonna University"), never as the app's name. Working name is a single constant, `APP_NAME` (see open question Q1).
- **Colors:** blue `#0E4C90` and yellow `#FFD200` are used at the owner's request. See risk R1.

---

## 2. Stack decision

The proposed stack is right. Keep it, with the changes below.

| Area                  | Decision                                                                       | Why                                                                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client                | React + Vite + TypeScript (strict), single-page app                            | As proposed. No server rendering needed; all data is behind Supabase.                                                                                                                                 |
| Mobile                | PWA now, Capacitor wrap in Phase 6                                             | Agreed: no React Native. One codebase, and the owner has no RN experience. Capacitor reuses the built web app unchanged.                                                                              |
| Backend               | Supabase: Postgres, Auth, Storage, Row Level Security, Edge Functions, pg_cron | As proposed. RLS is the permission system; the UI only mirrors it.                                                                                                                                    |
| Hosting               | **Cloudflare Pages** (not Vercel)                                              | Static-asset bandwidth is not metered on the free plan. Vercel's Hobby plan is restricted to non-commercial personal use and meters bandwidth; Netlify's free plan pauses sites when credits run out. |
| Routing               | React Router                                                                   | View and date live in the URL; the event popup is a route, so links are shareable and Back closes it.                                                                                                 |
| Server state          | TanStack Query on top of `supabase-js`                                         | Caching, prefetch of adjacent months, optimistic "going" toggle with rollback.                                                                                                                        |
| Styling               | Tailwind CSS with tokens from `DESIGN.md` as CSS variables                     | One token source for light and dark.                                                                                                                                                                  |
| Accessible primitives | Radix UI (Dialog, Toggle Group)                                                | Focus trapping and keyboard behavior are easy to get wrong by hand.                                                                                                                                   |
| Icons                 | Lucide, one stroke weight                                                      | Anti-slop rule: one icon set.                                                                                                                                                                         |
| Dates                 | date-fns with its time-zone companion                                          | All display is in the campus zone, `America/Detroit`, regardless of device zone.                                                                                                                      |
| Validation            | Zod in forms, CHECK constraints in the database                                | The database is the authority; Zod only gives early feedback.                                                                                                                                         |
| Calendar UI           | **Custom**, no calendar library                                                | A month grid is simple, and libraries fight the design rules. Week and day are agenda lists, not hour grids (better on phones, far less code).                                                        |
| Tests                 | Vitest + Testing Library (client), pgTAP via `supabase test db` (permissions)  | Permission rules are tested against a real Postgres in CI.                                                                                                                                            |

### Where "free tiers only" breaks

| Item                          | Cost                                                | Needed for                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain name                   | about $10–15/year, **deferred**                     | Owner decision: no paid domain for now. Without one the app cannot send auth email (Supabase's built-in mailer is capped at 2 emails per hour and SMTP providers need a domain you control). Consequence: **sign-in is Google only**, the site lives on a free `*.pages.dev` address, and reminder emails are not built. Email + password and email reminders can be added later if a domain is bought. |
| Apple Developer Program       | $99/year                                            | App Store listing and native iOS push (Phase 6 only).                                                                                                                                                                                                                                                                                                                                                   |
| Google Play developer account | $25 once                                            | Play Store listing (Phase 6 only).                                                                                                                                                                                                                                                                                                                                                                      |
| GitHub branch protection      | $0 if the repo is **public**; GitHub Pro if private | Required status checks on `main`. Protected branches on private repos are a paid feature for personal accounts. Recommendation: public repo. Nothing secret lives in it (the Supabase browser key is public by design).                                                                                                                                                                                 |

### Free-tier limits that shape the design

| Limit                                                                                                                       | Consequence in this plan                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase pauses free projects after 1 week of inactivity                                                                    | Fine during term. Over summer the project may pause; unpausing is one click. Documented in `docs/DEPLOY.md`.                                                    |
| Supabase free: 500 MB database, 1 GB file storage, 5 GB egress, 50,000 monthly active users                                 | Ample for one campus if flyers are small (next row).                                                                                                            |
| Supabase image transformations are not on the free plan                                                                     | Flyers are resized and compressed **in the browser before upload** (longest side 1600 px, WebP, target ≤ 300 KB). Stored width and height prevent layout shift. |
| Supabase built-in email: 2 per hour                                                                                         | No app email at all for now: Google sign-in only, so no confirmation or reset emails are needed.                                                                |
| iOS web push works only for a web app added to the Home Screen (iOS 16.4+)                                                  | The notification settings screen detects iOS-in-browser and shows install steps instead of a dead toggle. There is no email fallback until a domain exists.     |
| Instagram: Basic Display API was shut down 2024-12-04; official APIs only return media for accounts that authorize your app | We cannot pull the university account's posts or stories. See §9.                                                                                               |

---

## 3. Architecture

```
Browser / installed PWA / (later) Capacitor shell
  React app ── TanStack Query ── supabase-js
      │                              │
      │  static files                │  HTTPS, user JWT
      ▼                              ▼
Cloudflare Pages            Supabase project
                              ├─ Auth (Google sign-in only)
                              ├─ Postgres + RLS  ← every permission lives here
                              ├─ Storage: bucket "flyers" (public read, policy-gated write)
                              ├─ Edge Functions (Phase 4+): send-reminders, delete-account
                              └─ pg_cron (Phase 4): hourly trigger for reminders
```

Principles:

1. **The client is untrusted.** Every rule in the permission matrix (§6) is enforced by RLS, column grants, constraints or triggers, and has a pgTAP test. UI checks exist only to hide controls the user cannot use.
2. **No custom server.** The browser talks to Supabase directly. Edge Functions exist only where a secret is required (sending push/email, deleting an auth user).
3. **Schema changes are migrations.** Never edited in the dashboard. Each migration ships with its tests and regenerated TypeScript types.
4. **Public read, authenticated write.** Published events and counts are readable without an account (see Q3). Everything else needs a session.
5. **Environments:** local Supabase (Docker) for development and CI; one hosted project for production. The owner applies migrations to production manually with `supabase db push` after merge (no deploy secrets in CI during MVP).

### Client structure

- `/` redirects to `/month/<current>`. Routes: `/month/:yyyy-mm`, `/week/:yyyy-mm-dd`, `/day/:yyyy-mm-dd`, `/event/:id` (dialog over the current view), `/profile`, `/about`, `/privacy`, `/sign-in`, `/sign-up`, `/admin/*`, `/orgs/*` (Phase 2).
- Events are fetched by date range. The visible range is cached; the previous and next ranges are prefetched when idle.
- The "going" toggle is optimistic: button state and count change immediately, roll back with an inline error if the write fails.
- Route-level code splitting: admin, profile and org tools are separate chunks. The calendar is the entry chunk.
- Service worker: precache the app shell; cache-first for flyer images; event data is cached by TanStack Query (persisted to local storage), not by the service worker.

### Abuse protection (open sign-up)

- Sign-in is through Google only, open to any Google account (no domain restriction). Google's own account checks replace email confirmation and CAPTCHA; no passwords are stored.
- Supabase Auth's built-in per-IP rate limits stay on.
- Database: length and format CHECK constraints on every user-supplied text column; unique keys make repeated RSVPs harmless; users can only write rows about themselves.
- Storage: bucket-level size cap (1 MB) and MIME allow-list (WebP, JPEG, PNG); uploads allowed only into the path of an organization the user belongs to.
- Only admin-assigned org members can publish anything other users see. A regular account can change exactly three things: its display name, its own RSVPs, its notification settings.
- Known gap: a determined person can register several confirmed emails and inflate a count. Accepted for MVP (see R6).

---

## 4. Data model

All tables live in `public`, all have RLS enabled, all timestamps are `timestamptz`. "Users" are Supabase `auth.users`; the app-facing table is `profiles`.

### profiles (the "users" table)

| Column       | Type        | Notes                                                                   |
| ------------ | ----------- | ----------------------------------------------------------------------- |
| id           | uuid, PK    | = `auth.users.id`, cascade delete                                       |
| display_name | text        | 2–40 chars. Shown publicly only if the user is a host.                  |
| email        | text        | Copied from auth at sign-up by trigger. Visible to self and admin only. |
| role         | text        | `user` or `admin`. Default `user`.                                      |
| created_at   | timestamptz |                                                                         |

A trigger on `auth.users` creates the row. Clients are granted UPDATE on `display_name` only; `role` and `email` cannot be written by any client role. The first admin is set once by SQL in the dashboard (documented in `docs/DEPLOY.md`).

### organizations

| Column      | Type         | Notes                                                               |
| ----------- | ------------ | ------------------------------------------------------------------- |
| id          | uuid, PK     |                                                                     |
| name        | text, unique | "Resident Assistants"                                               |
| label       | text         | Short label shown on events: "RA event", "BSU event". 2–24 chars.   |
| color_key   | text         | One of the label palette keys in `DESIGN.md`. Not a free hex value. |
| is_archived | boolean      | Archived orgs keep their past events but cannot get new ones.       |
| created_at  | timestamptz  |                                                                     |

Organizations are rows, never code. No organization name appears in any migration, policy or component.

### memberships

| Column          | Type              | Notes     |
| --------------- | ----------------- | --------- |
| organization_id | uuid, FK          | PK part   |
| user_id         | uuid, FK profiles | PK part   |
| added_by        | uuid, FK profiles | The admin |
| created_at      | timestamptz       |           |

Removing a membership also removes that user as host from the organization's events that have not started yet (trigger).

### categories

`id`, `slug` (unique), `name`, `sort_order`. Seeded (Social, Academic, Wellness, Faith, Service, Sports, Other). Admin-managed.

### events

| Column                    | Type              | Notes                                                      |
| ------------------------- | ----------------- | ---------------------------------------------------------- |
| id                        | uuid, PK          |                                                            |
| organization_id           | uuid, FK          | Required. Supplies the label.                              |
| title                     | text              | 3–100 chars                                                |
| description               | text              | ≤ 4,000 chars, plain text                                  |
| category_id               | uuid, FK          |                                                            |
| location                  | text              | Free text, ≤ 120 chars                                     |
| starts_at, ends_at        | timestamptz       | `ends_at > starts_at`                                      |
| flyer_path                | text, null        | Path in the `flyers` bucket                                |
| flyer_width, flyer_height | int, null         | For aspect-ratio placeholders                              |
| status                    | text              | `draft`, `published`, `cancelled`                          |
| going_count               | int               | Maintained by trigger on `rsvps`. Not writable by clients. |
| created_by                | uuid, FK profiles |                                                            |
| created_at, updated_at    | timestamptz       |                                                            |

Rules: an event cannot be `published` without at least one host. Clients get UPDATE only on content columns (not `going_count`, `created_by`, `organization_id`). Index on `(starts_at)` and `(organization_id, starts_at)`.

### event_hosts

| Column       | Type              | Notes                                                                                                                                  |
| ------------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| event_id     | uuid, FK          | PK part, cascade                                                                                                                       |
| user_id      | uuid, FK profiles | PK part                                                                                                                                |
| display_name | text              | Snapshot of the host's name, kept in sync by trigger. This is what the popup shows, so `profiles` never needs to be publicly readable. |

A host must be a member of the event's organization (trigger). The last host of a published event cannot be removed.

### rsvps

| Column     | Type              | Notes            |
| ---------- | ----------------- | ---------------- |
| event_id   | uuid, FK          | PK part, cascade |
| user_id    | uuid, FK profiles | PK part, cascade |
| created_at | timestamptz       |                  |

Insert allowed only for oneself, only on published events that have not ended. A row existing means "going". Names are never exposed through this table to regular users; managers read attendee names through the function `event_attendees(event_id)`, which checks permission inside.

### attendance_verifications (Phase 3)

| Column      | Type              | Notes                                                                                                |
| ----------- | ----------------- | ---------------------------------------------------------------------------------------------------- |
| event_id    | uuid, FK          | PK part                                                                                              |
| user_id     | uuid, FK profiles | PK part: one row per student per event, so one host's verification is enough and a second is a no-op |
| verified_by | uuid, FK profiles | Must be a host of the event or admin; must differ from `user_id`                                     |
| verified_at | timestamptz       |                                                                                                      |

Allowed from 30 minutes before `starts_at` until 7 days after `ends_at` (Q6). Two paths lead to a row here: a host marks someone from the going list, or an attendee (including a walk-in who never marked going) sends an attendance request and any one host accepts it (T42).

### badges and user_badges (Phase 3)

`badges`: `id`, `slug`, `name`, `description`, `rule_type`, `threshold`, `sort_order`. Seeded with `rule_type = 'verified_count'` and thresholds 1, 5, 10, 25, 50.
`user_badges`: `user_id`, `badge_id`, `awarded_at` (PK on the pair).

A trigger on `attendance_verifications` recounts the student's verified events and inserts any newly earned badges; undoing a verification removes badges no longer earned. New badge kinds are a new `rule_type` plus a branch in one function, with no schema change.

### Later tables

- Phase 3: `attendance_requests` (`event_id`, `user_id` as PK, `status` pending / accepted / declined, `created_at`, `decided_by`, `decided_at`). One request per person per event. Accepting is done through a function that sets the status and inserts the verification in one transaction.
- Phase 2: `event_reports` (`event_id`, `reporter_id`, `reason`, `created_at`, `resolved_at`).
- Phase 4: `push_subscriptions` (`user_id`, `endpoint`, keys, `platform`), `notification_settings` (`user_id`, `push_enabled`, `email_enabled`), `reminder_log` (`event_id`, `user_id`, `channel`, `sent_at`, unique on the first three: the idempotency key).
- Phase 5: `instagram_posts` (`url`, `sort_order`, `added_by`).

### Helper functions used by policies

`is_admin()`, `is_org_member(org_id)`, `is_event_host(event_id)`, `can_manage_event(event_id)` (admin or member of the event's organization). All `security definer`, `stable`, with a fixed `search_path`, and covered by tests.

---

## 5. Roles

| Role       | How you get it                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Visitor    | No session.                                                                                                                   |
| User       | Signed in, email confirmed.                                                                                                   |
| Org member | A `memberships` row for the organization in question. Scoped per organization: a BSU member is a plain User toward RA events. |
| Host       | An `event_hosts` row for the event in question. Always also an org member.                                                    |
| Admin      | `profiles.role = 'admin'`.                                                                                                    |

## 6. Permission matrix

✓ allowed · — denied · "own" = only rows about oneself. Org member and Host columns apply **only to their own organization / event**; toward anything else they are Users.

| #   | Action                                                                      | Visitor | User | Org member |         Host          |       Admin       |
| --- | --------------------------------------------------------------------------- | :-----: | :--: | :--------: | :-------------------: | :---------------: |
| 1   | View published and cancelled events, host names, org label, going count     |    ✓    |  ✓   |     ✓      |           ✓           |         ✓         |
| 2   | View draft events                                                           |    —    |  —   |     ✓      |           ✓           |         ✓         |
| 3   | Create an account, sign in                                                  |    ✓    | n/a  |    n/a     |          n/a          |        n/a        |
| 4   | Mark / unmark "I'm going" for oneself                                       |    —    |  ✓   |     ✓      |           ✓           |         ✓         |
| 5   | Mark going on behalf of another user                                        |    —    |  —   |     —      |           —           |         —         |
| 6   | See own RSVPs                                                               |    —    | own  |    own     |          own          |        own        |
| 7   | See who is going (names)                                                    |    —    |  —   |     ✓      |           ✓           |         ✓         |
| 8   | Create an event for an organization                                         |    —    |  —   |     ✓      |           ✓           |         ✓         |
| 9   | Edit or cancel an event                                                     |    —    |  —   |     ✓      |           ✓           |         ✓         |
| 10  | Move an event to another organization                                       |    —    |  —   |     —      |           —           |         ✓         |
| 11  | Delete an event permanently                                                 |    —    |  —   |     —      |           —           |         ✓         |
| 12  | Upload or replace a flyer                                                   |    —    |  —   |     ✓      |           ✓           |         ✓         |
| 13  | Add or remove hosts (members of that org only)                              |    —    |  —   |     ✓      |           ✓           |         ✓         |
| 14  | Mark a student as attended; undo it                                         |    —    |  —   |     —      |           ✓           |         ✓         |
| 15  | Mark oneself as attended                                                    |    —    |  —   |     —      |           —           |         —         |
| 16  | Create, edit, archive organizations                                         |    —    |  —   |     —      |           —           |         ✓         |
| 17  | Add or remove organization members                                          |    —    |  —   |     —      |           —           |         ✓         |
| 18  | List all users (name, email)                                                |    —    |  —   |     —      |           —           |         ✓         |
| 19  | Change a user's global role                                                 |    —    |  —   |     —      |           —           |   ✓ (SQL only)    |
| 20  | Edit own display name                                                       |    —    | own  |    own     |          own          |        own        |
| 21  | Read another user's profile, RSVPs, attended list or badges                 |    —    |  —   |     —      |           —           |         ✓         |
| 22  | Read own attended list and badges                                           |    —    | own  |    own     |          own          |        own        |
| 23  | Write `going_count`, badges or verification rows directly                   |    —    |  —   |     —      |           —           | — (triggers only) |
| 24  | Manage categories                                                           |    —    |  —   |     —      |           —           |         ✓         |
| 27  | Request attendance for oneself at an event (during the verification window) |    —    |  ✓   |     ✓      | — (not for own event) |         ✓         |
| 28  | See, accept or decline attendance requests for an event                     |    —    |  —   |     —      |           ✓           |         ✓         |
| 25  | Report an event (Phase 2)                                                   |    —    |  ✓   |     ✓      |           ✓           |         ✓         |
| 26  | Read reports (Phase 2)                                                      |    —    |  —   |     —      |           —           |         ✓         |

**Tests.** `supabase/tests/` holds one pgTAP file per table plus `matrix.test.sql`, which walks every row above once per role using fixture users (visitor, user, member of org A, member of org B, host, admin). Every ✓ is asserted to succeed and every — is asserted to fail or return zero rows, including the cross-organization cases (member of B acting on A's event). CI runs them on every PR. A task that changes a policy must change the matrix here and the test in the same PR.

---

## 7. Phases

| Phase                     | Contents                                                                                                                                                                                                                     | Outcome                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1 — MVP                   | Foundation and CI, schema with full RLS, auth, month/week/day views, event popup, going + counts, calendar export, admin tools (organizations, events, flyers, member assignment), profile, independence notice, PWA, deploy | Usable by residents; admin publishes everything |
| 2 — Org member tools      | Members create/edit their organization's events, drafts, attendee list, cancel flow, report an event                                                                                                                         | Admin is no longer the bottleneck               |
| 3 — Attendance and badges | Host check-in, verified attendance, badges, full profile                                                                                                                                                                     | The "I actually went" loop                      |
| 4 — Notifications         | Web push and opt-in email, same-day digest                                                                                                                                                                                   | Reminders                                       |
| 5 — Instagram             | Link section, admin-curated embedded posts                                                                                                                                                                                   | See §9                                          |
| 6 — Mobile wrap           | Account deletion, Capacitor iOS/Android, native push, store listing                                                                                                                                                          | Store apps                                      |

Admin member assignment is in Phase 1, earlier than the brief suggested, because the popup must show host names and a host must be an org member.

## 8. Reminders (Phase 4 design)

- One digest per user per day at 08:00 campus time listing that day's events the user marked going. An event created or RSVP'd after the digest does not trigger a second one.
- pg_cron fires hourly and calls the `send-reminders` Edge Function; the function acts only in the 08:00 hour, selects (user, event) pairs with no `reminder_log` row, sends, then writes the log. Running twice sends nothing twice.
- Channel: web push only (VAPID keys, free, no vendor). Email reminders wait for a domain. Phase 6 adds native push tokens to the same function.

## 9. Instagram feasibility

- **Link section:** trivial, Phase 5.
- **Recent posts:** the official API will not return another account's media unless that account's owner authorizes our app, which is not possible for an independent project. What works without any API: the admin pastes URLs of public posts, and the app renders Instagram's official embed for each. The embed script is third-party, so it loads only after the user taps "Show posts".
- **Stories:** not available to third parties for accounts we do not own. Not planned.
- Scraping is ruled out: it breaks Instagram's terms and breaks often.

---

## 10. Risks

| #   | Risk                                                                                                                                                                                                                                                                                                         | Mitigation                                                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Brand use.** The university's brand guidelines say external use of its name, logo or other brand elements must go to its Marketing Department for approval. We use no logo, but we do use the name descriptively and the exact brand colors. Combined, that could be read as official despite the notices. | Notices in five places; own icon and name; no brand typography. Consider a short courtesy email to Marketing before launch, and be ready to shift the palette (tokens make that a one-file change). This is not legal advice. |
| R2  | RAs and some clubs are university-run; the university may object to its staff posting on an unofficial platform.                                                                                                                                                                                             | Raise it with Residence Life early. The app works with student clubs only if needed.                                                                                                                                          |
| R3  | RLS mistakes leak names or allow cross-organization edits.                                                                                                                                                                                                                                                   | Matrix tests in CI; policies written by the strongest model; no table without RLS (asserted by a test).                                                                                                                       |
| R4  | Free-tier changes or project pausing.                                                                                                                                                                                                                                                                        | Limits listed in §2; nothing in the design depends on a paid feature; `docs/DEPLOY.md` has the unpause step.                                                                                                                  |
| R5  | iOS push needs Home Screen install; many users will not do it, and there is no email fallback without a domain.                                                                                                                                                                                              | In-app install guidance; native push in Phase 6.                                                                                                                                                                              |
| R6  | Fake accounts inflate counts or spam RSVPs.                                                                                                                                                                                                                                                                  | Google accounts only, rate limits. Verified attendance (Phase 3) is the trustworthy number.                                                                                                                                   |
| R7  | User-uploaded flyers: inappropriate or copyrighted images.                                                                                                                                                                                                                                                   | Only admin-assigned members upload; report flow in Phase 2; admin can remove. App stores require a report mechanism for user content.                                                                                         |
| R8  | Personal data of students (names, emails, attendance history).                                                                                                                                                                                                                                               | Minimal collection; names visible only to event managers; privacy page; deletion on request in MVP and self-service in Phase 6.                                                                                               |
| R9  | Cheaper models drift from the design or widen scope.                                                                                                                                                                                                                                                         | Small tasks with explicit acceptance criteria; `DESIGN.md` checklist; CI gates.                                                                                                                                               |
| R10 | Solo maintainer.                                                                                                                                                                                                                                                                                             | Everything reproducible from the repo: migrations, seed, deploy doc.                                                                                                                                                          |

## 11. Open questions

Defaults are what the tasks assume until the owner decides otherwise.

| #   | Question                                                                                                      | Default                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | App name?                                                                                                     | **Decided:** `APP_NAME = "Campus Events Calendar"` with the tagline "Unofficial events calendar for Madonna University residents". |
| Q2  | Which campus?                                                                                                 | Livonia, Michigan; zone `America/Detroit`.                                                                                         |
| Q3  | Can people browse events without an account?                                                                  | Yes. Sign-in is needed only to mark going.                                                                                         |
| Q4  | Sign-in methods?                                                                                              | **Decided by Q12:** Google only.                                                                                                   |
| Q5  | Can a host verify a walk-in who did not mark going?                                                           | **Decided:** yes. The attendee requests attendance from the event; when any one host accepts, attendance is marked (T42).          |
| Q6  | How long after an event can attendance be verified?                                                           | 7 days.                                                                                                                            |
| Q7  | Recurring or all-day events?                                                                                  | Neither. Each occurrence is its own event with a start and end time.                                                               |
| Q8  | Do org members see drafts of their organization only, and may any member edit any event of that organization? | Yes to both, as the brief states.                                                                                                  |
| Q9  | Should hosts count their own events as "attended"?                                                            | No. Hosting is shown separately; self-verification is blocked.                                                                     |
| Q10 | Which Instagram account, exactly?                                                                             | A config value, set in Phase 5.                                                                                                    |
| Q11 | Reminder time?                                                                                                | 08:00 on the day.                                                                                                                  |
| Q12 | Is a custom domain acceptable?                                                                                | **Decided:** not for now. Google-only sign-in, `*.pages.dev` address, no email.                                                    |
| Q13 | Public or private GitHub repo?                                                                                | **Decided:** public, open source. Rules in §13.                                                                                    |
| Q14 | Minimum age / terms?                                                                                          | 13+, simple terms and privacy pages; no university ID collected.                                                                   |

## 12. Out of scope

Comments or chat, ticketing or payments, event capacity and waitlists, recurring events, multi-campus, languages other than English, an admin analytics dashboard, pulling events from the university's own calendar.

## 13. Public repository rules

The repo is public. That is safe because security comes from RLS, not from hidden code, but only if these hold:

1. **No secret ever enters git history**, even briefly: service-role key, database password, VAPID private key, Google OAuth client secret, any function secret. They live in the Supabase and Cloudflare dashboards. The Supabase URL and browser key are public by design.
2. GitHub secret scanning and push protection are turned on (free for public repos).
3. `seed.sql` and test fixtures contain invented people only. No real names, emails or database dumps.
4. CI uses no secrets, so pull requests from forks cannot leak anything. Keep "require approval for workflows from outside contributors" on, and never switch the workflow to `pull_request_target`.
5. Production is changed only by the owner (`supabase db push`, dashboard), never from CI.
6. Commit with GitHub's no-reply email if the owner's address should stay private.
7. A `LICENSE` (MIT) and a `SECURITY.md` saying how to report a vulnerability privately are added in T01.
