# TASKS.md

Work queue for the campus events calendar. One task = one fresh model session = one branch = one pull request. Do them in order unless "Depends on" says otherwise.

## How to run a task

1. Run the "before" git commands shown in the task.
2. Start a fresh session with the recommended model and say: `Read CLAUDE.md, then do task TNN from TASKS.md.`
3. Review `git status` and `git diff`. Run `npm run check` yourself (and `npm run db:test` for database tasks).
4. Run the "after" git commands. Merge when both CI checks (`web`, `db`) are green.

`gh` is the GitHub CLI. Without it, open and merge the pull request in the browser instead of the two `gh` lines.

## Model guide

| Model  | Use for                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Haiku  | Mechanical work with an exact spec: config, static pages, small components, docs.                                                      |
| Sonnet | Most feature work: components with states, hooks, forms, tests.                                                                        |
| Opus   | Anything where a mistake is a security or data bug: migrations, RLS, triggers, Edge Functions with secrets, the permission test suite. |

If a cheaper model fails a task twice, rerun it one tier up rather than patching by hand.

## Definition of done (every task)

- Acceptance criteria met, required tests written and passing.
- `npm run check` passes; `npm run db:test` passes if `supabase/` changed.
- UI tasks: checked against the anti-slop rules in `DESIGN.md`, in light and dark mode, at 360px and 1280px.
- No files changed outside "Files" without saying so.

---

# Phase 1 — MVP

## Foundation

### T01 · Scaffold the app

**Model:** Sonnet · **Depends on:** nothing

**Goal:** A Vite + React + TypeScript (strict) project with linting, formatting, unit testing and the npm scripts named in `CLAUDE.md`.

**Files:** `package.json`, `package-lock.json`, `.nvmrc` (current Node LTS), `tsconfig*.json`, `vite.config.ts`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `.gitignore`, `.env.example`, `index.html`, `src/main.tsx`, `src/app/App.tsx`, `src/test/setup.ts`, `src/app/App.test.tsx`, `README.md`, `LICENSE` (MIT), `SECURITY.md` (how to report a vulnerability privately). Copy `PLAN.md`, `TASKS.md`, `DESIGN.md`, `CLAUDE.md` into the repo root unchanged.

**Acceptance:**

- All scripts in the `CLAUDE.md` command table exist; the `db:*` scripts may call the Supabase CLI even though T02 sets it up.
- ESLint includes typescript-eslint (strict), react-hooks and jsx-a11y. Prettier ignores `src/lib/database.types.ts`.
- `.env.example` lists `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`; `.env*` (except the example) is git-ignored.
- The app renders a placeholder heading with the app name from `src/lib/config.ts` (`APP_NAME`, `INDEPENDENCE_NOTICE`, `CAMPUS_TIME_ZONE`).
- README states in its first paragraph that the project is independent of Madonna University.

**Tests:** One Vitest + Testing Library test that renders `App` and finds the heading. `npm run check` passes.

**Git:**

```
git init -b main
git add -A
git commit -m "chore: scaffold Vite React TypeScript app"
gh repo create campus-events-calendar --public --source=. --push
```

### T02 · Local Supabase project and database test harness

**Model:** Sonnet · **Depends on:** T01

**Goal:** `supabase/` initialized so a local database starts, pgTAP tests run, and TypeScript types generate.

**Files:** `supabase/config.toml`, `supabase/migrations/` (one migration enabling pgTAP in the `extensions` schema), `supabase/seed.sql` (empty with a comment), `supabase/tests/000_smoke.test.sql`, `src/lib/database.types.ts` (generated), `README.md` (local setup section).

**Acceptance:**

- `npm run db:start`, `db:reset`, `db:test`, `db:lint`, `db:types` all work on a clean machine with Docker.
- Site URL in `config.toml` points to the Vite dev URL. Seed and fixtures use invented people only (public repo).
- The generated types file is committed and matches the local schema.

**Tests:** `000_smoke.test.sql` asserts pgTAP runs and that the `public` schema exists. `npm run db:test` passes.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t02-supabase-local
# after reviewing git status and git diff
git add -A
git commit -m "chore(db): local Supabase project and pgTAP harness"
git push -u origin t02-supabase-local
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T03 · CI workflow and pull request template

**Model:** Haiku · **Depends on:** T02

**Goal:** Every PR runs lint, format check, typecheck, unit tests, build, and the database permission tests.

**Files:** `.github/workflows/ci.yml` (use the content provided with this plan verbatim), `.github/pull_request_template.md` (task id, what changed, checklist: tests added, `DESIGN.md` anti-slop check for UI, matrix updated if policies changed).

**Acceptance:**

- The PR for this task shows two checks, `web` and `db`, both green.
- No secrets are referenced by the workflow.

**Tests:** The workflow run itself.

**Owner, after merging (once):** GitHub → Settings → Branches → add a rule for `main`: require a pull request before merging (0 approvals), require status checks `web` and `db`, require branches to be up to date. The repo must be public for this to be free (see `PLAN.md` §2).

**Git:**

```
# before
git checkout main && git pull
git checkout -b t03-ci
# after reviewing git status and git diff
git add -A
git commit -m "ci: lint, typecheck, test, build and permission checks on every PR"
git push -u origin t03-ci
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T04 · Design tokens, base styles, font and icons

**Model:** Sonnet · **Depends on:** T01

**Goal:** Tailwind wired to the tokens in `DESIGN.md` so later tasks never write a raw color or spacing value.

**Files:** `src/styles/tokens.css` (all palette tokens for light and dark, the eight organization label colors, spacing, radius, type scale), `src/styles/base.css`, Tailwind config or `@theme` block, `src/main.tsx`, `package.json` (Tailwind, self-hosted Inter variable font, `lucide-react`), `src/components/ui/Icon.tsx` (fixes stroke 1.75 and the 16/20/24 sizes).

**Acceptance:**

- Every token in `DESIGN.md` exists with exactly the documented values; dark values apply under `prefers-color-scheme: dark`.
- Tailwind's default color palette and arbitrary spacing are disabled or unused; only token-backed utilities are available.
- Global: tabular numerals utility, `text-wrap: balance` on headings, a visible focus ring, reduced-motion media query that zeroes transitions.
- No font is loaded from a third-party origin.

**Tests:** A unit test that parses `tokens.css` and asserts the documented hex values for `--primary`, `--accent`, `--text`, `--bg` in both modes, and that all eight label keys are defined in both modes.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t04-design-tokens
# after reviewing git status and git diff
git add -A
git commit -m "feat(ui): design tokens, base styles, font and icon wrapper"
git push -u origin t04-design-tokens
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T05 · UI primitives

**Model:** Sonnet · **Depends on:** T04

**Goal:** The shared primitives every screen uses, each with all states from `DESIGN.md`.

**Files:** `src/components/ui/`: `Button.tsx`, `Field.tsx`, `Skeleton.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `Toast.tsx` + provider, `index.ts`, tests beside each.

**Acceptance:**

- Button: primary, secondary, quiet; default, hover, active, focus-visible, disabled, loading. Minimum 44px touch height.
- Field: visible label, error text linked with `aria-describedby`, disabled state, 16px input text.
- ErrorState takes a message and an `onRetry`; EmptyState takes one sentence and an optional single action.
- Toast is announced through a live region and is used only for errors.

**Tests:** Per component: renders each variant, disabled and loading block clicks, error text is associated with the input, retry fires.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t05-ui-primitives
# after reviewing git status and git diff
git add -A
git commit -m "feat(ui): button, field, skeleton, empty, error and toast primitives"
git push -u origin t05-ui-primitives
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T06 · App shell, independence notice, About and Privacy

