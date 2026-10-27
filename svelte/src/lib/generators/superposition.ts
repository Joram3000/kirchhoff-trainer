import type { Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { fmt } from '../utils/format';
import { difficultyLevel } from '../utils/difficulty';
import { variant, problemFrom, ohm, volt, amp, type Built } from './built';

const R_POOL = [2, 4, 5, 6, 8, 10, 12, 15, 20, 30] as const;
const randR = () => pick(R_POOL);
const par = (a: number, b: number) => (a * b) / (a + b);
const p = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n));

const OFF = `Zet steeds één bron aan en de andere uit: een spanningsbron uit = <b>kortsluiten</b>, een stroombron uit = <b>openen</b> (weghalen).`;

/** Shared three-question set: each contribution, then the sum. */
function contributions(
  name: string,
  first: { source: string; value: number },
  second: { source: string; value: number },
  highlight: string[],
): Built['variants'] {
  const total = first.value + second.value;
  const sum = `${name} = ${name}′ + ${name}″ = ${fmt(first.value)} + ${p(second.value)} = <b>${fmt(total)} A</b>`;
  return [
    variant(
      `Superpositie, stap 1: laat alleen ${first.source} aan staan. Hoe groot is de bijdrage ${name}′ aan de stroom ${name}?`,
      'A',
      first.value,
      [],
      highlight,
    ),
    variant(
      `Superpositie, stap 2: laat alleen ${second.source} aan staan. Hoe groot is de bijdrage ${name}″ aan de stroom ${name}?`,
      'A',
      second.value,
      [],
      highlight,
    ),
    variant(`Bepaal met het superpositiebeginsel de stroom ${name} (richting zoals aangegeven).`, 'A', total, [sum], highlight),
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
      `<b>Alleen V<sub>s</sub></b> (I<sub>s</sub> open): R<sub>1</sub> en R<sub>2</sub> staan in serie. i′ = V<sub>s</sub>/(R<sub>1</sub> + R<sub>2</sub>) = ${fmt(V)}/(${fmt(R1)} + ${fmt(R2)}) = ${fmt(i1)} A.`,
      `<b>Alleen I<sub>s</sub></b> (V<sub>s</sub> kortgesloten): R<sub>1</sub> komt nu parallel aan R<sub>2</sub>. Stroomdeler: i″ = ${p(s)}·R<sub>1</sub>/(R<sub>1</sub> + R<sub>2</sub>) = ${p(s)}·${fmt(R1)}/${fmt(R1 + R2)} = ${fmt(i2)} A${up ? '' : ' (negatief: de bron trekt stroom omhoog door R<sub>2</sub>)'}.`,
    ],
    variants: contributions('i', { source: 'de spanningsbron V<sub>s</sub>', value: i1 }, { source: 'de stroombron I<sub>s</sub>', value: i2 }, ['R2']),
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
  const vA = (V1 * par(R2, R3)) / (R1 + par(R2, R3));
  const vB = (s2 * par(R1, R2)) / (R3 + par(R1, R2));
  const i1 = vA / R2;
  const i2 = vB / R2;

  return {
    title: 'Superpositie · twee spanningsbronnen',
    steps: [
      OFF,
      `<b>Alleen V<sub>1</sub></b> (V<sub>2</sub> kortgesloten): R<sub>2</sub> en R<sub>3</sub> staan parallel: ${fmt(R2)} ∥ ${fmt(R3)} = ${fmt(par(R2, R3))} Ω. Spanningsdeler: v′ = ${fmt(V1)}·${fmt(par(R2, R3))}/(${fmt(R1)} + ${fmt(par(R2, R3))}) = ${fmt(vA)} V, dus i′ = v′/R<sub>2</sub> = ${fmt(i1)} A.`,
      `<b>Alleen V<sub>2</sub></b> (V<sub>1</sub> kortgesloten): R<sub>1</sub> ∥ R<sub>2</sub> = ${fmt(par(R1, R2))} Ω. Spanningsdeler: v″ = ${p(s2)}·${fmt(par(R1, R2))}/(${fmt(R3)} + ${fmt(par(R1, R2))}) = ${fmt(vB)} V${plus2Top ? '' : ' (de + van V<sub>2</sub> zit onder, dus negatief)'}, dus i″ = v″/R<sub>2</sub> = ${fmt(i2)} A.`,
    ],
    variants: contributions('i', { source: 'V<sub>1</sub>', value: i1 }, { source: 'V<sub>2</sub>', value: i2 }, ['R2']),
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
      `<b>Alleen I<sub>1</sub></b> (I<sub>2</sub> open): de stroom verdeelt zich over R<sub>1</sub> en de tak R<sub>2</sub> + R<sub>3</sub>. Stroomdeler: i′ = ${p(s1)}·R<sub>1</sub>/(R<sub>1</sub> + R<sub>2</sub> + R<sub>3</sub>) = ${p(s1)}·${fmt(R1)}/${fmt(tot)} = ${fmt(i1)} A.`,
      `<b>Alleen I<sub>2</sub></b> (I<sub>1</sub> open): de stroom verdeelt zich over R<sub>3</sub> en de tak R<sub>2</sub> + R<sub>1</sub>; door R<sub>2</sub> loopt die naar <b>links</b>, tegen de pijl in. i″ = −${p(s2)}·R<sub>3</sub>/${fmt(tot)} = ${fmt(i2)} A.`,
    ],
    variants: contributions('i', { source: 'I<sub>1</sub>', value: i1 }, { source: 'I<sub>2</sub>', value: i2 }, ['R2']),
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
      `<b>Alleen e</b> (I<sub>s</sub> open): R<sub>3</sub> staat direct parallel aan e en verandert dus niets aan de rest. Er blijft één lus over: e, R<sub>2</sub>, massa, R<sub>1</sub>. De + van e zit ${plusLeft ? 'links' : 'rechts'}, dus de stroom gaat ${plusLeft ? 'omhoog' : 'omlaag'} door R<sub>2</sub>: i′ = ${plusLeft ? '−' : '+'}e/(R<sub>1</sub> + R<sub>2</sub>) = ${plusLeft ? '−' : ''}${fmt(E)}/${fmt(R1 + R2)} = ${fmt(i1)} A.`,
      `<b>Alleen I<sub>s</sub></b> (e kortgesloten): beide bovenknopen worden één knoop en R<sub>3</sub> is kortgesloten. R<sub>1</sub> en R<sub>2</sub> staan parallel; stroomdeler: i″ = I<sub>s</sub>·R<sub>1</sub>/(R<sub>1</sub> + R<sub>2</sub>) = ${fmt(Is)}·${fmt(R1)}/${fmt(R1 + R2)} = ${fmt(i2)} A.`,
    ],
    variants: contributions('i', { source: 'de spanningsbron e', value: i1 }, { source: 'de stroombron I<sub>s</sub>', value: i2 }, ['R2']),
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

/** Each difficulty level unlocks harder topologies, in the order the lessons introduced them. */
const TEMPLATES_BY_LEVEL: ReadonlyArray<ReadonlyArray<() => Built>> = [[vAndI], [twoVoltages, twoCurrents], [floatingSource]];

export function buildSuperposition(level: number): Built {
  return pick(TEMPLATES_BY_LEVEL.slice(0, level + 1).flat())();
}

export function generateSuperposition(streak = 0): Problem {
  return problemFrom('superposition', 'theorem', buildSuperposition(difficultyLevel(streak)));
}
