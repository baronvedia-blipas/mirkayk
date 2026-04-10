# mirkayk Phase 1: UI-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete mirkayk frontend — botanical AI agent orchestration dashboard with interactive mock data, zero backend.

**Architecture:** Next.js 14 App Router standalone app. All state lives in Zustand stores seeded with mock data. CSS custom properties define the botanical design system, consumed by Tailwind. Pages use route groups: `(auth)` for /connect, `(dashboard)` for the 3-column dashboard layout.

**Tech Stack:** Next.js 14, TypeScript strict, Tailwind CSS, Zustand, Google Fonts (Lora + Nunito + JetBrains Mono)

**Spec:** `docs/superpowers/specs/2026-04-10-mirkayk-ui-first-design.md`

---

## File Map

### Config & Setup
| File | Responsibility |
|------|---------------|
| `package.json` | Dependencies: next, react, zustand, tailwindcss |
| `next.config.ts` | Next.js config (minimal) |
| `tailwind.config.ts` | Extend with CSS variable colors, custom fonts, animations |
| `tsconfig.json` | Strict mode, path aliases |
| `app/globals.css` | CSS variables (full palette), grain texture, base styles, animations |
| `app/layout.tsx` | Root layout: Google Fonts, GrainOverlay, metadata |

### Types & Data Layer
| File | Responsibility |
|------|---------------|
| `lib/types/index.ts` | All TypeScript interfaces and type aliases |
| `lib/utils/index.ts` | `cn()` helper, `formatDate()`, `generateId()` |
| `lib/mock/agents.ts` | 6 agent configs with full system prompts |
| `lib/mock/tasks.ts` | 8-10 sample tasks in mixed statuses |
| `lib/mock/activity.ts` | 15-20 recent activity entries |
| `lib/mock/projects.ts` | 1 default project + provider initial state |
| `lib/stores/providers.ts` | useProviderStore — connect/disconnect providers |
| `lib/stores/agents.ts` | useAgentStore — agent selection, status, prompt editing |
| `lib/stores/tasks.ts` | useTaskStore — CRUD with cross-store side effects |
| `lib/stores/projects.ts` | useProjectStore — active project |
| `lib/stores/activity.ts` | useActivityStore — capped feed |

### UI Primitives
| File | Responsibility |
|------|---------------|
| `components/ui/button.tsx` | Button: primary, secondary, ghost variants |
| `components/ui/badge.tsx` | Badge: status + provider + priority color mapping |
| `components/ui/card.tsx` | Card: surface bg, hover lift, pink glow |
| `components/ui/modal.tsx` | Modal: backdrop blur, slide-in, portal |
| `components/ui/input.tsx` | Input + Textarea: warm border, focus ring |
| `components/ui/segmented-control.tsx` | SegmentedControl: selectable pill group |
| `components/ui/token-meter.tsx` | TokenMeter: circular SVG progress ring |

### Shared Visual
| File | Responsibility |
|------|---------------|
| `components/shared/grain-overlay.tsx` | Fixed SVG noise texture overlay |
| `components/shared/botanical-decor.tsx` | Abstract leaf/petal SVG decorations |
| `components/shared/empty-state.tsx` | Botanical empty state for placeholder pages |

### Connect Page
| File | Responsibility |
|------|---------------|
| `components/connect/provider-button.tsx` | Provider card with icon, name, hint, status |
| `components/connect/terminal-modal.tsx` | Dark terminal with typing animation + spinner |
| `components/connect/confetti.tsx` | CSS-only petal confetti burst |
| `app/(auth)/connect/page.tsx` | Connect page: logo, 3 providers, continue button |

### Dashboard Layout
| File | Responsibility |
|------|---------------|
| `components/layout/sidebar.tsx` | Left sidebar: logo, project, nav, token meter, botanical |
| `components/layout/activity-panel.tsx` | Right panel: live activity feed |
| `app/(dashboard)/layout.tsx` | 3-column shell: sidebar + main + activity |

### Dashboard Pages
| File | Responsibility |
|------|---------------|
| `app/(dashboard)/page.tsx` | Home: stats row + agent grid |
| `components/agents/agent-card.tsx` | Agent card: status dot, name, role, provider pill |
| `components/agents/agent-grid.tsx` | 2x3 responsive grid of agent cards |
| `components/agents/agent-detail.tsx` | Slide-in panel with 4 tabs |
| `components/tasks/task-modal.tsx` | New task form modal |
| `components/tasks/task-card.tsx` | Single task row with status, priority, agent |
| `components/tasks/task-list.tsx` | Filterable task list |
| `app/(dashboard)/agents/page.tsx` | Agent management: expanded grid + detail |
| `app/(dashboard)/tasks/page.tsx` | Task board with filters |
| `app/(dashboard)/projects/page.tsx` | Placeholder empty state |
| `app/(dashboard)/logs/page.tsx` | Placeholder empty state |
| `app/(dashboard)/budget/page.tsx` | Placeholder empty state |

### Root
| File | Responsibility |
|------|---------------|
| `app/page.tsx` | Redirect: has provider → /dashboard, else → /connect |
| `public/svg/leaf-1.svg` | Botanical decoration SVG |
| `public/svg/leaf-2.svg` | Botanical decoration SVG |
| `public/svg/petal-1.svg` | Botanical decoration SVG |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /c/ClaudecodeProjects/mirkayk
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Select: Yes to all defaults. This creates the base Next.js 14 project with TypeScript and Tailwind.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install zustand
```

- [ ] **Step 3: Verify the dev server starts**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000, default Next.js page renders.

- [ ] **Step 4: Commit scaffold**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 + TypeScript + Tailwind + Zustand"
```

---

## Task 2: Design System — CSS Variables, Fonts, Tailwind Config

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace globals.css with botanical design system**

Replace the entire contents of `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Backgrounds */
  --bg: #FEF5EE;
  --surface: #FFFAF6;
  --surface-2: #FDF0E8;

  /* Pink spectrum */
  --pink-100: #FFE0E8;
  --pink-200: #F5B8CA;
  --pink-300: #E8849E;

  /* Nature */
  --sage-100: #D8EACF;
  --sage-200: #A8C9A0;

  /* Warm */
  --sand-100: #F5E8D8;
  --sand-200: #E0C49A;

  /* Accent */
  --lavender-100: #EDE0F0;
  --lavender-200: #C8AED8;
  --sky-100: #DCE8F5;
  --peach-100: #FFE8DC;

  /* Text — no harsh blacks */
  --text-900: #2E1A14;
  --text-700: #7A5040;
  --text-500: #B09080;

  /* Border */
  --border: rgba(232, 132, 158, 0.15);
}

body {
  background-color: var(--bg);
  color: var(--text-900);
  font-family: var(--font-nunito), sans-serif;
}

/* Status pulse animation */
@keyframes status-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

/* Card hover lift */
@keyframes hover-lift {
  from { transform: translateY(0); }
  to { transform: translateY(-2px); }
}

/* Typing cursor blink */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Confetti fall */
@keyframes confetti-fall {
  0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

/* Grain overlay texture */
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}
```

- [ ] **Step 2: Update tailwind.config.ts with botanical theme**

Replace `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        pink: {
          100: "var(--pink-100)",
          200: "var(--pink-200)",
          300: "var(--pink-300)",
        },
        sage: {
          100: "var(--sage-100)",
          200: "var(--sage-200)",
        },
        sand: {
          100: "var(--sand-100)",
          200: "var(--sand-200)",
        },
        lavender: {
          100: "var(--lavender-100)",
          200: "var(--lavender-200)",
        },
        sky: { 100: "var(--sky-100)" },
        peach: { 100: "var(--peach-100)" },
        text: {
          900: "var(--text-900)",
          700: "var(--text-700)",
          500: "var(--text-500)",
        },
        border: "var(--border)",
      },
      fontFamily: {
        display: ["var(--font-lora)", "serif"],
        body: ["var(--font-nunito)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        card: "16px",
        btn: "12px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(232, 132, 158, 0.08)",
        "card-hover": "0 8px 24px rgba(232, 132, 158, 0.15)",
      },
      animation: {
        "status-pulse": "status-pulse 2s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Update layout.tsx with Google Fonts + GrainOverlay**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Lora, Nunito, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "mirkayk — your ai dev team, blooming",
  description: "AI agent orchestration platform for web development teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lora.variable} ${nunito.variable} ${jetbrains.variable}`}>
      <body className="font-body antialiased">
        {children}
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Replace app/page.tsx with a temporary test page**

Replace `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-5xl italic text-text-900">mirkayk</h1>
        <p className="font-body text-text-500 mt-2">your ai dev team, blooming</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verify design system renders**

```bash
npm run dev
```

Expected: Warm cream background (#FEF5EE), "mirkayk" in Lora italic serif, tagline in Nunito, subtle grain overlay visible.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/layout.tsx app/page.tsx tailwind.config.ts
git commit -m "feat: botanical design system — CSS variables, fonts, grain overlay"
```

