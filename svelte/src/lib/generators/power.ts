import type { Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { m, d, par } from '../utils/tex';
import { variant, answerStep, problemFrom, ohm, volt, amp, type Built } from './built';

const CONVENTION =
  `Passieve tekenconventie: loopt de stroom een element <b>in aan de + kant</b>, dan neemt het vermogen op: ${m`P = +v\,i`}. Komt de stroom er <b>aan de + kant uit</b>, dan levert het: ${m`P = -v\,i`}. Positief = opgenomen, negatief = geleverd.`;

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
    `Er is maar één lus, dus overal loopt dezelfde stroom. De stroombron legt die vast (met de klok mee):${d`i = I_s = ${Is}\,\mathrm{A}`}`,
    `KVL met de klok mee (van − naar + is een stijging):${d`\begin{aligned}
      v_I - i\,R ${plusTop ? '-' : '+'} e &= 0 \\
      v_I &= ${Is} \cdot ${R} ${plusTop ? '+' : '-'} ${E} = ${vI}\,\mathrm{V}
    \end{aligned}`}`,
    CONVENTION,
    `Weerstand — die neemt altijd op:${d`P_R = i^2 R = ${Is}^2 \cdot ${R} = ${PR}\,\mathrm{W}`}`,
    plusTop
      ? `Spanningsbron: de stroom loopt de bron in aan de + kant, dus hij neemt op (hij wordt als het ware opgeladen):${d`P_e = +e\,i = ${E} \cdot ${Is} = ${Pe}\,\mathrm{W}`}`
      : `Spanningsbron: de stroom loopt de bron in aan de − kant en komt er aan de + kant uit, dus hij levert:${d`P_e = -e\,i = -${E} \cdot ${Is} = ${Pe}\,\mathrm{W}`}`,
    `Stroombron: de stroom komt er boven, aan de + kant van ${m`v_I`}, uit (${absorbed(PI)}):${d`P_I = -v_I\,i = -${par(vI)} \cdot ${Is} = ${PI}\,\mathrm{W}`}`,
    `Controle — wat geleverd wordt, wordt ook opgenomen:${d`P_I + P_R + P_e = ${PI} + ${PR} + ${par(Pe)} = 0 \;\checkmark`}`,
  ];

  return {
    title: 'Vermogen · serielus',
    steps,
    variants: [
      variant(`Bereken de spanning v<sub>I</sub> over de stroombron (+ aan de bovenkant).`, 'V', vI, [answerStep('v_I', vI, 'V')], ['I']),
      variant(powerQuestion('de stroombron'), 'W', PI, [answerStep('P_I', PI, 'W')], ['I']),
      variant(powerQuestion('de spanningsbron'), 'W', Pe, [answerStep('P_e', Pe, 'W')], ['e']),
      variant(powerQuestion('de weerstand'), 'W', PR, [answerStep('P_R', PR, 'W')], ['R']),
      variant(`Bereken de stroom i<sub>e</sub> door de spanningsbron (richting zoals aangegeven).`, 'A', Is, [answerStep('i_e', Is, 'A')], ['e']),
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
    `Alle drie de elementen zitten tussen dezelfde twee knooppunten, dus over elk staat dezelfde spanning (+ boven):${d`v = e = ${E}\,\mathrm{V}`}`,
    `Wet van Ohm voor de weerstand (stroom naar beneden):${d`i_R = \frac{e}{R} = \frac{${E}}{${R}} = ${iR}\,\mathrm{A}`}`,
    `KCL in het bovenste knooppunt, met ${m`i_e`} omhoog uit de bron:${d`\begin{aligned}
      i_e ${up ? '+' : '-'} I_s &= i_R \\
      i_e &= ${iR} ${up ? '-' : '+'} ${Is} = ${ie}\,\mathrm{A}
    \end{aligned}`}`,
    CONVENTION,
    `Spanningsbron: ${m`i_e`} komt er aan de + kant uit (${absorbed(Pe)}):${d`P_e = -e\,i_e = -${E} \cdot ${par(ie)} = ${Pe}\,\mathrm{W}`}`,
    up
      ? `Stroombron: de stroom komt er boven, aan de + kant, uit (geleverd):${d`P_I = -v\,I_s = -${E} \cdot ${Is} = ${PI}\,\mathrm{W}`}`
      : `Stroombron: de stroom loopt er boven, aan de + kant, in (opgenomen):${d`P_I = +v\,I_s = ${E} \cdot ${Is} = ${PI}\,\mathrm{W}`}`,
    `Weerstand (opgenomen):${d`P_R = \frac{e^2}{R} = \frac{${E}^2}{${R}} = ${PR}\,\mathrm{W}`}`,
    `Controle:${d`P_e + P_I + P_R = ${Pe} + ${par(PI)} + ${PR} = 0 \;\checkmark`}`,
  ];

  return {
    title: 'Vermogen · parallel',
    steps,
    variants: [
      variant(`Bereken de stroom i<sub>e</sub> door de spanningsbron (richting zoals aangegeven).`, 'A', ie, [answerStep('i_e', ie, 'A')], ['e']),
      variant(powerQuestion('de spanningsbron'), 'W', Pe, [answerStep('P_e', Pe, 'W')], ['e']),
      variant(powerQuestion('de stroombron'), 'W', PI, [answerStep('P_I', PI, 'W')], ['I']),
      variant(powerQuestion('de weerstand'), 'W', PR, [answerStep('P_R', PR, 'W')], ['R']),
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
