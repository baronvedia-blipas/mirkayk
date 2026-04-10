# mirkayk — Phase 2C: Full Pages (Projects, Logs, Budget)

**Date:** 2026-04-10
**Status:** Approved
**Scope:** Replace 3 placeholder pages with functional UI consuming existing stores
**Depends on:** Phase 1 (UI), Phase 2A (CLI integration / runs store)

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data source | Existing Zustand stores only | No new stores needed; projects, runs, agents already have the data |
| Token/cost values | Approximate from output.length | Real token tracking deferred to Phase 2B |
| New components | Page-level only | Reuse existing Card, Badge, Modal, Button, SegmentedControl |

---

## Pages

### /dashboard/projects

**Data:** `useProjectStore` (projects[], activeProjectId, createProject, setActive, deleteProject) + `useAgentStore` (agents[])

**UI:**
- Header: "Projects" title + "New Project" button (pink-300)
- Grid of project Cards (1-2 columns):
  - Project name (font-display bold)
  - Description (text-text-700, truncated 2 lines)
  - Department badge (web2 = lavender, web3 = sky)
  - Agent count: "6 agents" with small icons
  - Created date (formatDate)
  - Active indicator: sage border if this is the active project
  - Footer: "Set Active" button (if not active) + "Delete" button (ghost, text-red)
- New Project Modal: name input, description textarea, department SegmentedControl (web2/web3), Submit button

### /dashboard/logs

**Data:** `useRunsStore` (runs[]) + `useAgentStore` (agents[])

**UI:**
- Header: "Agent Logs" title + run count badge
- Filters row: status SegmentedControl (all/running/completed/failed) + agent select dropdown
- Run list (Cards, stacked vertically):
  - Agent name + color dot
  - Prompt text (truncated to 1 line)
  - Status badge (running=pink, completed=sage, failed=red)
  - Timestamp (formatTimeAgo)
  - Click/expand: shows full output in dark terminal block (bg-gray-900, font-mono, text-green-400)
- Empty state if no runs: "Run an agent to see logs here."

### /dashboard/budget

**Data:** `useRunsStore` (runs[]) + `useAgentStore` (agents[])

**UI:**
- Header: "Token Budget" title
- 3 stat cards row:
  - Total Runs (count of all runs)
  - Est. Tokens (sum of output.length / 4 as rough token approximation)
  - Est. Cost (tokens * $0.003 / 1000 formatted as $X.XX)
- Bar chart by agent: horizontal bars showing relative "usage" per agent (output.length sum), same visual style as AgentDetail token chart (pink-100 bars)
- Runs table: agent name, run count, total output chars, est. tokens, est. cost — sorted by usage desc
- Note text at bottom: "Token estimates are approximate. Real tracking coming in a future update."

---

## New Files

| File | Purpose |
|------|---------|
| `components/projects/project-card.tsx` | Single project card with actions |
| `components/projects/new-project-modal.tsx` | Form modal for creating projects |
| `components/logs/run-entry.tsx` | Single run log entry with expandable output |
| `app/dashboard/projects/page.tsx` | Replace placeholder |
| `app/dashboard/logs/page.tsx` | Replace placeholder |
| `app/dashboard/budget/page.tsx` | Replace placeholder |

---

## Scope Boundaries

### Included
- Full project CRUD UI (create, view, set active, delete)
- Run log viewer with filters and expandable output
- Budget overview with approximate token/cost calculations
- All data from existing stores (no new stores)

### Excluded
- Real token counting (Phase 2B)
- Project-agent assignment UI (just shows count)
- Log export/download
- Budget alerts or limits
- Persistent storage (still Zustand in-memory)