**Model:** Sonnet · **Depends on:** T05

**Goal:** Router, layout, and the independence statement in all three required places.

**Files:** `src/app/router.tsx`, `src/app/Layout.tsx`, `src/app/Footer.tsx`, `src/app/FirstVisitNotice.tsx`, `src/features/about/AboutPage.tsx`, `src/features/about/PrivacyPage.tsx`, `src/app/NotFound.tsx`, tests, `package.json` (React Router).

**Acceptance:**

- Routes exist for `/`, `/about`, `/privacy` and a not-found page; `/` shows a calendar placeholder.
- The footer on every page shows `INDEPENDENCE_NOTICE` and links to About and Privacy.
- First visit shows the notice with a "Got it" button; dismissal is remembered in `localStorage` and survives reload; if storage is unavailable the notice still dismisses for the session.
- About explains who runs the app, that it is unofficial, and gives a contact address from config. Privacy lists what is stored (email, display name, RSVPs) and how to request deletion.
- No university logo, image or wordmark anywhere. Header shows only the app name and account entry point.

**Tests:** Notice appears once and stays dismissed; footer text present on each route; About and Privacy render the notice wording from config (not a duplicated string).

**Git:**

```
# before
git checkout main && git pull
git checkout -b t06-app-shell
# after reviewing git status and git diff
git add -A
git commit -m "feat: app shell with independence notice, about and privacy pages"
git push -u origin t06-app-shell
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

## Database and permissions

### T07 · Profiles, global role and sign-up trigger

**Model:** Opus · **Depends on:** T02

**Goal:** `profiles` as specified in `PLAN.md` §4, with a role that no client can change.

**Files:** new migration, `supabase/tests/fixtures.sql` (helpers to create a user and to act as a role), `supabase/tests/profiles.test.sql`, regenerated types.

**Acceptance:**

- Row is created by a trigger on `auth.users` with `role = 'user'`, the email, and a display name from sign-up metadata (validated 2–40 chars, fallback "New member").
- `is_admin()` helper exists (`security definer`, fixed `search_path`).
- Select: own row, or all rows for admin. Update: own row, `display_name` column only (column-level grant). No client insert or delete.
- `role` and `email` are not writable by `anon` or `authenticated`.

**Tests (pgTAP):** user reads own row but not another's; admin reads all; user cannot update `role` or `email` (own or others'); user can update own `display_name` and not another's; visitor reads nothing; length constraint rejects 1-char and 41-char names; a test asserting every table in `public` has RLS enabled.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t07-profiles
# after reviewing git status and git diff
git add -A
git commit -m "feat(db): profiles with protected role and sign-up trigger"
git push -u origin t07-profiles
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T08 · Organizations, memberships and categories

**Model:** Opus · **Depends on:** T07

**Goal:** Organizations as data, admin-managed membership, seeded categories.

**Files:** new migration, `supabase/tests/organizations.test.sql`, `supabase/tests/memberships.test.sql`, `supabase/seed.sql` (two sample organizations, sample users and memberships for local use only), regenerated types.

**Acceptance:**

- Tables match `PLAN.md` §4. `color_key` is constrained to the eight keys in `DESIGN.md`. Label length 2–24.
- `is_org_member(org_id)` helper exists.
- Organizations and categories: readable by everyone including visitors; writable by admin only.
- Memberships: admin can insert and delete; a user can read their own memberships; members can read the member list of their own organization; nobody else can read them.
- Seven categories are inserted by the migration (not the seed), as listed in `PLAN.md`.

**Tests (pgTAP):** each rule above for visitor, user, member of A, member of B, admin; a user cannot add themselves to an organization; invalid `color_key` rejected.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t08-organizations
# after reviewing git status and git diff
git add -A
git commit -m "feat(db): organizations, memberships and categories with RLS"
git push -u origin t08-organizations
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T09 · Events and hosts

**Model:** Opus · **Depends on:** T08

**Goal:** `events` and `event_hosts` with organization-scoped write access.

**Files:** new migration, `supabase/tests/events.test.sql`, `supabase/tests/event_hosts.test.sql`, seed additions (a month of sample events), regenerated types.

**Acceptance:**

- Tables, constraints and indexes match `PLAN.md` §4. `updated_at` maintained by trigger.
- Helpers `is_event_host(event_id)` and `can_manage_event(event_id)` exist.
- Select: published and cancelled events for everyone; drafts only for members of the event's organization and admin.
- Insert: admin, or a member inserting for their own non-archived organization, with `created_by = auth.uid()`.
- Update: `can_manage_event`, content columns only; `organization_id` changeable by admin only; `going_count` and `created_by` by no client.
- Delete: admin only.
- Hosts: readable wherever the event is readable; insert and delete by `can_manage_event`; the user must be a member of the event's organization; `display_name` snapshot filled and kept in sync by trigger; an event cannot become `published` with zero hosts; the last host of a published event cannot be removed.
- Removing a membership deletes that user's host rows on that organization's events that have not started.

**Tests (pgTAP):** every rule above, including: member of B cannot insert, update or add hosts on A's event; member cannot change `going_count`; member cannot move an event to another organization; visitor cannot see drafts; publishing without a host fails; adding a non-member as host fails; display-name change propagates.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t09-events
# after reviewing git status and git diff
git add -A
git commit -m "feat(db): events and hosts with organization-scoped RLS"
git push -u origin t09-events
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T10 · RSVPs, going count and attendee list

**Model:** Opus · **Depends on:** T09

**Goal:** "I'm going" with a public count and private names.

**Files:** new migration, `supabase/tests/rsvps.test.sql`, regenerated types.

**Acceptance:**

- `rsvps` matches `PLAN.md` §4. Insert and delete only where `user_id = auth.uid()`; insert only on published events whose `ends_at` is in the future.
- Select: own rows only (no policy exposes other users' rows to regular users).
- Trigger keeps `events.going_count` exact on insert and delete, including cascade deletes.
- Function `event_attendees(event_id)` returns `user_id`, `display_name`, `created_at` only when `can_manage_event(event_id)` is true; otherwise it raises or returns no rows.

**Tests (pgTAP):** user RSVPs and count becomes 1; duplicate RSVP fails and count stays 1; un-RSVP returns it to 0; user cannot RSVP for someone else; cannot RSVP to draft, cancelled or ended events; user cannot select another user's RSVP; `event_attendees` works for member of the organization, host and admin, and returns nothing for a plain user and for a member of another organization; visitor cannot write.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t10-rsvps
# after reviewing git status and git diff
git add -A
git commit -m "feat(db): rsvps with trigger-maintained count and gated attendee list"
git push -u origin t10-rsvps
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T11 · Flyer storage bucket and policies

**Model:** Opus · **Depends on:** T09

**Goal:** A `flyers` bucket anyone can read and only the right people can write.

**Files:** new migration (bucket + `storage.objects` policies), `supabase/tests/storage.test.sql`.

**Acceptance:**

- Bucket is public-read, 1 MB size limit, MIME allow-list `image/webp`, `image/jpeg`, `image/png`.
- Object path convention: `<organization_id>/<event_id>/<random>.webp`.
- Insert, update and delete allowed only when the first path segment is an organization the user is a member of, or the user is admin.

**Tests (pgTAP):** member of A can insert under A's path and not under B's; plain user and visitor cannot insert anywhere; admin can insert anywhere; a member of B cannot delete A's object.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t11-flyer-storage
# after reviewing git status and git diff
git add -A
git commit -m "feat(db): flyers bucket with organization-scoped write policies"
git push -u origin t11-flyer-storage
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T12 · Permission matrix test suite

**Model:** Opus · **Depends on:** T10, T11

**Goal:** One test file that proves `PLAN.md` §6 row by row, so later changes cannot silently widen access.

**Files:** `supabase/tests/matrix.test.sql`, `supabase/tests/fixtures.sql` (visitor, user, member of A, member of B, host of an A event, admin), `PLAN.md` (only if the matrix needs a correction; say so).

**Acceptance:**

- Rows 1–24 of the matrix are each asserted for every role column: allowed cases succeed, denied cases fail or return zero rows. Rows for later phases (14, 15, 22 attended/badges, 25, 26) are listed as `todo` tests naming the task that will fill them.
- Each assertion's description starts with the matrix row number, e.g. `M09 member of B cannot edit A's event`.
- The suite is independent of `seed.sql`.

