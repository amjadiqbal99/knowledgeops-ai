# Claude Ops OS

Claude Ops OS is a production-oriented MVP for an internal AI operating system. It organizes fragmented SOPs, strategy docs, training material, workflow templates, QA feedback, and audit history into a source-of-truth knowledge hub designed for explainable prompt assembly.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Prisma ORM
- PostgreSQL
- Auth.js credentials auth
- Zod
- React Hook Form

## MVP scope

- Role-based authentication for Admin, Team Member, and Reviewer
- Dashboard with operational KPIs, activity, stale document alerts, and QA summaries
- Knowledge base CRUD with authority ranking, workflow eligibility, rationale, tags, and review dates
- Source-of-truth hierarchy mapping with explicit override relationships
- Workflow templates for strategic guidance, execution, drafting support, and process QA
- Deterministic prompt assembly with ordered source citations and saved workflow runs
- Draft request packaging
- QA logging and trend visibility
- Activity log / audit trail
- Integration settings placeholders for Claude, Google Drive, ClickUp, and Slack
- Global search across documents, workflows, QA records, and users

## Project structure

```text
app/
components/
features/
  auth/
  drafts/
  knowledge/
  qa/
  settings/
  workflows/
lib/
prisma/
types/
```

## Setup

1. Install dependencies.

```bash
npm install
```

2. Copy environment variables.

```bash
cp .env.example .env
```

3. Set `AUTH_SECRET` in `.env`. `NEXTAUTH_SECRET` is also accepted for compatibility.

4. Update `DATABASE_URL` in `.env` to point at a PostgreSQL database.

5. Generate Prisma client.

```bash
npm run prisma:generate
```

6. Run a migration.

```bash
npm run prisma:migrate -- --name init
```

7. Seed the database.

```bash
npm run prisma:seed
```

8. Start the app.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For local development, the app also falls back to a dev-only secret if neither env var is set, but production should always define a real secret.

## Seeded credentials

- Admin: `amjadiqbal@claudeopsos.com` / `Password123!`
- Team Member: `jordan@claudeopsos.com` / `Password123!`
- Reviewer: `priya@claudeopsos.com` / `Password123!`

## Notes

- Legacy Noise documents are excluded from prompt assembly unless explicitly toggled.
- Workflow runs persist the compiled prompt and exact source ordering.
- Integrations are intentionally stubbed behind configuration forms and a small abstraction layer.
- The app is designed to run locally without third-party credentials.

## Future extensions

- Claude API execution service on top of the existing prompt package output
- Google Drive sync jobs
- ClickUp task sync and workflow handoff loops
- Slack notifications for review queues
- CSV export and richer QA analytics
- Rich markdown editing and document diffing