---

## Task 3: TypeScript Types & Utility Helpers

**Files:**
- Create: `lib/types/index.ts`
- Create: `lib/utils/index.ts`

- [ ] **Step 1: Create types file**

Create `lib/types/index.ts`:

```typescript
export type ProviderName = "claude" | "codex" | "gemini";
export type AgentStatus = "idle" | "active" | "working";
export type TaskPriority = "P1" | "P2" | "P3";
export type TaskStatus = "pending" | "in_progress" | "completed" | "failed";
export type RunStatus = "running" | "completed" | "failed";
export type AgentColor = "sage" | "lavender" | "pink" | "sand" | "sky" | "peach";

export interface Provider {
  id: string;
  name: ProviderName;
  connected: boolean;
  connectedAt: Date | null;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  color: AgentColor;
  provider: ProviderName;
  model: string;
  status: AgentStatus;
  currentTask: string | null;
  systemPrompt: string;
  instructions: string[];
  skills: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  agentId: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  completedAt: Date | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  department: "web2" | "web3";
  agentIds: string[];
  createdAt: Date;
}

export interface AgentRun {
  id: string;
  agentId: string;
  taskId: string | null;
  input: string;
  output: string | null;
  tokensUsed: number;
  costUsd: number;
  status: RunStatus;
  startedAt: Date;
  completedAt: Date | null;
}

export interface ActivityEntry {
  id: string;
  agentId: string;
  agentName: string;
  agentColor: AgentColor;
  action: string;
  timestamp: Date;
}

/** Maps agent color names to their CSS variable light/dark pairs */
export const AGENT_COLOR_MAP: Record<AgentColor, { bg: string; text: string }> = {
  sage: { bg: "bg-sage-100", text: "text-sage-200" },
  lavender: { bg: "bg-lavender-100", text: "text-lavender-200" },
  pink: { bg: "bg-pink-100", text: "text-pink-300" },
  sand: { bg: "bg-sand-100", text: "text-sand-200" },
  sky: { bg: "bg-sky-100", text: "text-blue-600" },
  peach: { bg: "bg-peach-100", text: "text-orange-600" },
};

/** Maps provider names to display info */
export const PROVIDER_INFO: Record<ProviderName, { label: string; company: string; hint: string; icon: string; iconBg: string }> = {
  claude: { label: "Claude", company: "Anthropic", hint: "Max, Pro or API key", icon: "A", iconBg: "bg-amber-100 text-amber-700" },
  codex: { label: "Codex", company: "OpenAI", hint: "ChatGPT Plus or API key", icon: "\u2726", iconBg: "bg-gray-900 text-white" },
  gemini: { label: "Gemini", company: "Google", hint: "Gemini Advanced or API key", icon: "G", iconBg: "bg-blue-50 text-blue-600" },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  P1: { label: "P1", color: "bg-red-100 text-red-700" },
  P2: { label: "P2", color: "bg-amber-100 text-amber-700" },
  P3: { label: "P3", color: "bg-green-100 text-green-700" },
};

export const STATUS_CONFIG: Record<AgentStatus, { label: string; dotColor: string }> = {
  idle: { label: "idle", dotColor: "bg-text-500" },
  active: { label: "active", dotColor: "bg-sage-200" },
  working: { label: "working", dotColor: "bg-pink-300" },
};
```

- [ ] **Step 2: Create utils file**

Create `lib/utils/index.ts`:

```typescript
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/
git commit -m "feat: TypeScript types, color maps, and utility helpers"
```

---

## Task 4: Mock Data

**Files:**
- Create: `lib/mock/agents.ts`, `lib/mock/tasks.ts`, `lib/mock/activity.ts`, `lib/mock/projects.ts`

- [ ] **Step 1: Create mock agents**

Create `lib/mock/agents.ts` with all 6 agents. Each agent must include the full `systemPrompt`, `instructions[]`, and `skills[]` from the spec. Key fields per agent:

```typescript
import { Agent } from "@/lib/types";

export const MOCK_AGENTS: Agent[] = [
  {
    id: "agent-pm",
    name: "PM Agent",
    role: "Project Manager",
    color: "sage",
    provider: "claude",
    model: "claude-sonnet-4-6",
    status: "active",
    currentTask: "Breaking down dashboard redesign into subtasks",
    systemPrompt: `You are the PM Agent for mirkayk, an AI-powered web development team. Your job is to coordinate the team, break down user requirements into actionable tasks, assign them to the right specialist agents, track progress, and report back to the user.\nAlways think in sprints. When a user gives you a project, decompose it into:\n1. Architecture tasks → assign to Architect\n2. Frontend tasks → assign to Frontend\n3. Backend tasks → assign to Backend\n4. Testing tasks → assign to QA\n5. Deployment tasks → assign to DevOps\nNever write code yourself. Your output is always a structured task list with clear acceptance criteria.\nCommunicate blockers immediately. Keep the user informed with concise status updates. End every update with: next 3 actions.`,
    instructions: [
      "Break every feature request into subtasks before assigning",
      "Always define acceptance criteria per task",
      "Escalate blockers to the user immediately",
      "Prioritize: P1 blocking, P2 important, P3 nice to have",
      "Never assign tasks without checking agent availability",
      "End every status update with: next 3 actions",
    ],
    skills: [
      "Task decomposition and sprint planning",
      "Dependency mapping between agents",
      "Acceptance criteria writing",
      "Risk identification and escalation",
      "Progress tracking and reporting",
      "Inter-agent communication coordination",
    ],
  },
  {
    id: "agent-architect",
    name: "Architect",
    role: "Technical Architect",
    color: "lavender",
    provider: "claude",
    model: "claude-opus-4-6",
    status: "working",
    currentTask: "Designing database schema for auth module",
    systemPrompt: `You are the Architect Agent for mirkayk. You design the technical foundation of every web application the team builds.\nBefore any code is written, you produce:\n- Tech stack recommendation with justification\n- Folder structure and project scaffold\n- Database schema (tables, relationships, indexes)\n- API contract (endpoints, request/response shapes)\n- Component tree for the frontend\n- Environment setup instructions\nYou write in Markdown. You produce diagrams using Mermaid.\nDefault stack unless told otherwise:\nFrontend: Next.js 14 + TypeScript + Tailwind CSS\nBackend: Node.js + Express + Prisma\nDatabase: PostgreSQL\nAuth: NextAuth.js\nDeploy: Vercel + Railway`,
    instructions: [
      "Always produce TECH_STACK.md before any agent writes code",
      "Define API contract before Backend starts coding",
      "Define component tree before Frontend starts coding",
      "Keep database schema normalized unless performance requires otherwise",
      "Document every architectural decision with its tradeoff",
      "Flag scalability concerns proactively",
    ],
    skills: [
      "Full-stack architecture design",
      "Database schema design",
      "REST and GraphQL API design",
      "Component architecture for React/Next.js",
      "Authentication and authorization patterns",
      "Mermaid diagram generation",
      "Tech stack evaluation and selection",
    ],
  },
  {
    id: "agent-frontend",
    name: "Frontend",
    role: "UI/UX Developer",
    color: "pink",
    provider: "claude",
    model: "claude-sonnet-4-6",
    status: "idle",
    currentTask: null,
    systemPrompt: `You are the Frontend Agent for mirkayk. You build beautiful, functional, production-ready user interfaces.\nYou always:\n- Follow the component tree defined by the Architect\n- Consume APIs exactly as defined in the API contract\n- Write TypeScript, never plain JS\n- Use Tailwind CSS for styling\n- Make interfaces responsive (mobile-first)\n- Handle loading, empty, and error states\n- Write accessible HTML (ARIA labels, semantic tags)\nYou never touch the backend or database.\nWhen you finish a component output:\n1. Complete file with full path\n2. Brief description of what it does\n3. Props or dependencies it expects\n4. Flag any missing API endpoints to PM`,
    instructions: [
      "Always use TypeScript, no exceptions",
      "Mobile-first responsive design on every component",
      "Every interactive element needs loading and error state",
      "Use Tailwind utility classes, avoid custom CSS unless necessary",
      "Name components PascalCase, files matching component name",
      "Always add JSDoc comments to component props",
      "Never hardcode API URLs, use environment variables",
    ],
    skills: [
      "React 18 and Next.js 14 App Router",
      "TypeScript",
      "Tailwind CSS",
      "Form handling (React Hook Form + Zod)",
      "State management (Zustand, React Query)",
      "Accessibility (WCAG 2.1)",
      "Responsive and mobile-first design",
      "Animation (Framer Motion)",
      "API integration",
    ],
  },
  {
    id: "agent-backend",
    name: "Backend",
    role: "API Developer",
    color: "sand",
    provider: "codex",
    model: "claude-sonnet-4-6",
    status: "idle",
    currentTask: null,
    systemPrompt: `You are the Backend Agent for mirkayk. You build secure, performant, well-structured server-side applications.\nYou always:\n- Follow the API contract defined by the Architect exactly\n- Validate all inputs with Zod schemas\n- Handle errors with proper HTTP status codes\n- Write database queries using Prisma ORM\n- Never expose sensitive data in responses\n- Add authentication middleware to protected routes\nYou never write frontend components or handle deployments.\nWhen you finish an endpoint output:\n1. Complete file with full path\n2. Endpoint documentation (method, path, request, response)\n3. Any database migrations needed\n4. Environment variables required`,
    instructions: [
      "Validate every request body and query param with Zod",
      "Use Prisma for all database operations",
      "Return consistent error shapes: { error: string, code: string }",
      "Protect routes with auth middleware by default",
      "Never commit secrets, always use process.env",
      "Write database migrations for every schema change",
      "Log errors with context, never swallow exceptions",
    ],
    skills: [
      "Node.js and Express",
      "TypeScript",
      "Prisma ORM",
      "PostgreSQL",
      "REST API design",
      "JWT and session authentication",
      "Input validation with Zod",
      "Error handling and middleware",
      "Rate limiting and security headers",
    ],
  },
  {
    id: "agent-qa",
    name: "QA",
    role: "Quality Assurance",
    color: "sky",
    provider: "codex",
    model: "claude-sonnet-4-6",
    status: "active",
    currentTask: "Running E2E tests on login flow",
    systemPrompt: `You are the QA Agent for mirkayk. You ensure every feature works correctly before it reaches production.\nYour responsibilities:\n- Write unit tests for Backend logic (Vitest)\n- Write integration tests for API endpoints\n- Write E2E tests for critical user flows (Playwright)\n- Review Frontend components for bugs and accessibility\n- Report bugs with clear reproduction steps\n- Verify acceptance criteria from PM\nBug report format:\nBUG-[number]: [Title]\nSeverity: Critical / High / Medium / Low\nSteps to reproduce: [numbered list]\nExpected: [what should happen]\nActual: [what happens]\nAssign to: [responsible agent]\nYou never fix bugs yourself, only report them.`,
    instructions: [
      "Test happy path AND edge cases AND error cases",
      "Every new feature needs at least one unit test",
      "Critical flows need E2E tests",
      "Report bugs immediately, do not batch them",
      "Verify PM acceptance criteria before marking done",
      "Check mobile responsiveness on every UI component",
      "Run accessibility audit on every new page",
    ],
    skills: [
      "Vitest (unit and integration testing)",
      "Playwright (end-to-end testing)",
      "Accessibility auditing (axe-core)",
      "Bug reporting and reproduction",
      "Test coverage analysis",
      "Cross-browser compatibility checking",
    ],
  },
  {
    id: "agent-devops",
    name: "DevOps",
    role: "Infrastructure & Deploy",
    color: "peach",
    provider: "gemini",
    model: "claude-sonnet-4-6",
    status: "idle",
    currentTask: null,
    systemPrompt: `You are the DevOps Agent for mirkayk. You handle all infrastructure, deployment, and operations.\nYour responsibilities:\n- Set up CI/CD pipelines (GitHub Actions)\n- Deploy frontend to Vercel\n- Deploy backend to Railway or Render\n- Configure environment variables in each platform\n- Set up database on Neon\n- Monitor deployments and alert on failures\n- Write Dockerfiles when needed\n- Configure domains and SSL\nYou always:\n- Use environment variables for all secrets\n- Set up staging AND production environments\n- Document everything in DEPLOY.md\nNever deploy to production without PM approval and QA sign-off.`,
    instructions: [
      "Always set up staging before production",
      "Require passing CI tests before any deployment",
      "Document every env variable in .env.example",
      "Never store secrets in code or git history",
      "Set up automatic rollback on failed deployments",
      "Create DEPLOY.md with step-by-step guide",
      "Configure uptime monitoring after every production deploy",
    ],
    skills: [
      "GitHub Actions CI/CD",
      "Vercel deployment and configuration",
      "Railway and Render deployment",
      "Docker and containerization",
      "Neon PostgreSQL cloud setup",
      "Environment variable management",
      "Domain configuration and SSL",
      "Monitoring and alerting setup",
    ],
  },
];
```

