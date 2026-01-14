## Fix Lint Command

The `next lint` command was deprecated in Next.js v16. Update the lint command in `package.json` to `eslint . --fix`.

## Remove Build Cache Directory Configuration for `next dev` Command

- In Next.js v16, build cache files are now generated under `.next/dev` when running `next dev`. This eliminates the need for the option to generate build cache in `.next-dev` during development.

If you have `distDir` configured in `next.config.ts` as shown below, remove the option.

```typescript next.config.ts
const nextConfig: NextConfig = {
  // other config options...
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  // other config options...
};
```

Remove `.next-dev` from your project directory if it exists.

## Update `eslint.config.mjs`

Run `npm install eslint@latest eslint-config-next@latest --save-dev` to update `eslint` and `eslint-config-next` to the latest version.

Update `eslint.config.mjs` to the following content. If you have configurations other than `eslint-config-next/typescript` and `eslint-config-next/core-web-vitals`, merge them accordingly.

```javascript eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

## Uninstall unnecessary packages

Uninstall `@eslint/eslintrc` as it is no longer needed.

```bash
npm uninstall @eslint/eslintrc
```

If you encounter issues with the migration, refer to the [ESLint Plugin documentation](https://nextjs.org/docs/app/api-reference/config/eslint.md).

## Update template.json

Update the `version` field in `.squadbase/template.json` to `'2'`.

```json .squadbase/template.json
{
  "version": "2",
  "template-name": "nextjs-dashboard-starter"
}
```
