## Key dependencies

Do not change major versions unless explicitly requested by the user.

- Next.js 16.x (standalone mode)
- Tailwind CSS v4

## Strict rules

- NEVER use server actions. Always use route handlers instead.
- ALWAYS use React Query (TanStack Query) for client-side API fetching.
- NEVER run build for testing purposes. Use `npm run lint` instead.
- NEVER run `npm run dev`. There is alway s a development server running in the background.
- Every implemented page MUST be accessible from the sidebar.

## Component Organization

### Directory Structure

`@/components` for shared, `app/[page-name]/components/` for page-specific

### Data Fetching Strategy

**CRITICAL: Call data fetching hooks INSIDE components, NOT in page.tsx**

- **page.tsx responsibilities:**
  - Layout and component composition ONLY
  - Page-wide shared state (e.g., filter values like `minAge`, `maxAge`)
  - Pass filter/parameter values as props to components
  - ❌ NO data fetching hooks
  - ❌ NO loading/error state aggregation

- **Component responsibilities:**
  - Call data fetching hooks internally (e.g., `usePassengers(minAge, maxAge)`)
  - Handle own loading/error states
  - Transform API data to display format
  - Add "use client" directive when using hooks

- **Hook structure:** One hook per component/feature in `hooks/use-[component-name].ts`
- **Type reuse:** `import type { XxxRecord } from "@/app/api/xxx/route"`

**Pattern:**

```tsx
// ✅ page.tsx - State management only
export default function DashboardPage() {
  const [filters, setFilters] = useState({...});
  return <Chart filters={filters} />;
}

// ✅ Component - Data fetching inside
"use client";
export function Chart({ filters }) {
  const { data, isLoading, error } = useChartData(filters);
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorCard />;
  return <ChartUI data={data} />;
}

// ❌ WRONG - Don't fetch in page.tsx
export default function DashboardPage() {
  const { data } = useChartData(); // ❌ NO!
  return <Chart data={data} />; // ❌ NO!
}
```

### Component Breakdown Guidelines

- Break down: Clear responsibility (chart, form, table), testable independently
- Keep together: Tightly coupled logic, minimal splitting benefit
- **State:** Lift to parent (multiple components, triggers API calls), keep local (single component, UI state)

### "use client" Directive Guidelines

- Add when: Using hooks, browser APIs, or event handlers with state
- Omit when: Pure props-to-JSX transformation (presentation components)

### Component Selector Support (CRITICAL)

**ALWAYS start components with native HTML elements (div, section), NOT React components (Card, etc.)**

**❌ Bad (won't be selectable):**

```tsx
export function MyChart() {
  return <Card>...</Card>;
}
```

**✅ Good (selectable):**

```tsx
export function MyChart() {
  return (
    <div>
      <Card>...</Card>
    </div>
  );
}
```