**Tests:** The suite itself; `npm run db:test` passes and prints one line per matrix cell.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t12-permission-matrix
# after reviewing git status and git diff
git add -A
git commit -m "test(db): role by action permission matrix suite"
git push -u origin t12-permission-matrix
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

## Auth

### T13 · Supabase client, session and query providers

**Model:** Sonnet · **Depends on:** T06, T07

**Goal:** Typed Supabase client, a session context, and TanStack Query set up once.

**Files:** `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/features/auth/SessionProvider.tsx`, `src/features/auth/useSession.ts`, `src/features/auth/useProfile.ts`, `src/app/providers.tsx`, `src/test/renderWithProviders.tsx`, `src/test/supabaseMock.ts`, tests, `package.json` (`@supabase/supabase-js`, `@tanstack/react-query`).

**Acceptance:**

- Client is typed with `Database` from the generated types and reads only the two public env vars; a missing var fails fast with a clear message.
- `useSession()` returns loading, signed-out or signed-in; `useProfile()` returns the user's profile row including `role`.
- Query defaults: 60s stale time, retry once, refetch on window focus.
- Test helpers render a component with providers and a mocked client.

**Tests:** Session states with a mocked auth client; `useProfile` returns the row and handles error; missing env var throws.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t13-session
# after reviewing git status and git diff
git add -A
git commit -m "feat(auth): typed supabase client, session and query providers"
git push -u origin t13-session
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T14 · Sign in with Google and sign out

**Model:** Sonnet · **Depends on:** T13

**Goal:** Accounts open to anyone with a Google account. No email + password, because the project has no domain to send auth email from (`PLAN.md` §2).

**Files:** `src/features/auth/SignInPage.tsx`, `AuthCallbackPage.tsx`, `CompleteProfile.tsx`, `profileSchema.ts`, router entries (`/sign-in`, `/auth/callback`), tests, `package.json` (Zod), `supabase/config.toml` (Google provider block reading client id and secret from env), `.env.example`, `README.md` (how to create the Google OAuth client for local use).

**Acceptance:**

- One "Continue with Google" button (the primary action on the screen) with the independence notice under it; no domain restriction.
- After the first sign-in the user confirms or edits their display name (2–40, prefilled from Google) before continuing; returning users skip this.
- The user returns to the page they came from. A cancelled or failed Google flow shows a specific error with a retry.
- Sign out works and clears cached user data.
- No password, sign-up or reset screens exist; `/sign-up` redirects to `/sign-in`.

**Tests:** Display-name schema table tests; button calls the OAuth sign-in with the right redirect; callback error state; first-time versus returning user path.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t14-google-sign-in
# after reviewing git status and git diff
git add -A
git commit -m "feat(auth): Google sign-in, first-run display name and sign out"
git push -u origin t14-google-sign-in
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T15 · Route guards and account menu

**Model:** Haiku · **Depends on:** T14

**Goal:** Protect signed-in and admin routes in the UI and give the header an account entry point.

**Files:** `src/features/auth/RequireSession.tsx`, `RequireAdmin.tsx`, `src/app/AccountMenu.tsx`, router changes, tests.

**Acceptance:**

- `/profile` redirects signed-out users to `/sign-in` and returns them afterwards.
- `/admin/*` renders not-found for non-admins (do not reveal that the route exists).
- Header shows "Sign in" when signed out; when signed in, a menu with Profile, Admin (admins only) and Sign out.
- Guards show a skeleton while the session loads, never a flash of the wrong screen.

**Tests:** Each guard for signed-out, user and admin; menu items per role.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t15-guards
# after reviewing git status and git diff
git add -A
git commit -m "feat(auth): route guards and account menu"
git push -u origin t15-guards
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

## Calendar

### T16 · Date utilities in the campus time zone

**Model:** Sonnet · **Depends on:** T01

**Goal:** All date math in one tested module so views never compute dates themselves.

**Files:** `src/lib/dates.ts`, `src/lib/dates.test.ts`, `package.json` (date-fns and its time-zone companion).

**Acceptance:**

- Functions: month grid (weeks × 7 days, Sunday first, including leading and trailing days), week range, day range, each returning UTC instants for querying; parse and build route params (`yyyy-mm`, `yyyy-mm-dd`); format time ("7:30 PM"), time range, long date, month title; `isToday`, `isSameDay` in campus zone; group events by campus day.
- Everything uses `CAMPUS_TIME_ZONE` from config, never the device zone.
- An event spanning midnight appears on each day it touches.

**Tests:** Table-driven: months starting on each weekday; February in leap and non-leap years; both daylight-saving transitions in `America/Detroit`; a device zone different from campus zone; midnight-spanning event; invalid route params return a safe fallback.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t16-date-utils
# after reviewing git status and git diff
git add -A
git commit -m "feat(calendar): campus time zone date utilities"
git push -u origin t16-date-utils
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T17 · Events data layer

**Model:** Sonnet · **Depends on:** T13, T16, T09

**Goal:** Query hooks that load events for a date range with caching and prefetch.

**Files:** `src/features/events/queries.ts` (`queryKeys`, `useEventsInRange`, `useEvent`, `usePrefetchRange`), `src/features/events/types.ts`, tests.

**Acceptance:**

- One query per visible range selecting only the fields lists need (id, title, times, status, `going_count`, organization label and `color_key`, location); `useEvent(id)` loads the full event with hosts and category.
- When signed in, the range result also carries which event ids the user is going to (one extra query on `rsvps`, own rows).
- Adjacent ranges are prefetched when the browser is idle; cached ranges render instantly on navigation.
- Errors surface as typed errors for the views to render.

**Tests:** Range query builds the right bounds; going ids are merged; prefetch is called for previous and next; error path.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t17-events-queries
# after reviewing git status and git diff
git add -A
git commit -m "feat(events): range queries with caching and prefetch"
git push -u origin t17-events-queries
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T18 · Month view

**Model:** Sonnet · **Depends on:** T17, T05

**Goal:** The main screen: a month grid that is the visual focus, responsive per `DESIGN.md`.

**Files:** `src/features/calendar/MonthView.tsx`, `MonthGrid.tsx`, `DayCell.tsx`, `EventChip.tsx`, `DayDots.tsx`, `MonthSkeleton.tsx`, route `/month/:ym`, tests.

**Acceptance:**

