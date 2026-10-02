import type { CavalryDocs } from "./docs.js";
import type { Section } from "./sections.js";

/** Where a script runs decides which namespaces exist (per the Cavalry scripting docs). */
export const SCRIPT_CONTEXTS = {
  editor: {
    label: "JavaScript Editor / UI script",
    allowed: ["api", "cavalry", "ui"],
  },
  layer: {
    label: "JavaScript Layer (Utility, Shape, Emitter, Modifier)",
    allowed: ["ctx", "cavalry"],
  },
  deformer: {
    label: "JavaScript Deformer",
    allowed: ["ctx", "cavalry", "def"],
  },
  render: {
    label: "Render Script (Render Queue Item)",
    allowed: ["render", "api", "cavalry"],
  },
} as const;

export type ScriptContext = keyof typeof SCRIPT_CONTEXTS;

const NAMESPACES = ["api", "cavalry", "ctx", "def", "ui", "render"];

const WHERE_AVAILABLE: Record<string, string> = {
  api: "the JavaScript Editor, UI scripts and Render Scripts",
  cavalry: "everywhere",
  ctx: "JavaScript Layers (Utility, Shape, Deformer, Emitter, Modifier)",
  def: "the JavaScript Deformer only",
  ui: "UI scripts run from the JavaScript Editor or Scripts menu",
  render: "Render Queue Item scripts only",
};

export interface ScriptIssue {
  line: number;
  column: number;
  severity: "error" | "warning" | "info";
  message: string;
  suggestions?: string[];
}

export interface ScriptReference {
  name: string;
  signature: string;
  id: string;
}

export interface ScriptReport {
  ok: boolean;
  context: string;
  issues: ScriptIssue[];
  references: ScriptReference[];
}

/** Replaces comments and string contents with spaces so positions are preserved. */
export function maskNonCode(code: string): string {
  let out = "";
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    const next = code[i + 1];
    if (c === "/" && next === "/") {
      while (i < code.length && code[i] !== "\n") out += " ", i++;
    } else if (c === "/" && next === "*") {
      const end = code.indexOf("*/", i + 2);
      const stop = end < 0 ? code.length : end + 2;
      for (; i < stop; i++) out += code[i] === "\n" ? "\n" : " ";
    } else if (c === '"' || c === "'" || c === "`") {
      out += c;
      i++;
      while (i < code.length && code[i] !== c) {
        if (code[i] === "\\") out += " ", i++;
        out += code[i] === "\n" ? "\n" : " ";
        i++;
      }
      if (i < code.length) out += c, i++;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

interface NamespaceVocabulary {
  /** Members with a reference entry, by lowercase name. */
  documented: Map<string, Section[]>;
  /** Members (usually classes like api.WebClient or ui.Button) only seen in prose or examples. */
  mentioned: Set<string>;
}

/** Builds the set of known members per namespace from the indexed scripting docs. */
export function buildVocabulary(docs: CavalryDocs): Map<string, NamespaceVocabulary> {
  const vocab = new Map<string, NamespaceVocabulary>();
  for (const ns of NAMESPACES) vocab.set(ns, { documented: new Map(), mentioned: new Set() });
  for (const s of docs.sections) {
    if (s.symbol && s.module && vocab.has(s.module)) {
      const list = vocab.get(s.module)!.documented.get(s.symbol.toLowerCase()) ?? [];
      list.push(s);
      vocab.get(s.module)!.documented.set(s.symbol.toLowerCase(), list);
    }
    if (!s.pageId.startsWith("tech-info/scripting") && !s.pageId.startsWith("nodes")) continue;
    for (const m of s.content.matchAll(/\b(api|cavalry|ctx|def|ui|render)\.([A-Za-z_$][\w$]*)/g)) {
      vocab.get(m[1])!.mentioned.add(m[2]);
    }
  }
  return vocab;
}

/**
 * Checks `ns.member` references in a script against the indexed docs: unknown members
 * (likely hallucinated) and namespaces that don't exist in the given execution context.
 */
export function validateScript(
  docs: CavalryDocs,
  code: string,
  context: ScriptContext,
  vocab = buildVocabulary(docs),
): ScriptReport {
  const allowed = SCRIPT_CONTEXTS[context].allowed as readonly string[];
  const issues: ScriptIssue[] = [];
  const references = new Map<string, ScriptReference>();
  const reportedNamespaces = new Set<string>();
  const masked = maskNonCode(code);
  const lineStarts = [0];
  for (let i = 0; i < masked.length; i++) if (masked[i] === "\n") lineStarts.push(i + 1);
  const position = (offset: number) => {
    let line = lineStarts.length - 1;
    while (lineStarts[line] > offset) line--;
    return { line: line + 1, column: offset - lineStarts[line] + 1 };
  };

  for (const m of masked.matchAll(/(?<![\w$.])(api|cavalry|ctx|def|ui|render)\s*\.\s*([A-Za-z_$][\w$]*)/g)) {
    const [, ns, member] = m;
    const at = position(m.index!);
    const name = `${ns}.${member}`;

    if (!allowed.includes(ns) && !reportedNamespaces.has(ns)) {
      reportedNamespaces.add(ns);
      issues.push({
        ...at,
        severity: "error",
        message: `${ns}.* is not available in a ${SCRIPT_CONTEXTS[context].label}; it exists in ${WHERE_AVAILABLE[ns]}.`,
      });
    }

    const words = vocab.get(ns)!;
    const documented = words.documented.get(member.toLowerCase());
    if (documented) {
      const exactCase = documented.find((s) => s.symbol === member);
      if (!exactCase) {
        issues.push({ ...at, severity: "error", message: `${name} has the wrong case; the API is case-sensitive.`, suggestions: [`${ns}.${documented[0].symbol}`] });
      }
      const s = exactCase ?? documented[0];
      references.set(name, { name: `${ns}.${s.symbol}`, signature: s.heading, id: s.id });
      continue;
    }
    if (words.mentioned.has(member)) {
      issues.push({ ...at, severity: "info", message: `${name} appears in the docs but has no reference entry; check its usage with search_docs.` });
      continue;
    }
    const candidates = [...words.documented.values()].map((list) => list[0].symbol!).concat([...words.mentioned]);
    const suggestions = [...new Set(candidates)]
      .map((c) => ({ c, d: editDistance(member.toLowerCase(), c.toLowerCase()) }))
      .map(({ c, d }) => {
        const lc = c.toLowerCase();
        const lm = member.toLowerCase();
        // "createLayer" -> "create": a real name that prefixes the invented one is a strong hint.
        const prefix = lc.length >= 3 && (lm.startsWith(lc) || lc.startsWith(lm));
        return { c, d: prefix ? Math.min(d, 1) : d, keep: prefix || d <= Math.max(2, Math.floor(c.length / 3)) || lc.includes(lm) };
      })
      .filter(({ keep }) => keep)
      .sort((a, b) => a.d - b.d || a.c.length - b.c.length)
      .slice(0, 3)
      .map(({ c }) => `${ns}.${c}`);
    issues.push({
      ...at,
      severity: "error",
      message: `${name} is not in the Cavalry docs; it may not exist.`,
      suggestions: suggestions.length ? suggestions : undefined,
    });
  }

  return {
    ok: !issues.some((i) => i.severity === "error"),
    context: SCRIPT_CONTEXTS[context].label,
    issues,
    references: [...references.values()],
  };
}
