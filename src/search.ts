import type { Section } from "./sections.js";

/** Documentation areas a search can be narrowed to, keyed by page-id prefix. */
export const AREAS: Record<string, string[]> = {
  scripting: ["tech-info/scripting", "web-player"],
  nodes: ["nodes"],
  ui: ["user-interface"],
  "getting-started": ["getting-started"],
  "release-notes": ["tech-info/release-notes"],
  tips: ["tips"],
  applications: ["applications", "web-player"],
  "tech-info": ["tech-info"],
};

export type Area = keyof typeof AREAS;

export function inArea(section: Section, area: string | undefined): boolean {
  if (!area) return true;
  const prefixes = AREAS[area];
  if (!prefixes) return true;
  return prefixes.some((p) => section.pageId === p || section.pageId.startsWith(`${p}/`));
}

/** Lowercase word tokens, with camelCase split out as well as kept whole. */
export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  for (const word of text.match(/[\p{L}\p{N}_$]+/gu) ?? []) {
    const lower = word.toLowerCase();
    tokens.push(lower);
    const parts = word.split(/(?<=[a-z0-9])(?=[A-Z])|_/).filter(Boolean);
    if (parts.length > 1) for (const part of parts) tokens.push(part.toLowerCase());
  }
  return tokens;
}

interface Doc {
  section: Section;
  length: number;
  tf: Map<string, number>;
  headingTokens: Set<string>;
}

export interface SearchHit {
  section: Section;
  score: number;
}

const HEADING_WEIGHT = 3;
const K1 = 1.2;
const B = 0.75;

/** BM25 over section text, with heading words counted extra and exact symbol matches boosted. */
export class SearchIndex {
  private docs: Doc[];
  private df = new Map<string, number>();
  private avgLength: number;

  constructor(readonly sections: Section[]) {
    this.docs = sections.map((section) => {
      const headingTokens = tokenize([...section.breadcrumbs, ...section.headingPath].join(" "));
      const bodyTokens = tokenize(section.content);
      const tf = new Map<string, number>();
      for (const t of bodyTokens) tf.set(t, (tf.get(t) ?? 0) + 1);
      for (const t of headingTokens) tf.set(t, (tf.get(t) ?? 0) + HEADING_WEIGHT);
      for (const t of tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
      return {
        section,
        length: bodyTokens.length + headingTokens.length * HEADING_WEIGHT,
        tf,
        headingTokens: new Set(headingTokens),
      };
    });
    this.avgLength = this.docs.reduce((sum, d) => sum + d.length, 0) / Math.max(this.docs.length, 1);
  }

  search(query: string, options: { limit?: number; area?: string } = {}): SearchHit[] {
    const terms = [...new Set(tokenize(query))];
    if (terms.length === 0) return [];
    const n = this.docs.length;
    const rawQuery = query.trim().toLowerCase().replace(/^(api|cavalry|ctx|def|ui)\./, "");
    const hits: SearchHit[] = [];
    for (const doc of this.docs) {
      if (!inArea(doc.section, options.area)) continue;
      let score = 0;
      let matched = 0;
      for (const term of terms) {
        const freq = doc.tf.get(term);
        if (!freq) continue;
        matched++;
        const df = this.df.get(term) ?? 0;
        const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
        score += (idf * freq * (K1 + 1)) / (freq + K1 * (1 - B + (B * doc.length) / this.avgLength));
      }
      if (matched === 0) continue;
      score *= matched / terms.length;
      if (doc.section.symbol && doc.section.symbol.toLowerCase() === rawQuery) score *= 3;
      hits.push({ section: doc.section, score });
    }
    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, options.limit ?? 10);
  }
}

/** A short excerpt around the first query term found in the section body. */
export function snippet(content: string, query: string, maxLength = 240): string {
  const body = content.replace(/^#{1,6} .*\n?/, "").replace(/\s+/g, " ").trim();
  const lower = body.toLowerCase();
  let at = -1;
  for (const term of tokenize(query)) {
    at = lower.indexOf(term);
    if (at >= 0) break;
  }
  const start = Math.max(0, at < 0 ? 0 : at - 60);
  const text = body.slice(start, start + maxLength);
  return `${start > 0 ? "…" : ""}${text}${start + maxLength < body.length ? "…" : ""}`;
}
