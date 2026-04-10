# Phase 2B: Backend + Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PostgreSQL database via Docker, Prisma ORM, API Routes, and migrate all stores from mock data to database hydration with optimistic updates.

**Architecture:** PostgreSQL runs in Docker container. Prisma ORM generates type-safe client. Next.js API Routes provide CRUD endpoints. Zustand stores hydrate from DB on mount and persist mutations via API calls with optimistic local updates.

**Tech Stack:** PostgreSQL 16 (Docker), Prisma 6, Next.js 16 API Routes, Zustand 5, tsx (seed runner)

---

### Task 1: Docker + Prisma Foundation

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `prisma/schema.prisma`
- Create: `lib/db.ts`
- Modify: `.gitignore`
- Modify: `package.json`

- [ ] **Step 1: Create docker-compose.yml**

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

- [ ] **Step 2: Create .env.example**

```env
DATABASE_URL="postgresql://mirkayk:mirkayk_dev@localhost:5432/mirkayk"
```

- [ ] **Step 3: Create .env from example**

```bash
cp .env.example .env
```

- [ ] **Step 4: Add prisma ignores to .gitignore**

Append to `.gitignore`:
```
# prisma
prisma/dev.db
prisma/dev.db-journal
```

Note: `.env*` is already ignored.

- [ ] **Step 5: Install dependencies**

```bash
npm install prisma @prisma/client --save-dev
npm install tsx --save-dev
```

Wait — Prisma client should be a runtime dep:
```bash
npm install @prisma/client
npm install prisma tsx --save-dev
```

- [ ] **Step 6: Initialize Prisma with PostgreSQL**

```bash
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma`. Replace its contents entirely.

- [ ] **Step 7: Write prisma/schema.prisma**

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
  department   String   @default("")
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

- [ ] **Step 8: Create Prisma client singleton**

