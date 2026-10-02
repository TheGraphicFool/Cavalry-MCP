# Cavalry-MCP

An MCP server that gives AI assistants **section-level access to the [Cavalry](https://cavalry.studio) documentation**. The 534 doc pages are split by heading into about 3,100 sections, so an assistant can fetch one function (`api.create`) or one topic (Lottie unsupported features) instead of a whole page. The API Module page alone is about 110k characters.

It complements Canva's official "Cavalry by Canva" MCP extension, which drives the app (Cavalry 2.8+). See [docs/mcp-design.md](docs/mcp-design.md).

## Tools
- `search_docs`: ranked search over sections, optionally limited to an area (`scripting`, `nodes`, `ui`, …).
- `read_doc`: read a section by id, page id or docs URL, paged for long content.
- `lookup_api`: full docs for a scripting symbol, e.g. `api.connect`, `ctx.index`, `cavalry.Path`.
- `get_outline`: list a page's sections, or list pages.

## Setup
The docs dump isn't committed, because this repo is public and the content belongs to Canva / Scene Group. Put a dump at `data/cavalry-docs.json`, shaped `{source, fetched, pageCount, pages:[{url, path, title, breadcrumbs, markdown}]}`, then:
```bash
npm install
npm run build      # compiles TypeScript and builds data/sections.json
npm test
```

Claude Desktop / Claude Code config:
```json
{
  "mcpServers": {
    "cavalry-docs": { "command": "node", "args": ["/absolute/path/to/Cavalry-MCP/dist/src/index.js"] }
  }
}
```

## Reference notes
- [docs/cavalry-research.md](docs/cavalry-research.md): features, workflows, and good and bad practice.
- [docs/cavalry-ui-reference.md](docs/cavalry-ui-reference.md): a condensed UI reference.

