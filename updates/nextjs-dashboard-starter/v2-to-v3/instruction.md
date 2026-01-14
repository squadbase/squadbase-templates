## Apply Styles to Active Sidebar Item

Apply styles to the active menu item in the sidebar based on the current URL path.

### 1. Convert `components/app-sidebar.tsx` to a Client Component

Add `"use client";` at the top of the file.

### 2. Get the Current Path in the Component

Use the `usePathname` hook inside the `AppSidebar` component to get the current path.

```typescript
import { usePathname } from "next/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  // ...
}
```

### 3. Add `isActive` Property to `SidebarMenuButton`

When rendering menu items, add the `isActive` property to compare with the current path.

```tsx
<SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
```

## Update template.json

Update the `version` field in `.squadbase/template.json` to `'3'`.

```json .squadbase/template.json
{
  "version": "3",
  "template-name": "nextjs-dashboard-starter"
}
```
