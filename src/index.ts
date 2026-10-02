#!/usr/bin/env node
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { CavalryDocs, DEFAULT_MAX_CHARS } from "./docs.js";
import { AREAS, inArea } from "./search.js";
import { buildVocabulary, SCRIPT_CONTEXTS, validateScript, type ScriptContext } from "./validate.js";

export const VERSION = "0.2.0";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * The docs dump is private and never committed. Its location comes from, in order:
 * --docs <path>, the CAVALRY_DOCS environment variable, or <repo>/data/cavalry-docs.json (git-ignored).
 */
export function resolveDocsPath(argv: string[] = process.argv.slice(2), env = process.env): string {
  const flag = argv.indexOf("--docs");
  if (flag >= 0 && argv[flag + 1]) return resolve(argv[flag + 1]);
  if (env.CAVALRY_DOCS) return resolve(env.CAVALRY_DOCS);
  return resolve(root, "data/cavalry-docs.json");
}

const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});

function instructions(docs: CavalryDocs): string {
  return `Reference for Cavalry (cavalry.studio), the procedural 2D motion design app by Canva / Scene Group.
Docs snapshot: ${docs.pageCount} pages${docs.meta.fetched ? `, fetched ${docs.meta.fetched.slice(0, 10)}` : ""}.
The docs are split into heading-level sections: use search_docs or lookup_api, then read_doc on a section id.
Avoid reading whole pages. Before giving a user Cavalry JavaScript, run validate_script on it.
Scripting namespaces: api.* (JavaScript Editor, UI scripts and Render Scripts: create layers, set attributes,
connect, keyframe, render), cavalry.* (maths, noise, colour, Path/Mesh classes; everywhere), ctx.* (JavaScript
Layers only), def.* (JavaScript Deformer only), ui.* (script UIs), render.* (Render Queue Item scripts),
web (api.WebClient / api.WebServer methods), webPlayer (Web Player JS API for browsers).
Attribute paths are case-sensitive (e.g. "position.x", "material.materialColor"); cite section URLs in answers.`;
}

