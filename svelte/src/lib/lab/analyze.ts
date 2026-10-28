import type { Pt, Side } from '../types';
import { solveLinear } from '../utils/linear';

/**
 * The circuit playground: a hand-drawn schematic whose element values the
 * student can change, solved with modified nodal analysis (MNA) so every
 * node voltage, branch current, KCL sum and KVL sum can be shown live.
 */

export interface LabElement {
  id: string;
  /** TeX-ish name used in labels and equations, e.g. "R_1" or "e". */
  name: string;
  kind: 'R' | 'V' | 'I';
  from: Pt;
  to: Pt;
  /** Ω, V or A. */
  value: number;
  /** Voltage source: terminal marked +. */
  plus?: 'from' | 'to';
  /** Current source: terminal the arrow points to. */
  toward?: 'from' | 'to';
  side?: Side;
  /** Where the live current arrow goes; defaults to opposite the label. */
  currentSide?: Side;
}

export interface LabNode {
  /** "1" for v₁; the ground node is named "0". */
  name: string;
  at: Pt;
  labelAt: Pt;
  anchor?: 'start' | 'middle' | 'end';
}

/** A closed path through elements; `dir` is +1 when the path runs from the element's `from` to its `to`. */
export interface LabLoop {
  name: string;
  path: [id: string, dir: 1 | -1][];
}

export interface LabPreset {
  id: string;
  title: string;
  description: string;
  elements: LabElement[];
  wires: Pt[][];
  dots?: Pt[];
  nodes: LabNode[];
  ground: Pt;
  loops: LabLoop[];
}

export interface ElementResult {
  el: LabElement;
  /** v(from) − v(to). */
  v: number;
  /** Current from `from` to `to` through the element. */
  i: number;
  /** Absorbed power, passive sign convention: negative means delivered. */
  p: number;
}

export interface Analysis {
  /** Node voltage per named node, ground = 0. */
  nodeV: Record<string, number>;
  elements: ElementResult[];
  /** Per named non-ground node: each element current leaving it (sign +1) or entering it (−1). */
  kcl: { node: LabNode; terms: { r: ElementResult; sign: 1 | -1 }[] }[];
  /** Per loop: each element's voltage drop in the walking direction. */
  kvl: { loop: LabLoop; terms: { r: ElementResult; dir: 1 | -1 }[] }[];
}

const key = (p: Pt) => `${p[0]},${p[1]}`;

function onSegment(p: Pt, a: Pt, b: Pt): boolean {
  const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  if (Math.abs(cross) > 1e-9) return false;
  const within = (k: 0 | 1) => p[k] >= Math.min(a[k], b[k]) - 1e-9 && p[k] <= Math.max(a[k], b[k]) + 1e-9;
  return within(0) && within(1);
}

/** Groups every drawn point into electrical nodes: points joined by wires (or lying on one) are the same node. */
function connectivity(preset: LabPreset): (p: Pt) => string {
  const points = new Map<string, Pt>();
  const add = (p: Pt) => points.set(key(p), p);
  preset.wires.forEach((w) => w.forEach(add));
  preset.elements.forEach((e) => (add(e.from), add(e.to)));
  preset.nodes.forEach((n) => add(n.at));
  add(preset.ground);

  const parent = new Map([...points.keys()].map((k) => [k, k]));
  const find = (k: string): string => {
    const p = parent.get(k)!;
    if (p === k) return k;
    const root = find(p);
    parent.set(k, root);
    return root;
  };
  for (const w of preset.wires) {
    for (let s = 0; s + 1 < w.length; s++) {
      for (const [k, p] of points) if (onSegment(p, w[s], w[s + 1])) parent.set(find(k), find(key(w[s])));
    }
  }
  return (p) => find(key(p));
}