Create `lib/db.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 9: Start Docker and run migration**

```bash
docker compose up db -d
npx prisma migrate dev --name init
```

Expected: Migration succeeds, creates tables Agent, Task, Project, Run.

- [ ] **Step 10: Verify Prisma client generation**

```bash
npx prisma generate
```

Expected: Prisma client generated successfully.

- [ ] **Step 11: Commit**

```bash
git add docker-compose.yml .env.example prisma/schema.prisma lib/db.ts .gitignore package.json package-lock.json
git commit -m "feat: add Docker PostgreSQL + Prisma schema for persistence layer"
```

---

### Task 2: Seed Script

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma.seed config)

- [ ] **Step 1: Add seed config to package.json**

Add to package.json root:
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 2: Write prisma/seed.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.run.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.agent.deleteMany();

  // Seed agents
  const agents = [
    {
      id: "agent-pm",
      name: "PM Agent",
      role: "Project Manager",
      color: "sage",
      provider: "claude",
      model: "claude-sonnet-4-6",
      status: "active",
      department: "",
      personality: "",
      currentTask: "Breaking down dashboard redesign into subtasks",
      systemPrompt: "You are the PM Agent for mirkayk, an AI-powered web development team. Your job is to coordinate the team, break down user requirements into actionable tasks, assign them to the right specialist agents, track progress, and report back to the user.\nAlways think in sprints. When a user gives you a project, decompose it into:\n1. Architecture tasks → assign to Architect\n2. Frontend tasks → assign to Frontend\n3. Backend tasks → assign to Backend\n4. Testing tasks → assign to QA\n5. Deployment tasks → assign to DevOps\nNever write code yourself. Your output is always a structured task list with clear acceptance criteria.\nCommunicate blockers immediately. Keep the user informed with concise status updates. End every update with: next 3 actions.",
      instructions: JSON.stringify([
        "Break every feature request into subtasks before assigning",
        "Always define acceptance criteria per task",
        "Escalate blockers to the user immediately",
        "Prioritize: P1 blocking, P2 important, P3 nice to have",
        "Never assign tasks without checking agent availability",
        "End every status update with: next 3 actions",
      ]),
      skills: JSON.stringify([
        "Task decomposition and sprint planning",
        "Dependency mapping between agents",
        "Acceptance criteria writing",
        "Risk identification and escalation",
        "Progress tracking and reporting",
        "Inter-agent communication coordination",
      ]),
    },
    {
      id: "agent-architect",
      name: "Architect",
      role: "Technical Architect",
      color: "lavender",
      provider: "claude",
      model: "claude-opus-4-6",
      status: "working",
      department: "",
      personality: "",
      currentTask: "Designing database schema for auth module",
      systemPrompt: "You are the Architect Agent for mirkayk. You design the technical foundation of every web application the team builds.\nBefore any code is written, you produce:\n- Tech stack recommendation with justification\n- Folder structure and project scaffold\n- Database schema (tables, relationships, indexes)\n- API contract (endpoints, request/response shapes)\n- Component tree for the frontend\n- Environment setup instructions\nYou write in Markdown. You produce diagrams using Mermaid.\nDefault stack unless told otherwise:\nFrontend: Next.js 14 + TypeScript + Tailwind CSS\nBackend: Node.js + Express + Prisma\nDatabase: PostgreSQL\nAuth: NextAuth.js\nDeploy: Vercel + Railway",
      instructions: JSON.stringify([
        "Always produce TECH_STACK.md before any agent writes code",
        "Define API contract before Backend starts coding",
        "Define component tree before Frontend starts coding",
        "Keep database schema normalized unless performance requires otherwise",
        "Document every architectural decision with its tradeoff",
        "Flag scalability concerns proactively",
      ]),
      skills: JSON.stringify([
        "Full-stack architecture design",
        "Database schema design",
        "REST and GraphQL API design",
        "Component architecture for React/Next.js",
        "Authentication and authorization patterns",
        "Mermaid diagram generation",
        "Tech stack evaluation and selection",
      ]),
    },
    {
      id: "agent-frontend",
      name: "Frontend",
      role: "UI/UX Developer",
      color: "pink",
      provider: "claude",
      model: "claude-sonnet-4-6",
      status: "idle",
      department: "",
      personality: "",
      currentTask: null,
      systemPrompt: "You are the Frontend Agent for mirkayk. You build beautiful, functional, production-ready user interfaces.\nYou always:\n- Follow the component tree defined by the Architect\n- Consume APIs exactly as defined in the API contract\n- Write TypeScript, never plain JS\n- Use Tailwind CSS for styling\n- Make interfaces responsive (mobile-first)\n- Handle loading, empty, and error states\n- Write accessible HTML (ARIA labels, semantic tags)\nYou never touch the backend or database.",
      instructions: JSON.stringify([
        "Always use TypeScript, no exceptions",
        "Mobile-first responsive design on every component",
        "Every interactive element needs loading and error state",
        "Use Tailwind utility classes, avoid custom CSS unless necessary",
        "Name components PascalCase, files matching component name",
        "Always add JSDoc comments to component props",
        "Never hardcode API URLs, use environment variables",
      ]),
      skills: JSON.stringify([
        "React 18 and Next.js 14 App Router",
        "TypeScript",
        "Tailwind CSS",
        "Form handling (React Hook Form + Zod)",
        "State management (Zustand, React Query)",
        "Accessibility (WCAG 2.1)",
        "Responsive and mobile-first design",
        "Animation (Framer Motion)",
        "API integration",
      ]),
    },
    {
      id: "agent-backend",
      name: "Backend",
      role: "API Developer",
      color: "sand",
      provider: "codex",
      model: "claude-sonnet-4-6",
      status: "idle",
      department: "",
      personality: "",
      currentTask: null,
      systemPrompt: "You are the Backend Agent for mirkayk. You build secure, performant, well-structured server-side applications.\nYou always:\n- Follow the API contract defined by the Architect exactly\n- Validate all inputs with Zod schemas\n- Handle errors with proper HTTP status codes\n- Write database queries using Prisma ORM\n- Never expose sensitive data in responses\n- Add authentication middleware to protected routes",
      instructions: JSON.stringify([
        "Validate every request body and query param with Zod",
        "Use Prisma for all database operations",
        "Return consistent error shapes: { error: string, code: string }",
        "Protect routes with auth middleware by default",
        "Never commit secrets, always use process.env",
        "Write database migrations for every schema change",
        "Log errors with context, never swallow exceptions",
      ]),
      skills: JSON.stringify([
        "Node.js and Express",
        "TypeScript",
        "Prisma ORM",
        "PostgreSQL",
        "REST API design",
        "JWT and session authentication",
        "Input validation with Zod",
        "Error handling and middleware",
        "Rate limiting and security headers",
      ]),
    },
    {
      id: "agent-qa",
      name: "QA",
      role: "Quality Assurance",
      color: "sky",
      provider: "codex",
      model: "claude-sonnet-4-6",
      status: "active",
      department: "",
      personality: "",
      currentTask: "Running E2E tests on login flow",
      systemPrompt: "You are the QA Agent for mirkayk. You ensure every feature works correctly before it reaches production.\nYour responsibilities:\n- Write unit tests for Backend logic (Vitest)\n- Write integration tests for API endpoints\n- Write E2E tests for critical user flows (Playwright)\n- Review Frontend components for bugs and accessibility\n- Report bugs with clear reproduction steps\n- Verify acceptance criteria from PM",
      instructions: JSON.stringify([
        "Test happy path AND edge cases AND error cases",
        "Every new feature needs at least one unit test",
        "Critical flows need E2E tests",
        "Report bugs immediately, do not batch them",
        "Verify PM acceptance criteria before marking done",
        "Check mobile responsiveness on every UI component",
        "Run accessibility audit on every new page",
      ]),
      skills: JSON.stringify([
        "Vitest (unit and integration testing)",
        "Playwright (end-to-end testing)",
        "Accessibility auditing (axe-core)",
        "Bug reporting and reproduction",
        "Test coverage analysis",
        "Cross-browser compatibility checking",
      ]),
    },
    {
      id: "agent-devops",
      name: "DevOps",
      role: "Infrastructure & Deploy",
      color: "peach",
      provider: "gemini",
      model: "claude-sonnet-4-6",
      status: "idle",
      department: "",
      personality: "",
      currentTask: null,
      systemPrompt: "You are the DevOps Agent for mirkayk. You handle all infrastructure, deployment, and operations.\nYour responsibilities:\n- Set up CI/CD pipelines (GitHub Actions)\n- Deploy frontend to Vercel\n- Deploy backend to Railway or Render\n- Configure environment variables in each platform\n- Set up database on Neon\n- Monitor deployments and alert on failures\n- Write Dockerfiles when needed\n- Configure domains and SSL",
      instructions: JSON.stringify([
        "Always set up staging before production",
        "Require passing CI tests before any deployment",
        "Document every env variable in .env.example",
        "Never store secrets in code or git history",
        "Set up automatic rollback on failed deployments",
        "Create DEPLOY.md with step-by-step guide",
        "Configure uptime monitoring after every production deploy",
      ]),
      skills: JSON.stringify([
        "GitHub Actions CI/CD",
        "Vercel deployment and configuration",
        "Railway and Render deployment",
        "Docker and containerization",
        "Neon PostgreSQL cloud setup",
        "Environment variable management",
        "Domain configuration and SSL",
        "Monitoring and alerting setup",
      ]),
    },
  ];

  for (const agent of agents) {
    await prisma.agent.create({ data: agent });
  }
  console.log(`Seeded ${agents.length} agents`);

  // Seed tasks
  const tasks = [
    { id: "task-1", title: "Design database schema for auth module", description: "Create the Prisma schema for User, Session, and Account models following NextAuth.js v5 conventions.", agentId: "agent-architect", priority: "P1", status: "in_progress", createdAt: new Date("2026-04-10T08:00:00") },
    { id: "task-2", title: "Build login page UI", description: "Create the login page with email/password form, OAuth buttons, and botanical styling.", agentId: "agent-frontend", priority: "P1", status: "pending", createdAt: new Date("2026-04-10T08:15:00") },
    { id: "task-3", title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for lint, test, and deploy on push to main.", agentId: "agent-devops", priority: "P2", status: "pending", createdAt: new Date("2026-04-10T08:30:00") },
    { id: "task-4", title: "Write E2E tests for login flow", description: "Playwright tests covering: successful login, invalid credentials, forgot password redirect.", agentId: "agent-qa", priority: "P1", status: "in_progress", createdAt: new Date("2026-04-10T09:00:00") },
    { id: "task-5", title: "Implement JWT middleware", description: "Express middleware to validate JWT tokens on protected routes. Return 401 for invalid/expired tokens.", agentId: "agent-backend", priority: "P1", status: "completed", createdAt: new Date("2026-04-09T14:00:00"), completedAt: new Date("2026-04-09T16:30:00") },
    { id: "task-6", title: "Create component tree for dashboard", description: "Define the React component hierarchy for the main dashboard view.", agentId: "agent-architect", priority: "P2", status: "completed", createdAt: new Date("2026-04-09T10:00:00"), completedAt: new Date("2026-04-09T12:00:00") },
    { id: "task-7", title: "Build responsive navigation sidebar", description: "Implement the left sidebar with logo, project selector, nav items, and token meter.", agentId: "agent-frontend", priority: "P2", status: "completed", createdAt: new Date("2026-04-09T13:00:00"), completedAt: new Date("2026-04-09T17:00:00") },
    { id: "task-8", title: "Deploy staging environment", description: "Deploy the current build to Vercel preview. Configure env vars for staging DB.", agentId: "agent-devops", priority: "P3", status: "pending", createdAt: new Date("2026-04-10T10:00:00") },
    { id: "task-9", title: "Implement /api/auth endpoints", description: "POST /auth/login, POST /auth/register, POST /auth/refresh. Input validation with Zod.", agentId: "agent-backend", priority: "P1", status: "pending", createdAt: new Date("2026-04-10T09:30:00") },
    { id: "task-10", title: "Accessibility audit on connect page", description: "Run axe-core audit. Check ARIA labels, keyboard navigation, and screen reader compatibility.", agentId: "agent-qa", priority: "P2", status: "pending", createdAt: new Date("2026-04-10T10:30:00") },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }
  console.log(`Seeded ${tasks.length} tasks`);

  // Seed projects
  await prisma.project.create({
    data: {
      id: "project-1",
      name: "mirkayk v1",
      description: "AI agent orchestration dashboard — Phase 1 UI build",
      department: "web2",
      agentIds: JSON.stringify(["agent-pm", "agent-architect", "agent-frontend", "agent-backend", "agent-qa", "agent-devops"]),
      isActive: true,
      createdAt: new Date("2026-04-09T08:00:00"),
    },
  });
  console.log("Seeded 1 project");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 3: Run seed**

```bash
npx prisma db seed
```

Expected: "Seeded 6 agents", "Seeded 10 tasks", "Seeded 1 project"

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add Prisma seed script with mock data"
```

