"use client";

import * as React from "react";
import Image from "next/image";
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
import { LucideHome } from "lucide-react";

const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: LucideHome,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <div>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Image
              src="/assets/snowflake-logo.png"
              alt="Snowflake"
              width={24}
              height={24}
            />
            <div className="text-base font-semibold">Snowflake Starter</div>
          </div>
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
          <div className="flex items-center justify-end">
            <ModeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
