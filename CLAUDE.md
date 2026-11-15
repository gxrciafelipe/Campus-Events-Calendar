# CLAUDE.md

Instructions for any model working in this repository. Read this file, then the task you were given in `TASKS.md`, then only the sections of `PLAN.md` and `DESIGN.md` that the task touches.

## What this is

An independent calendar of campus events at Madonna University: React + Vite + TypeScript PWA on Supabase. It is **not** run by or affiliated with the university. Never add the university's logo, wordmark, seal or photos, and never remove the independence notice.

## Hard rules

1. **Never run `git commit`, `git push`, `git merge` or `gh pr`.** The owner commits. When the task is done, stop and print the git commands listed at the end of the task.
2. **One task per session.** Do exactly the task named. Do not start the next one, do not refactor unrelated code, do not add features the task does not list. If something outside the task is broken, say so in your final message.
3. **Tests ship with the task.** A task is not done until its required tests exist and `npm run check` passes locally (and `npm run db:test` if you touched `supabase/`).
4. **Permissions live in the database.** Every rule is enforced by RLS, grants, constraints or triggers. A UI check is never the only protection. If you change a policy, update the matrix in `PLAN.md` §6 and `supabase/tests/matrix.test.sql` in the same task.
5. **Schema changes are new migration files.** Never edit a migration that is already on `main`. After any migration, run `npm run db:types` and include the regenerated file.
6. **Follow `DESIGN.md` for all UI.** Use tokens, never raw hex values or ad-hoc spacing.
7. Before finishing any UI task, check the work against the anti-slop rules in DESIGN.md.
8. **No new dependencies** unless the task names them. If you believe one is needed, stop and ask.
9. **No secrets in the repo.** Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` (the public browser key) reach the client. The service-role key is used only inside Edge Functions and is never committed.
10. **Organizations are data.** No organization name ("RA", "BSU") in code, migrations, policies or tests other than seed and fixture data.
11. If a task is ambiguous or conflicts with `PLAN.md`, stop and ask. Do not guess on permissions or data model.

## Commands

| Command                                   | Does                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `npm run dev`                             | Vite dev server                                                           |
| `npm run lint`                            | ESLint (includes jsx-a11y)                                                |
| `npm run format` / `npm run format:check` | Prettier write / verify                                                   |
| `npm run typecheck`                       | `tsc --noEmit`                                                            |
| `npm run test`                            | Vitest, single run                                                        |
| `npm run build`                           | Production build                                                          |
| `npm run check`                           | lint + format:check + typecheck + test + build (what CI's `web` job runs) |
| `npm run db:start` / `npm run db:stop`    | Local Supabase (Docker required)                                          |
| `npm run db:reset`                        | Recreate the local database from migrations and seed                      |
| `npm run db:test`                         | pgTAP permission tests (`supabase test db`)                               |
| `npm run db:lint`                         | `supabase db lint`                                                        |
| `npm run db:types`                        | Regenerate `src/lib/database.types.ts` from the local database            |

## Folder layout

```
.github/workflows/ci.yml
PLAN.md  TASKS.md  DESIGN.md  CLAUDE.md
docs/                      DEPLOY.md and other runbooks
public/                    icons, manifest assets, _redirects, _headers
src/
  app/                     router, providers, layout shell
  components/ui/           primitives (Button, Field, Skeleton, EmptyState, ErrorState, Toast)
  features/
    calendar/              month, week, day views; date navigation
    events/                event dialog, going button, export, event form
    auth/                  sign-in, sign-up, session, guards
    profile/
    admin/                 organizations, users, memberships
    orgs/                  org member tools (Phase 2)
    attendance/            check-in, badges (Phase 3)
    notifications/         (Phase 4)
  lib/                     supabase client, query client, dates, config, database.types.ts (generated)
  styles/                  tokens.css, base.css
  test/                    setup and shared test helpers
supabase/
  config.toml
  migrations/              timestamped SQL, one concern per file
  seed.sql                 local development data only
  tests/                   pgTAP: one file per table + matrix.test.sql + fixtures
  functions/               Edge Functions (Phase 4+)
```

A feature folder holds its components, hooks (`use*.ts`), queries and tests together. Features import from `lib/` and `components/ui/`, never from each other's internals; share through an `index.ts`.

## Conventions

**TypeScript and React**

- `strict` is on. No `any`, no non-null `!`, no `@ts-ignore`. Type database rows from `database.types.ts`.
- Function components and hooks only. Named exports. One component per file, file named after it (`EventDialog.tsx`); tests beside it (`EventDialog.test.tsx`).
- Server state goes through TanStack Query hooks in the feature folder. No `supabase` calls inside components. Query keys come from one `queryKeys` object per feature.
- View and date state live in the URL, not in component state.
- Every async view renders loading, empty and error states (see `DESIGN.md`).
- User-facing strings are specific and in sentence case. App name and the independence wording come from `src/lib/config.ts`, never typed inline.
- All date math goes through `src/lib/dates.ts` in the campus time zone. Never use `new Date()` formatting directly in a component.

**SQL**

- Lowercase SQL, snake_case names, plural table names. Every table: `enable row level security` in the same migration that creates it, plus explicit policies per command. No table is ever left without RLS.
- Policies call the helper functions (`is_admin()`, `is_org_member()`, `is_event_host()`, `can_manage_event()`), never repeat their logic inline.
- `security definer` functions set `search_path = ''` and schema-qualify everything.
- Column-level grants protect columns clients must not write (`profiles.role`, `events.going_count`).
- Each migration comes with pgTAP tests proving both what is allowed and what is denied, including a user from a different organization.

**Tests**

- Client: Vitest + Testing Library. Test behavior a user can observe; query by role and name. Pure logic (dates, ICS, validation) gets table-driven unit tests.
- Database: pgTAP in `supabase/tests/`. Use the shared fixtures to act as each role.
- Do not delete or weaken a test to make it pass. If a test is wrong, say why in your final message.

**Git (for the owner, not for you)**

- Branch per task: `tNN-short-slug`. Conventional commit subjects (`feat:`, `fix:`, `chore:`, `test:`, `docs:`), scope optional. Squash merge after CI is green.

## Finishing a task

End your final message with, in this order:

1. What changed, in two or three sentences.
2. Anything you could not do or are unsure about.
3. Manual steps for the owner, if any (dashboard settings, env vars, `supabase db push`).
4. The output of `npm run check` (and `npm run db:test` when relevant): pass or fail, no paraphrase.
5. The git commands from the task, verbatim.
