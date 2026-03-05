import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { squadbasePlugin } from "@squadbase/vite-server/plugin";

export default defineConfig(({ command, mode }) => {
  // サーバービルド: vite build（デフォルト mode = production）
  if (command === "build" && mode !== "client") {
    return {
      build: { target: "node20" },
      plugins: [squadbasePlugin()],
    };
  }

  // 開発 + クライアントビルド: vite dev / vite build --mode client
  return {
    plugins: [react(), squadbasePlugin(), tailwindcss()],
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
