/**
 * Pure code transformations used by the legacy CMS extraction.
 *
 * The legacy CMS stored JavaScript bodies as strings and evaluated them at runtime with a set of
 * implicit globals. These helpers rewrite such bodies into TypeScript module source that receives
 * the same values as explicit function parameters. They never execute the code.
 */

export interface ConversionWarning {
  code: string;
  message: string;
}

/** Converts a CMS name such as "[Population] Top states" into a safe kebab-case file stem. */
export function kebab(name: string, fallback = "item"): string {
  const stem = String(name || "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return stem || fallback;
}

/**
 * Rewrites a Canon URL template (`<tesseract>tesseract/data?...&include=<hierarchy>:<id>`) into the
 * body of a TypeScript template literal that reads from an `attrs` object.
 * Accessor paths like `<parents[0].id>` become `${pick(attrs, "parents[0].id")}`.
 */
export function convertUrlTemplate(url: string): {code: string; placeholders: string[]; warnings: ConversionWarning[]} {
  const placeholders: string[] = [];
  const warnings: ConversionWarning[] = [];
  let needsPick = false;
  const escaped = url.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  const body = escaped.replace(/<([^&=/>\s]+)>/g, (_match, raw: string) => {
    placeholders.push(raw);
    if (/^[A-Za-z_$][\w$]*$/.test(raw)) return `\${attrs.${raw}}`;
    needsPick = true;
    return `\${pick(attrs, ${JSON.stringify(raw)})}`;
  });
  if (url.startsWith("/") || url.startsWith("api/")) {
    warnings.push({code: "legacy-internal-endpoint", message: `URL targets a legacy Express endpoint: ${url.split("?")[0]}`});
  }
  const code = needsPick ? `\`${body}\`` : `\`${body}\``;
  return {code, placeholders, warnings};
}

/**
 * Walks JavaScript source and calls `onString` for every string literal (single, double or
 * template quoted), returning the source with each literal replaced by the callback's result.
 * Template literals are returned whole, including their `${...}` expressions, whose own string
 * literals are not visited (they are rare in this content and flagged separately).
 */
/** Returns the index just past the string literal that starts at `start` (source[start] is the quote). */
export function scanQuoted(source: string, start: number): number {
  const quote = source[start];
  const n = source.length;
  let j = start + 1;
  while (j < n) {
    const ch = source[j];
    if (ch === "\\") { j += 2; continue; }
    if (ch === quote) return j + 1;
    if (quote !== "`" && ch === "\n") return j; // unterminated string; bail out
    if (quote === "`" && ch === "$" && source[j + 1] === "{") {
      let depth = 1; j += 2;
      while (j < n && depth > 0) {
        const c = source[j];
        if (c === "{") depth++;
        else if (c === "}") depth--;
        else if (c === "`" || c === "\"" || c === "'") { j = scanQuoted(source, j); continue; }
        j++;
      }
      continue;
    }
    j++;
  }
  return n;
}

/**
 * Walks JavaScript source and calls `onString` for every string literal (single, double or
 * template quoted), returning the source with each literal replaced by the callback's result.
 * Comments and regex literals are skipped. Template literals are passed whole.
 */
export function mapStringLiterals(source: string, onString: (literal: string, quote: string) => string): string {
  let out = "";
  let i = 0;
  const n = source.length;
  while (i < n) {
    const ch = source[i];
    if (ch === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i);
      const stop = end === -1 ? n : end;
      out += source.slice(i, stop); i = stop; continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      out += source.slice(i, stop); i = stop; continue;
    }
    if (ch === "/") {
      const trimmed = out.replace(/\s+$/, "");
      const prev = trimmed.slice(-1);
      if (prev === "" || "(,=:[!&|?{};+-*%<>~^".includes(prev) || /\b(return|typeof|case|do|else|in|of)$/.test(trimmed)) {
        let j = i + 1; let inClass = false;
        while (j < n) {
          const c = source[j];
          if (c === "\\") { j += 2; continue; }
          if (c === "[") inClass = true;
          else if (c === "]") inClass = false;
          else if (c === "/" && !inClass) { j++; break; }
          else if (c === "\n") break;
          j++;
        }
        while (j < n && /[a-z]/.test(source[j])) j++;
        out += source.slice(i, j); i = j; continue;
      }
    }
    if (ch === "\"" || ch === "'" || ch === "`") {
      const end = scanQuoted(source, i);
      const literal = source.slice(i, end);
      out += onString(literal, ch);
      i = end;
      continue;
    }
    out += ch; i++;
  }
  return out;
}

