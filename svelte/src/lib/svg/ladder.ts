import type { NodeVoltageSpec, NvElement } from '../types';
import { fmt } from '../utils/format';

export const VIEW_W = 380;
export const TOP = 90;
export const BOTTOM = 240;
export const MID = (TOP + BOTTOM) / 2;
export const BRIDGE_Y = 38;

const SAME_NODE_GAP = 52;
const MAX_NODE_GAP = 150;
const EDGE_PAD = 8;
/** Rough advance width of one 12px IBM Plex Mono glyph. */
const CHAR_W = 7.3;

/** Plain-text label for an element; the component renders the CCCS subscript itself. */
export function elementLabel(el: NvElement): string {
  switch (el.type) {
    case 'R':
      return `${fmt(el.ohms)} Ω`;
    case 'I':
      return `${fmt(el.amps)} A`;
    case 'V':
      return `${fmt(el.volts)} V`;
    case 'CCCS':
      return `${fmt(el.gain)}·i${el.ctrl}`;
  }
}

/** Distance from a shunt's axis to where its side label starts. */
export function labelOffset(el: NvElement, side: 'left' | 'right'): number {
  switch (el.type) {
    case 'R':
      return 14;
    case 'I':
      return 26;
    case 'CCCS':
      return 24;
    case 'V':
      // The battery's +/− signs sit on its right.
      return side === 'right' ? 30 : 18;
  }
}

function halfWidth(el: NvElement): number {
  return el.type === 'R' ? 9 : el.type === 'V' ? 24 : 20;
}

export interface ShuntLayout {
  x: number;
  side: 'left' | 'right';
}

export interface LadderLayout {
  shunts: ShuntLayout[];
  /** Per node: x of its first and last shunt column. */
  spans: { first: number; last: number }[];
}

/**
 * Places the shunt columns left to right. Each label goes on the side facing
 * away from a same-node neighbour, the node-to-node gaps shrink to fit the
 * view, and the whole ladder is centred.
 */
export function layoutLadder(spec: NodeVoltageSpec): LadderLayout {
  const { shunts } = spec;
  const sides = shunts.map((s, i) =>
    i + 1 < shunts.length && shunts[i + 1].node === s.node ? ('left' as const) : ('right' as const),
  );
  const extent = (i: number, side: 'left' | 'right') =>
    sides[i] === side ? labelOffset(shunts[i].el, side) + elementLabel(shunts[i].el).length * CHAR_W : halfWidth(shunts[i].el);

  const leftMargin = EDGE_PAD + extent(0, 'left');
  const rightMargin = EDGE_PAD + extent(shunts.length - 1, 'right');
  const avail = VIEW_W - leftMargin - rightMargin;

  let sameCount = 0;
  let nodeGaps = 0;
  for (let i = 1; i < shunts.length; i++) {
    if (shunts[i].node === shunts[i - 1].node) sameCount++;
    else nodeGaps++;
  }
  const nodeGap = nodeGaps === 0 ? 0 : Math.min(MAX_NODE_GAP, (avail - sameCount * SAME_NODE_GAP) / nodeGaps);
  const total = sameCount * SAME_NODE_GAP + nodeGaps * nodeGap;

  let x = leftMargin + (avail - total) / 2;
  const out: ShuntLayout[] = [];
  shunts.forEach((s, i) => {
    if (i > 0) x += s.node === shunts[i - 1].node ? SAME_NODE_GAP : nodeGap;
    out.push({ x, side: sides[i] });
  });

  const spans = spec.nodes.map((_, n) => {
    const xs = out.filter((_, i) => shunts[i].node === n).map((p) => p.x);
    return { first: Math.min(...xs), last: Math.max(...xs) };
  });

  return { shunts: out, spans };
}
