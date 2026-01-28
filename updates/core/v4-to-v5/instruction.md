## Remove shadcn MCP server from `.mcp.json`

Remove the `shadcn` entry from the `mcpServers` object in `.mcp.json`. Do not modify any other entries.

```json
"shadcn": {
  "command": "npx",
  "args": ["shadcn@latest", "mcp"]
}
```

## Simplify CLAUDE.md

Apply the following changes to `CLAUDE.md`:

### Remove MCP tool usage rules

Remove the following two lines from the rules section:

```markdown
- For Next.js implementation, use the `mcp__next-devtools__nextjs_docs` tool to gather accurate information.
- After implementation, use the `mcp__next-devtools__nextjs_runtime` tool to verify and check for errors.
```

### Simplify sidebar navigation rule

Replace:

```markdown
- ALWAYS add new pages to the side menu navigation. Every implemented page MUST be accessible from the sidebar.
```

With:

```markdown
- Every implemented page MUST be accessible from the sidebar.
```

### Remove "Data Fetching Strategy" subsection

Remove the entire "Data Fetching Strategy" subsection under "Component Organization", from the `### Data Fetching Strategy` heading down to (but not including) the `### Component Breakdown Guidelines` heading. This includes all sub-bullets, code examples, and the "Benefits" list.

### Remove `data-component-id` explanation paragraph

Remove the following paragraph that appears after the `data-component-id` code example:

```markdown
**Why:** React components don't forward unknown props to DOM; native HTML elements do. This ensures `data-component-id` reaches the browser.
```

### Remove "Development tips" section

Remove the entire "Development tips" section:

```markdown
## Development tips

- Use next-devtools MCP for Next.js docs and runtime information.
- Use shadcn MCP for finding documentation and code examples for shadcn components.
- Use context7 MCP for finding documentation and code examples for other packages/libraries.
- For chart implementation, see @docs/chart-implementation.md for best practices and checklist.
```

## Update template.json

Update the `version` field in `.squadbase/template.json` to `'5'`.

```json .squadbase/template.json
{
  "version": "5",
  "template-name": "<template-name>"
}
```