- [ ] **Step 2: Create mock tasks**

Create `lib/mock/tasks.ts`:

```typescript
import { Task } from "@/lib/types";

export const MOCK_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Design database schema for auth module",
    description: "Create the Prisma schema for User, Session, and Account models following NextAuth.js v5 conventions.",
    agentId: "agent-architect",
    priority: "P1",
    status: "in_progress",
    createdAt: new Date("2026-04-10T08:00:00"),
    completedAt: null,
  },
  {
    id: "task-2",
    title: "Build login page UI",
    description: "Create the login page with email/password form, OAuth buttons, and botanical styling.",
    agentId: "agent-frontend",
    priority: "P1",
    status: "pending",
    createdAt: new Date("2026-04-10T08:15:00"),
    completedAt: null,
  },
  {
    id: "task-3",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for lint, test, and deploy on push to main.",
    agentId: "agent-devops",
    priority: "P2",
    status: "pending",
    createdAt: new Date("2026-04-10T08:30:00"),
    completedAt: null,
  },
  {
    id: "task-4",
    title: "Write E2E tests for login flow",
    description: "Playwright tests covering: successful login, invalid credentials, forgot password redirect.",
    agentId: "agent-qa",
    priority: "P1",
    status: "in_progress",
    createdAt: new Date("2026-04-10T09:00:00"),
    completedAt: null,
  },
  {
    id: "task-5",
    title: "Implement JWT middleware",
    description: "Express middleware to validate JWT tokens on protected routes. Return 401 for invalid/expired tokens.",
    agentId: "agent-backend",
    priority: "P1",
    status: "completed",
    createdAt: new Date("2026-04-09T14:00:00"),
    completedAt: new Date("2026-04-09T16:30:00"),
  },
  {
    id: "task-6",
    title: "Create component tree for dashboard",
    description: "Define the React component hierarchy for the main dashboard view including sidebar, stats, and agent grid.",
    agentId: "agent-architect",
    priority: "P2",
    status: "completed",
    createdAt: new Date("2026-04-09T10:00:00"),
    completedAt: new Date("2026-04-09T12:00:00"),
  },
  {
    id: "task-7",
    title: "Build responsive navigation sidebar",
    description: "Implement the left sidebar with logo, project selector, nav items, and token meter. Collapsible on mobile.",
    agentId: "agent-frontend",
    priority: "P2",
    status: "completed",
    createdAt: new Date("2026-04-09T13:00:00"),
    completedAt: new Date("2026-04-09T17:00:00"),
  },
  {
    id: "task-8",
    title: "Deploy staging environment",
    description: "Deploy the current build to Vercel preview. Configure env vars for staging DB.",
    agentId: "agent-devops",
    priority: "P3",
    status: "pending",
    createdAt: new Date("2026-04-10T10:00:00"),
    completedAt: null,
  },
  {
    id: "task-9",
    title: "Implement /api/auth endpoints",
    description: "POST /auth/login, POST /auth/register, POST /auth/refresh. Input validation with Zod.",
    agentId: "agent-backend",
    priority: "P1",
    status: "pending",
    createdAt: new Date("2026-04-10T09:30:00"),
    completedAt: null,
  },
  {
    id: "task-10",
    title: "Accessibility audit on connect page",
    description: "Run axe-core audit. Check ARIA labels, keyboard navigation, and screen reader compatibility.",
    agentId: "agent-qa",
    priority: "P2",
    status: "pending",
    createdAt: new Date("2026-04-10T10:30:00"),
    completedAt: null,
  },
];
```

- [ ] **Step 3: Create mock activity**

Create `lib/mock/activity.ts`:

