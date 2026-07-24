import type { ComponentProps } from "react"
import { SquadbaseProvider } from "@squadbase/react"
import { Link, Outlet, useRouterState } from "@squadbase/vantage/router"
import { AppShell } from "@squadbase/vantage/components"
import type { NavGroup } from "@squadbase/vantage/components"

import { UserCard } from "./components/user-card.js"
import { NAV_ITEMS } from "./lib/navigation.js"

/**
 * `AppShell` is router-agnostic and renders nav entries through whatever
 * component it is handed, using an `href` prop. Adapt it to the Vantage router
 * so navigation stays client-side.
 */
function RouterLink({ href, ...props }: { href: string } & ComponentProps<"a">) {
  return <Link to={href} {...props} />
}

function useNavGroups(): NavGroup[] {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return [
    {
      label: "Pages",
      items: NAV_ITEMS.map((item) => ({ ...item, isActive: pathname === item.href })),
    },
  ]
}

/**
 * The root layout is the only place an app-wide provider can go — Vantage owns
 * the React root, so there is no `main.tsx` to wrap. `SquadbaseProvider` supplies
 * the signed-in user to `useUser()`; the QueryClient provider is already
 * installed by the runtime.
 */
export default function RootLayout() {
  return (
    <SquadbaseProvider>
      <AppShell
        variant="header"
        groups={useNavGroups()}
        actions={<UserCard />}
        linkComponent={RouterLink}
      >
        <Outlet />
      </AppShell>
    </SquadbaseProvider>
  )
}
