import type { GridElement, GridSpec, Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { fmt } from '../utils/format';
import { difficultyLevel } from '../utils/difficulty';
import { m, d, par, result } from '../utils/tex';
import { variant, problemFrom, abTerminals, ohm, volt, amp, type Built } from './built';

const R_POOL = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40] as const;
const randR = () => pick(R_POOL);
const parallel = (a: number, b: number) => (a * b) / (a + b);

/**
 * A two-terminal network with its Thévenin/Norton values and how to find
 * each one. The step builders take `final`: whether that value is the asked
 * answer (and so gets boxed) or an intermediate result.
 */
export interface TwoTerminal {
  title: string;
  circuit: GridSpec;
  Vt: number;
  Rt: number;
  In: number;
  rtSteps: (final: boolean) => string[];
  vtSteps: (final: boolean) => string[];
  inSteps: (final: boolean) => string[];
}

export const PLAN = `Stappenplan voor het Thévenin- en Norton-equivalent:${d`\begin{aligned}
  V_t &= v_{ab} \text{ bij open klemmen} \\
  I_n &= \text{kortsluitstroom van a naar b} \\
  R_t &= \text{vervangingsweerstand vanaf a-b, met alle bronnen uit} \\
  V_t &= I_n \cdot R_t
\end{aligned}`}Bronnen uitzetten: een spanningsbron wordt een kortsluiting, een stroombron wordt open.`;

