<p align="center">
    <img src="public\logo\shanyraq-full.png" alt="Logo" width="400px"/>
</p>

---

Shanyraq is a full-stack pilot MVP for transparent apartment construction and building management in Kazakhstan. It demonstrates how residents, managers, contractors, and auditors can work from one evidence base to reduce corruption risks and legal violations.

## Stack

- Next.js App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, Geist fonts
- Seeded role login with secure HTTP-only signed sessions
- Drizzle ORM schema for Neon Postgres
- Vercel Blob document upload path with local demo fallback
- EN/RU/KK language switcher
- Hash-chain audit log and simulated red-flag rules
- Vitest unit tests and Playwright E2E tests

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Resident | `resident@shanyraq.kz` | `resident123` |
| Manager | `manager@shanyraq.kz` | `manager123` |
| Contractor | `contractor@shanyraq.kz` | `contractor123` |
| Auditor | `auditor@shanyraq.kz` | `auditor123` |

## Local Development

PowerShell may block npm shims on this machine, so use `npm.cmd`.

```bash
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`. The app runs with seeded in-memory demo data when `DATABASE_URL` is absent.

## Environment Variables

Create `.env.local` from `.env.example` for real persistence and uploads.

- `DATABASE_URL`: Neon Postgres connection string.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for uploaded files.
- `SESSION_SECRET`: long random secret for signed session cookies.

When `DATABASE_URL` is configured, the app seeds the database on first read if it is empty. Run migrations before deploying:

```bash
npm.cmd run db:generate
npm.cmd run db:migrate
```

## Verification

```bash
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
npm.cmd run test:e2e
```

The E2E suite covers resident voting, manager finance publication, auditor risk/document workflows, and route-preserving language switching.

## Deployment

Deploy as a Vercel preview first. Configure `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, and `SESSION_SECRET` in the Vercel project before relying on real persistence or Blob uploads.

```bash
npx.cmd vercel
```

This MVP is an academic transparency prototype. The red-flag checks are explainable simulated rules and are not official government determinations.
