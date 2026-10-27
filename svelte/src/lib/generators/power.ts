import type { Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { fmt } from '../utils/format';
import { variant, problemFrom, ohm, volt, amp, type Built } from './built';

/** Wraps negatives in parentheses so substitutions like "5 · (−3)" read correctly. */
const p = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n));

const CONVENTION =
  `Passieve tekenconventie: loopt de stroom een element <b>in aan de + kant</b>, dan neemt het vermogen op: P = +v·i. Komt de stroom er <b>aan de + kant uit</b>, dan levert het: P = −v·i. Positief = opgenomen, negatief = geleverd.`;

const absorbed = (P: number) => (P >= 0 ? 'opgenomen' : 'geleverd');

function powerQuestion(what: string): string {
  return `Bereken het vermogen dat ${what} <b>opneemt</b> (positief = opgenomen, negatief = geleverd).`;
}

/** Oefentoets opgave 1: a current source, a resistor and a voltage source in one loop. */
export function buildPowerLoop(): Built {
  const Is = niceInt(1, 10);
  const R = niceInt(2, 20);
  const E = niceInt(5, 60);
  const plusTop = Math.random() < 0.6;

  const vI = Is * R + (plusTop ? E : -E);
  const PR = Is * Is * R;
  const Pe = plusTop ? E * Is : -E * Is;
  const PI = -vI * Is;

  const steps = [
    `Er is maar één lus, dus overal loopt dezelfde stroom. De stroombron legt die vast: i = I<sub>s</sub> = ${fmt(Is)} A, met de klok mee.`,
    `KVL met de klok mee (van − naar + is een stijging): v<sub>I</sub> − i·R ${plusTop ? '−' : '+'} e = 0 → v<sub>I</sub> = ${fmt(Is)}·${fmt(R)} ${plusTop ? '+' : '−'} ${fmt(E)} = ${fmt(vI)} V.`,
    CONVENTION,
    `Weerstand: P<sub>R</sub> = i²·R = ${fmt(Is)}²·${fmt(R)} = ${fmt(PR)} W (opgenomen — een weerstand neemt altijd op).`,
    plusTop
      ? `Spanningsbron: de stroom loopt de bron in aan de + kant → P<sub>e</sub> = +e·i = ${fmt(E)}·${fmt(Is)} = ${fmt(Pe)} W (opgenomen; de bron wordt als het ware opgeladen).`
      : `Spanningsbron: de stroom loopt de bron in aan de − kant, dus komt er aan de + kant uit → P<sub>e</sub> = −e·i = ${fmt(Pe)} W (geleverd).`,
    `Stroombron: de stroom komt er boven, aan de + kant van v<sub>I</sub>, uit → P<sub>I</sub> = −v<sub>I</sub>·i = −${p(vI)}·${fmt(Is)} = ${fmt(PI)} W (${absorbed(PI)}).`,
    `Controle: ΣP = ${fmt(PI)} + ${fmt(PR)} + ${p(Pe)} = 0 ✓ — wat geleverd wordt, wordt ook opgenomen.`,
  ];

  return {
    title: 'Vermogen · serielus',
    steps,
    variants: [
      variant(`Bereken de spanning v<sub>I</sub> over de stroombron (+ aan de bovenkant).`, 'V', vI, [], ['I']),
      variant(powerQuestion('de stroombron'), 'W', PI, [], ['I']),
      variant(powerQuestion('de spanningsbron'), 'W', Pe, [], ['e']),
      variant(powerQuestion('de weerstand'), 'W', PR, [], ['R']),
      variant(`Bereken de stroom i<sub>e</sub> door de spanningsbron (richting zoals aangegeven).`, 'A', Is, [], ['e']),
    ],
    circuit: {
      wires: [[[0, 2], [2.6, 2]]],
      elements: [
        {
          kind: 'I', id: 'I', from: [0, 2], to: [0, 0], toward: 'to', label: amp('I_s', Is), side: 'left',
          value: Is, polarity: { plus: 'to', label: 'v_I', side: 'right' },
        },
        { kind: 'R', id: 'R', from: [0, 0], to: [2.6, 0], label: ohm('R', R), value: R, current: { label: 'i', toward: 'to' } },
        {
          kind: 'V', id: 'e', from: [2.6, 0], to: [2.6, 2], plus: plusTop ? 'from' : 'to', label: volt('e', E),
          value: E, current: { label: 'i_e', toward: 'to', side: 'left' },
        },
      ],
      dots: [[0, 0], [2.6, 0], [2.6, 2], [0, 2]],
    },
  };
}

