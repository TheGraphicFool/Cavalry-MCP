# Cavalry-MCP

An MCP server that gives Claude (and other MCP clients) **accurate, section-level access to the [Cavalry](https://cavalry.studio) documentation**, and **checks Cavalry JavaScript** before you run it.

- **Section-level docs:** 534 pages split into 3,112 sections, so Claude reads one function (`api.connect`) or one topic (Lottie unsupported features) rather than whole pages. The API Module page alone is about 110k characters.
- **API lookup:** 607 scripting entries across `api`, `cavalry`, `ctx`, `def`, `ui`, `render`, `web` and `webPlayer`.
- **Script checking:** `validate_script` flags invented functions, wrong letter case, and namespaces used where they don't exist (e.g. `api.*` inside a JavaScript Layer).
- **Prompt templates** for writing scripts, explaining features, and planning procedural setups.
- **Private docs:** the docs dump stays on your machine and is never committed. Point the server at it with `--docs`.

It doesn't control Cavalry. Use it alongside Canva's official **Cavalry by Canva** MCP extension (Cavalry 2.8+), which does.

## Quick start
```bash
npm install && npm run build
node dist/src/index.js --docs /path/to/cavalry-docs.json --check
```
Then add it to Claude Desktop or Claude Code. See **[docs/SETUP.md](docs/SETUP.md)**.

## Documentation
| Guide | Contents |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Install, run, connect to Claude Desktop / Claude Code, troubleshooting |
| [docs/CAPABILITIES.md](docs/CAPABILITIES.md) | Every tool and prompt, what's indexed, limitations |
| [docs/PROMPTING.md](docs/PROMPTING.md) | Detailed prompting guide with recipes and a Claude Project template |
| [docs/mcp-design.md](docs/mcp-design.md) | Design notes and how this relates to the official Cavalry MCP |
| [docs/cavalry-research.md](docs/cavalry-research.md) | Cavalry features, workflows, good and bad practice |
| [docs/cavalry-ui-reference.md](docs/cavalry-ui-reference.md) | Condensed UI reference |

## Development
```bash
npm test     # 12 tests; the ones that need the docs dump are skipped if it isn't found (set CAVALRY_DOCS)
```
Source: `src/sections.ts` (heading splitter), `src/search.ts` (BM25), `src/docs.ts` (lookup and paging), `src/validate.ts` (script checker), `src/index.ts` (MCP server).
