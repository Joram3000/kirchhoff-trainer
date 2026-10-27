import type { GridElement, GridSpec, Pt, Side } from '../types';

/** Pixels per grid unit. */
export const UNIT = 70;
export const R_LEN = 56;
export const R_THICK = 16;
export const SRC_R = 17;
export const BOX_LEN = 44;
export const BOX_THICK = 24;
const SWITCH_LEN = 44;
/** Space between a symbol's edge and the text or arrow beside it. */
const GAP = 8;
const PAD = 10;
/** Same width as the fixed-topology canvas, so text renders at one size across figures. */
const MIN_WIDTH = 380;
/** Rough advance widths of 12px / 9px IBM Plex Mono glyphs. */
const CHAR_W = 7.3;
const SUB_W = 5.5;

export interface TextPart {
  text: string;
  sub: boolean;
}

/** Splits "R_1 = 4 Ω" / "i_{R2}" mini-markup into plain and subscript runs. */
export function richParts(s: string): TextPart[] {
  const out: TextPart[] = [];
  let last = 0;
  for (const m of s.matchAll(/_(?:\{([^}]*)\}|(\S))/g)) {
    if (m.index > last) out.push({ text: s.slice(last, m.index), sub: false });
    out.push({ text: m[1] ?? m[2], sub: true });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ text: s.slice(last), sub: false });
  return out;
}

function textWidth(s: string): number {
  return richParts(s).reduce((w, p) => w + p.text.length * (p.sub ? SUB_W : CHAR_W), 0);
}

const toPx = (p: Pt): [number, number] => [p[0] * UNIT, p[1] * UNIT];

function opposite(side: Side): Side {
  return side === 'left' ? 'right' : side === 'right' ? 'left' : side === 'above' ? 'below' : 'above';
}

export interface PlacedText {
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  /** Baseline shift in em, as the SVG `dy` attribute. */
  dy: number;
  text: string;
  cls: 'lbl' | 'lbl-target' | 'sign' | 'hint';
}

export interface PlacedArrow {
  x: number;
  y: number;
  angle: number;
  accent: boolean;
}

export interface PlacedElement {
  el: GridElement;
  cx: number;
  cy: number;
  horizontal: boolean;
  /** Half the symbol's extent along / across the wire. */
  half: number;
  across: number;
  /** The two lead wires from the terminals to the symbol. */
  leads: [number, number, number, number][];
  accent: boolean;
  texts: PlacedText[];
  arrow: PlacedArrow | null;
}

export interface GridLayout {
  elements: PlacedElement[];
  wires: string[];
  dots: [number, number][];
  terminals: [number, number][];
  arrows: PlacedArrow[];
  texts: PlacedText[];
  ground: [number, number] | null;
  viewBox: string;
}

/** Text placed `dist` px beyond (cx, cy) on `side`, anchored so it grows away from the point. */
function besides(cx: number, cy: number, side: Side, dist: number, text: string, cls: PlacedText['cls']): PlacedText {
  switch (side) {
    case 'left':
      return { x: cx - dist, y: cy, anchor: 'end', dy: 0.35, text, cls };
    case 'right':
      return { x: cx + dist, y: cy, anchor: 'start', dy: 0.35, text, cls };
    case 'above':
      return { x: cx, y: cy - dist, anchor: 'middle', dy: 0, text, cls };
    case 'below':
      return { x: cx, y: cy + dist, anchor: 'middle', dy: 0.8, text, cls };
  }
}

const ANGLE = { up: -90, down: 90, left: 180, right: 0 } as const;

function placeElement(el: GridElement, accent: boolean): PlacedElement {
  const [x1, y1] = toPx(el.from);
  const [x2, y2] = toPx(el.to);
  const horizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;

  let half: number;
  let across: number;
  switch (el.kind) {
    case 'R':
      half = Math.min(R_LEN, len - 24) / 2;
      across = R_THICK / 2;
      break;
    case 'V':
    case 'I':
      half = across = SRC_R;
      break;
    case 'box':
      half = BOX_LEN / 2;
      across = BOX_THICK / 2;
      break;
    case 'switch':
      half = Math.min(SWITCH_LEN, len - 16) / 2;
      // The open lever rises about this far, so its label must clear it.
      across = 24;
      break;
  }

  // Unit vector from `from` to `to`, so leads stop at the symbol's edges.
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const leads: PlacedElement['leads'] = [
    [x1, y1, cx - ux * half, cy - uy * half],
    [cx + ux * half, cy + uy * half, x2, y2],
  ];

  const labelSide = el.side ?? (horizontal ? 'above' : 'right');
  const texts: PlacedText[] = [];
  if (el.label) texts.push(besides(cx, cy, labelSide, across + GAP, el.label, accent ? 'lbl-target' : 'lbl'));

  let arrow: PlacedArrow | null = null;
  if (el.current) {
    const side = el.current.side ?? opposite(labelSide);
    const off = across + GAP + 4;
    const ax = side === 'left' ? cx - off : side === 'right' ? cx + off : cx;
    const ay = side === 'above' ? cy - off : side === 'below' ? cy + off : cy;
    const sign = el.current.toward === 'to' ? 1 : -1;
    arrow = { x: ax, y: ay, angle: (Math.atan2(uy * sign, ux * sign) * 180) / Math.PI, accent };
    texts.push(besides(ax, ay, side, side === 'above' ? 13 : 8, el.current.label, accent ? 'lbl-target' : 'lbl'));
  }

  if (el.polarity) {
    const side = el.polarity.side ?? opposite(labelSide);
    const plusAtTo = el.polarity.plus === 'to';
    // Far enough apart that a name between the signs (e.g. "v_I") fits, even beside a small source.
    const reach = Math.max(half * 0.8, 20);
    const ends: [number, number][] = [
      [cx - ux * reach, cy - uy * reach],
      [cx + ux * reach, cy + uy * reach],
    ];
    const dist = across + GAP;
    ends.forEach(([ex, ey], i) => {
      const sign = (i === 1) === plusAtTo ? '+' : '−';
      const t = besides(ex, ey, side, dist, sign, 'sign');
      // Signs read better centred on their end than hanging off it.
      if (horizontal) t.anchor = 'middle';
      texts.push(t);
    });
    if (el.polarity.label) texts.push(besides(cx, cy, side, dist, el.polarity.label, accent ? 'lbl-target' : 'lbl'));
  }

  return { el, cx, cy, horizontal, half, across, leads, accent, texts, arrow };
}

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function textBox(t: PlacedText): Box {
  const w = textWidth(t.text);
  const x0 = t.anchor === 'start' ? t.x : t.anchor === 'end' ? t.x - w : t.x - w / 2;
  const base = t.y + t.dy * 12;
  return { x0, y0: base - 11, x1: x0 + w, y1: base + 4 };
}

