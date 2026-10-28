import type { Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { difficultyLevel } from '../utils/difficulty';
import { m, d, par } from '../utils/tex';
import { variant, problemFrom, ohm, volt, amp, type Built } from './built';

const R_POOL = [2, 4, 5, 6, 8, 10, 12, 15, 20, 30] as const;
const randR = () => pick(R_POOL);
const parallel = (a: number, b: number) => (a * b) / (a + b);

const OFF = `Plan van aanpak: zet steeds één bron aan en de andere uit — een spanningsbron uit = <b>kortsluiten</b>, een stroombron uit = <b>openen</b> (weghalen). Tel daarna de bijdragen op.`;

/** Shared three-question set: each contribution, then the sum. */
function contributions(
  first: { source: string; value: number },
  second: { source: string; value: number },
  highlight: string[],
): Built['variants'] {
  const total = first.value + second.value;
  return [
    variant(
      `Superpositie, stap 1: laat alleen ${first.source} aan staan. Hoe groot is de bijdrage i′ aan de stroom i?`,
      'A',
      first.value,
      [`Gevraagd is de eerste bijdrage:${d`i' = \boxed{${first.value}\,\mathrm{A}}`}`],
      highlight,
    ),
    variant(
      `Superpositie, stap 2: laat alleen ${second.source} aan staan. Hoe groot is de bijdrage i″ aan de stroom i?`,
      'A',
      second.value,
      [`Gevraagd is de tweede bijdrage:${d`i'' = \boxed{${second.value}\,\mathrm{A}}`}`],
      highlight,
    ),
    variant(`Bepaal met het superpositiebeginsel de stroom i (richting zoals aangegeven).`, 'A', total, [
      `Tel de bijdragen op, met hun teken:${d`i = i' + i'' = ${first.value} + ${par(second.value)} = \boxed{${total}\,\mathrm{A}}`}`,
    ], highlight),
  ];
}

/** Les 7 tentamenvraag / P2.94: voltage source with series R, a shunt R (the asked current) and a current source. */
function vAndI(): Built {
  const V = niceInt(5, 40);
  const Is = niceInt(1, 8);
  const up = Math.random() < 0.7;
  const s = up ? Is : -Is;
  const R1 = randR();
  const R2 = randR();
  const i1 = V / (R1 + R2);
  const i2 = (s * R1) / (R1 + R2);

  return {
    title: 'Superpositie · V en I',
    steps: [
      OFF,
      `<b>Alleen ${m`V_s`}</b> (${m`I_s`} open): ${m`R_1`} en ${m`R_2`} staan in serie.${d`i' = \frac{V_s}{R_1 + R_2} = \frac{${V}}{${R1} + ${R2}} = ${i1}\,\mathrm{A}`}`,
      `<b>Alleen ${m`I_s`}</b> (${m`V_s`} kortgesloten): ${m`R_1`} komt parallel aan ${m`R_2`}, dus een stroomdeler${up ? '' : ' (de bron wijst naar beneden, dus reken met een negatieve stroom)'}:${d`i'' = I_s \cdot \frac{R_1}{R_1 + R_2} = ${par(s)} \cdot \frac{${R1}}{${R1} + ${R2}} = ${i2}\,\mathrm{A}`}`,
    ],
    variants: contributions({ source: 'de spanningsbron V<sub>s</sub>', value: i1 }, { source: 'de stroombron I<sub>s</sub>', value: i2 }, ['R2']),
    circuit: {
      wires: [
        [[0, 2], [3.3, 2]],
        [[2, 0], [3.3, 0]],
      ],
      elements: [
        { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: volt('V_s', V), side: 'left', value: V },
        { kind: 'R', from: [0, 0], to: [2, 0], label: ohm('R_1', R1), value: R1 },
        { kind: 'R', id: 'R2', from: [2, 0], to: [2, 2], label: ohm('R_2', R2), side: 'left', value: R2, current: { label: 'i', toward: 'to' } },
        { kind: 'I', from: [3.3, 2], to: [3.3, 0], toward: up ? 'to' : 'from', label: amp('I_s', Is), value: Is },
      ],
      dots: [[2, 0], [2, 2]],
    },
  };
}

/** Les 6 fig. 3.46: two voltage sources feeding a T-network; asks the current through the middle resistor. */
function twoVoltages(): Built {
  const V1 = niceInt(5, 60);
  const V2 = niceInt(5, 90);
  const plus2Top = Math.random() < 0.75;
  const s2 = plus2Top ? V2 : -V2;
  const [R1, R2, R3] = [randR(), randR(), randR()];
  const p23 = parallel(R2, R3);
  const p12 = parallel(R1, R2);
  const vA = (V1 * p23) / (R1 + p23);
  const vB = (s2 * p12) / (R3 + p12);
  const i1 = vA / R2;
  const i2 = vB / R2;

  return {
    title: 'Superpositie · twee spanningsbronnen',
    steps: [
      OFF,
      `<b>Alleen ${m`V_1`}</b> (${m`V_2`} kortgesloten): ${m`R_2`} en ${m`R_3`} staan parallel. Spanningsdeler, dan de wet van Ohm:${d`\begin{aligned}
        R_2 \parallel R_3 &= \frac{${R2} \cdot ${R3}}{${R2} + ${R3}} = ${p23}\,\Omega \\
        v' &= ${V1} \cdot \frac{${p23}}{${R1} + ${p23}} = ${vA}\,\mathrm{V} \\
        i' &= \frac{v'}{R_2} = \frac{${vA}}{${R2}} = ${i1}\,\mathrm{A}
      \end{aligned}`}`,
      `<b>Alleen ${m`V_2`}</b> (${m`V_1`} kortgesloten): nu staan ${m`R_1`} en ${m`R_2`} parallel${plus2Top ? '' : `; de + van ${m`V_2`} zit onder, dus reken met ${m`-${V2}\,\mathrm{V}`}`}:${d`\begin{aligned}
        R_1 \parallel R_2 &= \frac{${R1} \cdot ${R2}}{${R1} + ${R2}} = ${p12}\,\Omega \\
        v'' &= ${par(s2)} \cdot \frac{${p12}}{${R3} + ${p12}} = ${vB}\,\mathrm{V} \\
        i'' &= \frac{v''}{R_2} = \frac{${vB}}{${R2}} = ${i2}\,\mathrm{A}
      \end{aligned}`}`,
    ],
    variants: contributions({ source: 'V<sub>1</sub>', value: i1 }, { source: 'V<sub>2</sub>', value: i2 }, ['R2']),
    circuit: {
      wires: [[[0, 2], [4, 2]]],
      elements: [
        { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: volt('V_1', V1), side: 'left', value: V1 },
        { kind: 'R', from: [0, 0], to: [2, 0], label: ohm('R_1', R1), value: R1 },
        { kind: 'R', id: 'R2', from: [2, 0], to: [2, 2], label: ohm('R_2', R2), side: 'left', value: R2, current: { label: 'i', toward: 'to' } },
        { kind: 'R', from: [2, 0], to: [4, 0], label: ohm('R_3', R3), value: R3 },
        { kind: 'V', from: [4, 0], to: [4, 2], plus: plus2Top ? 'from' : 'to', label: volt('V_2', V2), value: V2 },
      ],
      dots: [[2, 0], [2, 2]],
    },
  };
}

/** P2.96 / P2.48: two current sources with a resistor between their nodes; asks the current through it. */
function twoCurrents(): Built {
  const I1 = niceInt(1, 8);
  const I2 = niceInt(1, 8);
  const up1 = Math.random() < 0.75;
  const up2 = Math.random() < 0.6;
  const s1 = up1 ? I1 : -I1;
  const s2 = up2 ? I2 : -I2;
  const [R1, R2, R3] = [randR(), randR(), randR()];
  const tot = R1 + R2 + R3;
  const i1 = (s1 * R1) / tot;
  const i2 = (-s2 * R3) / tot;

  return {
    title: 'Superpositie · twee stroombronnen',
    steps: [
      OFF,
      `<b>Alleen ${m`I_1`}</b> (${m`I_2`} open): de stroom verdeelt zich over ${m`R_1`} en de tak ${m`R_2 + R_3`}:${d`i' = I_1 \cdot \frac{R_1}{R_1 + R_2 + R_3} = ${par(s1)} \cdot \frac{${R1}}{${tot}} = ${i1}\,\mathrm{A}`}`,
      `<b>Alleen ${m`I_2`}</b> (${m`I_1`} open): de stroom verdeelt zich over ${m`R_3`} en de tak ${m`R_2 + R_1`}. Door ${m`R_2`} loopt die naar <b>links</b>, tegen de pijl in, dus met een minteken:${d`i'' = -I_2 \cdot \frac{R_3}{R_1 + R_2 + R_3} = -${par(s2)} \cdot \frac{${R3}}{${tot}} = ${i2}\,\mathrm{A}`}`,
    ],
    variants: contributions({ source: 'I<sub>1</sub>', value: i1 }, { source: 'I<sub>2</sub>', value: i2 }, ['R2']),
    circuit: {
      wires: [
        [[0, 0], [1.2, 0]],
        [[0, 2], [5, 2]],
        [[3.4, 0], [5, 0]],
      ],
      elements: [
        { kind: 'I', from: [0, 2], to: [0, 0], toward: up1 ? 'to' : 'from', label: amp('I_1', I1), side: 'left', value: I1 },
        { kind: 'R', from: [1.2, 0], to: [1.2, 2], label: ohm('R_1', R1), value: R1 },
        { kind: 'R', id: 'R2', from: [1.2, 0], to: [3.4, 0], label: ohm('R_2', R2), value: R2, current: { label: 'i', toward: 'to' } },
        { kind: 'R', from: [3.4, 0], to: [3.4, 2], label: ohm('R_3', R3), value: R3 },
        { kind: 'I', from: [5, 2], to: [5, 0], toward: up2 ? 'to' : 'from', label: amp('I_2', I2), value: I2 },
      ],
      dots: [[1.2, 0], [1.2, 2], [3.4, 0], [3.4, 2]],
    },
  };
}

/** Oefentoets opgave 5 / P2.95: a voltage source between two nodes, bridged by R3, plus a current source. */
function floatingSource(): Built {
  const E = niceInt(5, 30);
  const Is = niceInt(1, 6);
  const plusLeft = Math.random() < 0.7;
  const pe = plusLeft ? E : -E;
  const [R1, R2, R3] = [randR(), randR(), randR()];
  const i1 = -pe / (R1 + R2);
  const i2 = (Is * R1) / (R1 + R2);

  return {
    title: 'Superpositie · zwevende bron',
    steps: [
      OFF,
      `<b>Alleen ${m`e`}</b> (${m`I_s`} open): ${m`R_3`} staat direct parallel aan ${m`e`} en verandert niets aan de rest. Er blijft één lus over: ${m`e`}, ${m`R_2`}, massa, ${m`R_1`}. De + van ${m`e`} zit ${plusLeft ? 'links' : 'rechts'}, dus de stroom gaat ${plusLeft ? 'omhoog' : 'omlaag'} door ${m`R_2`}:${d`i' = ${plusLeft ? '-' : ''}\frac{e}{R_1 + R_2} = ${plusLeft ? '-' : ''}\frac{${E}}{${R1} + ${R2}} = ${i1}\,\mathrm{A}`}`,
      `<b>Alleen ${m`I_s`}</b> (${m`e`} kortgesloten): beide bovenknopen worden één knoop en ${m`R_3`} is kortgesloten. ${m`R_1`} en ${m`R_2`} staan parallel, dus een stroomdeler:${d`i'' = I_s \cdot \frac{R_1}{R_1 + R_2} = ${Is} \cdot \frac{${R1}}{${R1} + ${R2}} = ${i2}\,\mathrm{A}`}`,
    ],
    variants: contributions({ source: 'de spanningsbron e', value: i1 }, { source: 'de stroombron I<sub>s</sub>', value: i2 }, ['R2']),
    circuit: {
      wires: [
        [[0, 0], [0, 1]],
        [[2, 0], [2, 1]],
        [[2, 1], [3.3, 1]],
        [[0, 2.6], [3.3, 2.6]],
      ],
      elements: [
        { kind: 'R', from: [0, 0], to: [2, 0], label: ohm('R_3', R3), value: R3 },
        { kind: 'V', from: [0, 1], to: [2, 1], plus: plusLeft ? 'from' : 'to', label: volt('e', E), side: 'below', value: E },
        { kind: 'R', from: [0, 1], to: [0, 2.6], label: ohm('R_1', R1), side: 'left', value: R1 },
        { kind: 'R', id: 'R2', from: [2, 1], to: [2, 2.6], label: ohm('R_2', R2), side: 'left', value: R2, current: { label: 'i', toward: 'to' } },
        { kind: 'I', from: [3.3, 2.6], to: [3.3, 1], toward: 'to', label: amp('I_s', Is), value: Is },
      ],
      dots: [[0, 1], [2, 1], [2, 2.6]],
    },
  };
}

/**
 * Every template's steps are [plan, contribution of source 1, contribution of
 * source 2], and its variants [i′, i″, i] in that order — the practice chain
 * below relies on that.
 */
/** Each difficulty level unlocks harder topologies, in the order the lessons introduced them. */
const TEMPLATES_BY_LEVEL: ReadonlyArray<ReadonlyArray<() => Built>> = [[vAndI], [twoVoltages, twoCurrents], [floatingSource]];

export function buildSuperposition(level: number): Built {
  return pick(TEMPLATES_BY_LEVEL.slice(0, level + 1).flat())();
}

/** Practice walks through the method on one circuit: i′ first, then i″, then the total — each with only its own steps. */
export function generateSuperposition(streak = 0): Problem {
  const built = buildSuperposition(difficultyLevel(streak));
  const [plan, first, second] = built.steps;
  const step = (n: number, steps: string[]): Problem => ({
    ...problemFrom('superposition', 'theorem', { ...built, steps, variants: [built.variants[n]] }),
    title: `${built.title} · stap ${n + 1} van 3`,
  });
  const total = step(2, [plan, first, second]);
  const middle = { ...step(1, [plan, second]), next: total };
  return { ...step(0, [plan, first]), next: middle };
}
