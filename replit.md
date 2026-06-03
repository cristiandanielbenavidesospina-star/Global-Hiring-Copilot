# Global Hiring Copilot

An AI-powered SaaS tool that helps companies evaluate international hiring opportunities and generate comprehensive hiring recommendations for different countries.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/global-hiring-copilot run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `OPENAI_API_KEY` — OpenAI API key for AI hiring analysis

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Wouter routing + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: OpenAI GPT-4o-mini (JSON mode structured output)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/hiringReports.ts` — DB schema for hiring reports
- `artifacts/api-server/src/routes/hiring.ts` — all hiring API routes + OpenAI integration
- `artifacts/global-hiring-copilot/src/` — React frontend

## Architecture decisions

- Contract-first OpenAPI → Orval codegen for both React Query hooks and Zod schemas
- OpenAI JSON mode used for structured AI output (reliable parsing)
- All AI generation is synchronous (no polling) — fast enough for UX (<5s typical)
- PostgreSQL stores every analysis for history + stats aggregation
- Stats endpoint uses SQL GROUP BY aggregations, not application-level counts

## Product

- Dashboard: search form (country, job role, company size) + system activity stats widget
- Report page: full AI-generated hiring report with workflow, risks, compliance, onboarding, interview process, risk badge
- History page: paginated list of past analyses with delete
- Insights page: charts for top countries, top roles, risk breakdown

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any change to `lib/api-spec/openapi.yaml`, must run `pnpm --filter @workspace/api-spec run codegen` then `pnpm run typecheck:libs`
- `OPENAI_API_KEY` must be set as a secret — never hardcode
- The DB lib must be rebuilt (`pnpm run typecheck:libs`) before the api-server can see new schema exports

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
