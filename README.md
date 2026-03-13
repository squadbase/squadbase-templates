# Squadbase Templates

A collection of production-ready templates for [Squadbase](https://www.squadbase.dev).

## Squadbase

Squadbase is a platform for Vibe Coding for Business Intelligence (BI). It enables you to build business dashboards simply by interacting with an AI agent. As a fully cloud-based solution, Squadbase requires no infrastructure setup—get started creating dashboards in just minutes.

While Squadbase comes with several built-in data connections, this repository offers not just connections but more practical and ready-to-use templates. These templates are pre-configured dashboards designed for real business use cases and can be used right away by simply switching the data connection.

## Templates

| Template | Description |
|----------|-------------|
| [Core Template](./core/) | A core template for squadbase |
| [Vite Template](./vite/) | Full-stack template: Vite 6 + React 19 + Hono + TypeScript + Tailwind CSS v4 + shadcn/ui |

### Vite Template

A full-stack template combining a React 19 SPA with a Hono API server, with HMR enabled.

**Stack:** Vite 6 · React 19 · Hono · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query · Apache ECharts

**Commands:**

```bash
npm run dev      # Start dev server (HMR enabled)
npm run build    # Build client (dist/client/) and server (dist/server/)
npm run start    # Run production server
```

**Skills (AI agent guidelines):**

The `vite/skills/` directory contains agent instruction files for AI-assisted development. These are generated automatically from the source AGENTS.md files — do not edit them directly.

| File | Source | Description |
|------|--------|-------------|
| `vite/skills/frontend-development.md` | `vite/AGENTS.md` | React frontend development guidelines |
| `vite/skills/data-source-development.md` | `vite-server/AGENTS.md` | Data source and server development guidelines |

To sync skills files after updating an AGENTS.md:

```bash
npm run vite-prepublish
```

## Documentation

For detailed documentation on each template, refer to the AGENTS.md in the specific template directory.

For Squadbase platform documentation, visit [Squadbase Docs](https://www.squadbase.dev/en/docs).

## Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Support

- [Documentation](https://www.squadbase.dev/en/docs)
- [GitHub Issues](https://github.com/squadbase/squadbase-templates/issues)
