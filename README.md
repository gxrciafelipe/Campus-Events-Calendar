# Campus Events Calendar

An independent calendar of campus events at Madonna University. This project is not run by, endorsed by or affiliated with Madonna University.

Month, week and day views, an "I'm going" button with a public count, and calendar export. Built with React, Vite and TypeScript as an installable PWA, on Supabase. See [PLAN.md](PLAN.md) for the plan, [DESIGN.md](DESIGN.md) for the design rules and [TASKS.md](TASKS.md) for the work queue.

## Requirements

- Node.js 24 (see `.nvmrc`)
- Docker and the Supabase CLI, only for the database scripts (set up in a later task)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the two public Supabase values
npm run dev
```

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
