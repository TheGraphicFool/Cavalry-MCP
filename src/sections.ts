// Splits Cavalry documentation pages into heading-level sections so that
// clients can fetch one function or topic instead of a whole page
// (the API Module page alone is ~110k characters).

export interface DocPage {
  url: string;
  path: string;
  title: string;
  breadcrumbs: string[];
  markdown: string;
}

export interface Section {
  /** Stable id: "<page slug>#<anchor>", e.g. "tech-info/scripting/api-module#create". */
  id: string;
  pageId: string;
  url: string;
  pageTitle: string;
  breadcrumbs: string[];
  /** Headings from the page title down to this section. */
  headingPath: string[];
  level: number;
  heading: string;
  /** Scripting symbol for signature headings, e.g. "create" for "create(layerType:string, ...)". */
  symbol?: string;
  /** Scripting namespace of the page the symbol belongs to (api, cavalry, ctx, def, ui, render, web, webPlayer). */
  module?: string;
  content: string;
}

/** Headings at or above this level start a new section; deeper headings stay inline. */
const MAX_SPLIT_LEVEL = 4;

const MODULE_BY_PAGE: Record<string, string> = {
  "tech-info/scripting/api-module": "api",
  "tech-info/scripting/cavalry-module": "cavalry",
  "tech-info/scripting/context-module": "ctx",
  "tech-info/scripting/deformer-module": "def",
  "tech-info/scripting/script-uis": "ui",
  "tech-info/scripting/web-apis": "web",
  "tech-info/scripting/render-scripts": "render",
  "web-player/api": "webPlayer",
};

export function pageIdFromPath(path: string): string {
  const trimmed = path.replace(/^\/?docs\/?/, "").replace(/^\/+|\/+$/g, "");
  return trimmed === "" ? "index" : trimmed;
}

/** Docusaurus-style slug: lowercase, drop punctuation, spaces to hyphens. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

const SIGNATURE = /^([A-Za-z_$][\w$]*)\s*(?:\(|→|$)/;

/** Returns the function or property name if the heading looks like an API signature. */
export function symbolFromHeading(heading: string): string | undefined {
  const text = heading.replace(/`/g, "").trim();
  const match = SIGNATURE.exec(text);
  if (!match) return undefined;
  // Plain prose headings ("Introduction", "Quick Start") are single words too; only
  // accept them as symbols when they look like code (call/arrow or camelCase).
  const looksLikeCode = /[(→]/.test(text) || /^[a-z]+[A-Z]/.test(match[1]);
  return looksLikeCode ? match[1] : undefined;
}

export function splitPage(page: DocPage): Section[] {
  const pageId = pageIdFromPath(page.path);
  const module = MODULE_BY_PAGE[pageId];
  const sections: Section[] = [];
  const usedAnchors = new Map<string, number>();
  const stack: string[] = [page.title];

  let current: { level: number; heading: string; anchor: string; lines: string[]; path: string[] } = {
    level: 1,
    heading: page.title,
    anchor: "",
    lines: [],
    path: [page.title],
  };

  const flush = () => {
    const content = current.lines.join("\n").trim();
    const isPageTop = current.anchor === "";
    // Headings that only group child sections are kept (heading line only) so outlines stay complete.
    // Only scripting reference pages define symbols; elsewhere "macOS" etc. are just headings.
    const symbol = module && current.level > 1 ? symbolFromHeading(current.heading) : undefined;
    sections.push({
      id: isPageTop ? pageId : `${pageId}#${current.anchor}`,
      pageId,
      url: isPageTop ? page.url : `${page.url}#${current.anchor}`,
      pageTitle: page.title,
      breadcrumbs: page.breadcrumbs,
      headingPath: current.path,
      level: current.level,
      heading: current.heading,
      symbol,
      module: symbol ? module : undefined,
      content,
    });
  };

  let inFence = false;
  for (const line of page.markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const match = inFence ? null : /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (match && match[1].length <= MAX_SPLIT_LEVEL) {
      const level = match[1].length;
      const heading = match[2];
      if (level === 1) {
        // The page title; content under it belongs to the page-top section.
        current.lines.push(line);
        continue;
      }
      flush();
      stack.length = level - 1;
      stack[level - 1] = heading;
      const path = [page.title, ...stack.slice(1).filter((h) => h !== undefined)];
      const symbol = module ? symbolFromHeading(heading) : undefined;
      let anchor = symbol ? symbol.toLowerCase() : slugify(heading) || "section";
      const seen = usedAnchors.get(anchor) ?? 0;
      usedAnchors.set(anchor, seen + 1);
      if (seen > 0) anchor = `${anchor}-${seen}`;
      current = { level, heading, anchor, lines: [line], path };
    } else {
      current.lines.push(line);
    }
  }
  flush();
  return sections;
}

export function splitPages(pages: DocPage[]): Section[] {
  return pages.flatMap(splitPage);
}