```typescript
import { ActivityEntry } from "@/lib/types";

export const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: "act-1", agentId: "agent-pm", agentName: "PM Agent", agentColor: "sage", action: "Assigned 'Design database schema' to Architect", timestamp: new Date("2026-04-10T08:01:00") },
  { id: "act-2", agentId: "agent-architect", agentName: "Architect", agentColor: "lavender", action: "Started working on database schema", timestamp: new Date("2026-04-10T08:02:00") },
  { id: "act-3", agentId: "agent-pm", agentName: "PM Agent", agentColor: "sage", action: "Created task: Build login page UI", timestamp: new Date("2026-04-10T08:15:00") },
  { id: "act-4", agentId: "agent-backend", agentName: "Backend", agentColor: "sand", action: "Completed JWT middleware implementation", timestamp: new Date("2026-04-09T16:30:00") },
  { id: "act-5", agentId: "agent-frontend", agentName: "Frontend", agentColor: "pink", action: "Completed responsive navigation sidebar", timestamp: new Date("2026-04-09T17:00:00") },
  { id: "act-6", agentId: "agent-qa", agentName: "QA", agentColor: "sky", action: "Started E2E tests for login flow", timestamp: new Date("2026-04-10T09:00:00") },
  { id: "act-7", agentId: "agent-pm", agentName: "PM Agent", agentColor: "sage", action: "Escalated: Backend blocked on auth schema", timestamp: new Date("2026-04-10T09:15:00") },
  { id: "act-8", agentId: "agent-architect", agentName: "Architect", agentColor: "lavender", action: "Completed component tree for dashboard", timestamp: new Date("2026-04-09T12:00:00") },
  { id: "act-9", agentId: "agent-devops", agentName: "DevOps", agentColor: "peach", action: "Configured GitHub Actions pipeline", timestamp: new Date("2026-04-10T08:45:00") },
  { id: "act-10", agentId: "agent-pm", agentName: "PM Agent", agentColor: "sage", action: "Sprint update: 3/10 tasks completed", timestamp: new Date("2026-04-10T10:00:00") },
  { id: "act-11", agentId: "agent-qa", agentName: "QA", agentColor: "sky", action: "BUG-001: Login button unresponsive on mobile", timestamp: new Date("2026-04-10T09:30:00") },
  { id: "act-12", agentId: "agent-frontend", agentName: "Frontend", agentColor: "pink", action: "Picked up: Build login page UI", timestamp: new Date("2026-04-10T10:15:00") },
  { id: "act-13", agentId: "agent-backend", agentName: "Backend", agentColor: "sand", action: "Started /api/auth endpoint implementation", timestamp: new Date("2026-04-10T09:35:00") },
  { id: "act-14", agentId: "agent-architect", agentName: "Architect", agentColor: "lavender", action: "Published API contract v2 for auth module", timestamp: new Date("2026-04-10T10:45:00") },
  { id: "act-15", agentId: "agent-pm", agentName: "PM Agent", agentColor: "sage", action: "Next 3 actions: finish schema, start login UI, deploy staging", timestamp: new Date("2026-04-10T11:00:00") },
];
```

- [ ] **Step 4: Create mock projects and providers**

Create `lib/mock/projects.ts`:

```typescript
import { Project, Provider } from "@/lib/types";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "project-1",
    name: "mirkayk v1",
    description: "AI agent orchestration dashboard — Phase 1 UI build",
    department: "web2",
    agentIds: ["agent-pm", "agent-architect", "agent-frontend", "agent-backend", "agent-qa", "agent-devops"],
    createdAt: new Date("2026-04-09T08:00:00"),
  },
];

export const MOCK_PROVIDERS: Provider[] = [
  { id: "prov-claude", name: "claude", connected: true, connectedAt: new Date("2026-04-09T07:00:00") },
  { id: "prov-codex", name: "codex", connected: true, connectedAt: new Date("2026-04-09T07:05:00") },
  { id: "prov-gemini", name: "gemini", connected: false, connectedAt: null },
];
```

- [ ] **Step 5: Commit**

```bash
git add lib/mock/
git commit -m "feat: mock data — 6 agents, 10 tasks, 15 activity entries, providers"
```

---

## Task 5: Zustand Stores

**Files:**
- Create: `lib/stores/providers.ts`, `lib/stores/agents.ts`, `lib/stores/tasks.ts`, `lib/stores/projects.ts`, `lib/stores/activity.ts`

- [ ] **Step 1: Create provider store**

Create `lib/stores/providers.ts`:

```typescript
import { create } from "zustand";
import { Provider, ProviderName } from "@/lib/types";
import { MOCK_PROVIDERS } from "@/lib/mock/projects";

interface ProviderStore {
  providers: Provider[];
  isAllConnected: boolean;
  connect: (name: ProviderName) => void;
  disconnect: (name: ProviderName) => void;
  reset: () => void;
}

export const useProviderStore = create<ProviderStore>((set) => ({
  providers: MOCK_PROVIDERS,
  isAllConnected: MOCK_PROVIDERS.every((p) => p.connected),
  connect: (name) =>
    set((state) => {
      const updated = state.providers.map((p) =>
        p.name === name ? { ...p, connected: true, connectedAt: new Date() } : p
      );
      return { providers: updated, isAllConnected: updated.every((p) => p.connected) };
    }),
  disconnect: (name) =>
    set((state) => {
      const updated = state.providers.map((p) =>
        p.name === name ? { ...p, connected: false, connectedAt: null } : p
      );
      return { providers: updated, isAllConnected: false };
    }),
  reset: () => set({ providers: MOCK_PROVIDERS, isAllConnected: MOCK_PROVIDERS.every((p) => p.connected) }),
}));
```

- [ ] **Step 2: Create activity store**

Create `lib/stores/activity.ts`:

```typescript
import { create } from "zustand";
import { ActivityEntry, AgentColor } from "@/lib/types";
import { MOCK_ACTIVITY } from "@/lib/mock/activity";
import { generateId } from "@/lib/utils";

const MAX_ENTRIES = 50;

interface ActivityStore {
  entries: ActivityEntry[];
  addEntry: (data: { agentId: string; agentName: string; agentColor: AgentColor; action: string }) => void;
  clear: () => void;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  entries: MOCK_ACTIVITY.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  addEntry: (data) =>
    set((state) => ({
      entries: [
        { id: generateId(), ...data, timestamp: new Date() },
        ...state.entries,
      ].slice(0, MAX_ENTRIES),
    })),
  clear: () => set({ entries: [] }),
}));
```

- [ ] **Step 3: Create agent store**

Create `lib/stores/agents.ts`:

```typescript
import { create } from "zustand";
import { Agent, AgentStatus } from "@/lib/types";
import { MOCK_AGENTS } from "@/lib/mock/agents";

interface AgentStore {
  agents: Agent[];
  selectedAgentId: string | null;
  selectAgent: (id: string | null) => void;
  updateStatus: (id: string, status: AgentStatus, currentTask?: string | null) => void;
  updatePrompt: (id: string, systemPrompt: string) => void;
  updateInstructions: (id: string, instructions: string[]) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: MOCK_AGENTS,
  selectedAgentId: null,
  selectAgent: (id) => set({ selectedAgentId: id }),
  updateStatus: (id, status, currentTask) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, status, currentTask: currentTask !== undefined ? currentTask : a.currentTask } : a
      ),
    })),
  updatePrompt: (id, systemPrompt) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, systemPrompt } : a)),
    })),
  updateInstructions: (id, instructions) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, instructions } : a)),
    })),
}));
```

- [ ] **Step 4: Create task store with cross-store effects**

Create `lib/stores/tasks.ts`:

```typescript
import { create } from "zustand";
import { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { MOCK_TASKS } from "@/lib/mock/tasks";
import { generateId } from "@/lib/utils";
import { useAgentStore } from "./agents";
import { useActivityStore } from "./activity";

interface TaskStore {
  tasks: Task[];
  createTask: (data: { title: string; description: string; agentId: string | null; priority: TaskPriority }) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateStatus: (id: string, status: TaskStatus) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: MOCK_TASKS,
  createTask: (data) => {
    const newTask: Task = {
      id: generateId(),
      ...data,
      status: data.agentId ? "in_progress" : "pending",
      createdAt: new Date(),
      completedAt: null,
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));

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
  },
  deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  updateStatus: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
}));
```

- [ ] **Step 5: Create project store**

Create `lib/stores/projects.ts`:

```typescript
import { create } from "zustand";
import { Project } from "@/lib/types";
import { MOCK_PROJECTS } from "@/lib/mock/projects";
import { generateId } from "@/lib/utils";

interface ProjectStore {
  projects: Project[];
  activeProjectId: string;
  createProject: (data: { name: string; description: string; department: "web2" | "web3" }) => void;
  setActive: (id: string) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: MOCK_PROJECTS,
  activeProjectId: MOCK_PROJECTS[0].id,
  createProject: (data) =>
    set((state) => ({
      projects: [
        ...state.projects,
        { id: generateId(), ...data, agentIds: [], createdAt: new Date() },
      ],
    })),
  setActive: (id) => set({ activeProjectId: id }),
  deleteProject: (id) =>
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),
}));
```

- [ ] **Step 6: Commit**

```bash
git add lib/stores/
git commit -m "feat: Zustand stores — providers, agents, tasks, projects, activity with cross-store effects"
```

---

## Task 6: UI Primitives — Button, Badge, Card, Input

**Files:**
- Create: `components/ui/button.tsx`, `components/ui/badge.tsx`, `components/ui/card.tsx`, `components/ui/input.tsx`

- [ ] **Step 1: Create Button**

Create `components/ui/button.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-body font-semibold transition-all duration-200 rounded-btn",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        variant === "primary" && "bg-pink-300 text-white hover:opacity-90 shadow-card hover:shadow-card-hover",
        variant === "secondary" && "border border-border text-text-700 hover:bg-surface-2",
        variant === "ghost" && "text-text-500 hover:text-text-700 hover:bg-surface-2",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Create Badge**

Create `components/ui/badge.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium",
        variant === "default" && "bg-surface-2 text-text-700",
        variant === "outline" && "border border-border text-text-500",
        className
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Create Card**

