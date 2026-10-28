import katex from 'katex';
import { fmt, fmtSig } from './format';

/**
 * Math in step texts is written as LaTeX inside the (trusted) HTML
 * fragments and rendered with KaTeX right before display: \( … \) inline in
 * a sentence, \[ … \] as its own block below the sentence. Generators build
 * those segments with the `m` and `d` tags below.
 */

/** A number as TeX: Dutch decimal comma (braced, so TeX adds no space after it). */
export function num(n: number): string {
  return fmt(n).replace(',', '{,}');
}

/** Up to `digits` significant digits — for equation coefficients like 0,325. */
export function sig(n: number, digits = 4): string {
  return fmtSig(n, digits).replace(',', '{,}');
}

/** A coefficient in front of a variable: "1" disappears and "−1" becomes a bare minus. */
export function coef(n: number): string {
  const s = sig(n);
  return s === '1' ? '' : s === '-1' ? '-' : s;
}

/** A number in parentheses when negative, for substitutions like 5 · (−3). */
export function par(n: number): string {
  return n < 0 ? `(${num(n)})` : num(n);
}

const UNITS: Record<string, string> = { Ω: '\\Omega', mΩ: '\\mathrm{m}\\Omega', kΩ: '\\mathrm{k}\\Omega', '%': '\\%' };

/** A unit as TeX, upright: V, A, W, Ω, mΩ, % … */
export function unitTex(unit: string): string {
  return UNITS[unit] ?? `\\mathrm{${unit}}`;
}

/** "12,4 V", boxed when it is the answer to the question being asked. */
export function result(value: number, unit: string, final = true): string {
  const body = `${num(value)}\\,${unitTex(unit)}`;
  return final ? `\\boxed{${body}}` : body;
}

function tex(strings: TemplateStringsArray, values: unknown[]): string {
  return String.raw({ raw: strings.raw }, ...values.map((v) => (typeof v === 'number' ? num(v) : String(v))));
}

/**
 * Inline math: `m\`\frac{v_1}{${R}}\``. The template is read raw, so
 * backslashes need no escaping; interpolated numbers are formatted with
 * `num`, strings are inserted as TeX.
 */
export function m(strings: TemplateStringsArray, ...values: unknown[]): string {
  return `\\(${tex(strings, values)}\\)`;
}

/** Display math: the same as `m`, but rendered as a block on its own line. */
export function d(strings: TemplateStringsArray, ...values: unknown[]): string {
  return `\\[${tex(strings, values)}\\]`;
}

/** A bare TeX fragment (no delimiters), formatted like `m`, for building rows of a block. */
export function t(strings: TemplateStringsArray, ...values: unknown[]): string {
  return tex(strings, values);
}

/**
 * Labelled equations stacked in one block, left-aligned after their labels:
 *   knooppunt 1:   v₁/4 + (v₁ − v₂)/5 = 2
 *   knooppunt 2:   …
 */
export function labelled(rows: [label: string, equation: string][]): string {
  const body = rows.map(([label, eq]) => `\\text{${label}:}\\quad & ${eq}`).join(' \\\\[4pt] ');
  return `\\[\\begin{aligned} ${body} \\end{aligned}\\]`;
}

/** A system of equations with a brace, aligned on "=": each row is [left side, right side]. */
export function system(rows: [lhs: string, rhs: string][]): string {
  const body = rows.map(([l, r]) => `${l} &= ${r}`).join(' \\\\ ');
  return `\\[\\left\\{\\begin{aligned} ${body} \\end{aligned}\\right.\\]`;
}

const MATH = /\\\((.+?)\\\)|\\\[(.+?)\\\]/gs;

/** `\htmlClass` is allowed (and only it), so equations can color terms through CSS, e.g. currents vs. voltages. */
const OPTIONS = {
  throwOnError: false,
  output: 'html',
  trust: (ctx: { command: string }) => ctx.command === '\\htmlClass',
} as const;

/** Wraps a TeX fragment in a CSS class, e.g. `tone('current', 'i_{R_1}')`. */
export function tone(kind: 'current' | 'voltage', texFragment: string): string {
  return `\\htmlClass{tone-${kind}}{${texFragment}}`;
}

/** Replaces every \( … \) and \[ … \] segment of an HTML fragment with KaTeX output. */
export function renderMath(html: string): string {
  return html.replace(MATH, (_, inline: string | undefined, block: string | undefined) =>
    inline !== undefined
      ? katex.renderToString(inline, OPTIONS)
      : `<span class="math-block">${katex.renderToString(block!, { ...OPTIONS, displayMode: true, fleqn: true })}</span>`,
  );
}

/** For checks and tests: every math segment in a fragment. */
export function mathSegments(html: string): string[] {
  return [...html.matchAll(MATH)].map((match) => match[1] ?? match[2]);
}