/** Les 5 / P2.83-light: a voltage divider, optionally with a series resistor towards the terminals. */
function divider(withR3: boolean): TwoTerminal {
  const Vs = niceInt(6, 48);
  const R1 = randR();
  const R2 = randR();
  const R3 = withR3 ? randR() : 0;
  const Rp = parallel(R1, R2);
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
    rtSteps: (final) => [
      withR3
        ? `Zet de spanningsbron uit (kortsluiting). Vanaf a-b gezien staan ${m`R_1`} en ${m`R_2`} dan parallel, met ${m`R_3`} daar in serie mee:${d`\begin{aligned}
            R_t &= R_1 \parallel R_2 + R_3 \\
                &= \frac{${R1} \cdot ${R2}}{${R1} + ${R2}} + ${R3} = ${Rp} + ${R3} = ${result(Rt, 'Ω', final)}
          \end{aligned}`}`
        : `Zet de spanningsbron uit (kortsluiting). Vanaf a-b gezien staan ${m`R_1`} en ${m`R_2`} dan parallel:${d`R_t = R_1 \parallel R_2 = \frac{${R1} \cdot ${R2}}{${R1} + ${R2}} = ${result(Rt, 'Ω', final)}`}`,
    ],
    vtSteps: (final) => [
      `${
        withR3
          ? `Met open klemmen loopt er geen stroom door ${m`R_3`}, dus valt er niets over: ${m`V_t`} is de spanning over ${m`R_2`}.`
          : `Met open klemmen is ${m`V_t`} gewoon de spanning over ${m`R_2`}.`
      } Spanningsdeler:${d`V_t = V_s \cdot \frac{R_2}{R_1 + R_2} = ${Vs} \cdot \frac{${R2}}{${R1} + ${R2}} = ${result(Vt, 'V', final)}`}`,
    ],
    inSteps: (final) =>
      withR3
        ? [`Uit ${m`V_t`} en ${m`R_t`}:${d`I_n = \frac{V_t}{R_t} = \frac{${Vt}}{${Rt}} = ${result(In, 'A', final)}`}`]
        : [
            `Sluit a-b kort: ${m`R_2`} wordt kortgesloten, dus alle stroom gaat via ${m`R_1`} door de kortsluiting:${d`I_n = \frac{V_s}{R_1} = \frac{${Vs}}{${R1}} = ${result(In, 'A', final)}`}`,
            `Controle:${d`\frac{V_t}{R_t} = \frac{${Vt}}{${Rt}} = ${In}\,\mathrm{A} \;\checkmark`}`,
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
  const Rt = parallel(R3, R1 + R2);
  const iBranch = (s * R1) / (R1 + R2 + R3);
  const Vt = iBranch * R3;
  const In = (s * R1) / (R1 + R2);
  const dirNote = up ? '' : ` De bron wijst naar beneden, dus reken met ${m`I_s = ${s}\,\mathrm{A}`}.`;

  return {
    title: 'Thévenin · stroombron',
    Vt,
    Rt,
    In,
    rtSteps: (final) => [
      `Zet de stroombron uit (open). Vanaf a-b zie je ${m`R_3`} parallel aan de serieschakeling ${m`R_1 + R_2`}:${d`R_t = R_3 \parallel (R_1 + R_2) = \frac{${R3} \cdot ${R1 + R2}}{${R3} + ${R1 + R2}} = ${result(Rt, 'Ω', final)}`}`,
    ],
    vtSteps: (final) => [
      `Met open klemmen verdeelt de bronstroom zich over ${m`R_1`} en de tak ${m`R_2 + R_3`} (stroomdeler).${dirNote}${d`\begin{aligned}
        i_3 &= I_s \cdot \frac{R_1}{R_1 + R_2 + R_3} = ${par(s)} \cdot \frac{${R1}}{${R1 + R2 + R3}} = ${iBranch}\,\mathrm{A} \\
        V_t &= i_3 \cdot R_3 = ${par(iBranch)} \cdot ${R3} = ${result(Vt, 'V', final)}
      \end{aligned}`}`,
    ],
    inSteps: (final) => [
      `Sluit a-b kort: ${m`R_3`} wordt kortgesloten en de bronstroom verdeelt zich over ${m`R_1`} en ${m`R_2`}.${dirNote}${d`I_n = I_s \cdot \frac{R_1}{R_1 + R_2} = ${par(s)} \cdot \frac{${R1}}{${R1} + ${R2}} = ${result(In, 'A', final)}`}`,
      `Controle:${d`I_n \cdot R_t = ${par(In)} \cdot ${Rt} = ${Vt}\,\mathrm{V} = V_t \;\checkmark`}`,
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
  const Rt = parallel(R1, R2);
  const In = Vs / R1 + s;
  const Vt = In * Rt;
  const sign = up ? '+' : '-';

  return {
    title: 'Thévenin · spannings- én stroombron',
    Vt,
    Rt,
    In,
    rtSteps: (final) => [
      `Spanningsbron kortsluiten, stroombron openen. Vanaf a-b staan ${m`R_1`} en ${m`R_2`} dan parallel:${d`R_t = R_1 \parallel R_2 = \frac{${R1} \cdot ${R2}}{${R1} + ${R2}} = ${result(Rt, 'Ω', final)}`}`,
    ],
    inSteps: (final) => [
      `De kortsluitstroom is hier het makkelijkst. Sluit a-b kort: de spanning over ${m`R_2`} wordt 0, dus door ${m`R_2`} loopt niets. Via ${m`R_1`} komt ${m`V_s/R_1`}, en de stroombron ${up ? 'duwt er' : 'trekt er'} ${fmt(Is)} A ${up ? 'bij' : 'af'}:${d`I_n = \frac{V_s}{R_1} ${sign} I_s = \frac{${Vs}}{${R1}} ${sign} ${Is} = ${result(In, 'A', final)}`}`,
    ],
    vtSteps: (final) => [
      `Knooppuntvergelijking in a, met open klemmen:${d`\begin{aligned}
        \frac{V_t - ${Vs}}{${R1}} + \frac{V_t}{${R2}} &= ${s} \\
        V_t \left(\frac{1}{${R1}} + \frac{1}{${R2}}\right) &= \frac{${Vs}}{${R1}} ${sign} ${Is} \\
        V_t &= ${In} \cdot ${Rt} = ${result(Vt, 'V', final)}
      \end{aligned}`}Dat is precies ${m`I_n \cdot R_t`}.`,
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
  const p12 = parallel(R1, R2);
  const loadOnR2 = parallel(R2, R3 + R4);
  const v1 = (Vs * loadOnR2) / (R1 + loadOnR2);
  const Vt = (v1 * R4) / (R3 + R4);
  const Rt = parallel(R4, R3 + p12);
  const In = Vt / Rt;

  return {
    title: 'Thévenin · twee secties',
    Vt,
    Rt,
    In,
    rtSteps: (final) => [
      `Spanningsbron kortsluiten en van links naar rechts combineren:${d`\begin{aligned}
        R_1 \parallel R_2 &= \frac{${R1} \cdot ${R2}}{${R1} + ${R2}} = ${p12}\,\Omega \\
        R_t &= R_4 \parallel (R_3 + R_1 \parallel R_2) = ${R4} \parallel ${R3 + p12} = ${result(Rt, 'Ω', final)}
      \end{aligned}`}`,
    ],
    vtSteps: (final) => [
      `Open klemmen: ${m`R_3`} en ${m`R_4`} staan in serie, en samen parallel aan ${m`R_2`}. Daarna twee keer de spanningsdeler:${d`\begin{aligned}
        R_2 \parallel (R_3 + R_4) &= ${R2} \parallel ${R3 + R4} = ${loadOnR2}\,\Omega \\
        v_1 &= ${Vs} \cdot \frac{${loadOnR2}}{${R1} + ${loadOnR2}} = ${v1}\,\mathrm{V} \\
        V_t &= v_1 \cdot \frac{R_4}{R_3 + R_4} = ${v1} \cdot \frac{${R4}}{${R3 + R4}} = ${result(Vt, 'V', final)}
      \end{aligned}`}`,
    ],
    inSteps: (final) => [`Uit ${m`V_t`} en ${m`R_t`}:${d`I_n = \frac{V_t}{R_t} = \frac{${Vt}}{${Rt}} = ${result(In, 'A', final)}`}`],
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
      `Model de bron als ${m`V_t`} in serie met ${m`R_t`}. Onbelast meet je de open klemspanning:${d`V_t = ${Vt}\,\mathrm{V}`}`,
      `Met ${m`R_L`} erop loopt er:${d`i = \frac{v_L}{R_L} = \frac{${VL}}{${RL}} = ${i}\,\mathrm{A}`}`,
      `Over ${m`R_t`} valt het verschil tussen beide spanningen:${d`R_t = \frac{V_t - v_L}{i} = \frac{${Vt} - ${VL}}{${i}} = \boxed{${Rt}\,\Omega}`}`,
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
      variant(`Bepaal de Thévenin-weerstand R<sub>t</sub> van het netwerk, gezien vanaf de klemmen a-b.`, 'Ω', t.Rt, t.rtSteps(true)),
      variant(`Bepaal de Thévenin-spanning V<sub>t</sub> (de open klemspanning v<sub>ab</sub>).`, 'V', t.Vt, t.vtSteps(true)),
      variant(`Bepaal de Norton-stroom I<sub>n</sub> (de kortsluitstroom van a naar b).`, 'A', t.In, t.inSteps(true)),
      variant(
        `Op a-b wordt een belasting R<sub>L</sub> = ${fmt(RL)} Ω aangesloten. Bepaal de stroom i<sub>L</sub> door R<sub>L</sub> (van a via R<sub>L</sub> naar b).`,
        'A',
        iL,
        [
          ...t.rtSteps(false),
          ...t.vtSteps(false),
          `Vervang het netwerk door ${m`V_t`} in serie met ${m`R_t`} en sluit ${m`R_L`} aan:${d`i_L = \frac{V_t}{R_t + R_L} = \frac{${t.Vt}}{${t.Rt} + ${RL}} = \boxed{${iL}\,\mathrm{A}}`}`,
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
