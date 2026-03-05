import buildPlugin from "@hono/vite-build/node";
import devServer from "@hono/vite-dev-server";
import nodeAdapter from "@hono/vite-dev-server/node";
import type { Plugin, ConfigEnv } from "vite";
import { setViteServer } from "./registry.ts";

interface SquadbasePluginOptions {
  buildEntry?: string;
  devEntry?: string;
  port?: number;
  external?: string[];
  exclude?: RegExp[];
}

const DEFAULT_EXCLUDE: RegExp[] = [
  /.*\.css$/,
  /.*\.ts$/,
  /.*\.tsx$/,
  /^\/@.+$/,
  /\?t\=\d+$/,
  /^\/favicon\.ico$/,
  /^\/static\/.+/,
  /^\/node_modules\/.*/,
  /^(?!\/api)/,
];

export function squadbasePlugin(options: SquadbasePluginOptions = {}): Plugin[] {
  const {
    buildEntry = "@squadbase/vite-server/main",
    devEntry = "@squadbase/vite-server",
    port = 3285,
    external = ["pg", "@google-cloud/bigquery", "snowflake-sdk"],
    exclude = DEFAULT_EXCLUDE,
  } = options;

  const isServerBuild = (_: unknown, { command, mode }: ConfigEnv) =>
    command === "build" && mode !== "client";

  const rawBuildPlugin = buildPlugin({
    entry: buildEntry,
    outputDir: "./dist/server",
    output: "index.js",
    port,
    external,
  });

  const rawDevServerPlugin = devServer({
    entry: devEntry,
    adapter: nodeAdapter,
    exclude,
  });

  const buildPlugins = (Array.isArray(rawBuildPlugin) ? rawBuildPlugin : [rawBuildPlugin]).map(
    (p) => ({ ...p, apply: isServerBuild }) as Plugin,
  );

  const devPlugins = (Array.isArray(rawDevServerPlugin) ? rawDevServerPlugin : [rawDevServerPlugin]).map(
    (p) => ({ ...p, apply: "serve" as const }) as Plugin,
  );

  const viteServerInjectionPlugin: Plugin = {
    name: "squadbase-vite-server-injection",
    apply: "serve",
    configureServer(server) {
      setViteServer(server);
    },
  };

  return [...buildPlugins, ...devPlugins, viteServerInjectionPlugin];
}