Create `components/ui/card.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-surface border border-border rounded-card p-5 shadow-card transition-all duration-200",
        hoverable && "cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Create Input and Textarea**

Create `components/ui/input.tsx`:

```tsx
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-body font-medium text-text-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full px-4 py-2.5 rounded-btn border border-border bg-surface font-body text-text-900",
          "placeholder:text-text-500 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-200",
          "transition-all duration-200",
          className
        )}
        {...props}
      />
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-body font-medium text-text-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "w-full px-4 py-2.5 rounded-btn border border-border bg-surface font-body text-text-900",
          "placeholder:text-text-500 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-200",
          "transition-all duration-200 resize-none",
          className
        )}
        {...props}
      />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/
git commit -m "feat: UI primitives — Button, Badge, Card, Input, Textarea"
```

---

## Task 7: UI Primitives — Modal, SegmentedControl, TokenMeter

**Files:**
- Create: `components/ui/modal.tsx`, `components/ui/segmented-control.tsx`, `components/ui/token-meter.tsx`

- [ ] **Step 1: Create Modal**

Create `components/ui/modal.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Modal({ open, onClose, children, className, title }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-text-900/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "bg-surface rounded-card shadow-card-hover border border-border w-full max-w-lg",
          "transition-all duration-200",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <h2 className="font-display text-lg font-semibold text-text-900">{title}</h2>
            <button onClick={onClose} className="text-text-500 hover:text-text-700 transition-colors text-xl leading-none">
              &times;
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create SegmentedControl**

Create `components/ui/segmented-control.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, className }: SegmentedControlProps<T>) {
  return (
    <div className={cn("inline-flex rounded-btn bg-surface-2 p-1 gap-1", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 rounded-btn text-sm font-body font-medium transition-all duration-200",
            value === opt.value
              ? "bg-surface text-text-900 shadow-card"
              : "text-text-500 hover:text-text-700"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create TokenMeter**

Create `components/ui/token-meter.tsx`:

```tsx
"use client";

interface TokenMeterProps {
  percentage: number;
  label?: string;
  size?: number;
}

export function TokenMeter({ percentage, label = "Budget", size = 80 }: TokenMeterProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--pink-300)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="text-center">
        <p className="text-sm font-body font-semibold text-text-900">{percentage}%</p>
        <p className="text-xs font-body text-text-500">{label}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/modal.tsx components/ui/segmented-control.tsx components/ui/token-meter.tsx
git commit -m "feat: UI primitives — Modal, SegmentedControl, TokenMeter"
```

---

## Task 8: Shared Visual Components — Grain, Botanicals, Empty State

**Files:**
- Create: `components/shared/grain-overlay.tsx`, `components/shared/botanical-decor.tsx`, `components/shared/empty-state.tsx`
- Create: `public/svg/leaf-1.svg`, `public/svg/leaf-2.svg`, `public/svg/petal-1.svg`

- [ ] **Step 1: Create GrainOverlay**

Create `components/shared/grain-overlay.tsx`:

```tsx
export function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}
```

- [ ] **Step 2: Create botanical SVGs**

Create `public/svg/leaf-1.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180" fill="none">
  <path d="M60 10 C20 50 10 120 60 170 C110 120 100 50 60 10Z" fill="#D8EACF" opacity="0.3"/>
  <path d="M60 10 C60 60 60 120 60 170" stroke="#A8C9A0" stroke-width="1" opacity="0.4"/>
</svg>
```

Create `public/svg/leaf-2.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 160" fill="none">
  <path d="M50 5 C10 40 15 100 50 155 C85 100 90 40 50 5Z" fill="#EDE0F0" opacity="0.25"/>
  <path d="M50 5 C50 50 50 100 50 155" stroke="#C8AED8" stroke-width="1" opacity="0.3"/>
</svg>
```

Create `public/svg/petal-1.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100" fill="none">
  <path d="M40 5 C10 25 5 60 40 95 C75 60 70 25 40 5Z" fill="#FFE0E8" opacity="0.3"/>
</svg>
```

- [ ] **Step 3: Create BotanicalDecor**

Create `components/shared/botanical-decor.tsx`:

```tsx
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BotanicalDecorProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "sidebar-bottom";
  className?: string;
}

const positionStyles: Record<BotanicalDecorProps["position"], string> = {
  "top-left": "absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 rotate-0",
  "top-right": "absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 rotate-90",
  "bottom-left": "absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 -rotate-90",
  "bottom-right": "absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 rotate-180",
  "sidebar-bottom": "absolute bottom-4 left-1/2 -translate-x-1/2 opacity-40",
};

const positionSvg: Record<BotanicalDecorProps["position"], string> = {
  "top-left": "/svg/leaf-1.svg",
  "top-right": "/svg/petal-1.svg",
  "bottom-left": "/svg/petal-1.svg",
  "bottom-right": "/svg/leaf-2.svg",
  "sidebar-bottom": "/svg/leaf-1.svg",
};

export function BotanicalDecor({ position, className }: BotanicalDecorProps) {
  return (
    <div className={cn("pointer-events-none select-none", positionStyles[position], className)} aria-hidden="true">
      <Image src={positionSvg[position]} alt="" width={100} height={140} className="opacity-60" />
    </div>
  );
}
```

- [ ] **Step 4: Create EmptyState**

Create `components/shared/empty-state.tsx`:

```tsx
import Image from "next/image";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description = "This feature is blooming shortly." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Image src="/svg/leaf-2.svg" alt="" width={80} height={120} className="opacity-40 mb-6" />
      <h2 className="font-display text-xl text-text-700 mb-2">{title}</h2>
      <p className="font-body text-text-500 text-sm">{description}</p>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/shared/ public/svg/
git commit -m "feat: shared visuals — GrainOverlay, BotanicalDecor, EmptyState, SVGs"
```

---

## Task 9: Connect Page — ProviderButton, TerminalModal, Confetti

**Files:**
- Create: `components/connect/provider-button.tsx`, `components/connect/terminal-modal.tsx`, `components/connect/confetti.tsx`, `app/(auth)/connect/page.tsx`

- [ ] **Step 1: Create ProviderButton**

Create `components/connect/provider-button.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";
import { ProviderName, PROVIDER_INFO } from "@/lib/types";

interface ProviderButtonProps {
  provider: ProviderName;
  connected: boolean;
  onClick: () => void;
}

export function ProviderButton({ provider, connected, onClick }: ProviderButtonProps) {
  const info = PROVIDER_INFO[provider];

  return (
    <button
      onClick={onClick}
      disabled={connected}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-card border transition-all duration-200",
        connected
          ? "border-sage-200 bg-sage-100/30"
          : "border-border bg-surface hover:shadow-card-hover hover:-translate-y-0.5"
      )}
    >
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg", info.iconBg)}>
        {info.icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-display font-semibold text-text-900">
          {info.label} <span className="font-body font-normal text-text-500 text-sm">({info.company})</span>
        </p>
        <p className="text-xs font-body text-text-500">{info.hint}</p>
      </div>
      {connected ? (
        <div className="w-8 h-8 rounded-full bg-sage-200 flex items-center justify-center text-white text-sm font-bold">
          &#10003;
        </div>
      ) : (
        <div className="text-text-500 text-sm font-body">Connect &rarr;</div>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Create TerminalModal**

Create `components/connect/terminal-modal.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { ProviderName, PROVIDER_INFO } from "@/lib/types";

interface TerminalModalProps {
  open: boolean;
  provider: ProviderName | null;
  onClose: () => void;
  onConnected: () => void;
}

const CLI_COMMANDS: Record<ProviderName, string> = {
  claude: "claude auth login",
  codex: "codex auth login",
  gemini: "gemini auth login",
};

export function TerminalModal({ open, provider, onClose, onConnected }: TerminalModalProps) {
  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState<"typing" | "waiting" | "done">("typing");

  useEffect(() => {
    if (!open || !provider) {
      setTypedText("");
      setPhase("typing");
      return;
    }

    const command = `$ ${CLI_COMMANDS[provider]}`;
    let i = 0;
    setTypedText("");
    setPhase("typing");

    const typeInterval = setInterval(() => {
      i++;
      setTypedText(command.slice(0, i));
      if (i >= command.length) {
        clearInterval(typeInterval);
        setPhase("waiting");
        setTimeout(() => {
          setPhase("done");
          setTimeout(() => {
            onConnected();
            onClose();
          }, 600);
        }, 2400);
      }
    }, 60);

    return () => clearInterval(typeInterval);
  }, [open, provider, onConnected, onClose]);

  if (!open || !provider) return null;

  const info = PROVIDER_INFO[provider];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-text-900/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-card w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-800">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-2 text-gray-400 text-xs font-mono">{info.label} CLI</span>
        </div>
        <div className="p-5 font-mono text-sm min-h-[160px]">
          <p className="text-green-400">
            {typedText}
            {phase === "typing" && <span className="animate-blink">|</span>}
          </p>
          {phase === "waiting" && (
            <div className="mt-3 flex items-center gap-2 text-gray-400">
              <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Waiting for authentication...
            </div>
          )}
          {phase === "done" && (
            <p className="mt-3 text-sage-200">
              &#10003; Successfully authenticated with {info.label}!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Confetti**

Create `components/connect/confetti.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; delay: number; color: string; size: number }[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    const colors = ["var(--pink-200)", "var(--sage-100)", "var(--pink-100)", "var(--sage-200)", "var(--lavender-100)"];
    const newPieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 8,
    }));
    setPieces(newPieces);
    const timeout = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(timeout);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
            animation: `confetti-fall 2.5s ease-in ${p.delay}s forwards`,
            borderRadius: "50% 50% 50% 0",
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create Connect page**

