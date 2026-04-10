# mirkayk — Phase 2E: Testing (Vitest + Playwright)

**Date:** 2026-04-10
**Status:** Approved
**Scope:** Add unit/integration tests for API routes + E2E tests for critical dashboard flows
**Depends on:** Phase 2B (persistence layer with PostgreSQL + Prisma)

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Unit/Integration framework | Vitest | Fast, native TypeScript, compatible with Next.js |
| E2E framework | Playwright | Cross-browser, reliable, good Next.js integration |
| Test database | Separate PostgreSQL DB (port 5434) | Isolate test data from development |
| API testing approach | Direct handler imports | Faster than HTTP, tests route logic directly |
| E2E test count | 3 critical flows | Covers core functionality without over-testing |

---

## Test Database

Docker Compose adds `db-test` service on port 5434 with database `mirkayk_test`.

Tests use `DATABASE_URL_TEST` env var. Setup helper handles:
- Migration via Prisma
- Seed before test suite
- Cleanup between tests

---

## Unit/Integration Tests (Vitest)

### __tests__/api/agents.test.ts

- GET /api/agents returns all agents from DB
- GET /api/agents returns agents sorted by name
- PATCH /api/agents/[id] updates status
- PATCH /api/agents/[id] updates systemPrompt

### __tests__/api/tasks.test.ts

- GET /api/tasks returns all tasks sorted by createdAt desc
- POST /api/tasks creates a task with correct defaults
- POST /api/tasks with agentId sets status to in_progress
- PATCH /api/tasks/[id] updates status and completedAt
- DELETE /api/tasks/[id] removes the task

### __tests__/api/projects.test.ts

- GET /api/projects returns all projects
- POST /api/projects creates a project
- PATCH /api/projects/[id] with isActive deactivates others
- DELETE /api/projects/[id] removes the project

### __tests__/api/runs.test.ts

- GET /api/runs returns runs with agent relation
- GET /api/runs returns empty array when no runs

---

## E2E Tests (Playwright)

### e2e/dashboard-load.spec.ts

- Navigate to /dashboard
- Verify agent cards render (at least 1 agent name visible)
- Verify task list renders
- Verify page title/header

### e2e/task-management.spec.ts

- Open /dashboard/tasks
- Click "New Task" button
- Fill title, description, priority
- Submit and verify task appears in list
- Delete task and verify removal

### e2e/project-management.spec.ts

- Open /dashboard/projects
- Click "New Project" button
- Fill name, description, select department
- Submit and verify project appears
- Set project as active, verify visual indicator
- Delete project

---

## New Files

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest configuration with path aliases |
| `__tests__/helpers/setup.ts` | Test DB client + cleanup utilities |
| `__tests__/api/agents.test.ts` | Agent API route tests |
| `__tests__/api/tasks.test.ts` | Task API route tests |
| `__tests__/api/projects.test.ts` | Project API route tests |
| `__tests__/api/runs.test.ts` | Run API route tests |
| `playwright.config.ts` | Playwright configuration |
| `e2e/dashboard-load.spec.ts` | Dashboard load E2E |
| `e2e/task-management.spec.ts` | Task CRUD E2E |
| `e2e/project-management.spec.ts` | Project management E2E |

---

## Scope Boundaries

### Included
- Vitest unit/integration tests for all API routes
- Playwright E2E tests for 3 critical flows
- Test database in Docker (isolated)
- Test helper utilities
- npm scripts for running tests

### Excluded
- CLI adapter tests (requires real CLI binaries)
- Snapshot tests
- Visual regression tests
- CI/CD pipeline integration
- Store unit tests (stores are thin wrappers over API calls now)
