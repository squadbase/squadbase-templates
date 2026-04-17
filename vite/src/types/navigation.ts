import type { LucideIcon } from "lucide-react"

export interface NavItem {
  /** Display label */
  label: string
  /** Route path or URL */
  href: string
  /** Lucide icon component */
  icon?: LucideIcon
  /** Whether this item is currently active */
  isActive?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
  /** Optional badge text (e.g. notification count) */
  badge?: string
  /** Nested child items */
  children?: NavItem[]
}

export interface NavGroup {
  /** Group label */
  label?: string
  /** Items in this group */
  items: NavItem[]
}
