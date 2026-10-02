import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { CavalryDocs } from "../src/docs.js";
import { createServer } from "../src/index.js";
import { splitPage, symbolFromHeading, type DocPage } from "../src/sections.js";
import { tokenize } from "../src/search.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const docs = CavalryDocs.fromSectionsFile(resolve(root, "data/sections.json"));

const page = (path: string, markdown: string): DocPage => ({
  url: `https://cavalry.studio/docs/${path}/`,
  path: `/docs/${path}/`,
  title: "Sample",
  breadcrumbs: ["Sample"],
  markdown,
});

test("splits at h2-h4, keeps deeper headings and fenced code inline", () => {
  const sections = splitPage(
    page(
      "tech-info/scripting/api-module",
      [
        "# Sample",
        "intro",
        "## Member Functions",
        "### Working with Layers",
        "#### create(layerType:string) → string",
        "Creates a layer.",
        "```js",
        "# not a heading",
        "```",
        "##### Note",
        "deep",
        "#### create(layerType:string) → string",
        "duplicate heading",
      ].join("\n"),
    ),
  );
  assert.deepEqual(
    sections.map((s) => s.id),
    [
      "tech-info/scripting/api-module",
      "tech-info/scripting/api-module#member-functions",
      "tech-info/scripting/api-module#working-with-layers",
      "tech-info/scripting/api-module#create",
      "tech-info/scripting/api-module#create-1",
    ],
  );
  const create = sections[3];
  assert.equal(create.symbol, "create");
  assert.equal(create.module, "api");
  assert.deepEqual(create.headingPath, ["Sample", "Member Functions", "Working with Layers", "create(layerType:string) → string"]);
  assert.match(create.content, /# not a heading/);
  assert.match(create.content, /##### Note\ndeep/);
});

test("symbols only come from code-like headings on scripting pages", () => {
  assert.equal(symbolFromHeading("getCompLayers(isTopLevel:bool) → [string]"), "getCompLayers");
  assert.equal(symbolFromHeading("index → int"), "index");
  assert.equal(symbolFromHeading("Introduction"), undefined);
  const nonScripting = splitPage(page("getting-started/requirements", "# Sample\n## macOS\ntext"));
  assert.equal(nonScripting[1].symbol, undefined);
});

test("tokenize splits camelCase but keeps the whole word", () => {
  assert.deepEqual(tokenize("getCompLayers"), ["getcomplayers", "get", "comp", "layers"]);
});

test("index covers every page and splits the API Module by function", () => {
  assert.equal(docs.pageCount, 534);
  const outline = docs.outline("tech-info/scripting/api-module")!;
  assert.ok(outline.filter((o) => o.symbol).length > 250);
  assert.ok(Math.max(...outline.map((o) => o.chars)) < 20000, "no API section should approach the 110k page size");
});

test("lookupSymbol resolves namespaced and bare names", () => {
  assert.equal(docs.lookupSymbol("api.create")[0].id, "tech-info/scripting/api-module#create");
  assert.equal(docs.lookupSymbol("ctx.index")[0].id, "tech-info/scripting/context-module#index");
  assert.equal(docs.lookupSymbol("getMagicEasing")[0].module, "api");
  assert.ok(docs.lookupSymbol("macOS").length === 0);
});

test("resolve accepts urls with anchors and page ids, and pages long content", () => {
  const byUrl = docs.resolve("https://cavalry.studio/docs/tech-info/scripting/api-module/#getMagicEasing");
  assert.equal(byUrl?.id, "tech-info/scripting/api-module#getmagiceasing");
  const wholePage = docs.resolve("tech-info/scripting/api-module")!;
  assert.ok(wholePage.content.length > 100000);
  const first = docs.read(wholePage, 0, 8000);
  assert.ok(first.text.length <= 8000 && first.nextOffset !== undefined);
  const second = docs.read(wholePage, first.nextOffset!, 8000);
  assert.equal(second.offset, first.nextOffset);
});

test("search ranks the obvious section first", () => {
  assert.equal(docs.search("getCompLayers")[0].id, "tech-info/scripting/api-module#getcomplayers");
  assert.equal(
    docs.search("lottie unsupported features")[0].id,
    "user-interface/menus/window-menu/render-manager/lottie-export#unsupported-features",
  );
  assert.ok(docs.search("ai automation claude", { area: "tips" })[0].id.startsWith("tips/ai-automation-with-claude"));
  assert.ok(docs.search("keyframe", { area: "scripting" }).every((h) => /^(tech-info\/scripting|web-player)/.test(h.id)));
});

test("MCP server exposes the tools end to end", async () => {
  const server = createServer(docs);
  const client = new Client({ name: "test", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ["get_outline", "lookup_api", "read_doc", "search_docs"]);

  const lookup = await client.callTool({ name: "lookup_api", arguments: { name: "api.connect" } });
  const lookupText = (lookup.content as { text: string }[])[0].text;
  assert.match(lookupText, /connect\(/);

  const read = await client.callTool({ name: "read_doc", arguments: { ref: "tech-info/scripting/api-module", max_chars: 2000 } });
  assert.match((read.content as { text: string }[])[0].text, /more: offset=/);

  const missing = await client.callTool({ name: "read_doc", arguments: { ref: "does/not/exist" } });
  assert.equal(missing.isError, true);
  await client.close();
});
