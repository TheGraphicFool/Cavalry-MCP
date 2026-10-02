import { readFileSync } from "node:fs";
import { SearchIndex, snippet } from "./search.js";
import { pageIdFromPath, splitPages, type DocPage, type Section } from "./sections.js";

export const DEFAULT_MAX_CHARS = 8000;

export interface SectionChunk {
  section: Section;
  text: string;
  offset: number;
  nextOffset?: number;
  totalChars: number;
}

export interface OutlineEntry {
  id: string;
  level: number;
  heading: string;
  chars: number;
  symbol?: string;
}

/** Heading-level access to the Cavalry docs: lookup by id/url, search, outlines and API symbols. */
export class CavalryDocs {
  readonly index: SearchIndex;
  private byId = new Map<string, Section>();
  private byPage = new Map<string, Section[]>();

  constructor(
    readonly sections: Section[],
    readonly meta: { fetched?: string; source?: string } = {},
  ) {
    this.index = new SearchIndex(sections);
    for (const s of sections) {
      this.byId.set(s.id, s);
      const list = this.byPage.get(s.pageId) ?? [];
      list.push(s);
      this.byPage.set(s.pageId, list);
    }
  }

  /** Loads a docs dump: {source, fetched, pages:[{url, path, title, breadcrumbs, markdown}]}. */
  static fromDumpFile(path: string): CavalryDocs {
    const dump = JSON.parse(readFileSync(path, "utf8")) as { source?: string; fetched?: string; pages: DocPage[] };
    if (!Array.isArray(dump.pages)) throw new Error(`${path} is not a Cavalry docs dump (no "pages" array).`);
    return new CavalryDocs(splitPages(dump.pages), { fetched: dump.fetched, source: dump.source });
  }

  get pageCount(): number {
    return this.byPage.size;
  }

  /**
   * Accepts a section id, a page id, or a docs URL/path with an optional #anchor.
   * A page reference resolves to the whole page (all its sections joined), for paged reading.
   */
  resolve(ref: string): Section | undefined {
    const trimmed = ref.trim();
    const [rawPath, anchor] = trimmed.replace(/^https?:\/\/[^/]+/, "").split("#");
    const pageId = this.byPage.has(rawPath) ? rawPath : pageIdFromPath(rawPath);
    if (anchor) return this.byId.get(`${pageId}#${anchor.toLowerCase()}`) ?? this.byId.get(trimmed);
    const page = this.byPage.get(pageId);
    if (!page) return undefined;
    return { ...page[0], content: page.map((s) => s.content).join("\n\n") };
  }

  /** Returns a section's text, paged by character offset so large sections stay within budget. */
  read(section: Section, offset = 0, maxChars = DEFAULT_MAX_CHARS): SectionChunk {
    const total = section.content.length;
    let end = Math.min(total, offset + maxChars);
    if (end < total) {
      // Prefer to break on a paragraph boundary.
      const breakAt = section.content.lastIndexOf("\n\n", end);
      if (breakAt > offset + maxChars / 2) end = breakAt;
    }
    return {
      section,
      text: section.content.slice(offset, end),
      offset,
      nextOffset: end < total ? end : undefined,
      totalChars: total,
    };
  }

  outline(pageRef: string): OutlineEntry[] | undefined {
    const top = this.resolve(pageRef);
    const list = top ? this.byPage.get(top.pageId) : undefined;
    return list?.map((s) => ({ id: s.id, level: s.level, heading: s.heading, chars: s.content.length, symbol: s.symbol }));
  }

  listPages(area?: (s: Section) => boolean): { id: string; title: string; breadcrumbs: string[] }[] {
    const pages: { id: string; title: string; breadcrumbs: string[] }[] = [];
    for (const [pageId, list] of this.byPage) {
      const top = list[0];
      if (area && !area(top)) continue;
      pages.push({ id: pageId, title: top.pageTitle, breadcrumbs: top.breadcrumbs });
    }
    return pages;
  }

  /** Finds scripting functions/properties by name, e.g. "create", "api.create" or "ctx.index". */
  lookupSymbol(name: string, module?: string): Section[] {
    let wanted = name.trim();
    const dotted = /^([A-Za-z]+)\.(.+)$/.exec(wanted);
    if (dotted && !module) {
      module = dotted[1];
      wanted = dotted[2];
    }
    wanted = wanted.replace(/\(.*$/, "").toLowerCase();
    const matches = (s: Section) => !!s.symbol && (!module || s.module === module);
    const exact = this.sections.filter((s) => matches(s) && s.symbol!.toLowerCase() === wanted);
    if (exact.length > 0) return exact;
    return this.sections.filter((s) => matches(s) && s.symbol!.toLowerCase().includes(wanted)).slice(0, 15);
  }

  search(query: string, options: { limit?: number; area?: string } = {}) {
    return this.index.search(query, options).map((hit) => ({
      id: hit.section.id,
      title: hit.section.headingPath.join(" › "),
      url: hit.section.url,
      chars: hit.section.content.length,
      score: Number(hit.score.toFixed(2)),
      snippet: snippet(hit.section.content, query),
    }));
  }
}
