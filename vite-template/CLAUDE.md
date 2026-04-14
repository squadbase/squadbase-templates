# CLAUDE.md — vite-template

CLI tool (`@squadbase/vite-template`) for initializing and customizing Squadbase Vite projects. Zero runtime dependencies — uses only Node.js built-ins.

## Directory Structure

```
vite-template/
├── src/
│   ├── index.ts              # CLI entry — parseArgs + command routing
│   ├── commands/
│   │   ├── init.ts           # init command — copies base-template/ to cwd
│   │   ├── add.ts            # add command — validates project, loads manifest, calls apply
│   │   └── list.ts           # list command — reads templates/ and shows manifests
│   ├── apply.ts              # File copying + routes.tsx patching
│   ├── manifest.ts           # Type definitions (TemplateManifest, FileEntry, RouteEntry) + loader
│   └── logger.ts             # ANSI color logging
├── templates/                # Template data shipped in npm package
│   └── <template-name>/
│       ├── manifest.json
│       ├── pages/
│       └── components/
├── base-template/            # Build-time copy of ../vite/ (gitignored)
├── tsup.config.ts            # Bundles to dist/index.js with #!/usr/bin/env node banner
├── tsconfig.json
├── package.json
├── .gitignore
└── .npmignore
```

## Build Process

`npm run build` does two things in sequence:

1. **`sync-base`** — `rsync -a --delete ../vite/ base-template/` (excluding node_modules, dist, package-lock.json, *.tsbuildinfo, *.log)
2. **`tsup`** — Bundles `src/index.ts` into `dist/index.js` (single ESM file with shebang)

### What gets published to npm

- `dist/` — Compiled CLI
- `templates/` — Template data (pages, components, manifest.json)
- `base-template/` — Full copy of the Vite base project (for `init` command)

### Path resolution

tsup bundles everything into a single `dist/index.js`, so `__dirname` always resolves to `dist/`. Asset directories are resolved one level up:

- `join(__dirname, "..", "templates")` → `vite-template/templates/`
- `join(__dirname, "..", "base-template")` → `vite-template/base-template/`

## Development Commands

```bash
npm run build      # Sync base template from ../vite/ + build with tsup
npm run release    # Publish to npm (@squadbase:registry)
```

## How routes.tsx Patching Works

The `add` command patches `src/routes.tsx` using string manipulation (not AST):

1. Reads `src/routes.tsx`
2. Checks for duplicate routes by matching `name: "<name>"` pattern
3. Finds the last `];` in the file (routes array closing)
4. Inserts new `lazy(() => import(...))` entries before `];`

This works because `routes.tsx` has a fixed structure managed by Squadbase templates.

## Adding a New Template

**テンプレートは原則 1 ルート**: `routes[]` は空にし、追加ルートは作らない。UI ロジックは適切にコンポーネントに分割すること（`components/` 配下に配置し、`manifest.json` の `files[]` に `action: "add"` で追加）。ユーザーがルートを追加する起点は `home.tsx` とし、テンプレート自体でルートを増やさない設計にすること。

1. Create `templates/<name>/` directory
2. Add a `manifest.json` with `name`, `description`, `version`, `files[]` (home.tsx + any component files with `action: "add"`), and `routes[]` (empty)
3. Add `pages/home.tsx` as the entry point, splitting large UI blocks into `components/` as appropriate
4. Test with `node dist/index.js add <name> --dry-run` from a Vite project directory

## Design Guidelines

See [DESIGN.md](./DESIGN.md) for UI/UX design guidelines for building dashboards and data apps with this template. Follow these guidelines when creating or modifying template pages and components.
