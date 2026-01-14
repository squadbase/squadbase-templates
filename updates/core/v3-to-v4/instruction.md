## Add Current User Display Using @squadbase/nextjs

The `@squadbase/nextjs` package allows you to retrieve information about the current user. This adds an implementation that displays user information in the sidebar footer, with a dialog showing details when clicked.

### 1. Install the Package

```bash
npm install @squadbase/nextjs
```

### 2. Create `lib/squadbaseSdk.ts`

```typescript lib/squadbaseSdk.ts
import { createNextjsServerClient } from "@squadbase/nextjs";

export const getSquadbaseSdkClient = () => {
  return createNextjsServerClient();
};
```

### 3. Create `components/user-info.tsx`

Create a user info component to display in the sidebar footer.

```tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { User } from "@squadbase/nextjs";

type Props = {
  user: User;
};

export function UserInfo({ user }: Props) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-sidebar-accent">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.iconUrl ?? undefined} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{fullName}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.iconUrl ?? undefined} alt={fullName} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="w-full space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Roles</p>
              {user.roles.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="font-medium">None</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Create `components/user-info-fallback.tsx`

Create a fallback component to display when user information cannot be retrieved (e.g., in local development environment).

```tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserIcon } from "lucide-react";

export function UserInfoFallback() {
  return (
    <div className="flex w-full items-center gap-3 rounded-md p-2">
      <Avatar className="h-9 w-9">
        <AvatarFallback>
          <UserIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col overflow-hidden">
        <span className="truncate text-sm font-medium text-muted-foreground">
          Guest
        </span>
        <span className="truncate text-xs text-muted-foreground">
          Unable to retrieve user information
        </span>
      </div>
    </div>
  );
}
```

### 5. Modify `components/app-sidebar.tsx`

Display user information in the `SidebarFooter`. Since `UserInfo` is a client component, user information needs to be passed as props from a server component. Display `UserInfoFallback` when user information cannot be retrieved.

```tsx
import { UserInfo } from "./user-info";
import { UserInfoFallback } from "./user-info-fallback";
import type { User } from "@squadbase/nextjs";

type Props = React.ComponentProps<typeof Sidebar> & {
  user: User | null;
};

export function AppSidebar({ user, ...props }: Props) {
  // ...
  return (
    // ...
    <SidebarFooter>
      <div>
        <div className="flex items-center justify-end mb-2">
          <ModeToggle />
        </div>
        <div className="border-t pt-2">
          {user ? <UserInfo user={user} /> : <UserInfoFallback />}
        </div>
      </div>
    </SidebarFooter>
    // ...
  );
}
```

### 6. Fetch and Pass User Information in `app/layout.tsx`

Fetch user information in the layout component and pass it to `AppSidebar`.

```tsx
import { getSquadbaseSdkClient } from "@/lib/squadbaseSdk";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = getSquadbaseSdkClient();
  const user = await client.getUser().catch((e) => {
    console.error("Failed to fetch user:", e);
    return null;
  });

  return (
    // ...
    <AppSidebar user={user} />
    // ...
  );
}
```

## Update template.json

Update the `version` field in `.squadbase/template.json` to `'4'`.

```json .squadbase/template.json
{
  "version": "4",
  "template-name": "<template-name>"
}
```
