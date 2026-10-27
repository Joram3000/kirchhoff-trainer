import type { GridElement, GridSpec, Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { fmt } from '../utils/format';
import { difficultyLevel } from '../utils/difficulty';
import { variant, problemFrom, abTerminals, ohm, volt, amp, type Built } from './built';

const R_POOL = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40] as const;
const randR = () => pick(R_POOL);
const par = (a: number, b: number) => (a * b) / (a + b);
const p = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n));

/** A two-terminal network with its Thévenin/Norton values and how to find each one. */
export interface TwoTerminal {
  title: string;
  circuit: GridSpec;
  Vt: number;
  Rt: number;
  In: number;
  rtSteps: string[];
  vtSteps: string[];
  inSteps: string[];
}

export const PLAN =
  `Stappenplan: V<sub>t</sub> = open klemspanning v<sub>ab</sub>, I<sub>n</sub> = kortsluitstroom van a naar b, R<sub>t</sub> = vervangingsweerstand gezien vanaf a-b met alle bronnen uit (spanningsbron → kortsluiting, stroombron → open). Altijd geldt V<sub>t</sub> = I<sub>n</sub>·R<sub>t</sub>.`;

/** Les 5 / P2.83-light: a voltage divider, optionally with a series resistor towards the terminals. */
function divider(withR3: boolean): TwoTerminal {
  const Vs = niceInt(6, 48);
  const R1 = randR();
  const R2 = randR();
  const R3 = withR3 ? randR() : 0;
  const Rp = par(R1, R2);
  const Vt = (Vs * R2) / (R1 + R2);
  const Rt = Rp + R3;
  const In = Vt / Rt;
  const xT = withR3 ? 3.8 : 3.4;
  const elements: GridElement[] = [
    { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: volt('V_s', Vs), side: 'left', value: Vs },
    { kind: 'R', from: [0, 0], to: [2, 0], label: ohm('R_1', R1), value: R1 },
    { kind: 'R', from: [2, 0], to: [2, 2], label: ohm('R_2', R2), side: withR3 ? 'right' : 'left', value: R2 },
  ];
  if (withR3) elements.push({ kind: 'R', from: [2, 0], to: [xT, 0], label: ohm('R_3', R3), value: R3 });

  return {
    title: 'Thévenin · spanningsdeler',
    Vt,
    Rt,
    In,
    rtSteps: [
      `Zet de spanningsbron uit (kortsluiting). Vanaf a-b gezien staan R<sub>1</sub> en R<sub>2</sub> dan parallel${withR3 ? `, met R<sub>3</sub> daar in serie mee` : ''}.`,
      withR3
        ? `R<sub>t</sub> = R<sub>1</sub> ∥ R<sub>2</sub> + R<sub>3</sub> = ${fmt(R1)}·${fmt(R2)}/(${fmt(R1)} + ${fmt(R2)}) + ${fmt(R3)} = ${fmt(Rp)} + ${fmt(R3)} = <b>${fmt(Rt)} Ω</b>`
        : `R<sub>t</sub> = R<sub>1</sub> ∥ R<sub>2</sub> = ${fmt(R1)}·${fmt(R2)}/(${fmt(R1)} + ${fmt(R2)}) = <b>${fmt(Rt)} Ω</b>`,
    ],
    vtSteps: [
      withR3
        ? `Met open klemmen loopt er geen stroom door R<sub>3</sub>, dus valt er niets over: V<sub>t</sub> is de spanning over R<sub>2</sub>.`
        : `Met open klemmen is V<sub>t</sub> gewoon de spanning over R<sub>2</sub>.`,
      `Spanningsdeler: V<sub>t</sub> = V<sub>s</sub>·R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>) = ${fmt(Vs)}·${fmt(R2)}/(${fmt(R1)} + ${fmt(R2)}) = <b>${fmt(Vt)} V</b>`,
    ],
    inSteps: withR3
      ? [`Kortsluitstroom via V<sub>t</sub> en R<sub>t</sub>: I<sub>n</sub> = V<sub>t</sub>/R<sub>t</sub> = ${fmt(Vt)}/${fmt(Rt)} = <b>${fmt(In)} A</b>.`]
      : [
          `Sluit a-b kort: R<sub>2</sub> wordt kortgesloten, alle stroom gaat via R<sub>1</sub> door de kortsluiting: I<sub>n</sub> = V<sub>s</sub>/R<sub>1</sub> = ${fmt(Vs)}/${fmt(R1)} = <b>${fmt(In)} A</b>.`,
          `Controle: V<sub>t</sub>/R<sub>t</sub> = ${fmt(Vt)}/${fmt(Rt)} = ${fmt(In)} A ✓`,
        ],
    circuit: {
      wires: withR3 ? [[[0, 2], [xT, 2]]] : [[[0, 2], [xT, 2]], [[2, 0], [xT, 0]]],
      elements,
      dots: [[2, 0], [2, 2]],
      ...abTerminals(xT, 0, 2),
    },
  };
}

