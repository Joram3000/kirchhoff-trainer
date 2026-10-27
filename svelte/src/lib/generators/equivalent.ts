import type { GridElement, GridSpec, Problem, Pt } from '../types';
import { pick } from '../utils/random';
import { fmt } from '../utils/format';
import { difficultyLevel } from '../utils/difficulty';
import { variant, problemFrom, type Built } from './built';

const SERIES_POOL = [2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20] as const;
const SHUNT_POOL = [2, 3, 4, 5, 6, 8, 10, 12, 15, 16, 18, 20, 24, 30, 36, 40, 60] as const;
/** Pairs whose parallel combination is a whole number of ohms. */
const NICE_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [3, 6], [4, 4], [6, 6], [4, 12], [6, 12], [8, 8], [5, 20], [10, 10], [12, 12],
  [10, 15], [8, 24], [12, 24], [16, 16], [20, 20], [15, 30], [12, 6], [24, 8],
];

const par = (a: number, b: number) => (a * b) / (a + b);
const parStep = (a: number, b: number) => `${fmt(a)} ∥ ${fmt(b)} = ${fmt(a)}·${fmt(b)}/(${fmt(a)} + ${fmt(b)}) = ${fmt(par(a, b))} Ω`;

/**
 * A ladder seen from terminals a-b on the left: section k is a series
 * resistor on the top rail followed by a shunt down to the bottom rail; the
 * last section may end in two parallel shunts.
 */
interface Section {
  series: number;
  shunts: number[];
}

/** Builds from the far end inwards, only accepting shunts that keep every intermediate value whole. */
function makeLadder(n: number, pairAtEnd: boolean): Section[] | null {
  const last = pairAtEnd ? [...pick(NICE_PAIRS)] : [pick(SHUNT_POOL)];
  const sections: Section[] = [];
  let value = last.length === 2 ? par(last[0], last[1]) : last[0];
  let shunts = last;
  for (let k = n - 1; k >= 0; k--) {
    const series = pick(SERIES_POOL);
    sections.unshift({ series, shunts });
    value += series;
    if (k === 0) break;
    const v = value;
    const fits = SHUNT_POOL.filter((P) => (P * v) % (P + v) === 0);
    if (fits.length === 0) return null;
    const P = pick(fits);
    shunts = [P];
    value = par(P, v);
  }
  return value <= 120 ? sections : null;
}

/** Value and reduction steps of everything hanging behind series resistor k. */
function behind(sections: Section[], k: number): { value: number; steps: string[] } {
  const s = sections[k];
  if (k === sections.length - 1) {
    return s.shunts.length === 2
      ? { value: par(s.shunts[0], s.shunts[1]), steps: [`Verst van de klemmen staan twee weerstanden parallel: ${parStep(s.shunts[0], s.shunts[1])}.`] }
      : { value: s.shunts[0], steps: [`Verst van de klemmen zit alleen de ${fmt(s.shunts[0])} Ω-weerstand.`] };
  }
  const inner = behind(sections, k + 1);
  const chain = sections[k + 1].series + inner.value;
  const P = s.shunts[0];
  return {
    value: par(P, chain),
    steps: [
      ...inner.steps,
      `Die staat in serie met ${fmt(sections[k + 1].series)} Ω: ${fmt(sections[k + 1].series)} + ${fmt(inner.value)} = ${fmt(chain)} Ω.`,
      `Dat geheel staat parallel aan ${fmt(P)} Ω: ${parStep(P, chain)}.`,
    ],
  };
}