---

### Task 3: API Routes — Agents

**Files:**
- Create: `app/api/agents/route.ts`
- Create: `app/api/agents/[id]/route.ts`

- [ ] **Step 1: Create GET /api/agents**

Create `app/api/agents/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const agents = await prisma.agent.findMany({
    orderBy: { name: "asc" },
  });

  // Parse JSON fields for frontend compatibility
  const parsed = agents.map((a) => ({
    ...a,
    instructions: JSON.parse(a.instructions as string),
    skills: JSON.parse(a.skills as string),
  }));

  return NextResponse.json(parsed);
}
```

- [ ] **Step 2: Create PATCH /api/agents/[id]**

Create `app/api/agents/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.status !== undefined) updateData.status = body.status;
  if (body.currentTask !== undefined) updateData.currentTask = body.currentTask;
  if (body.systemPrompt !== undefined) updateData.systemPrompt = body.systemPrompt;
  if (body.instructions !== undefined) updateData.instructions = JSON.stringify(body.instructions);

  const agent = await prisma.agent.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    ...agent,
    instructions: JSON.parse(agent.instructions as string),
    skills: JSON.parse(agent.skills as string),
  });
}
```

- [ ] **Step 3: Verify with curl**

```bash
curl http://localhost:3000/api/agents | head -c 200
```

