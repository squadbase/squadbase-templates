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
import { BarChart3, TrendingUp, Layers, Home } from "lucide-react";

const allMenuItems = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "CV Page Analysis",
    url: "/cv-page-analysis",
    icon: TrendingUp,
  },
  {
    title: "Channel Engagement",
    url: "/channel-engagement",
    icon: BarChart3,
  },
  {
    title: "Channel Page Breakdown",
    url: "/channel-page-breakdown",
    icon: Layers,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const isConfigured = !!process.env.GA_SERVICE_ACCOUNT_JSON_BASE64;
  const menuItems = isConfigured
    ? allMenuItems.filter(item => item.url !== "/home")
    : allMenuItems;

  return (
    <div>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <Image
              src="/ga-logo.png"
              alt="Google Analytics"
              width={136}
              height={24}
              className="object-contain"
            />
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
