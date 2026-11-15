# Campus Events Calendar

An independent calendar of campus events at Madonna University. This project is not run by, endorsed by or affiliated with Madonna University.

Month, week and day views, an "I'm going" button with a public count, and calendar export. Built with React, Vite and TypeScript as an installable PWA, on Supabase. See [PLAN.md](PLAN.md) for the plan, [DESIGN.md](DESIGN.md) for the design rules and [TASKS.md](TASKS.md) for the work queue.

## Requirements

- Node.js 24 (see `.nvmrc`)
- Docker, only for the database scripts (see [Local database](#local-database)). The Supabase CLI is a dev dependency and installs with `npm install`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the two public Supabase values
npm run dev
```

## Local database

The `db:*` scripts need Docker running. They use the Supabase CLI from `node_modules`, so there is nothing else to install.

```bash
npm run db:start   # start local Postgres, Auth and Studio (first run downloads images)
npm run db:reset   # recreate the database from supabase/migrations and supabase/seed.sql
npm run db:test    # run the pgTAP tests in supabase/tests
npm run db:lint    # lint the public schema (skips pgTAP's own functions in extensions)
npm run db:types   # regenerate src/lib/database.types.ts from the local schema
npm run db:stop    # stop the local stack
```

`db:start` prints the local API URL and the publishable key. Put them in `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`. The local auth site URL is the Vite dev server, `http://localhost:5173`. Seed data and test fixtures use invented people only.

Schema changes are new files in `supabase/migrations/`; run `npm run db:types` after each one and commit the regenerated types.

## Scripts

| Command                                     | Does                                          |
| ------------------------------------------- | --------------------------------------------- |
| `npm run dev`                               | Vite dev server                               |
| `npm run lint`                              | ESLint                                        |
| `npm run format` / `npm run format:check`   | Prettier write / verify                       |
| `npm run typecheck`                         | `tsc` without emitting                        |
| `npm run test`                              | Vitest, single run                            |
| `npm run build`                             | Production build                              |
| `npm run check`                             | lint, format check, typecheck, test and build |
| `npm run db:start` / `db:stop` / `db:reset` | Local Supabase                                |
| `npm run db:test` / `db:lint` / `db:types`  | pgTAP tests, database lint, generated types   |

## License

[MIT](LICENSE). Report vulnerabilities as described in [SECURITY.md](SECURITY.md).
