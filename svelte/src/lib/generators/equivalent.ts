import type { GridElement, GridSpec, Problem, Pt } from '../types';
import { pick } from '../utils/random';
import { fmt } from '../utils/format';
import { difficultyLevel } from '../utils/difficulty';
import { d, t } from '../utils/tex';
import { variant, problemFrom, type Built } from './built';

const SERIES_POOL = [2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20] as const;
const SHUNT_POOL = [2, 3, 4, 5, 6, 8, 10, 12, 15, 16, 18, 20, 24, 30, 36, 40, 60] as const;
/** Pairs whose parallel combination is a whole number of ohms. */
const NICE_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [3, 6], [4, 4], [6, 6], [4, 12], [6, 12], [8, 8], [5, 20], [10, 10], [12, 12],
  [10, 15], [8, 24], [12, 24], [16, 16], [20, 20], [15, 30], [12, 6], [24, 8],
];

const par = (a: number, b: number) => (a * b) / (a + b);
/** "a ∥ b = a·b / (a + b) = c Ω" as TeX; `aligned` puts the first "=" on the alignment point of an aligned block. */
const parStep = (a: number, b: number, aligned = false) =>
  t`${a} \parallel ${b} ${aligned ? '&=' : '='} \frac{${a} \cdot ${b}}{${a} + ${b}} = ${par(a, b)}\,\Omega`;

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
      ? { value: par(s.shunts[0], s.shunts[1]), steps: [`Verst van de klemmen staan twee weerstanden parallel:${d`${parStep(s.shunts[0], s.shunts[1])}`}`] }
      : { value: s.shunts[0], steps: [`Verst van de klemmen zit alleen de ${fmt(s.shunts[0])} Ω-weerstand.`] };
  }
  const inner = behind(sections, k + 1);
  const S = sections[k + 1].series;
  const chain = S + inner.value;
  const P = s.shunts[0];
  return {
    value: par(P, chain),
    steps: [
      ...inner.steps,
      `Dat staat in serie met ${fmt(S)} Ω, en dat geheel parallel aan ${fmt(P)} Ω:${d`\begin{aligned}
        ${S} + ${inner.value} &= ${chain}\,\Omega \\
        ${parStep(P, chain, true)}
      \end{aligned}`}`,
    ],
  };
}

/** The ladder as one expression, from the terminals inwards; `unknown` is the series resistor written as R. */
function structure(sections: Section[], unknown: number | null, k = 0): string {
  const s = sections[k];
  const S = k === unknown ? 'R' : t`${s.series}`;
  const rest =
    k === sections.length - 1
      ? s.shunts.length === 2
        ? t`(${s.shunts[0]} \parallel ${s.shunts[1]})`
        : t`${s.shunts[0]}`
      : t`${s.shunts[0]} \parallel \bigl(${structure(sections, unknown, k + 1)}\bigr)`;
  return `${S} + ${rest}`;
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
        `Schrijf eerst de opbouw op, van de klemmen naar binnen (∥ betekent parallel):${d`R_{ab} = ${structure(sections, null)}`}`,
        `Werk dan van <b>ver weg naar de klemmen toe</b>: combineer steeds de weerstanden die zuiver in serie of parallel staan.`,
        ...front.steps,
        `Vooraan staat ${fmt(sections[0].series)} Ω in serie:${d`R_{ab} = ${sections[0].series} + ${front.value} = \boxed{${Rab}\,\Omega}`}`,
      ],
      variants: [variant(`Bepaal de vervangingsweerstand R<sub>ab</sub> tussen de klemmen a en b.`, 'Ω', Rab, [])],
      circuit: ladderCircuit(sections, null),
    };
  }

  const u = 1 + Math.floor(Math.random() * (n - 1));
  const steps = [
    `Schrijf de opbouw op, van de klemmen naar binnen:${d`R_{ab} = ${structure(sections, u)} = ${Rab}\,\Omega`}`,
    `Werk nu andersom: <b>pel het netwerk af vanaf de klemmen</b> tot je bij R uitkomt. Staat er iets in serie, trek het af. Staat er iets parallel, gebruik${d`\frac{1}{R_{\text{rest}}} = \frac{1}{R_{\text{totaal}}} - \frac{1}{R_{\text{parallel}}}`}`,
  ];
  let cur = Rab;
  for (let j = 0; j < u; j++) {
    const S = sections[j].series;
    const P = sections[j].shunts[0];
    const afterSeries = cur - S;
    const rest = (afterSeries * P) / (P - afterSeries);
    steps.push(
      `Haal de ${fmt(S)} Ω eraf die vooraan in serie staat; wat overblijft is ${fmt(P)} Ω parallel aan de tak met R:${d`\begin{aligned}
        ${cur} - ${S} &= ${afterSeries}\,\Omega \\
        \frac{1}{R_{\text{tak}}} &= \frac{1}{${afterSeries}} - \frac{1}{${P}} \\
        R_{\text{tak}} &= \frac{${afterSeries} \cdot ${P}}{${P} - ${afterSeries}} = ${rest}\,\Omega
      \end{aligned}`}`,
    );
    cur = rest;
  }
  const tail = behind(sections, u);
  const R = sections[u].series;
  steps.push(
    `Reken uit wat er achter R zit:`,
    ...tail.steps,
    `De tak is R in serie met ${fmt(tail.value)} Ω:${d`\begin{aligned}
      R + ${tail.value} &= ${cur} \\
      R &= ${cur} - ${tail.value} = \boxed{${R}\,\Omega}
    \end{aligned}`}`,
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
