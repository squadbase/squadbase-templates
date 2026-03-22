---
name: nextjs-common-rules
description: Prohibited file modifications, architectural constraints, and development rules for Next.js App Router template projects
---

# Next.js App Router Template — Prohibited Files & Architectural Rules

## DO NOT Modify These Files

| File / Directory | Role | Why it must not be changed |
|------------------|------|---------------------------|
| `app/layout.tsx` | Root layout — providers, sidebar, header, fonts, metadata, user auth fetch. | Breaking this breaks authentication, navigation, and the entire layout contract. |
| `app/globals.css` | Tailwind CSS v4 `@theme` directives, oklch design tokens, base layer styles. | Editing breaks the design system. |
| `next.config.ts` | Build config: React Compiler, SWC component annotator plugin, standalone output, turbopack cache. | Breaks the build pipeline and component selection. |
| `postcss.config.mjs` | PostCSS config for Tailwind processing. | Breaks Tailwind CSS compilation. |
| `tsconfig.json` | Path aliases (`@/*`), Next.js plugin configuration. | Breaks module resolution and Next.js features. |
| `eslint.config.mjs` | ESLint configuration. | Changes lint validation behavior. |
| `components.json` | shadcn/ui configuration. | Breaks `npx shadcn` component generation. |
| `components/providers.tsx` | React Query (`QueryClientProvider`) setup. | Breaks all client-side data fetching. |
| `components/ui/` | shadcn/ui component library. | Managed building blocks, not application code. |
| `components/sqb-dev/` | Dev tools (component selector, inspector). | Required for component selection functionality. |
| `components/site-header.tsx` | Header component imported by root layout. | Part of root layout infrastructure. |
| `components/user-info.tsx` | Sidebar user profile display. | Platform auth infrastructure. |
| `components/user-info-fallback.tsx` | User display fallback. | Platform auth infrastructure. |
| `components/app-sidebar.tsx` (structure) | Sidebar navigation — **only the `menuItems` array may be changed**. | Everything else is navigation infrastructure. Use `scaffoldNextPage` to add entries. |
| `lib/` directory | Infrastructure: `squadbaseSdk.ts`, `squadbase-db.ts`, `react-query.ts`, `utils.ts`. | Platform-level modules. |
| `squadbase.yml` | Framework and deploy config. | Changing breaks the deployment pipeline. |
| `.squadbase/` | Connection configuration. | Deployment-specific connector config. |
| `.mcp.json` | MCP server config for coding agent tools. | Breaks coding agent tool integration. |
| `node_modules/` | Installed dependencies. | Overwritten on install. |

## Where to Implement Instead

| Need | Location | Notes |
|------|----------|-------|
| New page | `app/{pageName}/page.tsx` | Use `scaffoldNextPage` — creates page and sidebar entry automatically. |
| Page-specific component | `app/{pageName}/components/{name}.tsx` | Co-locate with the page. |
| Shared component | `components/{name}.tsx` | Reusable across multiple pages. |
| API endpoint / backend logic | `app/api/{route}/route.ts` | Route handler. NEVER use server actions. |
| Custom hook | `hooks/{name}.ts` | Standard React hook file. |
| Page layout | `app/{pageName}/layout.tsx` | App Router layout for route segment. |

## Key Rules

### App Router Conventions
- `page.tsx` defines routes, `layout.tsx` provides shared layouts, `loading.tsx` enables Suspense, `error.tsx` provides error boundaries (`"use client"` is required for error.tsx).

### "use client" Directive
- **Add** when: using hooks, event handlers with state, or browser APIs.
- **Omit** when: pure props-to-JSX transformation (presentation components).

### Charts
- Use recharts via `@/components/ui/chart`. Do NOT use echarts (that is for Vite templates).
- Chart colors: use ONLY `var(--color-chart-1)` through `var(--color-chart-5)`.

### Data Fetching
- **Client-side**: React Query (`@tanstack/react-query`). Place `useQuery` hooks inside child components, NOT in `page.tsx`.
- **Server-side API**: Route handlers (`app/api/*/route.ts`). NEVER use server actions (`"use server"`).

### Component Selector (CRITICAL)
- Components MUST start with a native HTML element (`<div>`, `<section>`), NOT a React component (`<Card>`).
- The SWC plugin adds `data-component-id` to the first JSX element — only native elements forward it to the DOM.
- **Exception**: `components/ui/` is excluded from this rule.

### Navigation
- Every page MUST be accessible from the sidebar.
- `scaffoldNextPage` auto-registers entries in `app-sidebar.tsx` `menuItems`.

### Development
- Use `npm run lint` for testing. NEVER run `npm run dev` (dev server runs in the background). `npm run build` is for production only, not testing.

### Runtime Error Handling
- Use App Router `error.tsx` files for route-level error boundaries (`"use client"` required).
- For client-side error recovery, use `refetch()` from `useQuery` after auto-retries are exhausted.
- Empty states: check `data.length === 0` and show appropriate empty UI.
- Null safety: always use optional chaining (`data?.field`) and nullish coalescing (`?? defaultValue`) for API response data.

## Common Violations — Do This Instead

| If you need to… | NEVER do this | Do this instead |
|-----------------|---------------|-----------------|
| Add an API endpoint | Use server actions (`"use server"`) | Create a route handler in `app/api/{route}/route.ts` |
| Add a provider or context | Edit `app/layout.tsx` | Wrap providers inside your page or component |
| Change the app layout | Edit `app/layout.tsx` | Create a layout for the route segment (`app/{name}/layout.tsx`) |
| Add a new page | Create page files manually | Use `scaffoldNextPage` tool (creates page and sidebar entry) |
| Change styles or theme | Edit `app/globals.css` | Use Tailwind classes in components |
| Fetch data in page.tsx | Put `useQuery` in the page component | Place `useQuery` hooks inside child components |
| Use echarts | Import `echarts` or `EChartsWrapper` | Use recharts via `@/components/ui/chart` |
| Test changes | Run `npm run build` or `npm run dev` | Run `npm run lint` |
