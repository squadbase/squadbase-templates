import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm"],
  target: "node18",
  splitting: false,
  sourcemap: false,
  clean: true,
  platform: "node",
  banner: {
    js: "#!/usr/bin/env node",
  },
});
