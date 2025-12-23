# Chart Implementation Guide

A practical checklist for implementing charts successfully on the first try.
Based on lessons learned from the Titanic dashboard implementation.

---

## Pre-Implementation Checklist

### 1. Environment & Library Selection

- [ ] Confirm Next.js version (16+) and React version (19+)
- [ ] **Use shadcn/ui Chart components**, NOT recharts directly
  - Reason: Better SSR compatibility with Next.js 16 + React 19
  - Import: `@/components/ui/chart`

### 2. Review SQL Source

- [ ] Locate the corresponding SQL file in `sql/` directory
- [ ] **Use SQL comparison operators to guide JavaScript comparisons**
- [ ] Note parameter types and comparison patterns

**SQL → JavaScript Conversion Pattern:**

```
SQL Pattern                    → JavaScript Pattern
─────────────────────────────────────────────────────────────
WHERE field = 1                → p.field == 1
WHERE field >= 10              → Number(p.field) >= 10
WHERE field = 'text'           → p.field === "text"
WHERE active = true            → p.active === "true" or Boolean(p.active)
```

### 3. Verify Data Structure

- [ ] Add `console.log()` to check actual API response
- [ ] Verify field types (numbers may come as strings from DuckDB/APIs)
- [ ] Sample first record: `console.log("First record:", data[0])`

---

## Data Handling Best Practices

### Type Coercion Strategy

**⚠️ Common Pitfall:** Numeric fields from APIs/databases often return as strings.

**Decision Matrix:**

| Data Type        | SQL Operator | JavaScript Approach     | Example               |
| ---------------- | ------------ | ----------------------- | --------------------- |
| Numeric equality | `= 1`        | Loose equality `==`     | `p.Survived == 1`     |
| Numeric range    | `>= 18`      | Convert with `Number()` | `Number(p.Age) >= 18` |
| String           | `= 'male'`   | Strict equality `===`   | `p.Sex === "male"`    |
| Boolean          | `= true`     | String or Boolean       | `p.Active === "true"` |

**✅ Recommended Pattern:**

```typescript
// For filtering (based on SQL: WHERE Survived = 1)
const survivedCount = passengers.filter((p) => p.Survived == 1).length;

// For range comparison (based on SQL: WHERE Age >= 18)
const adults = passengers.filter((p) => Number(p.Age) >= 18);

// For string comparison
const males = passengers.filter((p) => p.Sex === "male");
```

**❌ Avoid:**

- Over-conversion: `String(p.Survived) === "1"` (redundant, breaks range comparisons)
- Blind strict equality: `p.Survived === 1` (fails if API returns "1" as string)

---

## Chart Type Implementation Checklist

### Pie Chart

- [ ] Define `ChartConfig` with labels and colors
- [ ] Prepare data array with `category`, `count`, `fill` fields
- [ ] **Required props:**
  - `data={survivalData}`
  - `dataKey="count"`
  - `nameKey="category"`
  - **`label`** ← Critical! Chart won't render without this
- [ ] Wrap with `<ChartContainer config={...}>`
- [ ] Add `<ChartTooltip content={<ChartTooltipContent hideLabel />} />`

**Example:**

```tsx
const survivalChartConfig = {
  survived: { label: "Survived", color: "hsl(var(--color-chart-1))" },
  didNotSurvive: {
    label: "Did not survive",
    color: "hsl(var(--color-chart-2))",
  },
} satisfies ChartConfig;

<ChartContainer config={survivalChartConfig}>
  <PieChart>
    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
    <Pie
      data={survivalData}
      dataKey="count"
      label // ← Essential!
      nameKey="category"
    />
  </PieChart>
</ChartContainer>;
```

### Bar Chart

- [ ] Define `ChartConfig` with labels and colors
- [ ] Prepare data array with keys matching `dataKey` props
- [ ] **Required components:**
  - `<CartesianGrid vertical={false} />`
  - `<XAxis dataKey="..." />`
  - `<YAxis />`
  - `<ChartTooltip content={<ChartTooltipContent />} />`
  - `<ChartLegend content={<ChartLegendContent />} />`
- [ ] Use CSS variables for `fill`: `var(--color-survived)`
- [ ] Add `radius={4}` for rounded corners

**Example:**

```tsx
<ChartContainer config={classSurvivalChartConfig} className="h-[250px] w-full">
  <BarChart data={classSurvivalData}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="class" tickLine={false} tickMargin={10} axisLine={false} />
    <YAxis />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="survived" fill="var(--color-survived)" radius={4} />
    <Bar dataKey="didNotSurvive" fill="var(--color-didNotSurvive)" radius={4} />
  </BarChart>
</ChartContainer>
```

### Common Chart Setup

- [ ] Import all required components from `@/components/ui/chart`
- [ ] Define `ChartConfig` using `satisfies ChartConfig` pattern
- [ ] **Use ONLY these predefined color variables:**
  - `var(--color-chart-1)`
  - `var(--color-chart-2)`
  - `var(--color-chart-3)`
  - `var(--color-chart-4)`
  - `var(--color-chart-5)`
  - ⚠️ Do NOT use custom colors or other CSS variables
- [ ] Wrap charts with `<ChartContainer>` for theming and responsiveness

---

## Troubleshooting Checklist

### Chart Renders Empty

**Symptoms:** Chart area is blank, no data displayed

**Checks:**

- [ ] Verify data is not empty: `console.log("Data length:", data.length)`
- [ ] Check data structure: `console.log("First item:", data[0])`
- [ ] Confirm `dataKey` matches actual field names in data
- [ ] **For Pie Chart:** Ensure `label` prop is present

### Data Count is Zero

**Symptoms:** `console.log` shows `count: 0` despite having data

**Checks:**

- [ ] **Type mismatch in filter conditions**
  - Print values: `console.log("Values:", data.map(d => d.fieldName))`
  - Check if numbers come as strings: `"1"` vs `1`
  - Apply appropriate conversion: `Number()` or use `==` instead of `===`
- [ ] Review SQL query for comparison type guidance

### Type Errors or Unexpected Behavior

**Checks:**

- [ ] Verify API response structure matches TypeScript interface
- [ ] Ensure all required chart props are provided
- [ ] Check for `undefined` or `null` values in data
- [ ] Use optional chaining: `data?.data ?? []`

---

## Quick Reference: Titanic Implementation

### Problem Encountered

- Charts displayed empty despite data being fetched
- Root cause: DuckDB returned `Survived` as `"1"` (string), but code used `p.Survived === 1` (strict number comparison)

### Solution Applied

- Changed filters to use appropriate type handling
- For equality: `p.Survived == 1` (loose equality allows type coercion)
- For ranges: `Number(p.Age) >= minAge` (explicit conversion for numeric operations)
- Referenced SQL: `WHERE Survived = 1` and `WHERE Age >= {{minAge}}`

### Key Takeaway

**Always verify actual data types returned by your API/database before implementing filters and comparisons.**

---

## Implementation Workflow

1. **Plan** → Review SQL file to understand data types and comparisons
2. **Inspect** → Add `console.log()` to verify API response structure
3. **Configure** → Define `ChartConfig` with appropriate colors and labels
4. **Implement** → Use shadcn/ui Chart components with required props
5. **Verify** → Check chart renders with correct data
6. **Clean up** → Remove debug `console.log()` statements

---

## References

- [shadcn/ui Charts Documentation](https://ui.shadcn.com/docs/components/chart)
- [Recharts Documentation](https://recharts.org/)
- Project SQL Guidelines: `sql/CLAUDE.md`
- Example Implementation: `app/sample-titanic/page.tsx`
