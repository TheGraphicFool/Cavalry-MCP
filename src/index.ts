#!/usr/bin/env node
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { CavalryDocs, DEFAULT_MAX_CHARS } from "./docs.js";
import { AREAS, inArea } from "./search.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export function loadDocs(): CavalryDocs {
  const sectionsFile = process.env.CAVALRY_DOCS_SECTIONS ?? resolve(root, "data/sections.json");
  if (existsSync(sectionsFile)) return CavalryDocs.fromSectionsFile(sectionsFile);
  return CavalryDocs.fromDumpFile(process.env.CAVALRY_DOCS_DUMP ?? resolve(root, "data/cavalry-docs.json"));
}

const INSTRUCTIONS = `Reference for Cavalry (cavalry.studio), the procedural 2D motion design app.
The docs are split into heading-level sections. Prefer search_docs or lookup_api and then read_doc on a
section id, rather than reading whole pages. Scripting namespaces: api.* (JavaScript Editor / UI scripts
only: create layers, set attributes, connect, keyframe, render), cavalry.* (utilities and Path/Mesh
classes, everywhere), ctx.* (JavaScript layers only), def.* (JavaScript Deformer only), ui.* (script UIs),
render (Render Script objects), webPlayer (Web Player JS API).`;

const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});

export function createServer(docs: CavalryDocs): McpServer {
  const server = new McpServer({ name: "cavalry-mcp", version: "0.1.0" }, { instructions: INSTRUCTIONS });
  const areaSchema = z.enum(Object.keys(AREAS) as [string, ...string[]]);

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
        "Returns the markdown of one section. Accepts a section id from search_docs/get_outline (e.g. 'tech-info/scripting/api-module#create'), a page id, or a docs URL with optional #anchor. Long sections are paged: call again with the returned nextOffset.",
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
        "Finds scripting API entries by name and returns their full documentation (signature, description, examples). Accepts 'create', 'api.create', 'ctx.index', 'cavalry.Path' etc. Falls back to partial name matches.",
      inputSchema: {
        name: z.string().min(1).describe("Function or property name, optionally prefixed with its namespace."),
        module: z.enum(["api", "cavalry", "ctx", "def", "ui", "render", "webPlayer"]).optional().describe("Restrict to one namespace."),
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

  return server;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const docs = loadDocs();
  const server = createServer(docs);
  await server.connect(new StdioServerTransport());
  console.error(`cavalry-mcp: serving ${docs.sections.length} sections from ${docs.pageCount} pages over stdio`);
}
