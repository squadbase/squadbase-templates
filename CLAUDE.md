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

### skills/

```bash
cd skills
npm run build    # Build skills package
npm run release  # Publish to npm
```

## Pre-commit Hook

Husky runs `npm run build:all` before every commit. The commit is rejected if any template build fails.

## Skills Workflow

The source of truth for Agent Skills is `skills/source/squadbase-vite-react/`. The `vite/skills/` directory is a copy — do not edit it directly.

To sync skills into the Vite template:

```bash
cd vite && npx @squadbase/skills --clean
```

When changing server logic behavior in `vite-server/`, always update the corresponding skill file at `skills/source/squadbase-vite-react/server-logic-development/SKILL.md`.
