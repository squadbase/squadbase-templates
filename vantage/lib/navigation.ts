import { Home } from "lucide-react"
import type { NavItem } from "@squadbase/vantage/components"

/**
 * Sidebar / header navigation entries.
 *
 * Vantage derives *routes* from the filesystem, but not their order or their
 * labels — so navigation stays an explicit list. When you add a page file
 * (e.g. `monthly-analysis.tsx` → `/monthly-analysis`), add a matching entry
 * here so it shows up in the app shell.
 */
export const NAV_ITEMS: Omit<NavItem, "isActive">[] = [
  { label: "Home", href: "/", icon: Home },
]
