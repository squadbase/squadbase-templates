import * as React from "react"
import { ChevronRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { NavGroup, NavItem } from "@/types/navigation"

interface AppShellSidebarProps {
  variant?: "sidebar"
  groups: NavGroup[]
  actions?: React.ReactNode
  header?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  linkComponent?: React.ElementType
  onNavigate?: (href: string) => void
}

interface AppShellHeaderProps {
  variant: "header"
  groups: NavGroup[]
  actions?: React.ReactNode
  header?: React.ReactNode
  children: React.ReactNode
  className?: string
  linkComponent?: React.ElementType
  onNavigate?: (href: string) => void
}

type AppShellProps = AppShellSidebarProps | AppShellHeaderProps

function flattenItems(item: NavItem): NavItem[] {
  if (item.children && item.children.length > 0) {
    return item.children.flatMap(flattenItems)
  }
  return [item]
}

function NavSelect({
  groups,
  onNavigate,
}: {
  groups: NavGroup[]
  onNavigate: (href: string) => void
}) {
  const allItems = groups.flatMap((g) => g.items.flatMap(flattenItems))
  const currentValue = allItems.find((item) => item.isActive)?.href ?? ""

  return (
    <Select value={currentValue} onValueChange={onNavigate}>
      <SelectTrigger size="sm" className="w-48">
        <SelectValue placeholder="ページを選択" />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group, index) => (
          <SelectGroup key={group.label ?? index}>
            {group.label && <SelectLabel>{group.label}</SelectLabel>}
            {group.items.flatMap(flattenItems).map((item) => (
              <SelectItem key={item.href} value={item.href} disabled={item.disabled}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

function NavItemWithChildren({
  item,
  linkComponent: LinkComponent = "a",
}: {
  item: NavItem
  linkComponent?: React.ElementType
}) {
  return (
    <Collapsible
      asChild
      defaultOpen={item.isActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.label}
            aria-disabled={item.disabled}
            className={cn(item.disabled && "pointer-events-none")}
          >
            {item.icon && <item.icon />}
            <span>{item.label}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children!.map((child) => (
              <SidebarMenuSubItem key={child.href}>
                <SidebarMenuSubButton
                  asChild
                  isActive={child.isActive}
                >
                  <LinkComponent
                    href={child.href}
                    aria-disabled={child.disabled}
                    tabIndex={child.disabled ? -1 : undefined}
                    className={cn(
                      child.disabled && "pointer-events-none opacity-50"
                    )}
                  >
                    {child.icon && <child.icon />}
                    <span>{child.label}</span>
                  </LinkComponent>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function NavItemLink({
  item,
  linkComponent: LinkComponent = "a",
}: {
  item: NavItem
  linkComponent?: React.ElementType
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.label}
        isActive={item.isActive}
      >
        <LinkComponent
          href={item.href}
          aria-disabled={item.disabled}
          tabIndex={item.disabled ? -1 : undefined}
          className={cn(item.disabled && "pointer-events-none")}
        >
          {item.icon && <item.icon />}
          <span>{item.label}</span>
        </LinkComponent>
      </SidebarMenuButton>
      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
    </SidebarMenuItem>
  )
}

const defaultNavigate = (href: string) => {
  window.location.assign(href)
}

const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (props, ref) => {
    const {
      variant = "sidebar",
      groups,
      actions,
      header,
      children,
      className,
      linkComponent,
      onNavigate = defaultNavigate,
    } = props

    if (variant === "header") {
      return (
        <div ref={ref} data-slot="app-shell" className={cn("flex flex-col h-full", className)}>
          {header !== undefined ? (
            header
          ) : (
            <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
              {groups.length > 0 && <NavSelect groups={groups} onNavigate={onNavigate} />}
              {actions && (
                <div className="ml-auto flex items-center gap-2">{actions}</div>
              )}
            </header>
          )}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      )
    }

    const { defaultOpen = true } = props as AppShellSidebarProps

    return (
      <SidebarProvider defaultOpen={defaultOpen}>
        <Sidebar data-slot="app-sidebar" collapsible="offcanvas">
          <SidebarContent>
            {groups.map((group, index) => (
              <SidebarGroup key={group.label ?? index}>
                {group.label && (
                  <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                )}
                <SidebarMenu>
                  {group.items.map((item) =>
                    item.children && item.children.length > 0 ? (
                      <NavItemWithChildren key={item.href} item={item} linkComponent={linkComponent} />
                    ) : (
                      <NavItemLink key={item.href} item={item} linkComponent={linkComponent} />
                    )
                  )}
                </SidebarMenu>
              </SidebarGroup>
            ))}
          </SidebarContent>
          {actions && <SidebarFooter>{actions}</SidebarFooter>}
          <SidebarRail />
        </Sidebar>
        <SidebarInset ref={ref} data-slot="app-shell" className={className}>
          {header !== undefined ? (
            header
          ) : (
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
            </header>
          )}
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    )
  }
)
AppShell.displayName = "AppShell"

export { AppShell }