- ≥768px: each day shows up to three chips (org dot, start time, one-line title) and "+n" for the rest. <768px: up to three org dots and "+n"; tapping a day selects it and lists that day's events below the grid.
- Today, selected, outside-month, cancelled, past and going states match `DESIGN.md`.
- Loading shows a grid-shaped skeleton; empty month shows "No events this month" under an intact grid; error shows ErrorState with Retry.
- Grid has `role="grid"`, each day an accessible name with date and event count, arrow keys move focus between days, Enter selects.
- Chips and rows link to `/event/:id` (dialog arrives in T22).
- Nothing sits above the calendar except the header and the navigation row.

**Tests:** Correct number of weeks; chips capped with "+n"; mobile renders dots and selected-day list; today has `aria-current="date"`; keyboard navigation; loading, empty and error states.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t18-month-view
# after reviewing git status and git diff
git add -A
git commit -m "feat(calendar): responsive month view"
git push -u origin t18-month-view
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T19 · Event row, agenda list and day view

**Model:** Sonnet · **Depends on:** T18

**Goal:** The reusable agenda row and the day view built from it.

**Files:** `src/features/calendar/EventRow.tsx`, `AgendaList.tsx`, `DayView.tsx`, route `/day/:ymd`, tests. Refactor the selected-day list in MonthView to use `AgendaList`.

**Acceptance:**

- Row shows time range (tabular), title (balanced, max two lines), organization label in its color, place, and the going marker.
- Day view lists events in start order; empty day shows "Nothing scheduled for this day".
- Cancelled events show a struck title and the word "Cancelled".
- Skeleton rows while loading; ErrorState with Retry on failure.

**Tests:** Ordering; cancelled and going rendering; empty, loading and error states; label uses the organization's color token.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t19-day-view
# after reviewing git status and git diff
git add -A
git commit -m "feat(calendar): agenda rows and day view"
git push -u origin t19-day-view
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T20 · Week view

**Model:** Haiku · **Depends on:** T19

**Goal:** Seven days of agenda lists.

**Files:** `src/features/calendar/WeekView.tsx`, route `/week/:ymd`, tests.

**Acceptance:**

- Sunday-to-Saturday week containing the route date; each day has a heading (weekday and date, today marked) followed by its `AgendaList`; days without events show a muted "No events" line, not a box.
- ≥1024px: seven columns. Below: one column, days stacked.
- Loading, empty-week and error states.

**Tests:** Correct seven days for a mid-week date; today marked; stacked versus columns by breakpoint class; states.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t20-week-view
# after reviewing git status and git diff
git add -A
git commit -m "feat(calendar): week view"
git push -u origin t20-week-view
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T21 · View switcher and date navigation

**Model:** Sonnet · **Depends on:** T20

**Goal:** Move between month, week and day, and through time, with the URL as the only state.

**Files:** `src/features/calendar/CalendarNav.tsx`, `ViewSwitcher.tsx`, `useCalendarRoute.ts`, router (`/` redirects to the current month), tests.

**Acceptance:**