/** Les 7 tentamenvraag / P2.82: a current source with R1 across it, R2 in series, R3 across the terminals. */
function currentSource(): TwoTerminal {
  const Is = niceInt(1, 12);
  const up = Math.random() < 0.7;
  const s = up ? Is : -Is;
  const R1 = randR();
  const R2 = randR();
  const R3 = randR();
  const Rt = par(R3, R1 + R2);
  const iBranch = (s * R1) / (R1 + R2 + R3);
  const Vt = iBranch * R3;
  const In = (s * R1) / (R1 + R2);
  const dirNote = up ? '' : ` (de bron wijst naar beneden, dus de stroom is negatief t.o.v. de richting naar a)`;

  return {
    title: 'Thévenin · stroombron',
    Vt,
    Rt,
    In,
    rtSteps: [
      `Zet de stroombron uit (open). Vanaf a-b zie je R<sub>3</sub> parallel aan de serieschakeling R<sub>2</sub> + R<sub>1</sub>.`,
      `R<sub>t</sub> = R<sub>3</sub> ∥ (R<sub>1</sub> + R<sub>2</sub>) = ${fmt(R3)} ∥ ${fmt(R1 + R2)} = ${fmt(R3)}·${fmt(R1 + R2)}/(${fmt(R3)} + ${fmt(R1 + R2)}) = <b>${fmt(Rt)} Ω</b>`,
    ],
    vtSteps: [
      `Met open klemmen verdeelt de bronstroom zich over R<sub>1</sub> en de tak R<sub>2</sub> + R<sub>3</sub> (stroomdeler)${dirNote}: i = ${p(s)}·${fmt(R1)}/(${fmt(R1)} + ${fmt(R2 + R3)}) = ${fmt(iBranch)} A.`,
      `V<sub>t</sub> = i·R<sub>3</sub> = ${p(iBranch)}·${fmt(R3)} = <b>${fmt(Vt)} V</b>`,
    ],
    inSteps: [
      `Sluit a-b kort: R<sub>3</sub> wordt kortgesloten. De bronstroom verdeelt zich nu over R<sub>1</sub> en R<sub>2</sub>${dirNote}.`,
      `I<sub>n</sub> = ${p(s)}·R<sub>1</sub>/(R<sub>1</sub> + R<sub>2</sub>) = ${p(s)}·${fmt(R1)}/(${fmt(R1)} + ${fmt(R2)}) = <b>${fmt(In)} A</b>`,
      `Controle: V<sub>t</sub>/R<sub>t</sub> = ${fmt(Vt)}/${fmt(Rt)} = ${fmt(In)} A ✓`,
    ],
    circuit: {
      wires: [
        [[0, 0], [1.2, 0]],
        [[0, 2], [4.4, 2]],
        [[3, 0], [4.4, 0]],
      ],
      elements: [
        { kind: 'R', from: [0, 0], to: [0, 2], label: ohm('R_1', R1), side: 'left', value: R1 },
        { kind: 'I', from: [1.2, 2], to: [1.2, 0], toward: up ? 'to' : 'from', label: amp('I_s', Is), value: Is },
        { kind: 'R', from: [1.2, 0], to: [3, 0], label: ohm('R_2', R2), value: R2 },
        { kind: 'R', from: [3, 0], to: [3, 2], label: ohm('R_3', R3), value: R3 },
      ],
      dots: [[1.2, 0], [1.2, 2], [3, 0], [3, 2]],
      ...abTerminals(4.4, 0, 2),
    },
  };
}

