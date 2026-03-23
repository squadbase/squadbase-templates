import { lazy } from "react";
import type { LazyExoticComponent, ComponentType } from "react";

export interface RouteConfig {
  name: string;
  path: string;
  title: string;
  component: LazyExoticComponent<ComponentType>;
}

export const routes: RouteConfig[] = [
  {
    name: "home",
    path: "/",
    title: "Home",
    component: lazy(() => import("./pages/home")),
  },
];
