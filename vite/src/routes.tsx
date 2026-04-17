import { lazy } from "react";
import type { LazyExoticComponent, ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { Home } from "lucide-react";

export interface RouteConfig {
  name: string;
  path: string;
  title: string;
  component: LazyExoticComponent<ComponentType>;
  icon?: LucideIcon;
}

export const routes: RouteConfig[] = [
  {
    name: "home",
    path: "/",
    title: "Home",
    icon: Home,
    component: lazy(() => import("./pages/home")),
  },
];