- [ ] **Step 4: Commit**

```bash
git add app/api/agents/
git commit -m "feat: add agents API routes (GET, PATCH)"
```

---

### Task 4: API Routes — Tasks

**Files:**
- Create: `app/api/tasks/route.ts`
- Create: `app/api/tasks/[id]/route.ts`

- [ ] **Step 1: Create GET + POST /api/tasks**

Create `app/api/tasks/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      priority: body.priority || "P2",
      agentId: body.agentId || null,
      status: body.agentId ? "in_progress" : "pending",
    },
  });

  return NextResponse.json(task, { status: 201 });
}
```

- [ ] **Step 2: Create PATCH + DELETE /api/tasks/[id]**

Create `app/api/tasks/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.status !== undefined) updateData.status = body.status;
  if (body.agentId !== undefined) updateData.agentId = body.agentId;
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.priority !== undefined) updateData.priority = body.priority;
  if (body.completedAt !== undefined) updateData.completedAt = body.completedAt ? new Date(body.completedAt) : null;

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(task);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/tasks/
git commit -m "feat: add tasks API routes (GET, POST, PATCH, DELETE)"
```

---

### Task 5: API Routes — Projects

**Files:**
- Create: `app/api/projects/route.ts`
- Create: `app/api/projects/[id]/route.ts`

