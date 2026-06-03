# Global Hiring Copilot

An AI-powered SaaS tool that helps companies evaluate international hiring opportunities and generate comprehensive hiring recommendations for any country and role combination.

## What It Does

Global Hiring Copilot acts as your authoritative guide for international expansion decisions. Submit a query with a target country, job role, and company size — and instantly receive a structured hiring report covering:

- **AI Summary** — Executive overview of hiring feasibility
- **Hiring Workflow** — Step-by-step process tailored to the country
- **Interview Process** — Country-specific interview recommendations
- **Onboarding Checklist** — Localized onboarding plan
- **Compliance Notes** — Legal and regulatory considerations
- **Risk Assessment** — Low / Medium / High risk rating with specific risks
- **History** — All past analyses stored and revisitable
- **Insights Dashboard** — Aggregated stats on top countries, roles, and risk trends

---

## Architecture

```
monorepo/
├── artifacts/
│   ├── global-hiring-copilot/   # React + Vite frontend (served at /)
│   └── api-server/              # Express 5 API server (served at /api)
├── lib/
│   ├── api-spec/                # OpenAPI 3.1 spec — source of truth
│   ├── api-client-react/        # Generated React Query hooks (Orval)
│   ├── api-zod/                 # Generated Zod validation schemas (Orval)
│   └── db/                      # Drizzle ORM schema + PostgreSQL client
```

### Key Technology Choices

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Fast builds, great DX, modern component model |
| API | Express 5 + TypeScript | Lightweight, flexible, production-proven |
| Database | PostgreSQL + Drizzle ORM | Type-safe queries, schema migrations via push |
| AI | OpenAI GPT-4o-mini | Cost-effective, structured JSON output |
| Validation | Zod + Orval codegen | Contract-first, no drift between spec and types |
| Routing | Wouter | Minimal client-side router |
| Charts | Recharts | Composable chart primitives |

### Data Flow

```
User submits form
  → POST /api/hiring/analyze
  → Express validates with Zod
  → OpenAI GPT-4o-mini generates structured report (JSON mode)
  → Report saved to PostgreSQL
  → Response returned to frontend
  → Frontend navigates to /report/:id
```

---

## Installation & Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database
- OpenAI API key

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set environment variables

Create a `.env` file or set these in your environment:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
OPENAI_API_KEY=sk-...
```

### 3. Push database schema

```bash
pnpm --filter @workspace/db run push
```

### 4. Run codegen (if spec changes)

```bash
pnpm --filter @workspace/api-spec run codegen
```

### 5. Start the application

Start the API server (default port 8080):

```bash
pnpm --filter @workspace/api-server run dev
```

Start the frontend (default port from PORT env):

```bash
pnpm --filter @workspace/global-hiring-copilot run dev
```

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Health check |
| `POST` | `/api/hiring/analyze` | Generate AI hiring report |
| `GET` | `/api/hiring/history` | List all past reports (paginated) |
| `GET` | `/api/hiring/history/:id` | Fetch a specific report |
| `DELETE` | `/api/hiring/history/:id` | Delete a report |
| `GET` | `/api/hiring/stats` | Aggregated activity stats |

### POST /api/hiring/analyze

**Request body:**
```json
{
  "country": "Germany",
  "role": "Senior Software Engineer",
  "companySize": "startup"
}
```
`companySize` options: `startup`, `smb`, `enterprise`

**Response:** Full `HiringReport` object with all AI-generated sections.

---

## Product Thinking Notes

This MVP was designed with the following product principles:

1. **Speed to insight** — The AI call is synchronous and fast (<5s typical). No polling needed.
2. **Persistent history** — Every analysis is stored. Teams can share reports by ID.
3. **Structured AI output** — JSON mode ensures reliable parsing. No hallucinated formats.
4. **Risk-first framing** — Every report surfaces a Low/Medium/High risk badge prominently so decision-makers can prioritize.
5. **Graceful empty states** — The app handles zero-data states with helpful prompts, not blank screens.
6. **Enterprise aesthetics** — Dark navy sidebar, tight typography hierarchy, dense-but-organized information layout matches the expectations of HR leaders and ops teams.

---

## Deployment

This app is designed for Replit deployment. Click **Publish** in the Replit UI to deploy to a `.replit.app` domain with automatic HTTPS and database migration.
