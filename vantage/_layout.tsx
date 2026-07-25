import type { ComponentProps } from "react"
import { SquadbaseProvider } from "@squadbase/react"
import { Link, Outlet, useCurrentRoute, useRoutes } from "@squadbase/vantage/router"
import { AppShell } from "@squadbase/vantage/components"
import type { NavGroup } from "@squadbase/vantage/components"

import { UserCard } from "./components/user-card"

/**
 * `AppShell` is router-agnostic and renders nav entries through whatever
 * component it is handed, using an `href` prop. Adapt it to the Vantage router
 * so navigation stays client-side.
 */
function RouterLink({ href, ...props }: { href: string } & ComponentProps<"a">) {
  return <Link to={href} {...props} />
}

/**
 * The nav *is* the route list — adding a page file puts it in the nav, with no
 * second list to keep in sync. Dynamic routes (`sales/[id].tsx`) have no single
 * URL, so they are filtered out; `route.label` resolves `navLabel` → `title` →
 * path, so shorten a long page title with `definePage({ navLabel })`.
 */
function useNavGroups(): NavGroup[] {
  const routes = useRoutes()
  const current = useCurrentRoute()
  return [
    {
      label: "Pages",
      items: routes
        .filter((route) => !route.dynamic)
        .map((route) => ({
          label: route.label,
          href: route.to,
          isActive: route.path === current?.path,
        })),
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