- [ ] **Step 1: Create GET + POST /api/projects**

Create `app/api/projects/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  const parsed = projects.map((p) => ({
    ...p,
    agentIds: JSON.parse(p.agentIds as string),
  }));

  return NextResponse.json(parsed);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description,
      department: body.department,
      agentIds: JSON.stringify(body.agentIds || []),
    },
  });

  return NextResponse.json(
    { ...project, agentIds: JSON.parse(project.agentIds as string) },
    { status: 201 }
  );
}
```

- [ ] **Step 2: Create PATCH + DELETE /api/projects/[id]**

Create `app/api/projects/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // If setting active, deactivate all others first
  if (body.isActive === true) {
    await prisma.project.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.agentIds !== undefined) updateData.agentIds = JSON.stringify(body.agentIds);

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    ...project,
    agentIds: JSON.parse(project.agentIds as string),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/projects/
git commit -m "feat: add projects API routes (GET, POST, PATCH, DELETE)"
```

---

### Task 6: API Routes — Runs

**Files:**
- Create: `app/api/runs/route.ts`
- Modify: `app/api/agent/run/route.ts`

- [ ] **Step 1: Create GET /api/runs**

Create `app/api/runs/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const runs = await prisma.run.findMany({
    orderBy: { startedAt: "desc" },
    include: { agent: { select: { name: true, color: true } } },
  });
  return NextResponse.json(runs);
}
```

- [ ] **Step 2: Modify /api/agent/run to persist runs to DB**

Add to `app/api/agent/run/route.ts`:

1. Import `prisma` from `@/lib/db`
2. After spawning CLI and before creating SSE stream, create the run in DB:
   ```typescript
   const dbRun = await prisma.run.create({
     data: { agentId, taskId: typeof taskId === "string" ? taskId : null, input: prompt, status: "running" },
   });
   ```
3. In the SSE stream `start()`, after enqueuing output events, debounce DB updates:
   ```typescript
   let outputBuffer = "";
   let flushTimeout: ReturnType<typeof setTimeout> | null = null;
   ```
   On output event: accumulate to `outputBuffer`, debounce flush every 2 seconds via `prisma.run.update`.
4. On done event: final flush of output, update run status and endedAt.

- [ ] **Step 3: Commit**

```bash
git add app/api/runs/ app/api/agent/run/route.ts
git commit -m "feat: add runs API route + persist CLI runs to database"
```

---

### Task 7: Migrate Agent Store

**Files:**
- Modify: `lib/stores/agents.ts`

- [ ] **Step 1: Rewrite agents store with hydrate + API calls**

Replace `lib/stores/agents.ts`:

