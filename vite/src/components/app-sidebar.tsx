import { Link, useLocation, useSearchParams } from "react-router";
import { FileText, Home } from "lucide-react";
import { routes } from "@/routes";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { UserCard } from "@/components/user-card";

export function AppSidebar() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return (
    <Sidebar>
      <SidebarHeader className="h-12 shrink-0 justify-center border-b p-0 px-4">
        <span className="font-semibold text-sm">App</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((route) => {
                const isActive = location.pathname === route.path;
                return (
                  <SidebarMenuItem key={route.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={{ pathname: route.path, search: searchParams.toString() }}>
                        {route.path === "/" ? (
                          <Home className="size-4" />
                        ) : (
                          <FileText className="size-4" />
                        )}
                        <span>{route.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserCard />
      </SidebarFooter>
    </Sidebar>
  );
}
