# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository contains templates for [Squadbase](https://www.squadbase.dev/) — a platform where users create projects, get a template deployed to an editor environment, and build dashboards and data apps with Squadbase AI (a coding agent).

## Directory Structure

`vite/` と `vantage/` の指針は各ディレクトリの `AGENTS.md`、
`vite-server/` `vite-template/` `vantage-template/` は各ディレクトリの `CLAUDE.md` にある。特定ディレクトリで作業する際は先にそれを読むこと。

## Pre-commit Hook

Husky runs `npm run build:all` before every commit — it builds `vite/` and `vantage/`. The commit is rejected if any template build fails.

## Vite vs Vantage

Both are React dashboard templates, but they hand off responsibility differently, so the conventions do **not** transfer:

| | `vite/` + `vite-template/` | `vantage/` + `vantage-template/` |
|---|---|---|
| Framework | App owns `vite.config.ts`, `main.tsx`, `routes.tsx` | `@squadbase/vantage` owns all of it; config files are forbidden |
| Routing | Explicit table in `src/routes.tsx` | File-based (`src/index.tsx` → `/`, `src/sales/[id].tsx` → `/sales/:id`) |
| Building blocks | Copied into `src/components/` (editable) | Imported from `@squadbase/vantage/{ui,components}` (managed) |
| Import style | `@/` alias | Package subpaths + extensionless relative specifiers |
| Backend | `@squadbase/vite-server` + `server-logic/` | `server/api/**` handlers built into the framework — **at the project root, not under `src/`** |
| UI primitives | Radix (`asChild`) | Base UI (`render` prop) |

When working in either tree, read that directory's own guidance file first (上記「Directory Structure」参照)。

## Skills Workflow

The source of truth for Agent Skills is `skills/source/squadbase-vite-react/`. The `vite/skills/` directory is a copy — do not edit it directly.

To sync skills into the Vite template:

```bash
cd vite && npx @squadbase/skills --clean
```

When changing server logic behavior in `vite-server/`, always update the corresponding skill file at `skills/source/squadbase-vite-react/server-logic-development/SKILL.md`.