export function createServer(docs: CavalryDocs): McpServer {
  const server = new McpServer({ name: "cavalry-mcp", version: VERSION }, { instructions: instructions(docs) });
  const areaSchema = z.enum(Object.keys(AREAS) as [string, ...string[]]);
  const vocabulary = buildVocabulary(docs);

  server.registerTool(
    "search_docs",
    {
      title: "Search Cavalry docs",
      description:
        "Full-text search over heading-level sections of the Cavalry documentation. Returns section ids, titles, URLs and snippets; pass an id to read_doc for the text.",
      inputSchema: {
        query: z.string().min(1).describe("Search terms, e.g. 'duplicator distribution' or 'getCompLayers'."),
        area: areaSchema.optional().describe("Limit to one part of the docs."),
        limit: z.number().int().min(1).max(50).optional().describe("Maximum results (default 10)."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, area, limit }) => {
      const hits = docs.search(query, { area, limit });
      return text(hits.length ? hits : `No sections matched "${query}".`);
    },
  );

  server.registerTool(
    "read_doc",
    {
      title: "Read a Cavalry docs section",
      description:
        "Returns the markdown of one section. Accepts a section id from search_docs/get_outline (e.g. 'tech-info/scripting/api-module#create'), a page id (whole page), or a docs URL with optional #anchor. Long content is paged: call again with the returned offset.",
      inputSchema: {
        ref: z.string().min(1).describe("Section id, page id, or cavalry.studio/docs URL."),
        offset: z.number().int().min(0).optional().describe("Character offset to continue from."),
        max_chars: z.number().int().min(500).max(50000).optional().describe(`Characters to return (default ${DEFAULT_MAX_CHARS}).`),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ ref, offset, max_chars }) => {
      const section = docs.resolve(ref);
      if (!section) return { ...text(`No section found for "${ref}". Use search_docs or get_outline to find ids.`), isError: true };
      const chunk = docs.read(section, offset ?? 0, max_chars ?? DEFAULT_MAX_CHARS);
      const header = [
        `id: ${section.id}`,
        `url: ${section.url}`,
        `path: ${section.headingPath.join(" › ")}`,
        `chars: ${chunk.offset}-${chunk.offset + chunk.text.length} of ${chunk.totalChars}` +
          (chunk.nextOffset !== undefined ? ` (more: offset=${chunk.nextOffset})` : ""),
      ].join("\n");
      return text(`${header}\n\n${chunk.text}`);
    },
  );

  server.registerTool(
    "lookup_api",
    {
      title: "Look up a Cavalry scripting function",
      description:
        "Finds scripting API entries by name and returns their full documentation (signature, description, examples). Accepts 'create', 'api.create', 'ctx.index', 'cavalry.random', 'ui.add' etc. Falls back to partial name matches.",
      inputSchema: {
        name: z.string().min(1).describe("Function or property name, optionally prefixed with its namespace."),
        module: z
          .enum(["api", "cavalry", "ctx", "def", "ui", "render", "web", "webPlayer"])
          .optional()
          .describe("Restrict to one namespace."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ name, module }) => {
      const found = docs.lookupSymbol(name, module);
      if (found.length === 0) return { ...text(`No scripting entry named "${name}". Try search_docs with area "scripting".`), isError: true };
      const exact = found.every((s) => s.symbol!.toLowerCase() === found[0].symbol!.toLowerCase());
      if (!exact) {
        return text({
          note: `No exact match for "${name}"; partial matches:`,
          matches: found.map((s) => ({ id: s.id, module: s.module, heading: s.heading })),
        });
      }
      return text(
        found
          .map((s) => `## ${s.module}.${s.symbol}  (${s.id})\n${s.url}\n\n${docs.read(s, 0, 12000).text}`)
          .join("\n\n---\n\n"),
      );
    },
  );

  server.registerTool(
    "validate_script",
    {
      title: "Check a Cavalry script",
      description:
        "Statically checks Cavalry JavaScript against the indexed docs: flags api./cavalry./ctx./def./ui./render. members that are not documented (likely invented), wrong letter case, and namespaces that don't exist where the script will run (e.g. api.* inside a JavaScript Layer). Returns the signatures of every documented member used. It does not run the script.",
      inputSchema: {
        code: z.string().min(1).describe("The JavaScript source."),
        context: z
          .enum(Object.keys(SCRIPT_CONTEXTS) as [ScriptContext, ...ScriptContext[]])
          .optional()
          .describe("Where it runs: editor (JavaScript Editor/UI script, default), layer, deformer, render."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ code, context }) => text(validateScript(docs, code, context ?? "editor", vocabulary)),
  );

  server.registerTool(
    "get_outline",
    {
      title: "Outline Cavalry docs",
      description:
        "With 'page': lists that page's sections (ids, headings, sizes, API symbols). Without it: lists pages, optionally filtered by area.",
      inputSchema: {
        page: z.string().optional().describe("Page id or URL, e.g. 'tech-info/scripting/api-module'."),
        area: areaSchema.optional().describe("When listing pages, limit to one part of the docs."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ page, area }) => {
      if (page) {
        const outline = docs.outline(page);
        if (!outline) return { ...text(`No page found for "${page}".`), isError: true };
        return text(outline);
      }
      return text(docs.listPages((s) => inArea(s, area)));
    },
  );

  // Prompt templates: these show up in Claude's "+" / slash menu and encode the recommended workflow.
  const userPrompt = (body: string) => ({ messages: [{ role: "user" as const, content: { type: "text" as const, text: body } }] });

  server.registerPrompt(
    "cavalry_script",
    {
      title: "Write a Cavalry script",
      description: "Write Cavalry JavaScript for a task, grounded in the docs and checked with validate_script.",
      argsSchema: {
        task: z.string().describe("What the script should do."),
        context: z.string().optional().describe("editor (default), layer, deformer or render."),
      },
    },
    ({ task, context }) =>
      userPrompt(`Write Cavalry JavaScript for this task: ${task}
Execution context: ${context ?? "editor"} (JavaScript Editor / UI script unless stated).

Work like this:
1. Use lookup_api for every api./cavalry./ctx./ui. function you plan to call, and search_docs for the layer types and attribute paths involved (e.g. the node's docs page lists its attributes).
2. Write the script. Use exact, case-sensitive layer types and attribute paths from the docs. Prefer batching attribute changes in a single api.set call.
3. Run validate_script with the matching context and fix every error before answering.
4. Reply with: the script, how to run it (JavaScript Editor > Run Script, or save to the Scripts folder for a UI script), what it creates, and the docs URLs you relied on. Call out anything you could not confirm in the docs.`),
  );

  server.registerPrompt(
    "cavalry_explain",
    {
      title: "Explain a Cavalry feature",
      description: "Answer a how-to or concept question from the docs, with citations.",
      argsSchema: { question: z.string().describe("The question, e.g. 'how do I loop a pre-comp?'") },
    },
    ({ question }) =>
      userPrompt(`Answer this Cavalry question from the documentation: ${question}

Search with search_docs (try 2-3 phrasings, and an area filter where it helps), read the most relevant sections with read_doc, then answer with concrete steps (menus, attribute names, shortcuts). Quote attribute names exactly, mention version requirements from release notes when relevant, and link the section URLs you used. If the docs don't cover it, say so instead of guessing.`),
  );

  server.registerPrompt(
    "cavalry_setup_plan",
    {
      title: "Plan a procedural setup",
      description: "Design a Cavalry node/behaviour setup for a motion design goal, before building it.",
      argsSchema: { goal: z.string().describe("The animation or design to achieve.") },
    },
    ({ goal }) =>
      userPrompt(`Plan a Cavalry setup for: ${goal}

Use search_docs and read_doc to pick the layers involved (Shapes, Duplicator + Distribution, Behaviours, Falloffs, Utilities, Effects) and confirm each attribute you plan to connect. Give:
1. The layer list and what each does.
2. The connections (sourceLayer.attribute → targetLayer.attribute) and any keyframes.
3. Which values to expose for art direction (Control Centre / Pre-Comp Overrides).
4. Performance or export caveats from the docs (e.g. Lottie support, Skip Invisible Duplicates).
5. Optionally, a validated api.* script that builds it (run validate_script first).
Cite the docs URLs for each layer.`),
  );

  return server;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`cavalry-mcp ${VERSION}: MCP server for the Cavalry documentation (stdio).

Usage: node dist/src/index.js [--docs <path/to/cavalry-docs.json>] [--check]

  --docs   Location of the private docs dump. Defaults to $CAVALRY_DOCS, then data/cavalry-docs.json.
  --check  Load and index the docs, print a summary, and exit (use this to test your setup).`);
    process.exit(0);
  }
  const docsPath = resolveDocsPath(args);
  if (!existsSync(docsPath)) {
    console.error(
      `cavalry-mcp: docs dump not found at ${docsPath}.\nPass --docs <path>, set CAVALRY_DOCS, or place the file at data/cavalry-docs.json.`,
    );
    process.exit(1);
  }
  const docs = CavalryDocs.fromDumpFile(docsPath);
  const summary = `cavalry-mcp ${VERSION}: ${docs.sections.length} sections from ${docs.pageCount} pages (${docsPath}${docs.meta.fetched ? `, fetched ${docs.meta.fetched}` : ""})`;
  if (args.includes("--check")) {
    console.log(summary);
    console.log(`API symbols: ${docs.sections.filter((s) => s.symbol).length}`);
    process.exit(0);
  }
  await createServer(docs).connect(new StdioServerTransport());
  console.error(`${summary}; serving over stdio`);
}
