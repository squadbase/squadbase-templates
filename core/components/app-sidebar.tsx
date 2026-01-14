"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { UserInfoFallback } from "./user-info-fallback";
import { LucideHome } from "lucide-react";
import type { User } from "@squadbase/nextjs";

const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: LucideHome,
  },
];

type Props = React.ComponentProps<typeof Sidebar> & {
  user: User | null;
};

export function AppSidebar({ user, ...props }: Props) {
  const pathname = usePathname();

  return (
    <div>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <div className="text-base font-semibold p-2">My Dashboard</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                      <a href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
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
      </Sidebar>
    </div>
  );
}
