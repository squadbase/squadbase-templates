## Key dependencies

Do not change major versions unless explicitly requested by the user.

- Next.js 16.x (standalone mode)
- Tailwind CSS v4

## Strict rules

- NEVER use server actions. Always use route handlers instead.
- ALWAYS use React Query (TanStack Query) for client-side API fetching.
- NEVER run build for testing purposes. Use `npm run lint` instead.
- NEVER run `npm run dev`. There is always a development server running in the background.
- For Next.js implementation, use the `mcp__next-devtools__nextjs_docs` tool to gather accurate information.
- After implementation, use the `mcp__next-devtools__nextjs_runtime` tool to verify and check for errors.
- ALWAYS add new pages to the side menu navigation. Every implemented page MUST be accessible from the sidebar.

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

**Benefits:**

- Progressive loading (components load independently)
- Isolated errors (one failed API doesn't block others)
- Better component testability and reusability

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

**Why:** React components don't forward unknown props to DOM; native HTML elements do. This ensures `data-component-id` reaches the browser.

## Development tips

- Use next-devtools MCP for Next.js docs and runtime information.
- Use shadcn MCP for finding documentation and code examples for shadcn components.
- Use context7 MCP for finding documentation and code examples for other packages/libraries.
- For chart implementation, see @docs/chart-implementation.md for best practices and checklist.

## Chart Implementation (Critical Rules)

1. **ALWAYS use shadcn/ui Chart components (`@/components/ui/chart`)**
2. **Chart colors: Use ONLY `--color-chart-1` through `--color-chart-5`. Example: `var(--color-chart-1)`**
3. **Data type handling: API/DB fields often return as strings, Always check SQL query for comparison type guidance**
   - For numeric equality: Use `==` (e.g., `p.Survived == 1`)
   - For numeric range: Use `Number()` (e.g., `Number(p.Age) >= 18`)
   - For strings: Use `===` (e.g., `p.Sex === "male"`)
4. **Pie Chart: MUST include `label` prop or chart won't render**
   - Example: `<Pie data={data} dataKey="count" label nameKey="category" />`
5. **Make all the charts responsive and mobile-friendly**

## Data Query Implementation(Critical Rules)

All rules below MUST be followed when implementing data queries for dashboard metrics and charts:

1. Store SQL queries in `sql/` directory e.g., `sql/weekly_active_users.sql`, `sql/unique_customer_count.sql`. Only one query per file.
2. Use parameterized SQL queries to prevent SQL injection.
3. Create route handler (e.g., `app/api/weekly_active_users/route.ts`, `app/api/unique_customer_count/route.ts`) for each SQL query to execute the query and return results as JSON.
4. Generate client-side hooks for data fetching with Tanstack Query in `hooks/` directory.