function ladderCircuit(sections: Section[], unknown: number | null): GridSpec {
  const H = 2.2;
  const elements: GridElement[] = [];
  const dots: Pt[] = [];
  let x = 0;
  sections.forEach((s, k) => {
    const isUnknown = k === unknown;
    elements.push({
      kind: 'R', id: `S${k}`, from: [x, 0], to: [x + 1.6, 0], value: s.series,
      label: isUnknown ? 'R = ?' : `${fmt(s.series)} Ω`,
    });
    x += 1.6;
    s.shunts.forEach((P, j) => {
      const sx = x + j * 1.2;
      elements.push({ kind: 'R', id: `P${k}${j}`, from: [sx, 0], to: [sx, H], value: P, label: `${fmt(P)} Ω` });
      const lastColumn = k === sections.length - 1 && j === s.shunts.length - 1;
      if (!lastColumn) dots.push([sx, 0], [sx, H]);
    });
  });
  const pairEnd = sections[sections.length - 1].shunts.length === 2;
  const right = pairEnd ? x + 1.2 : x;
  return {
    wires: [[[0, H], [right, H]], ...(pairEnd ? [[[x, 0], [right, 0]] as Pt[]] : [])],
    elements,
    dots,
    terminals: [
      { at: [0, 0], label: 'a', side: 'left' },
      { at: [0, H], label: 'b', side: 'left' },
    ],
    highlight: unknown === null ? [] : [`S${unknown}`],
  };
}

export function buildEquivalent(level: number, inverse: boolean): Built {
  const n = level >= 2 ? 3 : 2;
  const pairAtEnd = level >= 1 && Math.random() < 0.6;
  let sections: Section[] | null = null;
  while (!sections) sections = makeLadder(n, pairAtEnd);

  const front = behind(sections, 0);
  const Rab = sections[0].series + front.value;

  if (!inverse) {
    return {
      title: 'Vervangingsweerstand',
      steps: [
        `Werk van <b>ver weg naar de klemmen toe</b>: combineer steeds de weerstanden die zuiver in serie of parallel staan.`,
        ...front.steps,
        `Vooraan staat ${fmt(sections[0].series)} Ω in serie: R<sub>ab</sub> = ${fmt(sections[0].series)} + ${fmt(front.value)} = <b>${fmt(Rab)} Ω</b>.`,
      ],
      variants: [variant(`Bepaal de vervangingsweerstand R<sub>ab</sub> tussen de klemmen a en b.`, 'Ω', Rab, [])],
      circuit: ladderCircuit(sections, null),
    };
  }

  const u = 1 + Math.floor(Math.random() * (n - 1));
  const steps = [
    `Nu werk je andersom: <b>pel het netwerk af vanaf de klemmen</b> tot je bij R uitkomt. Serie: trek af. Parallel: 1/R<sub>rest</sub> = 1/R<sub>totaal</sub> − 1/R<sub>parallel</sub>.`,
  ];
  let cur = Rab;
  for (let j = 0; j < u; j++) {
    const S = sections[j].series;
    const P = sections[j].shunts[0];
    const afterSeries = cur - S;
    const rest = (afterSeries * P) / (P - afterSeries);
    steps.push(
      `${fmt(S)} Ω staat vooraan in serie, dus de rest is samen ${fmt(cur)} − ${fmt(S)} = ${fmt(afterSeries)} Ω.`,
      `Die ${fmt(afterSeries)} Ω is ${fmt(P)} Ω parallel aan de tak met R: 1/R<sub>tak</sub> = 1/${fmt(afterSeries)} − 1/${fmt(P)} → R<sub>tak</sub> = ${fmt(afterSeries)}·${fmt(P)}/(${fmt(P)} − ${fmt(afterSeries)}) = ${fmt(rest)} Ω.`,
    );
    cur = rest;
  }
  const tail = behind(sections, u);
  const R = sections[u].series;
  steps.push(
    `Reken uit wat er achter R zit:`,
    ...tail.steps,
    `De tak is R in serie met ${fmt(tail.value)} Ω: R + ${fmt(tail.value)} = ${fmt(cur)} → R = <b>${fmt(R)} Ω</b>.`,
  );

  return {
    title: 'Vervangingsweerstand · terugrekenen',
    steps,
    variants: [variant(`Tussen de klemmen a en b meet je R<sub>ab</sub> = ${fmt(Rab)} Ω. Bepaal de waarde van R.`, 'Ω', R, [], [`S${u}`])],
    circuit: ladderCircuit(sections, u),
  };
}

export function generateEquivalent(streak = 0): Problem {
  const level = difficultyLevel(streak);
  return problemFrom('equivalent', 'mixed', buildEquivalent(level, level >= 1 && Math.random() < 0.45));
}