/** P2.80 / oefentoets opgave 6: voltage source + series R, a shunt R and a current source at the terminals. */
function sourceMix(): TwoTerminal {
  const Vs = niceInt(5, 30);
  const R1 = randR();
  const R2 = randR();
  const Is = niceInt(1, 5);
  const up = Math.random() < 0.7;
  const s = up ? Is : -Is;
  const Rt = par(R1, R2);
  const In = Vs / R1 + s;
  const Vt = In * Rt;

  return {
    title: 'Thévenin · spannings- én stroombron',
    Vt,
    Rt,
    In,
    rtSteps: [
      `Spanningsbron kortsluiten, stroombron openen. Vanaf a-b staan R<sub>1</sub> en R<sub>2</sub> dan parallel.`,
      `R<sub>t</sub> = R<sub>1</sub> ∥ R<sub>2</sub> = ${fmt(R1)}·${fmt(R2)}/(${fmt(R1)} + ${fmt(R2)}) = <b>${fmt(Rt)} Ω</b>`,
    ],
    inSteps: [
      `Hint: de kortsluitstroom is hier het makkelijkst. Sluit a-b kort: de spanning over R<sub>2</sub> wordt 0, dus door R<sub>2</sub> loopt niets.`,
      `Via R<sub>1</sub> komt V<sub>s</sub>/R<sub>1</sub> = ${fmt(Vs)}/${fmt(R1)} = ${fmt(Vs / R1)} A; de stroombron ${up ? 'duwt' : 'trekt'} er ${fmt(Is)} A ${up ? 'bij' : 'af'}.`,
      `I<sub>n</sub> = ${fmt(Vs / R1)} ${up ? '+' : '−'} ${fmt(Is)} = <b>${fmt(In)} A</b>`,
    ],
    vtSteps: [
      `Knooppuntvergelijking in a (open klemmen): (V<sub>t</sub> − ${fmt(Vs)})/${fmt(R1)} + V<sub>t</sub>/${fmt(R2)} = ${p(s)}.`,
      `V<sub>t</sub>·(1/${fmt(R1)} + 1/${fmt(R2)}) = ${fmt(Vs)}/${fmt(R1)} ${up ? '+' : '−'} ${fmt(Is)} → V<sub>t</sub> = ${fmt(In)}·${fmt(Rt)} = <b>${fmt(Vt)} V</b> (dat is precies I<sub>n</sub>·R<sub>t</sub>).`,
    ],
    circuit: {
      wires: [
        [[0, 2], [4.6, 2]],
        [[2, 0], [4.6, 0]],
      ],
      elements: [
        { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: volt('V_s', Vs), side: 'left', value: Vs },
        { kind: 'R', from: [0, 0], to: [2, 0], label: ohm('R_1', R1), value: R1 },
        { kind: 'R', from: [2, 0], to: [2, 2], label: ohm('R_2', R2), side: 'left', value: R2 },
        { kind: 'I', from: [3.2, 2], to: [3.2, 0], toward: up ? 'to' : 'from', label: amp('I_s', Is), value: Is },
      ],
      dots: [[2, 0], [2, 2], [3.2, 0], [3.2, 2]],
      ...abTerminals(4.6, 0, 2),
    },
  };
}

