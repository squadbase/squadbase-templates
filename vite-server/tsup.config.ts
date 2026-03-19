import { defineConfig } from "tsup";
import { globSync } from "glob";
import path from "node:path";

const connectorEntries = Object.fromEntries(
  globSync("src/connectors/entries/*.ts").map((f) => [
    `connectors/${path.basename(f, ".ts")}`,
    f,
  ]),
);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    main: "src/main.ts",
    "types/data-source": "src/types/data-source.ts",
    "vite-plugin": "src/vite-plugin.ts",
    ...connectorEntries,
  },
  format: ["esm"],
  dts: true,
  target: "node18",
  splitting: false,
  sourcemap: false,
  clean: true,
  platform: "node",
  external: [
    "pg",
    "snowflake-sdk",
    "@google-cloud/bigquery",
    "mysql2",
    "mysql2/promise",
    "@aws-sdk/client-athena",
    "@aws-sdk/client-redshift-data",
    "@databricks/sql",

    "@google-analytics/data",
    "@kintone/rest-api-client",
    "@squadbase/connectors",
    "@squadbase/connectors/sdk",
    "hono",
    "@hono/node-server",
    "@hono/vite-build",
    "@hono/vite-build/node",
    "@hono/vite-dev-server",
    "@hono/vite-dev-server/node",
    "vite",
  ],
});