/** A voltage source, a resistor and a current source side by side: all share one voltage. */
function parallelBank(): Built {
  const E = niceInt(5, 40);
  const R = pick([2, 4, 5, 8, 10, 20] as const);
  const Is = niceInt(1, 10);
  const up = Math.random() < 0.5;
  const sI = up ? Is : -Is;

  const iR = E / R;
  const ie = iR - sI;
  const Pe = -E * ie;
  const PI = -E * sI;
  const PR = (E * E) / R;

  const steps = [
    `Alle drie de elementen zitten tussen dezelfde twee knooppunten, dus over elk staat dezelfde spanning: v = e = ${fmt(E)} V (+ boven).`,
    `Wet van Ohm: i<sub>R</sub> = e/R = ${fmt(E)}/${fmt(R)} = ${fmt(iR)} A (naar beneden).`,
    `KCL in het bovenste knooppunt: i<sub>e</sub> ${up ? '+' : '−'} I<sub>s</sub> = i<sub>R</sub> → i<sub>e</sub> = ${fmt(iR)} ${up ? '−' : '+'} ${fmt(Is)} = ${fmt(ie)} A (omhoog, de bron uit aan de + kant).`,
    CONVENTION,
    `Spanningsbron: i<sub>e</sub> komt er aan de + kant uit → P<sub>e</sub> = −e·i<sub>e</sub> = −${fmt(E)}·${p(ie)} = ${fmt(Pe)} W (${absorbed(Pe)}).`,
    up
      ? `Stroombron: de stroom komt er boven, aan de + kant, uit → P<sub>I</sub> = −v·I<sub>s</sub> = −${fmt(E)}·${fmt(Is)} = ${fmt(PI)} W (geleverd).`
      : `Stroombron: de stroom loopt er boven, aan de + kant, in → P<sub>I</sub> = +v·I<sub>s</sub> = ${fmt(E)}·${fmt(Is)} = ${fmt(PI)} W (opgenomen).`,
    `Weerstand: P<sub>R</sub> = e²/R = ${fmt(E)}²/${fmt(R)} = ${fmt(PR)} W (opgenomen).`,
    `Controle: ΣP = ${fmt(Pe)} + ${p(PI)} + ${fmt(PR)} = 0 ✓`,
  ];

  return {
    title: 'Vermogen · parallel',
    steps,
    variants: [
      variant(`Bereken de stroom i<sub>e</sub> door de spanningsbron (richting zoals aangegeven).`, 'A', ie, [], ['e']),
      variant(powerQuestion('de spanningsbron'), 'W', Pe, [], ['e']),
      variant(powerQuestion('de stroombron'), 'W', PI, [], ['I']),
      variant(powerQuestion('de weerstand'), 'W', PR, [], ['R']),
    ],
    circuit: {
      wires: [
        [[0, 0], [3.2, 0]],
        [[0, 2], [3.2, 2]],
      ],
      elements: [
        {
          kind: 'V', id: 'e', from: [0, 0], to: [0, 2], plus: 'from', label: volt('e', E), side: 'left',
          value: E, current: { label: 'i_e', toward: 'from' },
        },
        { kind: 'R', id: 'R', from: [1.7, 0], to: [1.7, 2], label: ohm('R', R), value: R },
        { kind: 'I', id: 'I', from: [3.2, 2], to: [3.2, 0], toward: up ? 'to' : 'from', label: amp('I_s', Is), value: Is },
      ],
      dots: [[1.7, 0], [1.7, 2]],
    },
  };
}

export function generatePower(): Problem {
  return problemFrom('power', 'mixed', pick([buildPowerLoop, parallelBank])());
}