- Segmented Month / Week / Day control; previous, next and Today buttons; the title shows the month, week range or day.
- Switching view keeps the focused date (month → week lands on the selected day's week, or today if it is in view).
- Browser Back and Forward work; reload keeps view and date; invalid params redirect to the current month.
- Previous and next trigger prefetch of the following range.
- Controls have accessible names ("Previous month"); active view is `aria-pressed`.

**Tests:** Route computed for each transition; Today from any view; invalid params; names of the previous and next buttons per view.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t21-calendar-nav
# after reviewing git status and git diff
git add -A
git commit -m "feat(calendar): view switcher and date navigation"
git push -u origin t21-calendar-nav
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

## Event detail

### T22 · Event dialog

**Model:** Sonnet · **Depends on:** T21

**Goal:** Clicking an event title opens the popup with everything about the event.

**Files:** `src/features/events/EventDialog.tsx`, `EventDialogSkeleton.tsx`, `Flyer.tsx`, `OrgLabel.tsx`, route `/event/:id` rendered over the current calendar view, tests, `package.json` (Radix Dialog).

**Acceptance:**

- Content order: flyer, title, organization label, placeholder slot for the going button (T23), date and time, place, host name(s), category, description, placeholder slot for export actions (T24).
- Flyer reserves its aspect ratio from stored width and height, lazy-loads, fades in once, has alt text "Flyer for <title>"; events without a flyer show no placeholder image.
- Centered modal ≥768px; bottom sheet below. Closes on Esc, backdrop and Back; focus returns to the element that opened it; opening `/event/:id` directly shows the dialog over the event's month.
- States: skeleton, loaded, not found ("This event doesn't exist or was removed"), error with Retry. Cancelled events say so at the top.
- Description preserves line breaks and renders as plain text (no HTML injection).

**Tests:** Field order; not-found and error states; Esc closes and restores focus; direct navigation; description with markup is rendered as text.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t22-event-dialog
# after reviewing git status and git diff
git add -A
git commit -m "feat(events): event dialog with flyer and details"
git push -u origin t22-event-dialog
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T23 · Going button with optimistic count

**Model:** Sonnet · **Depends on:** T22, T10

**Goal:** The primary action of the app.

**Files:** `src/features/events/GoingButton.tsx`, `useToggleGoing.ts`, `AttendeeCount.tsx`, tests.

**Acceptance:**

- States exactly as in `DESIGN.md`: not going, going, pending (optimistic), error (rollback with inline message), signed out (leads to sign-in and returns to the event), ended or cancelled (disabled).
- On toggle, the button, the dialog count, and the chip or row marker in the calendar behind update immediately; on failure all three roll back.
- Count reads "1 going", "12 going"; at zero shows "Be the first to go". Count change is announced politely to assistive tech.
- Rapid double taps result in one consistent final state and at most one request in flight.
- Animation is 120ms and disabled under reduced motion.

**Tests:** Optimistic increment and decrement; rollback on error; signed-out path; disabled for ended and cancelled; double-tap; cache for the range query is updated.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t23-going-button
# after reviewing git status and git diff
git add -A
git commit -m "feat(events): optimistic going toggle with attendee count"
git push -u origin t23-going-button
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T24 · Add to calendar

**Model:** Sonnet · **Depends on:** T22

**Goal:** Google Calendar link and an `.ics` download that Apple Calendar opens.

**Files:** `src/features/events/export/ics.ts`, `googleCalendarUrl.ts`, `AddToCalendar.tsx`, tests.

**Acceptance:**

- `.ics` is a valid single-event VCALENDAR: UID stable per event, DTSTAMP, DTSTART and DTEND in UTC, SUMMARY, LOCATION, DESCRIPTION, URL back to the event; text escaped and lines folded at 75 octets per RFC 5545.
- Google link uses the template URL with title, UTC dates, details and location, all URL-encoded.
- Two quiet actions in the dialog: "Google Calendar" and "Apple Calendar (.ics)". File name derives from the title.
- No dependency added.

**Tests:** Table-driven for both generators: commas, semicolons, newlines, emoji and long descriptions; daylight-saving dates; exact expected output for one fixture event.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t24-calendar-export
# after reviewing git status and git diff
git add -A
git commit -m "feat(events): Google Calendar link and ICS export"
git push -u origin t24-calendar-export
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

## Admin

### T25 · Admin: organizations

**Model:** Sonnet · **Depends on:** T15, T08

**Goal:** The admin creates and edits organizations and their labels.

**Files:** `src/features/admin/AdminLayout.tsx`, `OrganizationsPage.tsx`, `OrganizationForm.tsx`, `queries.ts`, routes `/admin`, `/admin/organizations`, tests.

**Acceptance:**

- List shows name, label rendered as it will appear on events, member count, archived state.
- Create and edit: name, label (2–24), color chosen from the eight swatches (each swatch has a text name; selection is not color-only).
- Archive and unarchive with a confirmation; archived organizations are not offered in the event form.
- Loading, empty ("No organizations yet. Create the first one.") and error states. Server errors (duplicate name) appear on the field.

**Tests:** Validation; duplicate-name error placement; archive flow; swatch selection is keyboard-operable.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t25-admin-organizations
# after reviewing git status and git diff
git add -A
git commit -m "feat(admin): manage organizations and labels"
git push -u origin t25-admin-organizations
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T26 · Admin: users and membership assignment

**Model:** Sonnet · **Depends on:** T25

**Goal:** The admin assigns users to organizations from a list of all users.

**Files:** `src/features/admin/UsersPage.tsx`, `MembershipEditor.tsx`, queries, route `/admin/users`, tests.

**Acceptance:**

- Searchable list of all users (display name, email, organizations), paginated at 50.
- Per user, add or remove membership in any non-archived organization; a user can belong to several; changes are optimistic with rollback.
- From an organization, a link shows its members.
- Removing a member warns that they will be removed as host from upcoming events.
- Loading, empty search result and error states.

**Tests:** Search filters; add and remove membership; rollback on error; multi-organization display.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t26-admin-users
# after reviewing git status and git diff
git add -A
git commit -m "feat(admin): user list and organization membership assignment"
git push -u origin t26-admin-users
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T27 · Event form (admin)

**Model:** Sonnet · **Depends on:** T26, T09

**Goal:** The admin creates, edits, publishes and cancels events for any organization.

**Files:** `src/features/events/form/EventForm.tsx`, `eventSchema.ts`, `HostPicker.tsx`, `useSaveEvent.ts`, `src/features/admin/EventsPage.tsx`, routes `/admin/events`, `/admin/events/new`, `/admin/events/:id`, tests.

**Acceptance:**

- Fields: organization, title, description, category, date, start time, end time, place, hosts (chosen from that organization's members; at least one to publish).
- Times are entered and shown in campus time; end must be after start; defaults to a one-hour event.
- Save as draft or Publish. Save sequence: write event as draft, write hosts, then set published; a failure midway leaves a draft and says so.
- Edit existing; Cancel event (with confirmation) sets `cancelled`; Delete permanently is admin-only with a typed confirmation.
- Admin event list with filters by organization and status.
- The form component takes the list of selectable organizations as a prop so Phase 2 can reuse it.

**Tests:** Schema table tests; publish blocked without a host; host picker only lists members of the chosen organization; changing organization clears hosts; cancel and delete confirmations.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t27-event-form
# after reviewing git status and git diff
git add -A
git commit -m "feat(events): admin event form with hosts, draft and publish"
git push -u origin t27-event-form
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T28 · Flyer upload with in-browser compression

**Model:** Sonnet · **Depends on:** T27, T11

**Goal:** Attach a flyer to an event without relying on paid image transformations.

**Files:** `src/features/events/form/FlyerInput.tsx`, `src/lib/image/compress.ts`, `useUploadFlyer.ts`, tests.

**Acceptance:**

- Accepts JPEG, PNG, WebP up to 15 MB input; resizes so the longest side is at most 1600px and encodes WebP, stepping quality down until ≤300 KB (hard stop at 1 MB with a clear error).
- Shows a preview, the final size, and progress; can replace or remove.
- Uploads to `<organization_id>/<event_id>/<random>.webp`, stores path, width and height on the event, and deletes the previous file on replace.
- Reads EXIF orientation correctly; strips metadata.
- Uses canvas APIs only; no new dependency unless the task is escalated.

**Tests:** Dimension math (landscape, portrait, already small); quality step-down loop with a mocked encoder; rejects unsupported types and oversize output; path format.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t28-flyer-upload
# after reviewing git status and git diff
git add -A
git commit -m "feat(events): flyer upload with client-side resize and compression"
git push -u origin t28-flyer-upload
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

## Profile and launch

### T29 · Profile (MVP)

**Model:** Sonnet · **Depends on:** T23

**Goal:** A profile page with what exists so far.

**Files:** `src/features/profile/ProfilePage.tsx`, `EditDisplayName.tsx`, queries, tests.

**Acceptance:**

- Sections: display name (editable, 2–40), "Going" (upcoming events I marked), "Hosting and created" (only if I am a member of any organization), and my organizations as labels.
- "Attended" and "Badges" are not shown yet (they arrive in T41); no empty placeholder cards.
- Each list uses `AgendaList`; each has its own loading, empty ("You haven't marked any upcoming events") and error state.
- Sign out is available here.

**Tests:** Name validation and save; sections per role (plain user versus org member); states.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t29-profile
# after reviewing git status and git diff
git add -A
git commit -m "feat(profile): profile page with going and hosting lists"
git push -u origin t29-profile
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T30 · Installable PWA

**Model:** Sonnet · **Depends on:** T21

**Goal:** Installable, fast on repeat visits, readable offline for already-viewed months.

**Files:** `vite.config.ts` (PWA plugin), `public/` icons (own mark; no university imagery), manifest fields, `src/app/UpdatePrompt.tsx`, query persistence in `src/lib/queryClient.ts`, tests, `package.json`.

**Acceptance:**

- Manifest: name from `APP_NAME`, description containing the independence wording, `display: standalone`, theme colors from tokens, maskable icons.
- Service worker precaches the app shell; flyers are cache-first with a size and age cap; Supabase API calls are not cached by the worker.
- Event range queries persist locally so the last viewed months render offline with a small "Offline. Showing saved events." line.
- A new version shows a "Update available. Reload" prompt, never a silent reload mid-use.
- Going toggles while offline fail with the standard inline error (no offline write queue).

**Tests:** Manifest content test (name, description includes the notice); update prompt renders on the worker's update event; offline line shows when `navigator.onLine` is false.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t30-pwa
# after reviewing git status and git diff
git add -A
git commit -m "feat: installable PWA with offline shell and update prompt"
git push -u origin t30-pwa
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T31 · Performance pass

**Model:** Sonnet · **Depends on:** T30, T28

**Goal:** Meet a stated budget on a mid-range phone.

**Files:** router (lazy routes), `vite.config.ts` (chunking), image attributes, `docs/PERFORMANCE.md`, tests where behavior changes.

**Acceptance:**

- Budget: entry JavaScript ≤ 170 KB gzip; admin, profile, auth and form code in separate lazy chunks; Largest Contentful Paint ≤ 2.5s and Cumulative Layout Shift ≤ 0.05 on Lighthouse mobile for `/month/...`. Record the measured numbers in `docs/PERFORMANCE.md`.
- Flyers: `loading="lazy"`, `decoding="async"`, explicit dimensions. Font is preloaded and subset.
- Lazy routes show the matching skeleton, not a spinner.
- A script `npm run size` prints chunk sizes; note it in `CLAUDE.md` commands.

**Tests:** A build-size test that fails if the entry chunk exceeds the budget.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t31-performance
# after reviewing git status and git diff
git add -A
git commit -m "perf: route splitting, image loading and size budget"
git push -u origin t31-performance
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T32 · Accessibility and anti-slop audit

**Model:** Opus · **Depends on:** T31

**Goal:** One deliberate pass over every screen against `DESIGN.md`, fixing what is found.

**Files:** any UI file that needs a fix (list them in the final message), `src/test/a11y.test.tsx`, `docs/AUDIT.md`, `package.json` (an axe matcher for Vitest).

**Acceptance:**

- `docs/AUDIT.md` has a table: each of the 15 anti-slop rules × each screen (calendar month/week/day, dialog, auth, profile, admin), pass or fixed, in light and dark.
- Automated axe checks pass for each main screen in its loaded state.
- Full keyboard walkthrough works: open the app, move to a day, open an event, toggle going, close, switch view.
- No raw hex values or off-scale spacing remain (grep-based test).

**Tests:** Axe test per screen; a test that scans `src/` for hex color literals outside `tokens.css`.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t32-a11y-audit
# after reviewing git status and git diff
git add -A
git commit -m "fix(ui): accessibility and anti-slop audit"
git push -u origin t32-a11y-audit
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T33 · Deploy configuration and runbook

**Model:** Sonnet · **Depends on:** T32

**Goal:** Everything needed to put the MVP online, with the manual steps written down.

**Files:** `public/_redirects` (SPA fallback), `public/_headers` (security headers and a Content Security Policy allowing only self and the Supabase project), `docs/DEPLOY.md`.

**Acceptance:**

- `docs/DEPLOY.md` covers, as numbered owner steps: create the Supabase project; `supabase link` and `supabase db push`; auth settings (email provider off, site and redirect URLs, Google provider with a Google Cloud OAuth client); turn on GitHub secret scanning and push protection; make the first admin with one SQL statement; Cloudflare Pages project connected to the repo with the two env vars and preview deploys on the free `*.pages.dev` address; what to do when the free project is paused; how to apply later migrations.
- CSP does not break the app locally (`npm run build && npm run preview`).
- The doc repeats the cost table from `PLAN.md` §2.

**Tests:** A unit test that reads `_headers` and asserts the CSP contains no wildcard source and no `unsafe-eval`.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t33-deploy
# after reviewing git status and git diff
git add -A
git commit -m "chore: deploy configuration and runbook"
git push -u origin t33-deploy
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

---

# Phase 2 — Organization member tools

### T34 · "My organizations" area

**Model:** Sonnet · **Depends on:** T33

**Goal:** Members see and manage their own organizations' events.

**Files:** `src/features/orgs/OrgsLayout.tsx`, `OrgEventsPage.tsx`, `RequireMember.tsx`, queries, routes `/orgs`, `/orgs/:orgId/events`, account-menu entry, tests.

**Acceptance:**

- The menu entry appears only for users with at least one membership.
- Per organization: upcoming, drafts, past and cancelled events, each row linking to edit.
- A member of several organizations switches between them; an organization the user is not in renders not-found.
- Loading, empty ("No events yet. Create one.") and error states.

**Tests:** Visibility by membership; drafts only for own organization; not-found for others.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t34-my-organizations
# after reviewing git status and git diff
git add -A
git commit -m "feat(orgs): member area listing organization events"
git push -u origin t34-my-organizations
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T35 · Members create and edit events

**Model:** Sonnet · **Depends on:** T34

**Goal:** Reuse the event form for members, limited to their organizations.

**Files:** `src/features/orgs/OrgEventNewPage.tsx`, `OrgEventEditPage.tsx`, small changes to `EventForm.tsx` (organization fixed, no delete, no move), tests.

**Acceptance:**

- Organization is preselected and fixed; hosts are picked from that organization's members; the creator is preselected as a host.
- Members can save drafts, publish, edit, upload or replace the flyer, and cancel. They cannot delete or move events (controls absent, and the database refuses).
- A rejected write (for example membership removed meanwhile) shows "You no longer have access to this organization".

**Tests:** Controls absent for members; permission error message; creator preselected; integration test of the save sequence with a mocked client.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t35-member-events
# after reviewing git status and git diff
git add -A
git commit -m "feat(orgs): members create and edit their organization's events"
git push -u origin t35-member-events
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T36 · Attendee list for hosts and members

**Model:** Sonnet · **Depends on:** T35

**Goal:** Managers see who is going; nobody else does.

**Files:** `src/features/orgs/AttendeesPage.tsx`, `useEventAttendees.ts`, link from the event dialog (managers only), route `/orgs/:orgId/events/:eventId/attendees`, tests.

**Acceptance:**

- Calls `event_attendees`; shows names in RSVP order with the total; search by name.
- The dialog shows a "See who's going" link only when the user can manage the event; regular users still see only the count.
- Loading, empty ("Nobody has marked going yet") and error states; a permission failure renders not-found.

**Tests:** Link visibility by role; list rendering; not-found on permission error.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t36-attendee-list
# after reviewing git status and git diff
git add -A
git commit -m "feat(orgs): attendee list for event managers"
git push -u origin t36-attendee-list
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T37 · Report an event

**Model:** Opus · **Depends on:** T36

**Goal:** Any signed-in user can report an event; the admin reviews reports.

**Files:** new migration (`event_reports` + RLS), `supabase/tests/event_reports.test.sql`, matrix rows 25–26 in `matrix.test.sql`, `src/features/events/ReportEvent.tsx`, `src/features/admin/ReportsPage.tsx`, tests, regenerated types.

**Acceptance:**

- A user can insert one open report per event with a reason (10–500 chars); cannot read anyone's reports, including their own after sending.
- Admin can read all reports and mark them resolved; admin sees a count of open reports in the admin nav.
- "Report" is a quiet action at the bottom of the dialog; confirmation is inline ("Report sent").

**Tests (pgTAP + client):** insert as user; duplicate open report rejected; user and member cannot select; admin can select and resolve; form validation.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t37-report-event
# after reviewing git status and git diff
git add -A
git commit -m "feat: report an event and admin review queue"
git push -u origin t37-report-event
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

---

# Phase 3 — Attendance verification and badges

### T38 · Attendance verifications table and rules

**Model:** Opus · **Depends on:** T37

**Goal:** One host marks a student as attended; that single row is the verification.

**Files:** new migration, `supabase/tests/attendance.test.sql`, matrix rows 14, 15, 22, 23 in `matrix.test.sql`, regenerated types.

**Acceptance:**

- Table matches `PLAN.md` §4; primary key `(event_id, user_id)` makes a second verification a no-op.
- Insert only by a host of that event or admin; `verified_by = auth.uid()`; `verified_by <> user_id`; the student must have an RSVP for the event; allowed from 30 minutes before start until 7 days after end (both values in one SQL function).
- Delete (undo) by any host of the event or admin, inside the same window.
- Select: the student sees own rows; managers of the event see its rows.
- `event_attendees` gains a `verified` boolean.

**Tests (pgTAP):** host verifies and a second host's attempt changes nothing; non-host member, plain user and member of another organization cannot verify; self-verification fails; outside the window fails; no RSVP fails; undo works; a student cannot insert their own row.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t38-attendance-db
# after reviewing git status and git diff
git add -A
git commit -m "feat(db): attendance verifications with host-only rules"
git push -u origin t38-attendance-db
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T39 · Badges and award trigger

**Model:** Opus · **Depends on:** T38

**Goal:** Extensible badges awarded automatically from verified attendance.

**Files:** new migration (`badges`, `user_badges`, award function and trigger, seed rows for thresholds 1, 5, 10, 25, 50), `supabase/tests/badges.test.sql`, regenerated types.

**Acceptance:**

- `badges` readable by everyone; `user_badges` readable by the owner and admin; neither writable by clients.
- After each verification insert or delete, the student's badges equal exactly the set whose threshold ≤ their verified count.
- The award function switches on `rule_type`; adding a new rule type requires no table change. A comment documents how.

**Tests (pgTAP):** first verification awards the first badge; the fifth awards the second; undo at five removes it; clients cannot insert into `user_badges`; another user cannot read my badges.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t39-badges-db
# after reviewing git status and git diff
git add -A
git commit -m "feat(db): badges with automatic award on verified attendance"
git push -u origin t39-badges-db
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T40 · Host check-in screen

**Model:** Sonnet · **Depends on:** T39

**Goal:** A phone-first screen a host uses at the door.

**Files:** `src/features/attendance/CheckInPage.tsx`, `useVerifyAttendance.ts`, route `/orgs/:orgId/events/:eventId/check-in`, link from the attendee list, tests.

**Acceptance:**

- Lists people who marked going; each row has one large "Mark attended" control that becomes "Attended" with an undo; optimistic with rollback.
- Search by name stays pinned at the top; counter reads "8 of 23 attended".
- Only hosts and admin see the entry point; members who are not hosts see the attendee list without check-in controls.
- Before the window opens: "Check-in opens 30 minutes before the event". After it closes: read-only.
- The host's own row has no control.

**Tests:** Optimistic mark and undo; rollback; window states; controls absent for non-host member; own row.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t40-check-in
# after reviewing git status and git diff
git add -A
git commit -m "feat(attendance): host check-in screen"
git push -u origin t40-check-in
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T41 · Profile: attended events and badges

**Model:** Sonnet · **Depends on:** T40

**Goal:** Complete the profile.

**Files:** `src/features/profile/AttendedSection.tsx`, `BadgesSection.tsx`, queries, tests.

**Acceptance:**

- "Attended" lists verified events only, newest first, with a total.
- "Badges" shows earned badges (name, date earned) and one line of progress to the next ("2 more events to reach 5"). Unearned badges are not shown as greyed-out trophies.
- Badge visuals follow `DESIGN.md`: text and a simple numeral mark, no gradients or illustrations.
- Loading, empty ("Attend an event and have a host check you in to earn your first badge") and error states.

**Tests:** Only verified events listed; progress line math at 0, 1, 4, 5, 50; states.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t41-profile-attendance
# after reviewing git status and git diff
git add -A
git commit -m "feat(profile): attended events and badges"
git push -u origin t41-profile-attendance
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T42 · Attendance requests

**Model:** Opus · **Depends on:** T41

**Goal:** An attendee asks the hosts to confirm they were there; when any one host accepts, their attendance is marked. This is how walk-ins who never marked going get verified.

**Files:** new migration (`attendance_requests` + RLS, functions `accept_attendance_request` and `decline_attendance_request`, relaxed RSVP rule on `attendance_verifications`), `supabase/tests/attendance_requests.test.sql`, matrix rows 27–28 in `matrix.test.sql`, `src/features/attendance/RequestAttendance.tsx` (in the event dialog), `AttendanceRequests.tsx` (section at the top of `CheckInPage.tsx`), queries, tests, regenerated types.

**Acceptance:**

- Any signed-in user can create one request per event for themselves, only inside the verification window (30 minutes before start to 7 days after end), only for published events, and not for an event they host. No RSVP is needed.
- The requester can read and withdraw their own pending request. Hosts of the event and admin can read its requests with the requester's display name; nobody else can.
- Accept, by any one host or admin, sets the request to accepted and inserts the verification in one transaction; badges follow from the existing trigger. If the person is already verified, the request simply becomes accepted. A second host acting on a decided request changes nothing.
- Decline sets it to declined; the requester cannot send another for that event. A host can still mark that person from the going list.
- A verification now requires an RSVP **or** an accepted request; direct marking from the going list (T38, T40) is unchanged. Self-acceptance is impossible.
- Dialog, during the window, for users not yet verified: quiet action "I was there" → "Request sent. Waiting for a host." → "Attendance confirmed" or "Request declined". It never outranks the going button before the event ends.
- Check-in screen: "Requests (3)" list above the going list with Accept and Decline per row, optimistic with rollback; empty state is no section at all.

**Tests (pgTAP + client):** user requests and host accepts → verification row exists and first badge awarded; walk-in without RSVP works; duplicate request fails; request outside the window fails; host cannot request for own event; non-host member, plain user and member of another organization cannot read, accept or decline; requester cannot accept their own; second host's accept is a no-op; declined blocks a new request; dialog states; accept and decline with rollback.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t42-attendance-requests
# after reviewing git status and git diff
git add -A
git commit -m "feat(attendance): attendance requests accepted by a host"
git push -u origin t42-attendance-requests
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

---

# Phase 4 — Notifications

### T43 · Notification tables

**Model:** Opus · **Depends on:** T41

**Goal:** Storage for subscriptions, preferences and an idempotency log.

**Files:** new migration (`push_subscriptions`, `notification_settings`, `reminder_log`), `supabase/tests/notifications.test.sql`, regenerated types.

**Acceptance:**

- Users can insert, read and delete only their own subscriptions and settings.
- `reminder_log` is unreadable and unwritable by clients; unique on `(event_id, user_id, channel)`.
- A SQL function returns the (user, event) pairs due for today's digest in campus time that have no log row, for use by the Edge Function with the service role only.

**Tests (pgTAP):** own-row rules; clients cannot touch `reminder_log`; the due-pairs function returns today's going events and excludes cancelled events and already-logged pairs.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t43-notification-db
# after reviewing git status and git diff
git add -A
git commit -m "feat(db): push subscriptions, settings and reminder log"
git push -u origin t43-notification-db
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T44 · Notification settings and web push subscription

**Model:** Sonnet · **Depends on:** T43

**Goal:** Users opt in to same-day reminders.

**Files:** `src/features/notifications/NotificationSettings.tsx`, `usePushSubscription.ts`, service-worker push and click handlers, profile link, `.env.example` (`VITE_VAPID_PUBLIC_KEY`), tests.

**Acceptance:**

- One toggle: "Push reminders on the day", off by default. No email option (no domain).
- The permission prompt appears only after the user turns the toggle on, never on page load.
- On iOS in a browser tab, the push toggle is replaced by install steps ("Add to Home Screen to get reminders"). Unsupported browsers see a plain sentence that reminders are not available in this browser.
- Denied permission is explained with how to re-enable. Turning off deletes the subscription row.
- A notification click opens the event.

**Tests:** Toggle flows with mocked Push API; iOS-in-tab branch; denied branch; unsubscribe removes the row.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t44-notification-settings
# after reviewing git status and git diff
git add -A
git commit -m "feat(notifications): reminder settings and web push subscription"
git push -u origin t44-notification-settings
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T45 · Reminder sender Edge Function

**Model:** Opus · **Depends on:** T44

**Goal:** Send the 08:00 digest once per user per day.

**Files:** `supabase/functions/send-reminders/` (handler, web-push sender, message builder), Deno tests, `.github/workflows/ci.yml` (add a `functions` job running `deno test` and `deno lint`), `docs/DEPLOY.md` (secrets: VAPID keys, function secret).

**Acceptance:**

- Rejects calls without the shared function secret. Acts only during the 08:00 campus hour unless called with a `force` flag by the service role.
- For each due user: one push per subscription summarizing today's events (title and time of the first, "+n more") that opens the day view; writes `reminder_log` so a second run sends nothing.
- Expired push subscriptions (410/404) are deleted. One user's failure does not stop the batch.

**Tests (Deno):** message builder for one and several events; idempotency with a mocked database; expired subscription cleanup; hour gate; missing secret returns 401.

**Owner, after merging:** add `functions` to the required status checks.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t45-send-reminders
# after reviewing git status and git diff
git add -A
git commit -m "feat(notifications): same-day reminder Edge Function"
git push -u origin t45-send-reminders
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T46 · Schedule the reminders

**Model:** Sonnet · **Depends on:** T45

**Goal:** Run the function hourly from the database.

**Files:** new migration (enable `pg_cron` and `pg_net`, schedule an hourly job that posts to the function using a secret read from Vault), `docs/DEPLOY.md` (how to set the secret, how to check job runs, how to trigger manually).

**Acceptance:**

- The job exists after migration and calls the function URL with the secret header; the URL and secret are not hard-coded in the migration.
- The runbook shows how to see the last runs and their status.

**Tests (pgTAP):** the cron job row exists with an hourly schedule.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t46-reminder-schedule
# after reviewing git status and git diff
git add -A
git commit -m "feat(notifications): hourly schedule for reminders"
git push -u origin t46-reminder-schedule
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

---

# Phase 5 — Instagram

### T47 · Instagram link section

**Model:** Haiku · **Depends on:** T33

**Goal:** A section that links to the university events Instagram account.

**Files:** `src/features/instagram/InstagramSection.tsx`, `src/lib/config.ts` (`INSTAGRAM_URL`, `INSTAGRAM_HANDLE`), About page and a link in the footer, tests.

**Acceptance:**

- Text link "@handle on Instagram" opening in a new tab with `rel="noopener noreferrer"`, and a sentence that the account belongs to its owner, not to this app.
- No Instagram logo artwork beyond the Lucide icon; no embedded content; no third-party script.
- Hidden entirely if the config value is empty.

**Tests:** Link attributes; hidden when unset.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t47-instagram-link
# after reviewing git status and git diff
git add -A
git commit -m "feat: Instagram link section"
git push -u origin t47-instagram-link
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T48 · Admin-curated embedded posts

**Model:** Sonnet · **Depends on:** T47

**Goal:** Show selected recent posts without any Instagram API (see `PLAN.md` §9).

**Files:** new migration (`instagram_posts` + RLS: public read, admin write), tests, `src/features/admin/InstagramPostsPage.tsx`, `src/features/instagram/PostEmbeds.tsx`, `public/_headers` (CSP additions for Instagram's embed origin), regenerated types.

**Acceptance:**

- Admin pastes post URLs (validated as Instagram post or reel URLs), reorders and removes them; at most six are shown.
- Embeds and Instagram's script load only after the user taps "Show posts"; until then there is no request to Instagram.
- If an embed fails, the plain link remains.
- Stories and automatic feeds are not attempted.

**Tests:** URL validation table; no script tag before the tap; pgTAP for the table's policies.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t48-instagram-embeds
# after reviewing git status and git diff
git add -A
git commit -m "feat: admin-curated Instagram post embeds"
git push -u origin t48-instagram-embeds
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

---

# Phase 6 — Mobile wrap

### T49 · Account deletion

**Model:** Opus · **Depends on:** T41

**Goal:** Users delete their own account in the app (required by the App Store for apps with sign-up).

**Files:** `supabase/functions/delete-account/`, Deno tests, `src/features/profile/DeleteAccount.tsx`, a migration if foreign keys need `on delete` adjustments, `PrivacyPage.tsx`, tests.

**Acceptance:**

- The function deletes the caller's auth user using the service role, identified only from the caller's verified JWT.
- Cascades remove profile, RSVPs, memberships, subscriptions, badges and verifications of the user; events they created remain; host rows are removed, and the function refuses with a clear message if the user is the only host of an upcoming published event.
- UI requires typing "delete" and signs the user out afterwards.

**Tests:** Deno tests for auth handling and the only-host refusal; pgTAP for cascades and `going_count` staying exact; client confirmation flow.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t49-account-deletion
# after reviewing git status and git diff
git add -A
git commit -m "feat: self-service account deletion"
git push -u origin t49-account-deletion
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T50 · Capacitor projects

**Model:** Sonnet · **Depends on:** T49

**Goal:** The built web app running as iOS and Android apps.

**Files:** `capacitor.config.ts`, `ios/`, `android/`, `package.json` (Capacitor core, CLI, iOS, Android, status bar, app), safe-area and back-button handling in `src/app/`, `docs/MOBILE.md`.

**Acceptance:**

- `npm run build && npx cap sync` produces runnable projects; app id and name come from config and do not contain the university's name as the title.
- Android hardware Back closes the dialog first, then navigates, then exits. Safe areas respected; status bar matches the theme in light and dark.
- The service worker is disabled inside the native shell; the web build is unaffected.
- `docs/MOBILE.md` lists build and run steps and the paid accounts required.

**Tests:** Unit test for the back-button handler order; platform detection helper.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t50-capacitor
# after reviewing git status and git diff
git add -A
git commit -m "feat(mobile): Capacitor iOS and Android projects"
git push -u origin t50-capacitor
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T51 · Native auth redirects

**Model:** Sonnet · **Depends on:** T50

**Goal:** Google sign-in returns into the app.

**Files:** deep-link configuration in `ios/` and `android/`, `src/features/auth/nativeRedirect.ts`, `docs/MOBILE.md`, `docs/DEPLOY.md` (extra redirect URLs), tests.

**Acceptance:**

- Google sign-in completes in the system browser and returns with a session.
- The web flows are unchanged.

**Tests:** URL parsing and routing table for the redirect handler.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t51-native-auth
# after reviewing git status and git diff
git add -A
git commit -m "feat(mobile): deep links for auth flows"
git push -u origin t51-native-auth
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T52 · Native push

**Model:** Opus · **Depends on:** T51, T45

**Goal:** Reminders through APNs and FCM in the store apps.

**Files:** `package.json` (Capacitor push plugin), `src/features/notifications/useNativePush.ts`, migration adding `platform` and token columns if missing, `supabase/functions/send-reminders/` (FCM sender), tests, `docs/MOBILE.md` and `docs/DEPLOY.md` (Firebase project, APNs key, secrets).

**Acceptance:**

- In the native shell the push toggle registers a device token instead of a web push subscription; on the web nothing changes.
- The sender delivers to web and native subscriptions in one run with the same idempotency.
- Tapping a notification opens the event.

**Tests:** Deno tests for the FCM payload and invalid-token cleanup; client test for the platform branch.

**Git:**

```
# before
git checkout main && git pull
git checkout -b t52-native-push
# after reviewing git status and git diff
git add -A
git commit -m "feat(mobile): native push reminders"
git push -u origin t52-native-push
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```

### T53 · Store listing checklist

**Model:** Haiku · **Depends on:** T52

**Goal:** Everything needed to submit, written down.

**Files:** `docs/STORE.md`.

**Acceptance:**

- Listing text with the independence notice in the first lines; a name that does not present the app as official; no university logo in icon or screenshots.
- Privacy answers (data collected: email, name, RSVPs, attendance; not sold; deletion available in-app), content rating notes, the report-an-event mechanism and account deletion called out for review, test account instructions for reviewers.
- Screenshot list per device size, and the Google Play closed-testing requirement for new personal accounts.

**Tests:** None (documentation).

**Git:**

```
# before
git checkout main && git pull
git checkout -b t53-store-checklist
# after reviewing git status and git diff
git add -A
git commit -m "docs: store listing checklist"
git push -u origin t53-store-checklist
gh pr create --fill
# when CI is green
gh pr merge --squash --delete-branch
```