Create `app/(auth)/connect/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProviderStore } from "@/lib/stores/providers";
import { ProviderName } from "@/lib/types";
import { ProviderButton } from "@/components/connect/provider-button";
import { TerminalModal } from "@/components/connect/terminal-modal";
import { Confetti } from "@/components/connect/confetti";
import { BotanicalDecor } from "@/components/shared/botanical-decor";
import { Button } from "@/components/ui/button";

export default function ConnectPage() {
  const router = useRouter();
  const { providers, isAllConnected, connect } = useProviderStore();
  const [activeProvider, setActiveProvider] = useState<ProviderName | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const hasAnyConnected = providers.some((p) => p.connected);

  const handleConnect = (name: ProviderName) => {
    setActiveProvider(name);
  };

  const handleConnected = () => {
    if (activeProvider) {
      connect(activeProvider);
      const willAllBeConnected = providers.every((p) => p.connected || p.name === activeProvider);
      if (willAllBeConnected) {
        setShowConfetti(true);
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <BotanicalDecor position="top-left" />
      <BotanicalDecor position="top-right" />
      <BotanicalDecor position="bottom-left" />
      <BotanicalDecor position="bottom-right" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl italic text-text-900">mirkayk</h1>
          <p className="font-body text-text-500 mt-1">your ai dev team, blooming</p>
        </div>

        <div className="bg-surface border border-border rounded-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-text-900 mb-1">Connect your AI accounts</h2>
          <p className="font-body text-sm text-text-500 mb-5">
            Link your existing subscriptions. No API keys needed.
          </p>

          <div className="flex flex-col gap-3">
            {providers.map((p) => (
              <ProviderButton
                key={p.name}
                provider={p.name}
                connected={p.connected}
                onClick={() => handleConnect(p.name)}
              />
            ))}
          </div>

          <div className="mt-6">
            <Button
              onClick={() => router.push("/dashboard")}
              disabled={!hasAnyConnected}
              className="w-full"
            >
              Continue to dashboard &rarr;
            </Button>
          </div>

          <p className="text-xs text-text-500 text-center mt-4 font-body">
            Your subscription tokens are used directly. mirkayk never stores credentials.
          </p>
        </div>
      </div>

      <TerminalModal
        open={activeProvider !== null}
        provider={activeProvider}
        onClose={() => setActiveProvider(null)}
        onConnected={handleConnected}
      />

      <Confetti active={showConfetti} />
    </main>
  );
}
```

- [ ] **Step 5: Verify connect page**

```bash
npm run dev
```

Visit http://localhost:3000/connect. Expected: cream background, botanical SVGs in corners, mirkayk logo, 3 provider buttons (Claude and Codex pre-connected with green checkmarks, Gemini clickable). Click Gemini → terminal modal with typing animation → auto-connects after 3s → confetti burst.

- [ ] **Step 6: Commit**

```bash
git add components/connect/ app/\(auth\)/
git commit -m "feat: /connect page — provider buttons, terminal modal, confetti, full flow"
```

---

## Task 10: Dashboard Layout — Sidebar, ActivityPanel, Shell

**Files:**
- Create: `components/layout/sidebar.tsx`, `components/layout/activity-panel.tsx`, `app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create Sidebar**

Create `components/layout/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/lib/stores/projects";
import { TokenMeter } from "@/components/ui/token-meter";
import { Badge } from "@/components/ui/badge";
import { BotanicalDecor } from "@/components/shared/botanical-decor";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "\u2726" },
  { label: "Agents", href: "/dashboard/agents", icon: "\u2726" },
  { label: "Tasks", href: "/dashboard/tasks", icon: "\u2726" },
  { label: "Projects", href: "/dashboard/projects", icon: "\u2726" },
  { label: "Logs", href: "/dashboard/logs", icon: "\u2726" },
  { label: "Budget", href: "/dashboard/budget", icon: "\u2726" },
];

export function Sidebar() {
  const pathname = usePathname();
  const project = useProjectStore((s) => s.projects.find((p) => p.id === s.activeProjectId));

  return (
    <aside className="w-[220px] h-screen sticky top-0 flex flex-col bg-surface border-r border-border p-4 relative overflow-hidden">
      {/* Logo */}
      <div className="mb-6">
        <h1 className="font-display text-2xl italic text-text-900">mirkayk</h1>
      </div>

      {/* Project */}
      {project && (
        <div className="mb-6 p-3 bg-surface-2 rounded-btn">
          <p className="font-body text-sm font-semibold text-text-900 truncate">{project.name}</p>
          <Badge className="mt-1 bg-lavender-100 text-lavender-200">{project.department}</Badge>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-btn text-sm font-body transition-all duration-200",
                isActive
                  ? "bg-pink-100 text-pink-300 font-semibold"
                  : "text-text-700 hover:bg-surface-2"
              )}
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Token meter */}
      <div className="mt-auto pt-4 flex justify-center">
        <TokenMeter percentage={62} label="Monthly budget" />
      </div>

      <BotanicalDecor position="sidebar-bottom" />
    </aside>
  );
}
```

- [ ] **Step 2: Create ActivityPanel**

Create `components/layout/activity-panel.tsx`:

```tsx
"use client";

