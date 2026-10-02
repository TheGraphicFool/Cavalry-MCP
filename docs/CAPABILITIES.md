# Capabilities

Cavalry-MCP is a **knowledge and verification server** for Cavalry, the procedural 2D motion design app. It gives Claude accurate, citable access to the official documentation and checks Cavalry JavaScript before you run it.

## What's indexed
- The official docs from a private local dump: **534 pages**, split at h2–h4 headings into **3,112 sections**. Code blocks are never split.
- **607 scripting symbols**, one section each, so a lookup returns a single function rather than a whole page:

| Namespace | Entries | Where it works in Cavalry |
|---|---|---|
| `api.*` | 305 | JavaScript Editor, UI scripts, Render Scripts: create layers, set/get attributes, connect, keyframe, render, files, palettes… |
| `cavalry.*` | 135 | Everywhere: maths, noise/random, colour, `Path`/`Mesh`/`Point`/`Matrix` classes |
| `ui.*` | 56 | Script UIs: widgets (`ui.Button`, `ui.Slider`…), layouts, callbacks |
| `webPlayer` | 53 | Web Player (browser) JS API |
| `def.*` | 17 | JavaScript Deformer only |
| `ctx.*` | 12 | JavaScript Layers only (`ctx.index`, `ctx.count`…) |
| `web` / `render` | 26 / 3 | `api.WebClient` / `api.WebServer` methods; Render Queue Item scripts |

- **Search areas:** `scripting`, `nodes` (every Shape, Behaviour, Utility, Effect, Deformer), `ui` (menus, windows, editors), `getting-started` (key concepts), `release-notes` (1.0 → 2.8), `tips`, `applications` (Player, Web Player), `tech-info`.

## Tools
All tools are read-only. None of them touch Cavalry or your files.

### `search_docs(query, area?, limit?)`
Ranked full-text search over sections. Heading and breadcrumb words count extra, camelCase is split (`getCompLayers` → get, comp, layers), and an exact function name gets a boost. Each result has the section id, title path, URL, size and a snippet.

### `read_doc(ref, offset?, max_chars?)`
Reads one section. `ref` can be:
- a section id (`tech-info/scripting/api-module#connect`)
- a page id (`nodes/shapes/duplicator`), which returns the whole page
- a docs URL with an anchor (`https://cavalry.studio/docs/tech-info/scripting/api-module/#getmagiceasing`)

Content over `max_chars` (default 8,000) is paged on paragraph boundaries; the response gives the `offset` to continue from.

### `lookup_api(name, module?)`
Returns the full reference entry (signature, description, examples) for `api.create`, `create`, `ctx.index`, `cavalry.random`, `ui.add`, and so on. If there's no exact match, it lists partial matches.

### `validate_script(code, context?)`
A static check of Cavalry JavaScript against the docs. **It doesn't run anything.** It reports:
- **Invented members**, e.g. `api.createLayer`, with suggestions from the real API.
- **Wrong letter case**, e.g. `api.getcomplayers` → `api.getCompLayers`. The API is case-sensitive.
- **Namespaces used where they don't exist:**

  | Context | Namespaces allowed |
  |---|---|
  | `editor` (default) | `api`, `cavalry`, `ui` |
  | `layer` | `ctx`, `cavalry` |
  | `deformer` | `ctx`, `cavalry`, `def` |
  | `render` | `render`, `api`, `cavalry` |

- **Signatures and section ids** for every documented call, so Claude can check the arguments.

Comments and strings are ignored. Across all 397 code examples in the official scripting docs, the checker raised one error, and that one is correct: an example that uses `def.*` outside a Deformer.

### `get_outline(page?, area?)`
Lists a page's sections (ids, levels, sizes, symbols), or lists pages, optionally by area. Use it to browse when you don't know what to search for.

## Prompt templates
These are reusable workflows. In Claude Desktop they're in the **+** menu; in Claude Code they're slash commands.

| Prompt | Arguments | What it does |
|---|---|---|
| `cavalry_script` | `task`, `context?` | Looks up every function, writes the script, runs `validate_script`, fixes errors, then gives the script, run instructions and sources |
| `cavalry_explain` | `question` | Searches with several phrasings, reads the right sections, and answers with steps and citations (or says the docs don't cover it) |
| `cavalry_setup_plan` | `goal` | Designs a node/behaviour setup: layers, connections, exposed controls, performance and export caveats, and optionally a script that builds it |

## Good uses
- Writing **JavaScript Editor scripts and UI tools** with real function names and attribute paths.
- Writing **expressions** for JavaScript Utility, Shape, Deformer, Emitter and Modifier layers, with the right `ctx`/`def` rules.
- **How-to answers** with menu paths, shortcuts and attribute names, linked to the docs.
- **Checking scripts** that came from Claude, Canva's Cavalry MCP, forums or teammates before running them.
- **Planning procedural setups**: Duplicator and Distribution, Behaviours, Falloffs, data-driven rendering, Lottie-safe animation.
- **Version questions**: when a feature or API function was added (release notes 1.0–2.8).

## Limitations
- **It doesn't control Cavalry.** It can't see your scene, create layers or render. For that, use Canva's **Cavalry by Canva** MCP extension (Cavalry 2.8+) in the same Claude session; see [SETUP.md](SETUP.md).
- **It's only as current as your dump.** Refresh the dump for newer releases.
- **`validate_script` checks names and context, not logic.** It doesn't check argument types or counts, layer type strings, attribute paths inside `api.set({...})`, or methods on variables (e.g. `myButton.onClick`). Claude should confirm those with `lookup_api` and `search_docs`, and the script still needs a test run in Cavalry.
- **Some docs anchors are best guesses.** Section URLs use the docs' anchor style (lowercase function name or heading slug), and a few may not match the live site exactly.