/** Solves the circuit; sources whose id is in `off` are switched off (V → short, I → open). */
export function analyze(preset: LabPreset, off: ReadonlySet<string> = new Set()): Analysis {
  const nodeOf = connectivity(preset);
  const groundRoot = nodeOf(preset.ground);
  const index = new Map<string, number>();
  const idx = (p: Pt): number => {
    const root = nodeOf(p);
    if (root === groundRoot) return -1;
    if (!index.has(root)) index.set(root, index.size);
    return index.get(root)!;
  };
  preset.elements.forEach((e) => (idx(e.from), idx(e.to)));

  const value = (e: LabElement) => (off.has(e.id) ? 0 : e.value);
  const sources = preset.elements.filter((e) => e.kind === 'V');
  const n = index.size;
  const size = n + sources.length;
  const A = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  const z = new Array<number>(size).fill(0);

  for (const e of preset.elements) {
    const a = idx(e.from);
    const b = idx(e.to);
    if (e.kind === 'R') {
      const g = 1 / e.value;
      if (a >= 0) A[a][a] += g;
      if (b >= 0) A[b][b] += g;
      if (a >= 0 && b >= 0) {
        A[a][b] -= g;
        A[b][a] -= g;
      }
    } else if (e.kind === 'I') {
      // Inside the source the current runs towards the arrow's terminal.
      const I = value(e) * (e.toward === 'to' ? 1 : -1);
      if (a >= 0) z[a] -= I;
      if (b >= 0) z[b] += I;
    }
  }
  sources.forEach((e, j) => {
    const a = idx(e.from);
    const b = idx(e.to);
    const r = n + j;
    if (a >= 0) A[a][r] = A[r][a] = 1;
    if (b >= 0) A[b][r] = A[r][b] = -1;
    z[r] = value(e) * (e.plus === 'from' ? 1 : -1);
  });

  const x = solveLinear(A, z);
  const V = (p: Pt) => {
    const k = idx(p);
    return k < 0 ? 0 : x[k];
  };

  const elements: ElementResult[] = preset.elements.map((el) => {
    const v = V(el.from) - V(el.to);
    const i =
      el.kind === 'R' ? v / el.value : el.kind === 'I' ? value(el) * (el.toward === 'to' ? 1 : -1) : x[n + sources.indexOf(el)];
    return { el, v, i, p: v * i };
  });
  const byId = new Map(elements.map((r) => [r.el.id, r]));

  const nodeV = Object.fromEntries(preset.nodes.map((node) => [node.name, V(node.at)]));
  const kcl = preset.nodes
    .filter((node) => nodeOf(node.at) !== groundRoot)
    .map((node) => {
      const root = nodeOf(node.at);
      const terms: { r: ElementResult; sign: 1 | -1 }[] = [];
      for (const r of elements) {
        if (nodeOf(r.el.from) === root) terms.push({ r, sign: 1 });
        if (nodeOf(r.el.to) === root) terms.push({ r, sign: -1 });
      }
      return { node, terms };
    });
  const kvl = preset.loops.map((loop) => ({ loop, terms: loop.path.map(([id, dir]) => ({ r: byId.get(id)!, dir })) }));

  return { nodeV, elements, kcl, kvl };
}

/** A straight piece of wire with the current through it, from `from` to `to` (negative: the other way). */
export interface WireFlow {
  from: Pt;
  to: Pt;
  amps: number;
}

/**
 * Current through every piece of wire, for the flow animation. Wires are cut
 * at every junction; within a node they form a tree, so each piece carries
 * whatever the elements inject into the part of the tree beyond it (KCL).
 */
export function wireFlows(preset: LabPreset, analysis: Analysis): WireFlow[] {
  const points = new Map<string, Pt>();
  const add = (p: Pt) => points.set(key(p), p);
  preset.wires.forEach((w) => w.forEach(add));
  preset.elements.forEach((e) => (add(e.from), add(e.to)));

  // Cut every wire segment at the points lying on it.
  const adjacency = new Map<string, string[]>();
  const link = (a: string, b: string) => {
    adjacency.set(a, [...(adjacency.get(a) ?? []), b]);
    adjacency.set(b, [...(adjacency.get(b) ?? []), a]);
  };
  for (const w of preset.wires) {
    for (let s = 0; s + 1 < w.length; s++) {
      const [a, b] = [w[s], w[s + 1]];
      const along = (p: Pt) => Math.hypot(p[0] - a[0], p[1] - a[1]);
      const cut = [...points.values()].filter((p) => onSegment(p, a, b)).sort((p, q) => along(p) - along(q));
      for (let c = 0; c + 1 < cut.length; c++) if (key(cut[c]) !== key(cut[c + 1])) link(key(cut[c]), key(cut[c + 1]));
    }
  }

  // Current flowing into the wiring at each point from the elements attached there.
  const injected = new Map<string, number>();
  for (const r of analysis.elements) {
    injected.set(key(r.el.from), (injected.get(key(r.el.from)) ?? 0) - r.i);
    injected.set(key(r.el.to), (injected.get(key(r.el.to)) ?? 0) + r.i);
  }

  const flows: WireFlow[] = [];
  const visited = new Set<string>();
  /** Returns the net current injected into the subtree at `k`, which then flows from `k` towards its parent. */
  const walk = (k: string, parent: string | null): number => {
    visited.add(k);
    let total = injected.get(k) ?? 0;
    for (const next of adjacency.get(k) ?? []) {
      if (next === parent || visited.has(next)) continue;
      const amps = walk(next, k);
      flows.push({ from: points.get(next)!, to: points.get(k)!, amps });
      total += amps;
    }
    return total;
  };
  for (const k of adjacency.keys()) if (!visited.has(k)) walk(k, null);
  return flows;
}
