# mirkayk — Phase 1: UI-First Design Spec

**Date:** 2026-04-10
**Status:** Approved
**Scope:** Frontend with interactive mock data (no backend)

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI integration | CLI-based (claude/codex/gemini local CLIs) | User has Max plan; CLIs handle auth and billing |
| Build strategy | UI-first with mock data | See full product immediately; backend connects later |
| Project setup | Next.js standalone | No Turborepo overhead until backend phase |
| State & mock data | Zustand interactive stores | Product feels real from day 1; clean transition to backend |

---

## Tech Stack (Phase 1)

- **Framework:** Next.js 14 (App Router) + TypeScript strict
- **Styling:** Tailwind CSS + CSS custom properties (botanical palette)
- **State:** Zustand (interactive stores with mock data)
- **Fonts:** Google Fonts — Lora (display), Nunito (body), JetBrains Mono (code)
- **No backend dependencies** — everything is client-side

---

## Project Structure

```
mirkayk/
├── app/
│   ├── layout.tsx              # Root layout (fonts, providers, grain overlay)
│   ├── page.tsx                # Redirect to /connect or /dashboard
│   ├── globals.css             # CSS variables, Tailwind config, grain texture
│   ├── (auth)/
│   │   └── connect/
│   │       └── page.tsx        # Provider connection page
│   └── (dashboard)/
│       ├── layout.tsx          # 3-column layout (sidebar + main + activity)
│       ├── page.tsx            # Dashboard home (stats + agent grid)
│       ├── agents/
│       │   └── page.tsx        # Agent list/management
│       ├── tasks/
│       │   └── page.tsx        # Task board
│       ├── projects/
│       │   └── page.tsx        # Placeholder — empty state
│       ├── logs/
│       │   └── page.tsx        # Placeholder — empty state
│       └── budget/
│           └── page.tsx        # Placeholder — empty state
├── components/
│   ├── ui/                     # Button, Badge, Card, Modal, Input, SegmentedControl, TokenMeter
│   ├── layout/                 # Sidebar, TopBar, ActivityPanel
│   ├── agents/                 # AgentCard, AgentDetail, AgentGrid
│   ├── tasks/                  # TaskModal, TaskList, TaskCard
│   ├── connect/                # ProviderButton, TerminalModal, Confetti
│   └── shared/                 # BotanicalDecor, GrainOverlay
├── lib/
│   ├── stores/                 # Zustand stores (agents, tasks, providers, projects, activity)
│   ├── mock/                   # Mock data (agents, tasks, activity, projects)
│   ├── types/
│   │   └── index.ts            # All TypeScript interfaces
│   └── utils/                  # Helpers (formatters, etc.)
├── public/
│   └── svg/                    # Botanical SVG decorations
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Design System

### Color Tokens (CSS Variables)

```css
--bg:           #FEF5EE   /* warm cream */
--surface:      #FFFAF6   /* cards */
--surface-2:    #FDF0E8   /* secondary surfaces */
--pink-100:     #FFE0E8
--pink-200:     #F5B8CA
--pink-300:     #E8849E   /* primary accent */
--sage-100:     #D8EACF
--sage-200:     #A8C9A0   /* success, connected state */
--sand-100:     #F5E8D8
--sand-200:     #E0C49A
--lavender-100: #EDE0F0
--lavender-200: #C8AED8
--sky-100:      #DCE8F5
--peach-100:    #FFE8DC
--text-900:     #2E1A14   /* darkest text — no harsh blacks */
--text-700:     #7A5040
--text-500:     #B09080
--border:       rgba(232, 132, 158, 0.15)
```

### Typography

| Use | Font | Tailwind class |
|-----|------|----------------|
| Logo, headings | Lora (serif, italic for logo) | `font-display` |
| Body, UI | Nunito (rounded, friendly) | `font-body` |
| Code, terminal | JetBrains Mono | `font-mono` |

### UI Primitives (`components/ui/`)

| Component | Description |
|-----------|-------------|
| `Button` | Variants: primary (pink-300), secondary (outline), ghost. Rounded 12px. |
| `Badge` | Color pills for status (active/idle/working) and providers (claude/codex/gemini) |
| `Card` | Surface bg, subtle border, rounded-16px, hover lift + pink glow shadow |
| `Modal` | Overlay with backdrop blur, slide-in animation, botanical corner accents |
| `Input` | Warm border, focus ring pink-200, rounded-12px |
| `SegmentedControl` | For priority P1/P2/P3 — selectable pills |
| `TokenMeter` | Circular SVG meter for sidebar (% budget used) |

### Visual Effects

- SVG grain texture overlay (fixed, pointer-events-none, opacity 3-5%)
- Botanical SVG decorations — abstract leaves/petals in sidebar and connect page corners
- Animations: status dot pulse, card hover lift (translateY -2px + shadow), smooth transitions 200ms
- All corners: 12-16px border radius
- Box shadows with warm pink tint
- Zero harsh blacks — text-900 (#2E1A14) is the darkest

---

## Routing

```
/                    → Redirect: provider connected → /dashboard, else → /connect
/connect             → Provider connection page (first screen for new users)
/dashboard           → Home: stats + agent grid + activity feed
/dashboard/agents    → Agent management (expanded grid + detail panel)
/dashboard/tasks     → Task board (filterable by agent/priority/status)
/dashboard/projects  → Placeholder with botanical empty state
/dashboard/logs      → Placeholder with botanical empty state
/dashboard/budget    → Placeholder with botanical empty state
```

---

## Pages

### /connect — CLI Provider Login

- Centered card on full cream background with botanical SVG corners
- mirkayk logo large (Lora italic + flower)
- Tagline: "your ai dev team, blooming"
- 3 provider buttons:
  - **Claude** (Anthropic): amber circle "A" icon, hint "Max, Pro or API key"
  - **Codex** (OpenAI): dark circle "diamond" icon, hint "ChatGPT Plus or API key"
  - **Gemini** (Google): colorful "G" icon, hint "Gemini Advanced or API key"
- Click provider → terminal modal (dark bg, JetBrains Mono, typing animation of CLI command)
- Spinner "Waiting for authentication..." → mock auto-connects after 3s
- Connected → button turns sage green with checkmark
- All 3 connected → CSS confetti burst (pink + sage petals, CSS only)
- "Continue to dashboard" button: disabled until 1+ provider connected, then pink-300

### /(dashboard) — Main Dashboard

**3-column layout:**

- **Left sidebar (220px fixed):** Logo, current project + badge, 6 nav items, TokenMeter, botanical SVG accent
- **Main content (flex-1):** Header (breadcrumb + agent count badges + "New Task +" button), stats row (3 cards), agent grid (2x3)
- **Right panel (280px):** "Live activity" scrollable feed

**Agent cards show:** colored status dot (pulsing if active), name (Lora bold), role (Nunito light), status badge, current task (truncated), provider pill. Hover: lift + pink glow.

**Agent detail (slide-in panel):** 4 tabs:
- Overview: role description, recent tasks, static token chart (mock SVG bar chart, not live data), "Assign task" textarea
- Prompt: editable system prompt in code block
- Instructions: editable checklist
- Skills: tag cloud

### New Task Modal

Fields: description (textarea), assign to agent (dropdown), priority P1/P2/P3 (segmented control). Submit button: "Assign task".

---

## Type System

```typescript
type ProviderName = "claude" | "codex" | "gemini"
type AgentStatus = "idle" | "active" | "working"
type TaskPriority = "P1" | "P2" | "P3"
type TaskStatus = "pending" | "in_progress" | "completed" | "failed"
type RunStatus = "running" | "completed" | "failed"
type AgentColor = "sage" | "lavender" | "pink" | "sand" | "sky" | "peach"

