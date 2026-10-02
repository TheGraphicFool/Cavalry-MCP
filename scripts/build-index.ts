// Builds data/sections.json from the raw docs dump (data/cavalry-docs.json).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { splitPages, type DocPage } from "../src/sections.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const input = resolve(root, process.argv[2] ?? "data/cavalry-docs.json");
const output = resolve(root, process.argv[3] ?? "data/sections.json");

const dump = JSON.parse(readFileSync(input, "utf8")) as { fetched?: string; pages: DocPage[] };
const sections = splitPages(dump.pages);
writeFileSync(output, JSON.stringify(sections));

const largest = Math.max(...sections.map((s) => s.content.length));
const symbols = sections.filter((s) => s.symbol).length;
console.log(
  `Indexed ${dump.pages.length} pages into ${sections.length} sections (${symbols} API symbols, largest ${largest} chars) -> ${output}`,
);