/** Applies `fn` to every `${expression}` inside a template literal (given with its backticks). */
export function mapTemplateExpressions(literal: string, fn: (expr: string) => string): string {
  let out = "";
  let i = 0;
  const n = literal.length;
  while (i < n) {
    const ch = literal[i];
    if (ch === "\\") { out += literal.slice(i, i + 2); i += 2; continue; }
    if (ch === "$" && literal[i + 1] === "{") {
      let depth = 1; let j = i + 2;
      while (j < n && depth > 0) {
        const c = literal[j];
        if (c === "{") depth++;
        else if (c === "}") depth--;
        else if (c === "`" || c === "\"" || c === "'") { j = scanQuoted(literal, j); continue; }
        if (depth > 0) j++;
      }
      out += "${" + fn(literal.slice(i + 2, j)) + "}";
      i = j + 1;
      continue;
    }
    out += ch; i++;
  }
  return out;
}

const TEMPLATE_TOKENS = /\[\[[^\]]+\]\]|\{\{[^}]+\}\}/;

/**
 * Wraps every string literal containing `[[selector]]` or `{{variable}}` tokens in a `swap(...)`
 * call, which performs the substitution Canon applied to the raw code before evaluating it.
 */
export function wrapTemplateStrings(source: string): {code: string; count: number} {
  let count = 0;
  const code = mapStringLiterals(source, literal => {
    if (!TEMPLATE_TOKENS.test(literal)) return literal;
    count++;
    return `swap(${literal})`;
  });
  return {code, count};
}

/** Replaces the legacy `window.albersUsaPr()` global with the `albersUsaPr()` helper from context. */
export function replaceWindowGlobals(source: string): {code: string; count: number} {
  let count = 0;
  const code = source.replace(/window\.albersUsaPr\(\)/g, () => { count++; return "albersUsaPr()"; });
  return {code, count};
}



/**
 * Loosens declarations whose inferred literal types fight the dynamic style of the legacy code:
 * object literals that later gain properties become `Record<string, any>`, empty/literal arrays
 * become `any[]`, and string-literal constants become `string`. Behaviour is unchanged.
 */
