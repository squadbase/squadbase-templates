# Components Layer Coding Guidelines

## Shared Component Guidelines

This directory contains **global, reusable components** used across multiple pages.

For page-specific components, place them in `app/[page-name]/components/` instead.

## Component Selector Support (CRITICAL)

**ALWAYS start components with a native HTML element (div, section, etc.), NOT with shadcn/ui or other React components.**

This ensures `data-component-id` attribute is properly added for component selection mode.

### ❌ Bad (won't be selectable)

```tsx
export function MyComponent() {
  return <Card>...</Card>
}
```

```tsx
export function DataChart() {
  return <ChartContainer>...</ChartContainer>
}
```

### ✅ Good (selectable)

```tsx
export function MyComponent() {
  return (
    <div>
      <Card>...</Card>
    </div>
  );
}
```

```tsx
export function DataChart() {
  return (
    <div>
      <ChartContainer>...</ChartContainer>
    </div>
  );
}
```

### Why This Rule Exists

The Babel plugin adds `data-component-id` to the first JSX element in your component.

- **Native elements** (div, section, span, etc.) receive the attribute and it appears in the DOM
- **React components** (Card, ChartContainer, etc.) receive it as a prop but don't forward it to DOM

**Result:** If you start with a React component, the `data-component-id` attribute won't appear in the browser, and component selection mode won't work.

## Exception: components/ui/

Components in `components/ui/` (shadcn/ui components) are excluded from this rule, as they are low-level building blocks, not selectable components.
