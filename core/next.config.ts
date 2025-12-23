import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    turbopackFileSystemCacheForDev: true,
    swcPlugins: [
      [
        "@squadbase/swc-plugin-component-annotate",
        {
          "source-file-attr": "data-component-id",
          "filepath-attr": "data-component-filepath",
          "ignored-components": [
            "components/ui/**",
            "app/**/layout.tsx",
            "app/**/page.tsx",
            "**/component-selector.tsx",
          ],
        },
      ],
    ],
  },
  reactCompiler: true,
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  serverExternalPackages: [
    "@duckdb/node-api",
    "@duckdb/node-bindings",
    "@duckdb/node-bindings-darwin-arm64",
    "@duckdb/node-bindings-darwin-x64",
  ],
  outputFileTracingIncludes: {
    "/*": [
      "node_modules/@duckdb/node-bindings-*",
      "node_modules/lightningcss/**",
      "node_modules/@tailwindcss/**",
    ],
  },
};

export default nextConfig;
