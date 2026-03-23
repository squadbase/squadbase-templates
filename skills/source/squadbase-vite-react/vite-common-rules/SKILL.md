---
name: vite-common-rules
description: Prohibited file modifications and architectural constraints for Vite template projects
---

# Vite Template — Prohibited Files & Architectural Rules

## DO NOT Modify These Files

| File / Directory | Role | Why it must not be changed |
|------------------|------|---------------------------|
| `vite.config.ts` | Build pipeline (`squadbasePlugin`, `react()`, `tailwindcss()`, path aliases, server config). Mode-based branching for server vs. client builds. | Changing plugins or build config breaks the dual client/server build, HMR, or production deployment. |
| `src/main.tsx` | React entry point — provider stack: `StrictMode` > `SquadbaseProvider` > `QueryClientProvider` > `BrowserRouter`. | Removing or reordering providers breaks auth, data fetching, or routing for the entire app. |
| `src/App.tsx` | Layout shell — `SidebarProvider` + `AppSidebar` + `PageRouter`. | Modifying breaks sidebar navigation and the page routing contract. |
| `src/routes.tsx` | Route registry with `lazy()` imports. Managed by the build system. | Manual edits conflict with auto-management and cause runtime lazy-load errors. |
| `src/index.css` | Tailwind CSS v4 base imports, design tokens (oklch CSS custom properties), dark mode config, base layer styles. | Editing tokens or imports breaks the entire design system. |
| `src/vite-env.d.ts` | Vite type reference (`/// <reference types="vite/client" />`). | Changing it breaks TypeScript module resolution for `import.meta.env`. |
| `node_modules/` | Installed dependencies. | Direct edits are overwritten on install and cause non-reproducible builds. |
| `.squadbase/` | Connection configuration (`connections.json`). | Contains deployment-specific connector config; manual edits break server logic connections. |

## Where to Implement Instead

| Need | Location | Notes |
|------|----------|-------|
| Backend logic / API endpoint | `server-logic/*.ts` | TypeScript server logic handler. See `server-logic-development` skill. |
| New page | `src/pages/{name}.tsx` | File-based routing: `home.tsx` → `/`, `dashboard.tsx` → `/dashboard`. Use `export default function`. |
| New component | `src/components/{pageName}/{component-name}.tsx` | Use `export default function`. See `frontend-development` skill. |
| Custom hook | `src/hooks/{hook-name}.ts` | Standard React hook file. |

## Common Violations — Do This Instead

| If you need to… | NEVER do this | Do this instead |
|-----------------|---------------|-----------------|
| Add an API endpoint or backend logic | Modify `vite.config.ts` or create Express/Hono routes manually | Create a TypeScript server logic handler in `server-logic/` |
| Add a provider or context | Edit `src/main.tsx` to add providers | Wrap providers inside your page or component |
| Change the app layout | Edit `src/App.tsx` | Create a layout component in `src/components/` and use it within your page |
| Add a new route | Manually edit `src/routes.tsx` | Create a new `.tsx` file in `src/pages/` — it is auto-registered |
| Change styles or theme | Edit `src/index.css` | Use Tailwind classes directly in components. Use CSS custom properties via `className` |
| Install or patch a dependency | Edit files in `node_modules/` | Use `npm install` and `package.json` |
