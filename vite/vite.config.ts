import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import devServer from "@hono/vite-dev-server";
import nodeAdapter from "@hono/vite-dev-server/node";
import build from "@hono/vite-build/node";

export default defineConfig(({ command, mode }) => {
  // サーバービルド: vite build（デフォルト mode = production）
  if (command === "build" && mode !== "client") {
    return {
      build: { target: "node20" },
      plugins: [
        build({
          entry: "./server/main.ts",
          outputDir: "./dist/server",
          output: "index.js",
          port: 3285,
          external: ["pg", "@google-cloud/bigquery", "snowflake-sdk"],
        }),
      ],
    };
  }

  // 開発 + クライアントビルド: vite dev / vite build --mode client
  return {
    plugins: [
      command === "serve" &&
        devServer({
          entry: "./server/index.ts",
          adapter: nodeAdapter,
          exclude: [
            // Vite 内部・静的アセット（デフォルトのまま）
            /.*\.css$/,
            /.*\.ts$/,
            /.*\.tsx$/,
            /^\/@.+$/,
            /\?t\=\d+$/,
            /^\/favicon\.ico$/,
            /^\/static\/.+/,
            /^\/node_modules\/.*/,
            // /api/* 以外はすべて Vite へ
            /^(?!\/api)/,
          ],
        }),
      react(),
      tailwindcss(),
    ].filter(Boolean),
    build: { outDir: "dist/client" },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 3280,
      allowedHosts: [".vercel.run"],
    },
  };
});