/** Resolves a grid spec to pixel positions and a viewBox that fits everything, labels included. */
export function layoutGrid(spec: GridSpec): GridLayout {
  const hl = new Set(spec.highlight ?? []);
  const isHl = (id?: string) => id !== undefined && hl.has(id);

  const elements = spec.elements.map((el) => placeElement(el, isHl(el.id)));
  const wires = spec.wires.map((pts) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toPx(p)[0]} ${toPx(p)[1]}`).join(' '),
  );
  const dots = (spec.dots ?? []).map(toPx);
  const terminals = (spec.terminals ?? []).map((t) => toPx(t.at));

  const texts: PlacedText[] = [];
  (spec.terminals ?? []).forEach((t, i) => {
    if (!t.label) return;
    const [x, y] = terminals[i];
    texts.push(besides(x, y, t.side ?? 'right', 9, t.label, 'lbl'));
  });

  const arrows: PlacedArrow[] = [];
  for (const a of spec.arrows ?? []) {
    const [x, y] = toPx(a.at);
    const accent = isHl(a.id);
    arrows.push({ x, y, angle: ANGLE[a.dir], accent });
    if (a.label) {
      const side = a.side ?? (a.dir === 'up' || a.dir === 'down' ? 'right' : 'above');
      texts.push(besides(x, y, side, side === 'above' ? 13 : 8, a.label, accent ? 'lbl-target' : 'lbl'));
    }
  }

  for (const t of spec.texts ?? []) {
    const [x, y] = toPx(t.at);
    const cls = isHl(t.id) ? 'lbl-target' : (t.style ?? 'lbl');
    texts.push({ x, y, anchor: t.anchor ?? 'middle', dy: 0.35, text: t.text, cls });
  }

  const ground = spec.ground ? toPx(spec.ground) : null;

  const boxes: Box[] = [];
  const pointBox = (x: number, y: number, r: number) => boxes.push({ x0: x - r, y0: y - r, x1: x + r, y1: y + r });
  for (const pts of spec.wires) for (const p of pts) pointBox(...toPx(p), 1);
  for (const e of elements) {
    for (const [ax, ay, bx, by] of e.leads) {
      pointBox(ax, ay, 1);
      pointBox(bx, by, 1);
    }
    const hx = e.horizontal ? e.half : e.across;
    const hy = e.horizontal ? e.across : e.half;
    boxes.push({ x0: e.cx - hx, y0: e.cy - hy, x1: e.cx + hx, y1: e.cy + hy });
    if (e.arrow) pointBox(e.arrow.x, e.arrow.y, 12);
    e.texts.forEach((t) => boxes.push(textBox(t)));
  }
  for (const [x, y] of terminals) pointBox(x, y, 5);
  for (const a of arrows) pointBox(a.x, a.y, 12);
  texts.forEach((t) => boxes.push(textBox(t)));
  if (ground) boxes.push({ x0: ground[0] - 13, y0: ground[1], x1: ground[0] + 13, y1: ground[1] + 24 });

  let x0 = Math.min(...boxes.map((b) => b.x0)) - PAD;
  const y0 = Math.min(...boxes.map((b) => b.y0)) - PAD;
  let x1 = Math.max(...boxes.map((b) => b.x1)) + PAD;
  const y1 = Math.max(...boxes.map((b) => b.y1)) + PAD;
  // Small figures would otherwise be scaled up with oversized text; keep them at the fixed diagrams' scale.
  if (x1 - x0 < MIN_WIDTH) {
    const grow = (MIN_WIDTH - (x1 - x0)) / 2;
    x0 -= grow;
    x1 += grow;
  }
  const viewBox = [x0, y0, x1 - x0, y1 - y0].map((n) => n.toFixed(1)).join(' ');

  return { elements, wires, dots, terminals, arrows, texts, ground, viewBox };
}
