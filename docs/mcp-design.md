# Cavalry-MCP: Design Notes

## What already exists (Cavalry 2.8, 30 Sep 2026)
The official docs page "AI Automation with Claude" (`tips/ai-automation-with-claude`) describes Canva's own MCP integration:
- **Cavalry by Canva** is a local MCP server, shipped as `cavalry-mcp-server.zip`. You unzip it into Claude Desktop's Extensions folder and enable it in Claude's settings. A directory connector is "coming soon".
- Cavalry has to opt in with **Preferences > MCP Server > Enable MCP Server**. A **MCP Server Port** preference sets the local port the extension talks to.
- **Scope:** Claude only. Cavalry and Claude must both be running. It needs macOS Big Sur 11+ for Claude and is not available in China.
- **Advertised uses:** bulk edits (e.g. connect a Value to every Rectangle's Corner Radius), renaming layers from their content, and generating reusable **script UIs** saved to the Scripts folder.
- **Not documented:** the tool list, and the protocol between the extension and Cavalry's port.

So driving Cavalry from Claude is already Canva's job. This project should do what that server doesn't, or can't, do well.

## What Cavalry-MCP does now: section-level docs access
An agent writing Cavalry scripts needs exact API signatures, attribute paths and caveats. The scripting reference is huge: `api-module` is about 110k characters and `script-uis` about 71k. Serving whole pages wastes context, so this server:

1. **Indexes a local dump of the official docs** (`data/cavalry-docs.json`, which is not committed; the one used here had 534 pages, fetched 2026-10-02) into **3,112 heading-level sections**. It splits at h2–h4. h5 and h6 headings and fenced code stay inside their section, so `#` lines in code are never treated as headings.
2. **Recognises scripting symbols** on the scripting reference pages (`api`, `cavalry`, `ctx`, `def`, `ui`, `render`, `web` and `webPlayer` namespaces): **607 symbols**, each its own section, with the anchor set to the lowercase function name (e.g. `api-module#getmagiceasing`, which matches how the release notes link to it).
3. **Exposes five read-only tools and three prompt templates.** The full list is in [CAPABILITIES.md](CAPABILITIES.md).

| Tool | Purpose |
|---|---|
| `search_docs(query, area?, limit?)` | BM25 search over sections. Heading and breadcrumb words carry extra weight, camelCase is split, and an exact symbol match is boosted. Areas: scripting, nodes, ui, getting-started, release-notes, tips, applications, tech-info. |
| `read_doc(ref, offset?, max_chars?)` | One section, by section id, page id (returns the whole page) or docs URL with `#anchor`. Paged by character offset, breaking at paragraph boundaries; the default is 8,000 characters. |
| `lookup_api(name, module?)` | `api.create`, `ctx.index`, `getMagicEasing`… returns the full entry (signature, text, examples). Falls back to partial matches. |
| `get_outline(page?, area?)` | A page's section list (ids, sizes, symbols), or the list of pages. |
| `validate_script(code, context?)` | Static check against the docs: invented members, wrong case, and namespaces used outside their context. Raises one error across the docs' 397 examples, and that one is correct. |

The largest single section is now about 35k characters (the Context concepts intro), versus 110k for a whole page. Paging covers the rest.

## Possible next phase: live control (not built)
Only worth doing where it adds something to the official extension. Options:
- **A. Docs only (current).** Use it alongside "Cavalry by Canva" in the same Claude session: the official server acts, this one supplies accurate API knowledge. Lowest risk and no overlap.
- **B. Own bridge for ≤ 2.7 and other MCP clients.** Add a Cavalry UI script that runs `api.WebServer` on localhost and executes posted JS, plus `run_script`, `get_scene` and `render_frame` tools. This is the pattern used by community bridges and Stallion. Use a port other than 8080 (Stallion uses it) and other than the MCP Server Port. Run raw-script execution behind an opt-in flag, and use a revision check so the agent doesn't overwrite edits a person is making at the same time. **This can't be tested in this cloud container (no Cavalry), so it needs a local test pass.**
- **C. Script and tool authoring helpers** (*done in 0.2: `validate_script` plus prompt templates*) that need no live connection: lint generated scripts against the indexed API (unknown `api.*` calls, `api.` used inside JS Layers where only `ctx.` and `cavalry.` exist), and templates for script UIs, render scripts and SkSL.

**Status:** A and C are built. **B** is still open. It builds directly on the index and supports the official server's "create a custom tool" use case. Only take on **B** if users on older versions, or clients other than Claude, need it.

## Docs privacy
The docs dump is never committed. The server reads it at startup from `--docs`, `CAVALRY_DOCS`, or the git-ignored `data/cavalry-docs.json`, and indexes it in memory in about 0.4 s. To update, replace the file and restart Claude.