```typescript
import { create } from "zustand";
import { Agent, AgentStatus } from "@/lib/types";

interface AgentStore {
  agents: Agent[];
  selectedAgentId: string | null;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  selectAgent: (id: string | null) => void;
  updateStatus: (id: string, status: AgentStatus, currentTask?: string | null) => void;
  updatePrompt: (id: string, systemPrompt: string) => void;
  updateInstructions: (id: string, instructions: string[]) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  selectedAgentId: null,
  isHydrated: false,

  hydrate: async () => {
    const res = await fetch("/api/agents");
    const agents = await res.json();
    set({ agents, isHydrated: true });
  },

  selectAgent: (id) => set({ selectedAgentId: id }),

  updateStatus: (id, status, currentTask) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id
          ? { ...a, status, currentTask: currentTask !== undefined ? currentTask : a.currentTask }
          : a
      ),
    }));
    fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, currentTask: currentTask ?? null }),
    });
  },

  updatePrompt: (id, systemPrompt) => {
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, systemPrompt } : a)),
    }));
    fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt }),
    });
  },

  updateInstructions: (id, instructions) => {
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, instructions } : a)),
    }));
    fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructions }),
    });
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add lib/stores/agents.ts
git commit -m "feat: migrate agent store from mock data to DB hydration"
```

---

### Task 8: Migrate Task Store

**Files:**
- Modify: `lib/stores/tasks.ts`

- [ ] **Step 1: Rewrite tasks store with hydrate + API calls**

Replace `lib/stores/tasks.ts`:

```typescript
import { create } from "zustand";
import { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { useAgentStore } from "./agents";
import { useActivityStore } from "./activity";

interface TaskStore {
  tasks: Task[];
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  createTask: (data: { title: string; description: string; agentId: string | null; priority: TaskPriority }) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateStatus: (id: string, status: TaskStatus) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isHydrated: false,

  hydrate: async () => {
    const res = await fetch("/api/tasks");
    const tasks = await res.json();
    // Parse dates from JSON
    const parsed = tasks.map((t: Record<string, unknown>) => ({
      ...t,
      createdAt: new Date(t.createdAt as string),
      completedAt: t.completedAt ? new Date(t.completedAt as string) : null,
    }));
    set({ tasks: parsed, isHydrated: true });
  },

  createTask: (data) => {
    const tempId = crypto.randomUUID();
    const newTask: Task = {
      id: tempId,
      ...data,
      status: data.agentId ? "in_progress" : "pending",
      createdAt: new Date(),
      completedAt: null,
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));

    // Cross-store effects
    if (data.agentId) {
      const agent = useAgentStore.getState().agents.find((a) => a.id === data.agentId);
      if (agent) {
        useAgentStore.getState().updateStatus(data.agentId, "working", data.title);
        useActivityStore.getState().addEntry({
          agentId: agent.id,
          agentName: agent.name,
          agentColor: agent.color,
          action: `Started working on: ${data.title}`,
        });
      }
    }

    // Persist and replace temp ID
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((real) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === tempId
              ? { ...real, createdAt: new Date(real.createdAt), completedAt: real.completedAt ? new Date(real.completedAt) : null }
              : t
          ),
        }));
      });
  },

  completeTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: "completed" as const, completedAt: new Date() } : t
      ),
    }));

    if (task.agentId) {
      const agent = useAgentStore.getState().agents.find((a) => a.id === task.agentId);
      if (agent) {
        useAgentStore.getState().updateStatus(task.agentId, "idle", null);
        useActivityStore.getState().addEntry({
          agentId: agent.id,
          agentName: agent.name,
          agentColor: agent.color,
          action: `Completed: ${task.title}`,
        });
      }
    }

    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", completedAt: new Date().toISOString() }),
    });
  },

  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    fetch(`/api/tasks/${id}`, { method: "DELETE" });
  },

  updateStatus: (id, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add lib/stores/tasks.ts
git commit -m "feat: migrate task store from mock data to DB hydration"
```

---

### Task 9: Migrate Project Store

**Files:**
- Modify: `lib/stores/projects.ts`

- [ ] **Step 1: Rewrite project store with hydrate + API calls**

Replace `lib/stores/projects.ts`:

