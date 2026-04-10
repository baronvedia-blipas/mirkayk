# Phase 2D: Dark Mode — Design Spec

## Goal

Add dark mode with system-first detection + manual override toggle, using a botanical warm dark palette that preserves the project's visual identity.

## Behavior

1. On load, read `localStorage.getItem("theme")`
2. If value exists ("light" or "dark") → use it
3. If no value → read `window.matchMedia("(prefers-color-scheme: dark")`
4. Apply `dark` or `light` class to `<html>` element
5. An inline `<script>` in `<head>` runs before first paint to prevent FOUC
6. A `matchMedia` change listener updates the theme if user has no manual override in localStorage
7. Manual toggle persists to localStorage and overrides system preference

## Toggle UI

- Sun/moon icon button at the bottom of the sidebar
- Tooltip: "Switch to dark/light mode"
- Smooth transition on all color properties (200ms)

## Dark Palette (Botanical Warm)

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#FEF5EE` | `#1A1210` |
| `--surface` | `#FFFAF6` | `#241C18` |
| `--surface-2` | `#FDF0E8` | `#2E241E` |
| `--pink-100` | `#FFE0E8` | `#3D2028` |
| `--pink-200` | `#F5B8CA` | `#A8607A` |
| `--pink-300` | `#E8849E` | `#D4899F` |
| `--sage-100` | `#D8EACF` | `#1E2E1A` |
| `--sage-200` | `#A8C9A0` | `#6A9A60` |
| `--sand-100` | `#F5E8D8` | `#2E2418` |
| `--sand-200` | `#E0C49A` | `#A08A60` |
| `--lavender-100` | `#EDE0F0` | `#28202E` |
| `--lavender-200` | `#C8AED8` | `#8A70A0` |
| `--sky-100` | `#DCE8F5` | `#1A2230` |
| `--peach-100` | `#FFE8DC` | `#2E2018` |
| `--text-900` | `#2E1A14` | `#F0E6E0` |
| `--text-700` | `#7A5040` | `#C0A898` |
| `--text-500` | `#B09080` | `#8A7A70` |
| `--border` | `rgba(232,132,158,0.15)` | `rgba(212,137,159,0.12)` |
| `--shadow-card` | `0 2px 12px rgba(232,132,158,0.08)` | `0 2px 12px rgba(0,0,0,0.3)` |
| `--shadow-card-hover` | `0 8px 24px rgba(232,132,158,0.15)` | `0 8px 24px rgba(0,0,0,0.5)` |

## Architecture

### No store needed

Theme state is CSS-driven via class on `<html>`. A React hook (`useTheme`) provides the toggle API and current state. No Zustand store — this is simpler and avoids hydration issues.

### Anti-FOUC script

An inline `<script>` in `<head>` reads localStorage/matchMedia and applies the class before React hydrates. This prevents a flash of the wrong theme.

### Files to change

| File | Change |
|------|--------|
| `app/globals.css` | Add `.dark { ... }` block with all token overrides, add `transition` to `body` |
| `app/layout.tsx` | Add inline `<script>` for anti-FOUC in `<head>` |
| `lib/hooks/use-theme.ts` | **New** — `useTheme()` hook returning `{ theme, toggleTheme, resolvedTheme }` |
| `components/layout/sidebar.tsx` | Add sun/moon toggle button at bottom |
| 7 component files with hardcoded hex | Replace with design tokens |

### Hardcoded hex files to fix

- `components/tasks/task-card.tsx` (2 instances)
- `components/connect/terminal-modal.tsx` (1)
- `components/layout/activity-panel.tsx` (1)
- `components/connect/provider-button.tsx` (1)
- `components/agents/agent-detail.tsx` (2)
- `components/agents/agent-card.tsx` (1)
- `components/agents/agent-terminal.tsx` (1)

## Grain overlay

The grain texture overlay (`.grain-overlay`) should reduce opacity in dark mode from `0.04` to `0.02` to avoid looking too noisy against dark backgrounds.