/** P2.83: two divider sections in cascade. */
function twoStage(): TwoTerminal {
  const Vs = niceInt(10, 48);
  const [R1, R2, R3, R4] = [randR(), randR(), randR(), randR()];
  const loadOnR2 = par(R2, R3 + R4);
  const v1 = (Vs * loadOnR2) / (R1 + loadOnR2);
  const Vt = (v1 * R4) / (R3 + R4);
  const Rt = par(R4, R3 + par(R1, R2));
  const In = Vt / Rt;

  return {
    title: 'Thévenin · twee secties',
    Vt,
    Rt,
    In,
    rtSteps: [
      `Spanningsbron kortsluiten. Van links naar rechts: R<sub>1</sub> ∥ R<sub>2</sub> = ${fmt(par(R1, R2))} Ω, in serie met R<sub>3</sub> geeft ${fmt(R3 + par(R1, R2))} Ω, en dat parallel aan R<sub>4</sub>.`,
      `R<sub>t</sub> = R<sub>4</sub> ∥ (R<sub>3</sub> + R<sub>1</sub> ∥ R<sub>2</sub>) = ${fmt(R4)} ∥ ${fmt(R3 + par(R1, R2))} = <b>${fmt(Rt)} Ω</b>`,
    ],
    vtSteps: [
      `Open klemmen: R<sub>3</sub> en R<sub>4</sub> staan in serie (${fmt(R3 + R4)} Ω), parallel aan R<sub>2</sub>: ${fmt(R2)} ∥ ${fmt(R3 + R4)} = ${fmt(loadOnR2)} Ω.`,
      `Spanningsdeler 1: v<sub>1</sub> = ${fmt(Vs)}·${fmt(loadOnR2)}/(${fmt(R1)} + ${fmt(loadOnR2)}) = ${fmt(v1)} V.`,
      `Spanningsdeler 2: V<sub>t</sub> = v<sub>1</sub>·R<sub>4</sub>/(R<sub>3</sub> + R<sub>4</sub>) = ${fmt(v1)}·${fmt(R4)}/${fmt(R3 + R4)} = <b>${fmt(Vt)} V</b>`,
    ],
    inSteps: [`I<sub>n</sub> = V<sub>t</sub>/R<sub>t</sub> = ${fmt(Vt)}/${fmt(Rt)} = <b>${fmt(In)} A</b>`],
    circuit: {
      wires: [
        [[0, 2], [5, 2]],
        [[3.6, 0], [5, 0]],
      ],
      elements: [
        { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: volt('V_s', Vs), side: 'left', value: Vs },
        { kind: 'R', from: [0, 0], to: [1.8, 0], label: ohm('R_1', R1), value: R1 },
        { kind: 'R', from: [1.8, 0], to: [1.8, 2], label: ohm('R_2', R2), value: R2 },
        { kind: 'R', from: [1.8, 0], to: [3.6, 0], label: ohm('R_3', R3), value: R3 },
        { kind: 'R', from: [3.6, 0], to: [3.6, 2], label: ohm('R_4', R4), value: R4 },
      ],
      dots: [[1.8, 0], [1.8, 2], [3.6, 0], [3.6, 2]],
      ...abTerminals(5, 0, 2),
    },
  };
}

/** Every template, grouped by the difficulty level that unlocks it. */
const TEMPLATES_BY_LEVEL: ReadonlyArray<ReadonlyArray<() => TwoTerminal>> = [
  [() => divider(false), currentSource],
  [() => divider(true), sourceMix],
  [twoStage],
];

export function buildTwoTerminal(level: number): TwoTerminal {
  return pick(TEMPLATES_BY_LEVEL.slice(0, level + 1).flat())();
}

