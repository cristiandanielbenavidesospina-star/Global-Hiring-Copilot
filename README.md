# Global Hiring Copilot

> An AI-powered SaaS tool that helps companies evaluate international hiring opportunities and generate comprehensive, actionable hiring recommendations for any country and role combination.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Live Demo](#live-demo)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Project Structure](#project-structure)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [AI Engine](#ai-engine)
10. [Frontend Pages](#frontend-pages)
11. [Environment Variables](#environment-variables)
12. [Installation & Local Setup](#installation--local-setup)
13. [Running the Application](#running-the-application)
14. [Development Workflow](#development-workflow)
15. [Deployment](#deployment)
16. [Product Decisions](#product-decisions)
17. [Roadmap](#roadmap)

---

## Overview

**Global Hiring Copilot** acts as your authoritative guide for international expansion decisions. HR teams and global operations leaders can submit a query — target country, job role, and company size — and receive a structured, AI-generated hiring report in under 5 seconds covering everything from legal compliance to interview process recommendations.

The tool is designed for serious enterprise use. Every report is persisted to PostgreSQL, revisitable from the History page, and aggregated into an Insights dashboard so teams can track hiring patterns across regions over time.

# Global Hiring Copilot

## Demo Video

[![Watch Demo](dashboard.png)](HiringCopilot.mp4)

---

## Features

### Core Features

| Feature | Description |
|---|---|
| **AI Hiring Analysis** | Submit a country + role + company size and receive a full structured report powered by Llama 3.3 70B via Groq |
| **Executive Summary** | 2-3 sentence overview of hiring feasibility and key considerations |
| **Hiring Workflow** | 6-8 concrete step-by-step instructions for hiring in the target country |
| **Interview Process** | Country and role-specific interview process recommendations |
| **Onboarding Plan** | Localized 6-8 item onboarding checklist |
| **Compliance Notes** | Legal and regulatory requirements specific to the country |
| **Risk Assessment** | Low / Medium / High risk badge with itemized risk factors |
| **Report History** | All past analyses stored persistently with pagination and delete support |
| **Insights Dashboard** | Bar charts for top countries & roles, pie chart for risk distribution |

### UX Features

- Skeleton loading states during AI generation
- Error toasts with clear messaging
- Empty states with action prompts when no data exists
- Persistent sidebar navigation with "Powered by AI" badge
- 404 Not Found page matching app quality
- Fully responsive layout

---

## Live Demo

The app is served via a shared reverse proxy:

| Service | Path |
|---|---|
| Frontend (React) | `/` |
| API Server (Express) | `/api` |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 7 | Build tool and dev server |
| Tailwind CSS | 4 | Utility-first styling |
| shadcn/ui | latest | Accessible component primitives |
| Radix UI | latest | Headless UI components |
| Wouter | 3.3 | Minimal client-side routing |
| TanStack Query | 5 | Server state management and caching |
| Recharts | 2.15 | Composable chart library |
| React Hook Form | 7.55 | Form state management |
| Zod | 3 | Schema validation |
| Lucide React | latest | Icon library |
| Framer Motion | latest | Animations |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 24 | Runtime |
| TypeScript | 5.9 | Type safety |
| Express | 5 | HTTP server framework |
| Drizzle ORM | latest | Type-safe PostgreSQL ORM |
| Pino | latest | Structured JSON logging |
| Zod (via Orval) | latest | Request/response validation |

### Database

| Technology | Purpose |
|---|---|
| PostgreSQL | Persistent storage for all hiring reports |
| Drizzle Kit | Schema migrations via `push` |

### AI

| Technology | Purpose |
|---|---|
| Groq API | Ultra-fast LLM inference |
| Llama 3.3 70B Versatile | Primary model for hiring analysis |
| JSON Mode | Structured output — reliable, no hallucinated formats |

### Tooling

| Technology | Purpose |
|---|---|
| pnpm workspaces | Monorepo package management |
| Orval | OpenAPI → React Query hooks + Zod schemas codegen |
| esbuild | Fast API server bundling |
| tsc --build | Incremental composite lib builds |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Replit Reverse Proxy                        │
│                  (path-based routing, mTLS)                     │
└──────────────────┬──────────────────────┬───────────────────────┘
                   │ /                    │ /api
                   ▼                      ▼
     ┌─────────────────────┐   ┌──────────────────────┐
     │   React + Vite      │   │   Express 5 API      │
     │   (port 18624)      │   │   (port 8080)        │
     │                     │   │                      │
     │  Wouter routing     │   │  Zod validation      │
     │  TanStack Query     │   │  Drizzle ORM         │
     │  shadcn/ui          │   │  Pino logging        │
     └─────────────────────┘   └──────────┬───────────┘
                                          │
                          ┌───────────────┼───────────────┐
                          ▼               ▼               ▼
                   ┌────────────┐  ┌──────────┐  ┌──────────────┐
                   │ PostgreSQL │  │ Groq API │  │  OpenAPI Spec │
                   │  (Drizzle) │  │ Llama 3.3│  │  (source of  │
                   └────────────┘  └──────────┘  │   truth)     │
                                                 └──────────────┘
```

### Data Flow

```
User submits form (country + role + companySize)
  │
  ▼
POST /api/hiring/analyze
  │
  ├── Zod validates request body (AnalyzeHiringBody)
  │
  ├── Builds contextual prompt (company size label + country + role)
  │
  ├── Groq API call (llama-3.3-70b-versatile, JSON mode, max_tokens: 1500)
  │     Returns: summary, hiringWorkflow, interviewProcess,
  │              onboardingPlan, complianceNotes, risks, riskAssessment
  │
  ├── INSERT into hiring_reports table (PostgreSQL via Drizzle)
  │
  └── Return full HiringReport (201 Created)
        │
        ▼
Frontend navigates to /report/:id
  │
  ▼
GET /api/hiring/history/:id
  │
  ▼
Report page renders all sections with rich layout
```

### Contract-First API Design

All API contracts are defined first in `lib/api-spec/openapi.yaml`. Orval then generates:
- **React Query hooks** → `lib/api-client-react/` (used by the frontend)
- **Zod schemas** → `lib/api-zod/` (used by the backend for validation)

This guarantees zero drift between the API contract, frontend types, and backend validation.

---

## Project Structure

```
monorepo/
│
├── artifacts/
│   ├── global-hiring-copilot/          # React + Vite frontend
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx       # Home page with search form
│   │   │   │   ├── Report.tsx          # Full hiring report detail view
│   │   │   │   ├── History.tsx         # Paginated past analyses
│   │   │   │   ├── Stats.tsx           # Insights charts dashboard
│   │   │   │   └── not-found.tsx       # 404 page
│   │   │   ├── components/             # Shared UI components
│   │   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── lib/                    # Utility functions
│   │   │   ├── App.tsx                 # Root component + routing
│   │   │   ├── main.tsx                # Entry point
│   │   │   └── index.css               # Global styles + theme tokens
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api-server/                     # Express 5 API server
│       ├── src/
│       │   ├── routes/
│       │   │   ├── hiring.ts           # All hiring endpoints + Groq AI
│       │   │   ├── health.ts           # Health check
│       │   │   └── index.ts            # Router aggregation
│       │   ├── lib/
│       │   │   └── logger.ts           # Pino structured logger
│       │   ├── app.ts                  # Express app setup
│       │   └── index.ts                # Server entry point
│       ├── build.mjs                   # esbuild bundler script
│       └── package.json
│
├── lib/
│   ├── api-spec/
│   │   ├── openapi.yaml                # SOURCE OF TRUTH for all API contracts
│   │   └── orval.config.ts             # Codegen configuration
│   │
│   ├── api-client-react/               # Generated: React Query hooks
│   │   └── src/generated/api.ts
│   │
│   ├── api-zod/                        # Generated: Zod validation schemas
│   │   └── src/generated/api.ts
│   │
│   └── db/
│       ├── src/
│       │   ├── schema/
│       │   │   ├── hiringReports.ts    # hiring_reports table definition
│       │   │   └── index.ts            # Schema barrel export
│       │   ├── client.ts               # Drizzle client (DATABASE_URL)
│       │   └── index.ts                # Package exports
│       └── drizzle.config.ts
│
├── scripts/                            # Utility scripts
├── pnpm-workspace.yaml                 # Workspace + catalog pins
├── tsconfig.base.json                  # Shared TypeScript config
├── tsconfig.json                       # Solution file (libs only)
└── package.json                        # Root task orchestration
```

---

## Database Schema

### Table: `hiring_reports`

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `serial` | NO | auto-increment | Primary key |
| `country` | `text` | NO | — | Target hiring country |
| `role` | `text` | NO | — | Job role title |
| `company_size` | `text` | NO | — | `startup`, `smb`, or `enterprise` |
| `summary` | `text` | NO | — | AI executive summary |
| `hiring_workflow` | `text[]` | NO | `{}` | Ordered hiring steps |
| `risks` | `text[]` | NO | `{}` | Identified hiring risks |
| `onboarding_plan` | `text[]` | NO | `{}` | Onboarding checklist items |
| `compliance_notes` | `text[]` | NO | `{}` | Legal/regulatory notes |
| `interview_process` | `text[]` | NO | `{}` | Interview process steps |
| `risk_assessment` | `text` | NO | `'medium'` | `low`, `medium`, or `high` |
| `created_at` | `timestamptz` | NO | `now()` | Creation timestamp (UTC) |

---

## API Reference

Base URL: `/api`

### Health

#### `GET /api/healthz`
Returns server health status.

**Response `200`:**
```json
{ "status": "ok" }
```

---

### Hiring

#### `POST /api/hiring/analyze`
Generates an AI-powered hiring report and persists it to the database.

**Request Body:**
```json
{
  "country": "Germany",
  "role": "Senior Software Engineer",
  "companySize": "startup"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `country` | string | YES | Any country name |
| `role` | string | YES | Any job title |
| `companySize` | string | YES | `startup` \| `smb` \| `enterprise` |

**Response `201`:** Full `HiringReport` object (see schema below)

**Response `400`:** Invalid request body
**Response `500`:** AI generation or database error

---

#### `GET /api/hiring/history`
Returns a paginated list of past hiring analyses, ordered by most recent.

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number (1-indexed) |
| `limit` | integer | `20` | Results per page |

**Response `200`:**
```json
{
  "reports": [ ...HiringReport[] ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

#### `GET /api/hiring/history/:id`
Fetches a single hiring report by ID.

**Path Parameters:** `id` (integer)

**Response `200`:** Full `HiringReport` object
**Response `404`:** Report not found

---

#### `DELETE /api/hiring/history/:id`
Permanently deletes a hiring report.

**Path Parameters:** `id` (integer)

**Response `204`:** Deleted successfully
**Response `404`:** Report not found

---

#### `GET /api/hiring/stats`
Returns aggregated statistics across all hiring analyses.

**Response `200`:**
```json
{
  "totalAnalyses": 37,
  "topCountries": [
    { "name": "Germany", "count": 8 },
    { "name": "Japan", "count": 6 }
  ],
  "topRoles": [
    { "name": "Software Engineer", "count": 12 },
    { "name": "Product Manager", "count": 7 }
  ],
  "riskBreakdown": {
    "low": 10,
    "medium": 20,
    "high": 7
  }
}
```

---

### HiringReport Schema

```typescript
{
  id: number;
  country: string;
  role: string;
  companySize: "startup" | "smb" | "enterprise";
  summary: string;                  // AI executive summary
  hiringWorkflow: string[];         // Ordered hiring steps
  interviewProcess: string[];       // Interview recommendations
  onboardingPlan: string[];         // Onboarding checklist
  complianceNotes: string[];        // Legal/compliance notes
  risks: string[];                  // Risk factors
  riskAssessment: "low" | "medium" | "high";
  createdAt: string;                // ISO 8601 datetime
}
```

---

## AI Engine

### Provider: Groq

[Groq](https://groq.com) provides ultra-fast LLM inference via dedicated LPU (Language Processing Unit) hardware, delivering significantly faster response times than traditional GPU-based inference.

### Model: `llama-3.3-70b-versatile`

Meta's Llama 3.3 70B is a frontier open-weight model with strong capabilities in structured reasoning, knowledge retrieval, and instruction following — ideal for generating reliable, actionable HR content.

### Prompt Engineering

The system prompt instructs the model to act as an expert in:
- International employment law
- Global HR best practices
- Cross-border talent acquisition

The model is instructed to:
1. Return **JSON mode** output (guaranteed parseable — no markdown, no hallucinated formats)
2. Reference **actual laws and regulations** by name where relevant
3. Be **specific and actionable** — not generic platitudes
4. Tailor all output to the **exact company size context** provided

### Company Size Context

| Input | Context Sent to AI |
|---|---|
| `startup` | "a startup (<50 employees)" |
| `smb` | "a small/medium business (50-500 employees)" |
| `enterprise` | "an enterprise (500+ employees)" |

### JSON Output Structure

```json
{
  "summary": "string",
  "hiringWorkflow": ["string"],
  "interviewProcess": ["string"],
  "onboardingPlan": ["string"],
  "complianceNotes": ["string"],
  "risks": ["string"],
  "riskAssessment": "low | medium | high"
}
```

All fields have safe fallbacks — if the model omits a field, it defaults to an empty string or array.

---

## Frontend Pages

### `/` — Dashboard
- Hero section with product tagline and feature badges
- **New Hiring Analysis** form (country, job role, company size)
- **System Activity** sidebar widget showing total analyses
- On submit: calls `useAnalyzeHiring` mutation → skeleton loading state → navigates to `/report/:id` on success

### `/report/:id` — Hiring Report
- Fetches report via `useGetHiringReport(id)`
- Displays: risk badge, executive summary, hiring workflow steps, interview process, compliance notes, risks list, onboarding checklist
- Full skeleton loading state while fetching

### `/history` — History
- Paginated list via `useListHiringHistory`
- Each item shows country, role, company size, risk badge, and timestamp
- Delete button calls `useDeleteHiringReport` then invalidates the history query
- Empty state with prompt to start first analysis

### `/stats` — Insights
- Fetches `useGetHiringStats`
- Bar chart: Top 5 countries by analysis count
- Bar chart: Top 5 roles by analysis count
- Pie / breakdown chart: Risk distribution (low / medium / high)
- Empty state when no analyses exist yet

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | YES | PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/db`) |
| `GROQ_API_KEY` | YES | Groq API key — get one free at [console.groq.com](https://console.groq.com) |
| `PORT` | Auto | Injected by Replit workflow config — do not set manually |
| `NODE_ENV` | Auto | Set to `development` by the dev script |

> **Never commit secrets to version control.** Use Replit Secrets or a `.env` file (gitignored) for local development.

---

## Installation & Local Setup

### Prerequisites

- [Node.js](https://nodejs.org) v20 or higher
- [pnpm](https://pnpm.io) v9 or higher
- A running **PostgreSQL** database
- A **Groq API key** (free at [console.groq.com](https://console.groq.com))

### Step 1 — Clone and install dependencies

```bash
git clone <your-repo-url>
cd global-hiring-copilot
pnpm install
```

### Step 2 — Configure environment variables

Create a `.env` file in the project root (or set these as system environment variables):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/hiring_copilot
GROQ_API_KEY=gsk_...
```

### Step 3 — Push database schema

This creates the `hiring_reports` table (and any future tables) in your database:

```bash
pnpm --filter @workspace/db run push
```

### Step 4 — (Optional) Regenerate API client

Only needed if you modify `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates:
- `lib/api-client-react/src/generated/api.ts` — React Query hooks
- `lib/api-zod/src/generated/api.ts` — Zod validation schemas

---

## Running the Application

You need two processes running simultaneously:

### API Server (port 8080)

```bash
pnpm --filter @workspace/api-server run dev
```

Builds with esbuild then starts with Node. Watches for source changes are not automatic — restart manually on code changes.

### Frontend Dev Server

```bash
pnpm --filter @workspace/global-hiring-copilot run dev
```

Starts Vite with HMR. The frontend proxies `/api` requests through to port 8080 automatically.

### On Replit

Both services are configured as workflows and start automatically. Use the Preview pane to access the app.

---

## Development Workflow

### Adding a new API endpoint

1. **Edit** `lib/api-spec/openapi.yaml` — add path, operation, and schemas
2. **Run codegen:**
   ```bash
   pnpm --filter @workspace/api-spec run codegen
   ```
3. **Grep generated Zod names** to use exact names in routes:
   ```bash
   grep "^export " lib/api-zod/src/generated/api.ts
   ```
4. **Implement** the route in `artifacts/api-server/src/routes/`
5. **Mount** it in `artifacts/api-server/src/routes/index.ts`
6. **Typecheck:**
   ```bash
   pnpm --filter @workspace/api-server run typecheck
   ```

### Modifying the database schema

1. **Edit** `lib/db/src/schema/<table>.ts`
2. **Export** from `lib/db/src/schema/index.ts`
3. **Rebuild libs** (makes new exports visible to the api-server):
   ```bash
   pnpm run typecheck:libs
   ```
4. **Push schema** to the database:
   ```bash
   pnpm --filter @workspace/db run push
   ```

### Full typecheck

```bash
pnpm run typecheck
```

Runs `tsc --build` for all composite libs, then `tsc --noEmit` for all leaf packages.

---

## Deployment

This application is built for [Replit](https://replit.com) deployment.

### Steps

1. Click **Publish** in the Replit interface
2. Replit automatically:
   - Builds both the frontend (Vite) and API server (esbuild)
   - Provisions HTTPS on a `.replit.app` domain
   - Wires environment variables from Replit Secrets
   - Configures the reverse proxy for path-based routing

### Production Checklist

- [ ] `GROQ_API_KEY` is set in Replit Secrets
- [ ] `DATABASE_URL` points to a production PostgreSQL instance
- [ ] Database schema has been pushed (`pnpm --filter @workspace/db run push`)
- [ ] Both workflows start cleanly (check logs after deploy)

---

## Product Decisions

### Why Groq + Llama 3.3 instead of OpenAI GPT-4?

Groq's LPU hardware delivers 10-20x faster token generation than GPU-based inference. For a synchronous user-facing analysis tool, this means reports in ~2s instead of ~8-10s — a materially better UX without any architectural complexity (polling, websockets, queues).

Llama 3.3 70B has strong performance on knowledge-intensive and structured reasoning tasks, making it appropriate for legal and compliance content.

### Why synchronous AI calls (no polling)?

Groq is fast enough (<3s typical) that polling adds complexity for zero benefit. The frontend shows a skeleton loading state during the call. If latency ever becomes a concern, the route can be refactored to async + polling without changing the frontend contract.

### Why JSON mode for AI output?

`response_format: { type: "json_object" }` guarantees the model returns parseable JSON — no markdown fences, no preambles, no format hallucinations. This makes the parsing code trivially simple and removes an entire class of runtime errors.

### Why PostgreSQL instead of SQLite?

The original spec suggested SQLite, but this project runs on Replit where a managed PostgreSQL instance is available out of the box. PostgreSQL enables proper `GROUP BY` aggregations for the stats endpoint, timezone-aware timestamps (`timestamptz`), and native array columns for the report sections — all of which SQLite handles poorly or not at all.

### Why contract-first OpenAPI?

Defining the API contract in `openapi.yaml` before writing any code ensures the frontend and backend never drift. Orval generates both the React Query hooks (frontend) and Zod schemas (backend validation) from the same source, eliminating an entire class of integration bugs.

---

## Roadmap

Potential next features in priority order:

- **Country autocomplete** — Curated dropdown of 50+ countries with flags
- **Compare mode** — Side-by-side comparison of two country/role analyses
- **PDF export** — Download any report as a formatted PDF
- **Team sharing** — Share report links with colleagues
- **Saved searches** — Bookmark country+role combinations for quick re-analysis
- **Trend alerts** — Notify when a country's risk profile changes
- **Bulk analysis** — Upload a CSV of roles/countries and generate reports in batch
- **Authentication** — Multi-user support with per-team report history

---

## License

MIT — see `LICENSE` file for details.

---

*Built with product thinking and real business value in mind. Designed for HR leaders and global ops teams who need fast, reliable answers when expanding internationally.*
