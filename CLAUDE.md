# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository contains templates for [Squadbase](https://www.squadbase.dev/) — a platform where users create projects, get a template deployed to an editor environment, and build dashboards and data apps with Squadbase AI (a coding agent).

## Directory Structure

| Directory | Description |
|-----------|-------------|
| `vite/` | Default template — Vite 8 + React 19 + Tailwind CSS v4 + shadcn/ui |
| `vite-server/` | `@squadbase/vite-server` — Hono-based backend plugin for the Vite template |
| `vite-template/` | `@squadbase/vite-template` — CLI for initializing and customizing Vite templates |
| `vantage/` | Vantage template — `@squadbase/vantage` (config-free React dashboard framework) |
| `vantage-template/` | `@squadbase/vantage-template` — CLI for initializing and customizing Vantage templates |
| `skills/` | `@squadbase/skills` — Agent Skills used in the editor environment |

Each active directory has its own `CLAUDE.md` with detailed guidance. Read those when working in a specific directory.

## Development Commands

### Root

```bash
npm run build:all          # Build all templates (used by pre-commit hook)
npm run skills-prepublish  # Prepare skills package for publishing
```

### vite/ (primary template)

```bash
cd vite
npm run dev      # Start Vite dev server
npm run build    # tsc + client build + server build
npm run start    # Run production server (node dist/server/index.js)
npm run lint     # ESLint
```

### vite-server/

```bash
cd vite-server
npm run build    # Build with tsup (all entry points + CLI)
npm run release  # Publish to npm
```

### vite-template/

```bash
cd vite-template
npm run build    # Sync base template from ../vite/ + build with tsup
npm run release  # Publish to npm
```

### vantage/

```bash
cd vantage
npm run dev      # vantage dev — dev server + API on :5173
npm run build    # vantage build → dist/
npm start        # Run production server (node dist/server/index.mjs)
npm run check    # vantage check — static diagnostics
```

### vantage-template/

```bash
cd vantage-template
npm run build    # Sync base template from ../vantage/ + build with tsup
npm run release  # Publish to npm
```

### skills/

```bash
cd skills
npm run build    # Build skills package
npm run release  # Publish to npm
```

## Pre-commit Hook

Husky runs `npm run build:all` before every commit — it builds `vite/` and `vantage/`. The commit is rejected if any template build fails.

## Vite vs Vantage

Both are React dashboard templates, but they hand off responsibility differently, so the conventions do **not** transfer:

| | `vite/` + `vite-template/` | `vantage/` + `vantage-template/` |
|---|---|---|
| Framework | App owns `vite.config.ts`, `main.tsx`, `routes.tsx` | `@squadbase/vantage` owns all of it; config files are forbidden |
| Routing | Explicit table in `src/routes.tsx` | File-based (`index.tsx` → `/`, `sales/[id].tsx` → `/sales/:id`) |
| Building blocks | Copied into `src/components/` (editable) | Imported from `@squadbase/vantage/{ui,components}` (managed) |
| Import style | `@/` alias | Package subpaths + relative specifiers ending in `.js` |
| Backend | `@squadbase/vite-server` + `server-logic/` | `server/api/**` handlers built into the framework |
| UI primitives | Radix (`asChild`) | Base UI (`render` prop) |

When working in either tree, read that directory's own `CLAUDE.md` first.

## Skills Workflow

The source of truth for Agent Skills is `skills/source/squadbase-vite-react/`. The `vite/skills/` directory is a copy — do not edit it directly.

To sync skills into the Vite template:

```bash
cd vite && npx @squadbase/skills --clean
```

When changing server logic behavior in `vite-server/`, always update the corresponding skill file at `skills/source/squadbase-vite-react/server-logic-development/SKILL.md`.