/** P2.81 / P2.86: deduce R_t of a source from an open-circuit and a loaded measurement. */
function measured(): Built {
  const Rt = pick([1, 2, 4, 5, 10, 20, 25, 50] as const);
  const RL = pick([10, 20, 40, 50, 100] as const);
  const i = pick([0.1, 0.2, 0.25, 0.5, 1] as const);
  const Vt = i * (Rt + RL);
  const VL = i * RL;

  return {
    title: 'Thévenin · uit een meting',
    steps: [
      `Model de bron als V<sub>t</sub> in serie met R<sub>t</sub>. Onbelast meet je de open klemspanning, dus V<sub>t</sub> = ${fmt(Vt)} V.`,
      `Met R<sub>L</sub> = ${fmt(RL)} Ω erop loopt er i = v<sub>L</sub>/R<sub>L</sub> = ${fmt(VL)}/${fmt(RL)} = ${fmt(i)} A.`,
      `Over R<sub>t</sub> valt het verschil: ${fmt(Vt)} − ${fmt(VL)} = ${fmt(Vt - VL)} V.`,
      `R<sub>t</sub> = ${fmt(Vt - VL)}/${fmt(i)} = <b>${fmt(Rt)} Ω</b> (of met de spanningsdeler: ${fmt(VL)} = ${fmt(Vt)}·R<sub>L</sub>/(R<sub>t</sub> + R<sub>L</sub>)).`,
    ],
    variants: [
      variant(
        `Een bron heeft onbelast een klemspanning van ${fmt(Vt)} V. Sluit je een weerstand R<sub>L</sub> = ${fmt(RL)} Ω aan, dan daalt de klemspanning naar ${fmt(VL)} V. Bepaal de inwendige weerstand (Thévenin-weerstand) R<sub>t</sub>.`,
        'Ω',
        Rt,
        [],
        ['Rt'],
      ),
    ],
    circuit: {
      wires: [
        [[0, 2], [3.4, 2]],
        [[2.4, 0], [3.4, 0]],
      ],
      elements: [
        { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: 'V_t', side: 'left', value: Vt },
        { kind: 'R', id: 'Rt', from: [0, 0], to: [2.4, 0], label: 'R_t = ?', value: Rt },
        { kind: 'R', from: [3.4, 0], to: [3.4, 2], label: ohm('R_L', RL), value: RL, polarity: { plus: 'from', label: 'v_L', side: 'left' } },
      ],
      terminals: [
        { at: [2.4, 0], label: 'a', side: 'above' },
        { at: [2.4, 2], label: 'b', side: 'below' },
      ],
    },
  };
}

function theveninBuilt(t: TwoTerminal): Built {
  const RL = randR();
  const iL = t.Vt / (t.Rt + RL);
  return {
    title: t.title,
    steps: [PLAN],
    variants: [
      variant(`Bepaal de Thévenin-weerstand R<sub>t</sub> van het netwerk, gezien vanaf de klemmen a-b.`, 'Ω', t.Rt, t.rtSteps),
      variant(`Bepaal de Thévenin-spanning V<sub>t</sub> (de open klemspanning v<sub>ab</sub>).`, 'V', t.Vt, t.vtSteps),
      variant(`Bepaal de Norton-stroom I<sub>n</sub> (de kortsluitstroom van a naar b).`, 'A', t.In, t.inSteps),
      variant(
        `Op a-b wordt een belasting R<sub>L</sub> = ${fmt(RL)} Ω aangesloten. Bepaal de stroom i<sub>L</sub> door R<sub>L</sub> (van a via R<sub>L</sub> naar b).`,
        'A',
        iL,
        [
          ...t.rtSteps,
          ...t.vtSteps,
          `Vervang het netwerk door V<sub>t</sub> in serie met R<sub>t</sub> en hang R<sub>L</sub> eraan: i<sub>L</sub> = V<sub>t</sub>/(R<sub>t</sub> + R<sub>L</sub>) = ${fmt(t.Vt)}/(${fmt(t.Rt)} + ${fmt(RL)}) = <b>${fmt(iL)} A</b>`,
        ],
      ),
    ],
    circuit: t.circuit,
  };
}

export function buildThevenin(level: number): Built {
  return theveninBuilt(buildTwoTerminal(level));
}

export function generateThevenin(streak = 0): Problem {
  const level = difficultyLevel(streak);
  const built = level >= 1 && Math.random() < 0.2 ? measured() : buildThevenin(level);
  return problemFrom('thevenin', 'theorem', built);
}