```typescript
import { create } from "zustand";
import { Project } from "@/lib/types";

interface ProjectStore {
  projects: Project[];
  activeProjectId: string;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  createProject: (data: { name: string; description: string; department: "web2" | "web3" }) => void;
  setActive: (id: string) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  activeProjectId: "",
  isHydrated: false,

  hydrate: async () => {
    const res = await fetch("/api/projects");
    const projects = await res.json();
    const parsed = projects.map((p: Record<string, unknown>) => ({
      ...p,
      createdAt: new Date(p.createdAt as string),
    }));
    const active = parsed.find((p: { isActive: boolean }) => p.isActive);
    set({ projects: parsed, activeProjectId: active?.id || "", isHydrated: true });
  },

  createProject: (data) => {
    const tempId = crypto.randomUUID();
    set((state) => ({
      projects: [
        ...state.projects,
        { id: tempId, ...data, agentIds: [], createdAt: new Date() },
      ],
    }));

    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((real) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === tempId ? { ...real, createdAt: new Date(real.createdAt) } : p
          ),
        }));
      });
  },

  setActive: (id) => {
    set({ activeProjectId: id });
    fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
  },

  deleteProject: (id) => {
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
    fetch(`/api/projects/${id}`, { method: "DELETE" });
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add lib/stores/projects.ts
git commit -m "feat: migrate project store from mock data to DB hydration"
```

---

### Task 10: Migrate Runs Store + Dashboard Hydration

**Files:**
- Modify: `lib/stores/runs.ts`
- Modify: `app/dashboard/layout.tsx`

- [ ] **Step 1: Add hydrate to runs store**

Add to `lib/stores/runs.ts` in the store interface and implementation:

```typescript
isHydrated: boolean;
hydrate: () => Promise<void>;
```

Implementation:
```typescript
isHydrated: false,
hydrate: async () => {
  const res = await fetch("/api/runs");
  const runs = await res.json();
  const parsed = runs.map((r: Record<string, unknown>) => ({
    id: r.id,
    agentId: r.agentId,
    taskId: r.taskId,
    input: r.input,
    output: r.output || "",
    tokensUsed: 0,
    costUsd: 0,
    status: r.status,
    startedAt: new Date(r.startedAt as string),
    completedAt: r.endedAt ? new Date(r.endedAt as string) : null,
  }));
  set({ runs: parsed, isHydrated: true });
},
```

- [ ] **Step 2: Create HydrationProvider client component**

Create `components/providers/hydration-provider.tsx`:

```typescript
"use client";

import { useEffect } from "react";
import { useAgentStore } from "@/lib/stores/agents";
import { useTaskStore } from "@/lib/stores/tasks";
import { useProjectStore } from "@/lib/stores/projects";
import { useRunsStore } from "@/lib/stores/runs";

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAgentStore.getState().hydrate();
    useTaskStore.getState().hydrate();
    useProjectStore.getState().hydrate();
    useRunsStore.getState().hydrate();
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 3: Wrap dashboard layout with HydrationProvider**

Modify `app/dashboard/layout.tsx`:

```typescript
import { Sidebar } from "@/components/layout/sidebar";
import { ActivityPanel } from "@/components/layout/activity-panel";
import { HydrationProvider } from "@/components/providers/hydration-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydrationProvider>
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
        <div className="hidden xl:block">
          <ActivityPanel />
        </div>
      </div>
    </HydrationProvider>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/stores/runs.ts components/providers/hydration-provider.tsx app/dashboard/layout.tsx
git commit -m "feat: add store hydration from database on dashboard mount"
```

---

### Task 11: Build Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Test API endpoints**

```bash
curl http://localhost:3000/api/agents | python -m json.tool | head -20
curl http://localhost:3000/api/tasks | python -m json.tool | head -20
curl http://localhost:3000/api/projects | python -m json.tool | head -20
curl http://localhost:3000/api/runs | python -m json.tool | head -5
```

- [ ] **Step 3: Test the dashboard loads data from DB**

Open http://localhost:3000/dashboard — agents, tasks, projects should render from database data.

- [ ] **Step 4: Test persistence**

Create a task via UI → refresh page → task should still be there.

- [ ] **Step 5: Final commit if any fixes needed**