export function loosenDeclarations(source: string): string {
  let code = replaceOutsideStrings(source, /\b(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\{/g,
    (_m, kw: string, name: string) => `${kw} ${name}: Record<string, any> = {`);
  code = replaceOutsideStrings(code, /\b(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\[/g,
    (_m, kw: string, name: string) => `${kw} ${name}: any = [`);
  code = replaceOutsideStrings(code, /\b(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(\u0001\d+\u0001)(?=\s*(?:;|\n|\/\/|$))/g,
    (_m, kw: string, name: string, lit: string) => `${kw} ${name}: string = ${lit}`);
  // `const x = cond ? value : false` sentinels take part in arithmetic later; type them `any`
  code = replaceOutsideStrings(code, /\b(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?=[^;\n]*\?[^;\n]*:\s*(?:false|null|undefined)\s*(?:;|\n|$))/g,
    (_m, kw: string, name: string) => `${kw} ${name}: any = `);
  // `let x;` with no initialiser
  code = replaceOutsideStrings(code, /\b(let|var)\s+([A-Za-z_$][\w$]*)\s*;/g, (_m, kw: string, name: string) => `${kw} ${name}: any;`);
  return code;
}

/**
 * Applies a regex replacement only to code outside string literals. Expressions embedded in template
 * literals (`${...}`) are code too and are processed recursively.
 */
export function replaceOutsideStrings(source: string, re: RegExp, replacer: (...args: string[]) => string): string {
  const placeholders: string[] = [];
  const masked = mapStringLiterals(source, (literal, quote) => {
    const processed = quote === "`" ? mapTemplateExpressions(literal, expr => replaceOutsideStrings(expr, re, replacer)) : literal;
    placeholders.push(processed);
    return `\u0001${placeholders.length - 1}\u0001`;
  });
  const replaced = masked.replace(re, (...args) => replacer(...(args as string[])));
  return replaced.replace(/\u0001(\d+)\u0001/g, (_m, idx: string) => placeholders[Number(idx)]);
}

/** Splits a parameter list at top-level commas (ignores commas inside brackets, braces, parens, strings). */
export function splitParams(params: string): string[] {
  const parts: string[] = [];
  let depth = 0; let current = ""; let i = 0;
  while (i < params.length) {
    const ch = params[i];
    if (ch === "\"" || ch === "'" || ch === "`") { const end = scanQuoted(params, i); current += params.slice(i, end); i = end; continue; }
    if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) depth--;
    if (ch === "," && depth === 0) { parts.push(current); current = ""; i++; continue; }
    current += ch; i++;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

/** Annotates one parameter with `: any` unless it is already typed. */
function annotateParam(param: string): string {
  const p = param.trim();
  if (!p) return param;
  if (/^\.\.\./.test(p)) return /:/.test(p) ? p : `${p}: any[]`;
  if (/^[{\[]/.test(p)) {
    // destructuring pattern, possibly with a default: `{a, b} = {}`
    const m = p.match(/^([{\[][\s\S]*[}\]])\s*(=\s*[\s\S]+)?$/);
    if (!m) return p;
    return m[2] ? `${m[1]}: any ${m[2]}` : `${m[1]}: any`;
  }
  const m = p.match(/^([A-Za-z_$][\w$]*)\s*(=\s*[\s\S]+)?$/);
  if (!m) return p; // already typed or not a simple param
  return m[2] ? `${m[1]}: any ${m[2]}` : `${m[1]}: any`;
}

/**
 * Adds explicit `any` annotations to untyped function parameters so the converted bodies compile
 * under `strict` without changing behaviour (contextually typed callbacks don't need it, but the
 * annotation is harmless there).
 */
export function annotateImplicitAnyParams(source: string): string {
  // `x => ...`
  let code = replaceOutsideStrings(source, /(^|[^\w$.)\]])([A-Za-z_$][\w$]*)\s*=>/g, (_m, pre: string, name: string) => `${pre}(${name}: any) =>`);
  // `(a, {b}, c = 1) => ...`
  code = replaceOutsideStrings(code, /\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*=>/g, (m, params: string) => {
    if (!params.trim()) return m;
    const parts = splitParams(params);
    if (parts.some(p => /^\s*[A-Za-z_$][\w$]*\s*:/.test(p) && !/^\s*[{\[]/.test(p))) return m; // already typed
    return `(${parts.map(annotateParam).join(", ")}) =>`;
  });
  // object-literal method shorthand: `fontColor(d) {`
  const keywords = new Set(["if", "for", "while", "switch", "catch", "function", "return", "typeof", "with", "do", "else"]);
  code = replaceOutsideStrings(code, /(^|[{,;\n]\s*)([A-Za-z_$][\w$]*)\s*\(([^()]*)\)\s*\{/g, (m, pre: string, name: string, params: string) => {
    if (keywords.has(name) || !params.trim()) return m;
    const parts = splitParams(params);
    if (!parts.every(p => /^\s*[A-Za-z_$][\w$]*\s*(=\s*[^,]+)?\s*$/.test(p))) return m;
    return `${pre}${name}(${parts.map(annotateParam).join(", ")}) {`;
  });
  // `function name(a, b) {`
  code = replaceOutsideStrings(code, /\bfunction(\s*[A-Za-z_$][\w$]*)?\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, (m, name: string | undefined, params: string) => {
    if (!params.trim()) return m;
    const parts = splitParams(params);
    if (parts.some(p => /^\s*[A-Za-z_$][\w$]*\s*:/.test(p) && !/^\s*[{\[]/.test(p))) return m;
    return `function${name ?? ""}(${parts.map(annotateParam).join(", ")})`;
  });
  return code;
}

const KNOWN_GLOBALS = new Set(["resp", "variables", "libs", "formatters", "locale", "swap", "albersUsaPr", "attrs", "window", "document", "navigator",
  "Math", "JSON", "Object", "Array", "Date", "String", "Number", "Boolean", "RegExp", "Map", "Set", "Promise", "console", "parseInt", "parseFloat",
  "isNaN", "isFinite", "undefined", "NaN", "Infinity", "encodeURIComponent", "decodeURIComponent", "encodeURI", "setTimeout", "Error", "Symbol", "arguments", "this"]);

/**
 * Legacy bodies ran in sloppy mode where `foo = 1` on an undeclared name created a global; strict
 * ES modules throw instead. Declares such names (`let foo: any;`) at the top of the body.
 */
export function declareImplicitGlobals(source: string): {code: string; declared: string[]} {
  const masked = mapStringLiterals(source, () => "\"\"");
  const declared = new Set<string>(KNOWN_GLOBALS);
  const addPattern = (pattern: string) => pattern.split(",").forEach(part => {
    const name = part.split(":").pop()!.split("=")[0].replace(/^\s*\.\.\./, "").trim();
    if (/^[A-Za-z_$][\w$]*$/.test(name)) declared.add(name);
  });
  let m: RegExpExecArray | null;
  const simple = /\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g;
  while ((m = simple.exec(masked))) declared.add(m[1]);
  const destructure = /\b(?:const|let|var)\s*([{\[][^=]*[}\]])\s*=/g;
  while ((m = destructure.exec(masked))) addPattern(m[1].replace(/[{}\[\]]/g, " "));
  const params = /\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*(?:=>|\{)/g;
  while ((m = params.exec(masked))) addPattern(m[1].replace(/[{}\[\]]/g, " ").replace(/:\s*any(\[\])?/g, ""));
  const bareArrow = /(^|[^\w$.)\]])([A-Za-z_$][\w$]*)\s*=>/g;
  while ((m = bareArrow.exec(masked))) declared.add(m[2]);
  const forVars = /\bfor\s*\(\s*(?:const|let|var)?\s*([A-Za-z_$][\w$]*)/g;
  while ((m = forVars.exec(masked))) declared.add(m[1]);
  const catchVars = /\bcatch\s*\(\s*([A-Za-z_$][\w$]*)/g;
  while ((m = catchVars.exec(masked))) declared.add(m[1]);

  const assigned = new Set<string>();
  const assignment = /(^|[;{}\n])\s*([A-Za-z_$][\w$]*)\s*(?:[+\-*/]?=)(?!=)/g;
  while ((m = assignment.exec(masked))) {
    if (!declared.has(m[2])) assigned.add(m[2]);
  }
  const names = Array.from(assigned);
  if (!names.length) return {code: source, declared: []};
  return {code: `${names.map(n => `let ${n}: any;`).join(" ")}\n${source}`, declared: names};
}

/** Small, behaviour-preserving rewrites of legacy idioms that TypeScript rejects. */
export function fixLegacyIdioms(source: string): string {
  let code = replaceOutsideStrings(source, /\bparseFloat\(([^(),]+),\s*10\)/g, (_m, arg: string) => `parseFloat(${arg})`);
  code = replaceOutsideStrings(code, /\.fill\(\)/g, () => ".fill(undefined)");
  code = replaceOutsideStrings(code, /\bwindow\.location\s*=\s*(?!=)/g, () => "window.location.href = ");
  return code;
}

export interface UsedVariables {
  /** Statically known keys. */
  keys: string[];
  /** Static prefixes of template-literal keys such as `variables[`senator${i}Name`]`. */
  prefixes: string[];
  /** Literal `[[selector]]Suffix` templates used as keys (`variables[swap("[[x]]Level")]`), expanded per option. */
  templates: string[];
  /** True when the body reads `variables` in a way that cannot be analysed (all keys must be sent). */
  dynamic: boolean;
}

/** Collects the variable keys a body reads from `variables`, with prefixes for templated keys. */
export function collectUsedVariables(source: string): UsedVariables {
  const keys = new Set<string>();
  const prefixes = new Set<string>();
  const templates = new Set<string>();
  let dynamic = false;
  const code = source;
  let m: RegExpExecArray | null;
  const destructure = /(?:const|let|var)\s*\{([^}]*)\}\s*=\s*variables\b/g;
  while ((m = destructure.exec(code))) {
    m[1].split(",").forEach(part => {
      const name = part.split(":")[0].split("=")[0].trim();
      if (name) keys.add(name);
    });
  }
  const dotted = /\bvariables\.([A-Za-z_$][\w$]*)/g;
  while ((m = dotted.exec(code))) keys.add(m[1]);
  // Bracket access: scan `variables[ ... ]` with depth counting so nested brackets such as
  // `variables[swap("[[sel]]Level")]` are captured whole.
  const bracketExprs: string[] = [];
  let searchFrom = 0;
  while (true) {
    const at = code.indexOf("variables[", searchFrom);
    if (at === -1) break;
    if (at > 0 && /[\w$.]/.test(code[at - 1])) { searchFrom = at + 10; continue; }
    let depth = 1; let j = at + 10;
    while (j < code.length && depth > 0) {
      const ch = code[j];
      if (ch === "\"" || ch === "'" || ch === "`") { j = scanQuoted(code, j); continue; }
      if (ch === "[") depth++;
      else if (ch === "]") depth--;
      if (depth > 0) j++;
    }
    bracketExprs.push(code.slice(at + 10, j).trim());
    searchFrom = j + 1;
  }
  for (const expr of bracketExprs) {
    const literal = expr.match(/^(["'])([^"']+)\1$/);
    const template = expr.match(/^`([^`$]*)\$\{[^`]*`$/);
    const swapped = expr.match(/^swap\((["'`])(.*)\1\)$/);
    // Canon swapped `[[selector]]` tokens inside the raw code, so a literal key may still carry them.
    if (literal) { if (literal[2].includes("[[")) templates.add(literal[2]); else keys.add(literal[2]); }
    else if (template) { if (template[1]) prefixes.add(template[1]); else dynamic = true; }
    else if (swapped) templates.add(swapped[2]);
    else if (!/^[A-Za-z_$][\w$]*$/.test(expr)) dynamic = true;
  }
  const stripped = code.replace(destructure, "").replace(dotted, "").replace(/\bvariables\[[^\n]*/g, "");
  if (/\bvariables\b/.test(stripped)) dynamic = true; // passed around whole
  return {keys: Array.from(keys).sort(), prefixes: Array.from(prefixes).sort(), templates: Array.from(templates).sort(), dynamic};
}

/** Extracts `type: "X"` chart types from a visualization body. */
export function collectVizTypes(source: string): string[] {
  const types = new Set<string>();
  const re = /\btype\s*:\s*["'`]([A-Za-z0-9]+)["'`]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) types.add(m[1]);
  return Array.from(types);
}

/** Scans a body for patterns that need human review and returns warnings. */
export function auditBody(source: string, kind: "generator" | "materializer" | "visualization"): ConversionWarning[] {
  const warnings: ConversionWarning[] = [];
  const outside = replaceOutsideStrings(source, /./gs, c => c); // identity; ensures tokenizer handles the source
  void outside;
  const masked = mapStringLiterals(source, () => "\"\"");
  if (/\[\[|\{\{/.test(masked)) warnings.push({code: "template-token-outside-string", message: "[[ or {{ appears outside a string literal"});
  if (/\bwindow\b/.test(masked)) warnings.push({code: "uses-window", message: "references window (client-only)"});
  if (/\bdocument\b/.test(masked)) warnings.push({code: "uses-document", message: "references document (client-only)"});
  if (/\bthis\b/.test(masked)) warnings.push({code: "uses-this", message: "references this"});
  if (/\beval\b|new Function\b/.test(masked)) warnings.push({code: "uses-eval", message: "uses eval or new Function"});
  if (/\brequire\(|\bimport\b/.test(masked)) warnings.push({code: "uses-import", message: "uses require/import"});
  if (kind === "materializer" && /\bresp\b/.test(masked)) warnings.push({code: "resp-in-materializer", message: "references resp"});
  if (/["'`]\/api\//.test(source) || /`\/api\//.test(source)) warnings.push({code: "legacy-internal-endpoint", message: "data URL targets a legacy /api/ endpoint"});
  if (/\/api\/data\?/.test(source)) warnings.push({code: "dead-logiclayer-url", message: "uses /api/data (logic layer removed in production)"});
  if (/libs\.d3\.(titleCase|strip|assign|closest)\b/.test(masked)) warnings.push({code: "libs-namespace-mismatch", message: "calls a d3plus helper via libs.d3 (undefined in legacy, would have thrown)"});
  return warnings;
}

/** Indents every line of a body by `spaces`. */
export function indent(body: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return body.split("\n").map(line => line.trim().length ? pad + line : line).join("\n");
}
