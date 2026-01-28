## Key dependencies

Do not change major versions unless explicitly requested by the user.

- Next.js 16.x (standalone mode)
- Tailwind CSS v4

## Strict rules

- NEVER use server actions. Always use route handlers instead.
- ALWAYS use React Query (TanStack Query) for client-side API fetching.
- NEVER run build for testing purposes. Use `npm run lint` instead.
- NEVER run `npm run dev`. There is always a development server running in the background.
- Every implemented page MUST be accessible from the sidebar.

## Component Organization

### Directory Structure

`@/components` for shared, `app/[page-name]/components/` for page-specific

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