import { useActivityStore } from "@/lib/stores/activity";
import { AGENT_COLOR_MAP } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function ActivityPanel() {
  const entries = useActivityStore((s) => s.entries);

  return (
    <aside className="w-[280px] h-screen sticky top-0 flex flex-col bg-surface border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="font-display text-base font-semibold text-text-900">Live activity</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const colorMap = AGENT_COLOR_MAP[entry.agentColor];
            return (
              <div key={entry.id} className="flex flex-col gap-1 pb-3 border-b border-border last:border-0">
                <div className="flex items-center justify-between">
                  <Badge className={`${colorMap.bg} ${colorMap.text}`}>{entry.agentName}</Badge>
                  <span className="text-[10px] font-body text-text-500">{formatTimeAgo(entry.timestamp)}</span>
                </div>
                <p className="text-xs font-body text-text-700 leading-relaxed">{entry.action}</p>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create Dashboard layout shell**

Create `app/(dashboard)/layout.tsx`:

```tsx
import { Sidebar } from "@/components/layout/sidebar";
import { ActivityPanel } from "@/components/layout/activity-panel";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      <ActivityPanel />
    </div>
  );
}
```

- [ ] **Step 4: Create temporary dashboard page to test layout**

Create `app/(dashboard)/page.tsx`:

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-900">Dashboard</h1>
      <p className="font-body text-text-500 mt-2">Agent grid and stats coming next.</p>
    </div>
  );
}
```

- [ ] **Step 5: Verify 3-column layout**

```bash
npm run dev
```

Visit http://localhost:3000/dashboard. Expected: 220px sidebar (logo, project badge, nav, token meter), flexible center, 280px activity panel with live entries. Sidebar nav highlights "Dashboard".

- [ ] **Step 6: Commit**

```bash
git add components/layout/ app/\(dashboard\)/
git commit -m "feat: dashboard 3-column layout — sidebar, activity panel, shell"
```

---

## Task 11: Agent Cards & Grid

**Files:**
- Create: `components/agents/agent-card.tsx`, `components/agents/agent-grid.tsx`

- [ ] **Step 1: Create AgentCard**

Create `components/agents/agent-card.tsx`:

```tsx
"use client";

import { Agent, AGENT_COLOR_MAP, STATUS_CONFIG, PROVIDER_INFO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const colorMap = AGENT_COLOR_MAP[agent.color];
  const statusConfig = STATUS_CONFIG[agent.status];
  const providerInfo = PROVIDER_INFO[agent.provider];

  return (
    <Card hoverable onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn("w-2.5 h-2.5 rounded-full", statusConfig.dotColor, agent.status !== "idle" && "animate-status-pulse")}
          />
          <h3 className="font-display font-bold text-text-900">{agent.name}</h3>
        </div>
        <Badge className={`${colorMap.bg} ${colorMap.text}`}>{statusConfig.label}</Badge>
      </div>

      <p className="text-sm font-body text-text-500 mb-3">{agent.role}</p>

      {agent.currentTask && (
        <p className="text-xs font-body text-text-700 italic truncate mb-3">
          {agent.currentTask}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Badge variant="outline">{providerInfo.label}</Badge>
        <span className="text-[10px] font-mono text-text-500">{agent.model}</span>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Create AgentGrid**

Create `components/agents/agent-grid.tsx`:

```tsx
"use client";

import { useAgentStore } from "@/lib/stores/agents";
import { AgentCard } from "./agent-card";

export function AgentGrid() {
  const { agents, selectAgent } = useAgentStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} onClick={() => selectAgent(agent.id)} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/agents/agent-card.tsx components/agents/agent-grid.tsx
git commit -m "feat: AgentCard with status pulse + AgentGrid 2x3 layout"
```

---

## Task 12: Dashboard Home Page — Stats + Agent Grid

**Files:**
- Modify: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Build full dashboard home page**

Replace `app/(dashboard)/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useAgentStore } from "@/lib/stores/agents";
import { useTaskStore } from "@/lib/stores/tasks";
import { AgentGrid } from "@/components/agents/agent-grid";
import { AgentDetail } from "@/components/agents/agent-detail";
import { TaskModal } from "@/components/tasks/task-modal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const agents = useAgentStore((s) => s.agents);
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId);
  const tasks = useTaskStore((s) => s.tasks);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const activeCount = agents.filter((a) => a.status !== "idle").length;
  const idleCount = agents.length - activeCount;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const totalTokens = "48.2k";
  const deploys = 3;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-900">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{agents.length} agents</Badge>
            <Badge className="bg-sage-100 text-sage-200">{activeCount} active</Badge>
            <Badge variant="outline">{idleCount} idle</Badge>
          </div>
        </div>
        <Button onClick={() => setShowTaskModal(true)}>New Task +</Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm font-body text-text-500">Tasks completed</p>
          <p className="text-2xl font-display font-bold text-text-900 mt-1">{completedTasks}</p>
        </Card>
        <Card>
          <p className="text-sm font-body text-text-500">Tokens used</p>
          <p className="text-2xl font-display font-bold text-text-900 mt-1">{totalTokens}</p>
        </Card>
        <Card>
          <p className="text-sm font-body text-text-500">Deploys</p>
          <p className="text-2xl font-display font-bold text-text-900 mt-1">{deploys}</p>
        </Card>
      </div>

      {/* Agent grid */}
      <AgentGrid />

      {/* Agent detail slide-in */}
      <AgentDetail />

      {/* New task modal */}
      <TaskModal open={showTaskModal} onClose={() => setShowTaskModal(false)} />
    </div>
  );
}
```

NOTE: This page references `AgentDetail` (Task 13) and `TaskModal` (Task 14). Build will show import errors until those are created — that is expected. Alternatively, comment out those imports temporarily and uncomment after Tasks 13-14.

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/page.tsx
git commit -m "feat: dashboard home — stats cards, header badges, agent grid"
```

---

## Task 13: Agent Detail Slide-In Panel

**Files:**
- Create: `components/agents/agent-detail.tsx`

- [ ] **Step 1: Create AgentDetail with 4 tabs**

Create `components/agents/agent-detail.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useAgentStore } from "@/lib/stores/agents";
import { useTaskStore } from "@/lib/stores/tasks";
import { AGENT_COLOR_MAP, STATUS_CONFIG, PROVIDER_INFO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

type Tab = "overview" | "prompt" | "instructions" | "skills";

export function AgentDetail() {
  const { agents, selectedAgentId, selectAgent, updatePrompt, updateInstructions } = useAgentStore();
  const tasks = useTaskStore((s) => s.tasks);
  const createTask = useTaskStore((s) => s.createTask);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [newTaskText, setNewTaskText] = useState("");

  const agent = agents.find((a) => a.id === selectedAgentId);
  if (!agent) return null;

  const colorMap = AGENT_COLOR_MAP[agent.color];
  const statusConfig = STATUS_CONFIG[agent.status];
  const recentTasks = tasks.filter((t) => t.agentId === agent.id).slice(0, 5);

  const handleAssignTask = () => {
    if (!newTaskText.trim()) return;
    createTask({ title: newTaskText.trim(), description: newTaskText.trim(), agentId: agent.id, priority: "P2" });
    setNewTaskText("");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "prompt", label: "Prompt" },
    { key: "instructions", label: "Instructions" },
    { key: "skills", label: "Skills" },
  ];

  return (
    <div className="fixed inset-y-0 right-[280px] w-[420px] bg-surface border-l border-border shadow-card-hover z-30 flex flex-col transition-transform duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className={cn("w-3 h-3 rounded-full", statusConfig.dotColor, agent.status !== "idle" && "animate-status-pulse")} />
          <h2 className="font-display text-lg font-bold text-text-900">{agent.name}</h2>
          <Badge className={`${colorMap.bg} ${colorMap.text}`}>{statusConfig.label}</Badge>
        </div>
        <button onClick={() => selectAgent(null)} className="text-text-500 hover:text-text-700 text-xl">&times;</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-3 py-2.5 text-sm font-body transition-all border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-pink-300 text-pink-300 font-semibold"
                : "border-transparent text-text-500 hover:text-text-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "overview" && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-body text-text-700 leading-relaxed">{agent.role}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{PROVIDER_INFO[agent.provider].label}</Badge>
                <span className="text-xs font-mono text-text-500">{agent.model}</span>
              </div>
            </div>

            {/* Recent tasks */}
            <div>
              <h3 className="text-sm font-body font-semibold text-text-900 mb-2">Recent tasks</h3>
              {recentTasks.length === 0 ? (
                <p className="text-xs text-text-500 font-body">No tasks yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-surface-2 rounded-btn">
                      <span className="text-xs font-body text-text-700 truncate flex-1">{t.title}</span>
                      <Badge className="ml-2 text-[10px]">{t.status.replace("_", " ")}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mock token chart */}
            <div>
              <h3 className="text-sm font-body font-semibold text-text-900 mb-2">Token usage (7 days)</h3>
              <div className="flex items-end gap-1 h-16">
                {[35, 52, 28, 64, 45, 72, 40].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-pink-100"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[10px] text-text-500 font-body">{d}</span>
                ))}
              </div>
            </div>

            {/* Assign task */}
            <div>
              <Textarea
                placeholder="Describe a task to assign..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAssignTask} className="mt-2 w-full" size="sm" disabled={!newTaskText.trim()}>
                Assign task
              </Button>
            </div>
          </div>
        )}

        {activeTab === "prompt" && (
          <div>
            <textarea
              value={agent.systemPrompt}
              onChange={(e) => updatePrompt(agent.id, e.target.value)}
              className="w-full h-[400px] p-4 font-mono text-xs bg-surface-2 border border-border rounded-btn text-text-900 focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
            />
          </div>
        )}

        {activeTab === "instructions" && (
          <div className="flex flex-col gap-2">
            {agent.instructions.map((inst, i) => (
              <label key={i} className="flex items-start gap-2 p-2 bg-surface-2 rounded-btn">
                <input type="checkbox" defaultChecked className="mt-0.5 accent-pink-300" />
                <span className="text-xs font-body text-text-700">{inst}</span>
              </label>
            ))}
          </div>
        )}

        {activeTab === "skills" && (
          <div className="flex flex-wrap gap-2">
            {agent.skills.map((skill) => (
              <Badge key={skill} className="bg-lavender-100 text-lavender-200">{skill}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/agents/agent-detail.tsx
git commit -m "feat: agent detail slide-in panel with 4 tabs (overview, prompt, instructions, skills)"
```

---

## Task 14: New Task Modal

**Files:**
- Create: `components/tasks/task-modal.tsx`

- [ ] **Step 1: Create TaskModal**

Create `components/tasks/task-modal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTaskStore } from "@/lib/stores/tasks";
import { useAgentStore } from "@/lib/stores/agents";
import { TaskPriority } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "P1", label: "P1" },
  { value: "P2", label: "P2" },
  { value: "P3", label: "P3" },
];

export function TaskModal({ open, onClose }: TaskModalProps) {
  const agents = useAgentStore((s) => s.agents);
  const createTask = useTaskStore((s) => s.createTask);
  const [description, setDescription] = useState("");
  const [agentId, setAgentId] = useState<string>("");
  const [priority, setPriority] = useState<TaskPriority>("P2");

  const handleSubmit = () => {
    if (!description.trim()) return;
    createTask({
      title: description.trim(),
      description: description.trim(),
      agentId: agentId || null,
      priority,
    });
    setDescription("");
    setAgentId("");
    setPriority("P2");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Task">
      <div className="flex flex-col gap-4">
        <Textarea
          label="Task description"
          placeholder="Describe what needs to be done..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          id="task-description"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="agent-select" className="text-sm font-body font-medium text-text-700">
            Assign to agent
          </label>
          <select
            id="agent-select"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-btn border border-border bg-surface font-body text-text-900 focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            <option value="">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-body font-medium text-text-700">Priority</span>
          <SegmentedControl options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />
        </div>

        <Button onClick={handleSubmit} disabled={!description.trim()} className="mt-2">
          Assign task
        </Button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Verify dashboard is fully functional**

```bash
npm run dev
```

Visit http://localhost:3000/dashboard. Expected: Stats row shows "3" completed tasks, "48.2k" tokens, "3" deploys. Agent grid shows 6 cards with pulsing dots on active agents. Click card → slide-in panel with tabs. Click "New Task +" → modal with form. Submit → agent changes to "working", activity feed updates.

- [ ] **Step 3: Commit**

```bash
git add components/tasks/task-modal.tsx
git commit -m "feat: new task modal with agent assignment and priority control"
```

---

## Task 15: /dashboard/tasks Page — Filterable Task Board

**Files:**
- Create: `components/tasks/task-card.tsx`, `components/tasks/task-list.tsx`, `app/(dashboard)/tasks/page.tsx`

- [ ] **Step 1: Create TaskCard**

Create `components/tasks/task-card.tsx`:

```tsx
"use client";

import { Task, PRIORITY_CONFIG } from "@/lib/types";
import { useAgentStore } from "@/lib/stores/agents";
import { useTaskStore } from "@/lib/stores/tasks";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const agents = useAgentStore((s) => s.agents);
  const completeTask = useTaskStore((s) => s.completeTask);
  const agent = agents.find((a) => a.id === task.agentId);
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <Card className="flex items-center gap-4">
      {task.status !== "completed" && task.status !== "failed" && (
        <button
          onClick={() => completeTask(task.id)}
          className="w-5 h-5 rounded-full border-2 border-border hover:border-sage-200 hover:bg-sage-100 transition-colors flex-shrink-0"
          title="Mark as complete"
        />
      )}
      {task.status === "completed" && (
        <div className="w-5 h-5 rounded-full bg-sage-200 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs">&#10003;</span>
        </div>
      )}
      {task.status === "failed" && (
        <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
          <span className="text-red-700 text-xs">&times;</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-body font-medium", task.status === "completed" && "line-through text-text-500")}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {agent && <span className="text-xs font-body text-text-500">{agent.name}</span>}
          <span className="text-[10px] font-body text-text-500">{formatDate(task.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>
        <Badge>{task.status.replace("_", " ")}</Badge>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Create TaskList**

Create `components/tasks/task-list.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTaskStore } from "@/lib/stores/tasks";
import { useAgentStore } from "@/lib/stores/agents";
import { TaskPriority, TaskStatus } from "@/lib/types";
import { TaskCard } from "./task-card";
import { SegmentedControl } from "@/components/ui/segmented-control";

type StatusFilter = "all" | TaskStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const agents = useAgentStore((s) => s.agents);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const filtered = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (agentFilter !== "all" && t.agentId !== agentFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <SegmentedControl options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="px-3 py-1.5 rounded-btn border border-border bg-surface font-body text-sm text-text-900 focus:outline-none focus:ring-2 focus:ring-pink-200"
        >
          <option value="all">All agents</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="text-sm font-body text-text-500 py-8 text-center">No tasks match your filters.</p>
        ) : (
          filtered.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create tasks page**

Create `app/(dashboard)/tasks/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { TaskList } from "@/components/tasks/task-list";
import { TaskModal } from "@/components/tasks/task-modal";
import { Button } from "@/components/ui/button";

export default function TasksPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-text-900">Tasks</h1>
        <Button onClick={() => setShowModal(true)}>New Task +</Button>
      </div>
      <TaskList />
      <TaskModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/tasks/ app/\(dashboard\)/tasks/
git commit -m "feat: /dashboard/tasks — filterable task board with status and agent filters"
```

---

## Task 16: /dashboard/agents Page

**Files:**
- Create: `app/(dashboard)/agents/page.tsx`

- [ ] **Step 1: Create agents page with search**

Create `app/(dashboard)/agents/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useAgentStore } from "@/lib/stores/agents";
import { AgentCard } from "@/components/agents/agent-card";
import { AgentDetail } from "@/components/agents/agent-detail";
import { Input } from "@/components/ui/input";

export default function AgentsPage() {
  const { agents, selectAgent } = useAgentStore();
  const [search, setSearch] = useState("");

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-text-900">Agents</h1>
        <div className="w-64">
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onClick={() => selectAgent(agent.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm font-body text-text-500 py-8 text-center">No agents match your search.</p>
      )}

      <AgentDetail />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/agents/
git commit -m "feat: /dashboard/agents — searchable agent management page"
```

---

## Task 17: Placeholder Pages — Projects, Logs, Budget

**Files:**
- Create: `app/(dashboard)/projects/page.tsx`, `app/(dashboard)/logs/page.tsx`, `app/(dashboard)/budget/page.tsx`

- [ ] **Step 1: Create all 3 placeholder pages**

Create `app/(dashboard)/projects/page.tsx`:

```tsx
import { EmptyState } from "@/components/shared/empty-state";

export default function ProjectsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-text-900 mb-6">Projects</h1>
      <EmptyState title="Projects" description="Project management is blooming shortly." />
    </div>
  );
}
```

Create `app/(dashboard)/logs/page.tsx`:

```tsx
import { EmptyState } from "@/components/shared/empty-state";

export default function LogsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-text-900 mb-6">Logs</h1>
      <EmptyState title="Agent Logs" description="Run history and output logs are blooming shortly." />
    </div>
  );
}
```

Create `app/(dashboard)/budget/page.tsx`:

```tsx
import { EmptyState } from "@/components/shared/empty-state";

export default function BudgetPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-text-900 mb-6">Budget</h1>
      <EmptyState title="Token Budget" description="Cost tracking and usage analytics are blooming shortly." />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/projects/ app/\(dashboard\)/logs/ app/\(dashboard\)/budget/
git commit -m "feat: placeholder pages — projects, logs, budget with botanical empty states"
```

---

## Task 18: Root Redirect + Final Verification

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx` (remove inline grain overlay if GrainOverlay component is used)

- [ ] **Step 1: Update root page with redirect logic**

Replace `app/page.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProviderStore } from "@/lib/stores/providers";

export default function Home() {
  const router = useRouter();
  const hasAnyConnected = useProviderStore((s) => s.providers.some((p) => p.connected));

  useEffect(() => {
    router.replace(hasAnyConnected ? "/dashboard" : "/connect");
  }, [hasAnyConnected, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-4xl italic text-text-900">mirkayk</h1>
        <p className="font-body text-text-500 mt-2">loading...</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Update layout.tsx to use GrainOverlay component**

In `app/layout.tsx`, replace the inline `<div className="grain-overlay" .../>` with the GrainOverlay component:

```tsx
import { GrainOverlay } from "@/components/shared/grain-overlay";
```

And replace `<div className="grain-overlay" aria-hidden="true" />` with `<GrainOverlay />`.

- [ ] **Step 3: Full verification**

```bash
npm run dev
```

Test the complete flow:
1. Visit `/` — should redirect to `/dashboard` (because mock data has providers pre-connected)
2. `/dashboard` — 3-column layout, 3 stat cards, 6 agent cards with pulsing dots, activity feed
3. Click agent card → slide-in detail panel with 4 tabs
4. "New Task +" → modal with description, agent dropdown, priority selector
5. Submit task → agent changes status, activity feed updates
6. `/dashboard/agents` — searchable agent grid
7. `/dashboard/tasks` — filterable task list, can mark tasks complete
8. `/dashboard/projects` — botanical empty state
9. `/dashboard/logs` — botanical empty state
10. `/dashboard/budget` — botanical empty state
11. `/connect` — 3 provider buttons, Gemini clickable → terminal modal → auto-connect → confetti
12. Sidebar nav highlights current page
13. Grain overlay visible on all pages

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/layout.tsx
git commit -m "feat: root redirect logic + GrainOverlay component integration"
```

---

## Task 19: Responsive Polish

**Files:**
- Modify: `app/(dashboard)/layout.tsx`
- Modify: `components/layout/sidebar.tsx`
- Modify: `components/layout/activity-panel.tsx`

- [ ] **Step 1: Add mobile responsive layout**

Update `app/(dashboard)/layout.tsx` to hide sidebar and activity panel on mobile:

```tsx
import { Sidebar } from "@/components/layout/sidebar";
import { ActivityPanel } from "@/components/layout/activity-panel";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      <div className="hidden xl:block">
        <ActivityPanel />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Make stats row responsive**

In `app/(dashboard)/page.tsx`, update the stats grid class from `grid-cols-3` to:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
```

- [ ] **Step 3: Verify responsive behavior**

```bash
npm run dev
```

Resize browser:
- Desktop (1280px+): full 3-column layout
- Tablet (1024px): sidebar + main, no activity panel
- Mobile (<1024px): main content only, sidebar hidden
- Agent grid stacks to 1 column on mobile, 2 on tablet, 3 on desktop

- [ ] **Step 4: Commit**

```bash
git add app/\(dashboard\)/layout.tsx app/\(dashboard\)/page.tsx
git commit -m "feat: responsive layout — sidebar and activity panel hide on smaller screens"
```
