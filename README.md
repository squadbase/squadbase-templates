# Squadbase Templates

A collection of production-ready templates for [Squadbase](https://www.squadbase.dev).

## Squadbase

Squadbase is a platform for Vibe Coding for Business Intelligence (BI). It enables you to build business dashboards simply by interacting with an AI agent. As a fully cloud-based solution, Squadbase requires no infrastructure setup—get started creating dashboards in just minutes.

While Squadbase comes with several built-in data connections, this repository offers not just connections but more practical and ready-to-use templates. These templates are pre-configured dashboards designed for real business use cases and can be used right away by simply switching the data connection.

## Templates

| Template | Description |
|----------|-------------|
| [Core Template](./core/) | A core template for squadbase |
| [Vite Template](./vite/) | Full-stack template: Vite 8 + React 19 + @squadbase/vite-server + TypeScript + Tailwind CSS v4 + shadcn/ui |

### Vite Template

A full-stack template combining a React 19 SPA with a @squadbase/vite-server backend, with HMR enabled.

**Stack:** Vite 8 · React 19 · @squadbase/vite-server · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query · Apache ECharts

> **@squadbase/vite-server** — A Hono-based backend server that manages and executes SQL/TypeScript server logics with automatic file-change reloading.

**Commands:**

```bash
npm run dev      # Start dev server (HMR enabled)
npm run build    # Build client (dist/client/) and server (dist/server/)
npm run start    # Run production server
```

**Skills (AI agent guidelines):**

The canonical source for skill files is `skills/source/squadbase-vite-react/`, published as [`@squadbase/skills`](https://www.npmjs.com/package/@squadbase/skills). The `vite/skills/` directory is a copy — do not edit it directly.

| Skill | Source | Description |
|-------|--------|-------------|
| `frontend-development` | `skills/source/squadbase-vite-react/frontend-development/SKILL.md` | React frontend development guidelines |
| `server-logic-development` | `skills/source/squadbase-vite-react/server-logic-development/SKILL.md` | Server logic development guidelines |
| `component-generation` | `skills/source/squadbase-vite-react/component-generation/SKILL.md` | TSX component generation rules for buildPageSection |

To sync skill files to `vite/skills/`:

```bash
cd vite && npx @squadbase/skills --clean
```

## Documentation

For detailed documentation on each template, refer to the skill files in `skills/source/`.

For Squadbase platform documentation, visit [Squadbase Docs](https://www.squadbase.dev/en/docs).

## Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Support

- [Documentation](https://www.squadbase.dev/en/docs)
- [GitHub Issues](https://github.com/squadbase/squadbase-templates/issues)