interface Provider { id: string; name: ProviderName; connected: boolean; connectedAt: Date | null }
interface Agent { id: string; name: string; role: string; color: AgentColor; provider: ProviderName; model: string; status: AgentStatus; currentTask: string | null; systemPrompt: string; instructions: string[]; skills: string[] }
interface Task { id: string; title: string; description: string; agentId: string | null; priority: TaskPriority; status: TaskStatus; createdAt: Date; completedAt: Date | null }
interface Project { id: string; name: string; description: string; department: "web2" | "web3"; agentIds: string[]; createdAt: Date }
interface AgentRun { id: string; agentId: string; taskId: string | null; input: string; output: string | null; tokensUsed: number; costUsd: number; status: RunStatus; startedAt: Date; completedAt: Date | null }
interface ActivityEntry { id: string; agentId: string; agentName: string; agentColor: AgentColor; action: string; timestamp: Date }
```

---

## Zustand Stores

| Store | State | Actions |
|-------|-------|---------|
| `useProviderStore` | providers[], isAllConnected | connect(name), disconnect(name), reset() |
| `useAgentStore` | agents[], selectedAgentId | selectAgent(id), updateStatus(id, status), updatePrompt(id, prompt) |
| `useTaskStore` | tasks[] | createTask(data), assignTask(taskId, agentId), completeTask(id), deleteTask(id) |
| `useProjectStore` | projects[], activeProjectId | createProject(data), setActive(id), deleteProject(id) |
| `useActivityStore` | entries[] (max 50) | addEntry(data), clear() |

### Cross-store flows:

- `createTask` with agentId → calls `agentStore.updateStatus(agentId, "working")` + `activityStore.addEntry(...)`
- `completeTask` → calls `agentStore.updateStatus(agentId, "idle")` + `activityStore.addEntry(...)`
- `connect(provider)` → updates provider, if all connected → `isAllConnected = true`

---

## Mock Data (Initial State)

- **6 agents:** PM (sage), Architect (lavender), Frontend (pink), Backend (sand), QA (sky), DevOps (peach) — full configs from spec
- **1 project:** "mirkayk v1" (web2)
- **8-10 tasks:** mixed statuses across agents
- **15-20 activity entries:** recent simulated events
- **Providers:** Claude and Codex pre-connected, Gemini disconnected (to demo the connect flow)

---

## Phase 1 Scope — Explicit Boundaries

### Included

- Design system complete (CSS vars, grain, botanicals, all UI primitives)
- /connect page with terminal modal, typing animation, confetti
- /dashboard home with 3-column layout, stats, agent grid, activity feed
- Agent detail slide-in panel with 4 tabs
- New Task modal with form
- /dashboard/tasks — filterable task list
- /dashboard/agents — expanded agent grid with search/filter
- All Zustand stores fully interactive
- Mobile responsive on all pages

### Excluded (Phase 2+)

- /projects, /logs, /budget — full implementations (placeholder empty states only)
- NextAuth / real authentication
- Prisma / PostgreSQL / Neon
- tRPC API layer
- Real CLI integration (claude/codex/gemini)
- Turborepo monorepo migration
- Dark mode toggle (CSS vars support it, but toggle deferred)
- Vitest / Playwright testing
- Real token tracking / cost calculation

---

## Agent Configurations Reference

### PM Agent
- **Color:** sage | **Model:** claude-sonnet-4-6 | **Provider:** claude
- **Role:** Coordinate team, decompose requirements, assign tasks, track progress
- **Key instructions:** Break features into subtasks, define acceptance criteria, escalate blockers, end updates with "next 3 actions"

### Architect Agent
- **Color:** lavender | **Model:** claude-opus-4-6 | **Provider:** claude
- **Role:** Design technical foundations — stack, schema, API contracts, component trees
- **Key instructions:** Produce TECH_STACK.md before code, define API contract before Backend starts, document tradeoffs

### Frontend Agent
- **Color:** pink | **Model:** claude-sonnet-4-6 | **Provider:** claude
- **Role:** Build production-ready UIs — TypeScript, Tailwind, responsive, accessible
- **Key instructions:** Mobile-first, loading/error states, no hardcoded URLs, JSDoc on props

### Backend Agent
- **Color:** sand | **Model:** claude-sonnet-4-6 | **Provider:** codex
- **Role:** Build secure APIs — validation, error handling, Prisma, auth middleware
- **Key instructions:** Zod validation, consistent error shapes, never commit secrets

### QA Agent
- **Color:** sky | **Model:** claude-sonnet-4-6 | **Provider:** codex
- **Role:** Testing and quality — unit/integration/E2E tests, bug reports, accessibility audits
- **Key instructions:** Test happy + edge + error cases, report bugs immediately, verify acceptance criteria

### DevOps Agent
- **Color:** peach | **Model:** claude-sonnet-4-6 | **Provider:** gemini
- **Role:** Infrastructure and deployment — CI/CD, Docker, Vercel, monitoring
- **Key instructions:** Staging before production, require CI tests, document env vars, automatic rollback
