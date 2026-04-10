# mirkayk — Phase 2B: Backend + Persistence (PostgreSQL + Docker)

**Date:** 2026-04-10
**Status:** Approved
**Scope:** Add PostgreSQL database via Docker, Prisma ORM, API Routes, migrate stores from mock data to DB hydration
**Depends on:** Phase 1 (UI), Phase 2A (CLI integration / runs store), Phase 2C (full pages)

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | PostgreSQL 16 in Docker | Project will be shared on GitHub; devs clone + `docker compose up db` |
| ORM | Prisma | Type-safe, auto-generated client, easy migrations |
| Dev setup | PostgreSQL in Docker + Next.js local | Fast hot reload, reproducible DB |
| API layer | Next.js API Routes (App Router) | Already used for `/api/agent/run`; no extra framework |
| Store migration | Hydrate pattern + optimistic updates | Responsive UI with persistence guarantee |
| Auth | None (deferred) | Single-user local dashboard for now |

---

## Docker Setup

### docker-compose.yml

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: mirkayk
      POSTGRES_PASSWORD: mirkayk_dev
      POSTGRES_DB: mirkayk
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### .env.example

```env
DATABASE_URL="postgresql://mirkayk:mirkayk_dev@localhost:5432/mirkayk"
```

### .env (gitignored, created by dev)

Same content as `.env.example` for local dev.

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Agent {
  id           String   @id
  name         String
  role         String
  color        String
  provider     String
  model        String
  status       String   @default("idle")
  department   String
  personality  String   @default("")
  systemPrompt String   @default("")
  instructions Json     @default("[]")
  skills       Json     @default("[]")
  currentTask  String?
  createdAt    DateTime @default(now())
  runs         Run[]
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String
  status      String    @default("pending")
  priority    String    @default("medium")
  agentId     String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  completedAt DateTime?
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String
  department  String
  agentIds    Json     @default("[]")
  isActive    Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Run {
  id        String    @id @default(cuid())
  agentId   String
  agent     Agent     @relation(fields: [agentId], references: [id])
  taskId    String?
  input     String
  output    String    @default("")
  status    String    @default("running")
  startedAt DateTime  @default(now())
  endedAt   DateTime?
}
```

---

## API Routes

### /api/agents — GET

Returns all agents from DB, ordered by name.

### /api/agents/[id] — PATCH

Body: `{ status?, currentTask? }`
Updates agent fields. Returns updated agent.

### /api/tasks — GET

Returns all tasks ordered by createdAt desc.

### /api/tasks — POST

Body: `{ title, description, priority?, agentId? }`
Creates task. Returns created task.

### /api/tasks/[id] — PATCH

Body: `{ status?, agentId?, title?, description?, priority?, completedAt? }`
Updates task. Returns updated task.

### /api/tasks/[id] — DELETE

Deletes task. Returns `{ ok: true }`.

### /api/projects — GET

Returns all projects ordered by createdAt desc.

### /api/projects — POST

Body: `{ name, description, department, agentIds? }`
Creates project. Returns created project.

### /api/projects/[id] — PATCH

Body: `{ name?, description?, isActive?, agentIds? }`
When setting `isActive: true`, sets all other projects to `isActive: false` first.
Returns updated project.

### /api/projects/[id] — DELETE

Deletes project. Returns `{ ok: true }`.

### /api/runs — GET

Returns all runs with agent relation, ordered by startedAt desc.

### /api/agent/run — POST (existing, modified)

After creating the SSE stream, also persists the run to DB:
- On start: `prisma.run.create()` with status "running"
- On output: `prisma.run.update()` appending to output (debounced)
- On done: `prisma.run.update()` with final status and endedAt

---

## Store Migration Pattern

### Before (mock data):

```typescript
const useAgentStore = create<AgentStore>((set) => ({
  agents: MOCK_AGENTS,
  // ...
}));
```

### After (hydrate from DB):

```typescript
const useAgentStore = create<AgentStore>((set, get) => ({
  agents: [],
  isHydrated: false,

  hydrate: async () => {
    const res = await fetch("/api/agents");
    const agents = await res.json();
    set({ agents, isHydrated: true });
  },

  updateStatus: async (id, status) => {
    // Optimistic: update local immediately
    set(s => ({ agents: s.agents.map(a => a.id === id ? { ...a, status } : a) }));
    // Persist
    await fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  },
  // ...
}));
```

### Dashboard Layout hydration:

```typescript
// app/dashboard/layout.tsx
useEffect(() => {
  agentStore.hydrate();
  taskStore.hydrate();
  projectStore.hydrate();
  runStore.hydrate();
}, []);
```

---

## Seed Script

`prisma/seed.ts` converts existing mock data (`lib/mock/agents.ts`, `lib/mock/tasks.ts`, etc.) into Prisma `createMany` calls. Run via `npx prisma db seed`.

Package.json addition:

```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

---

## Developer Setup Flow

```bash
git clone https://github.com/user/mirkayk.git
cp .env.example .env
docker compose up db -d
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

---

## New Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | PostgreSQL service |
| `.env.example` | Template env vars |
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Seed script with mock data |
| `lib/db.ts` | Prisma client singleton |
| `app/api/agents/route.ts` | GET agents |
| `app/api/agents/[id]/route.ts` | PATCH agent |
| `app/api/tasks/route.ts` | GET, POST tasks |
| `app/api/tasks/[id]/route.ts` | PATCH, DELETE task |
| `app/api/projects/route.ts` | GET, POST projects |
| `app/api/projects/[id]/route.ts` | PATCH, DELETE project |
| `app/api/runs/route.ts` | GET runs |

## Modified Files

| File | Change |
|------|--------|
| `lib/stores/agents.ts` | Remove mock import, add hydrate + API calls |
| `lib/stores/tasks.ts` | Remove mock import, add hydrate + API calls |
| `lib/stores/projects.ts` | Remove mock import, add hydrate + API calls |
| `lib/stores/runs.ts` | Add hydrate + persist runs to DB |
| `app/api/agent/run/route.ts` | Add DB persistence for runs |
| `app/dashboard/layout.tsx` | Add hydrate calls on mount |
| `package.json` | Add prisma deps + seed config |
| `.gitignore` | Ensure .env is ignored |

---

## Scope Boundaries

### Included
- Docker Compose with PostgreSQL
- Prisma schema, migrations, seed
- Prisma client singleton
- 8 API Route endpoints (CRUD for agents, tasks, projects, runs)
- Store migration to hydrate pattern with optimistic updates
- Modified SSE route to persist runs
- Developer setup documentation in .env.example
- tsx devDependency for seed script

### Excluded
- Authentication / authorization
- tRPC
- Docker container for Next.js (dev runs locally)
- Real token counting (still approximate)
- WebSocket (still SSE)
- Production deployment config
