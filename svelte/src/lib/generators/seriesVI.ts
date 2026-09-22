import type { Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';

interface Variant {
  question: string;
  unit: string;
  answer: number;
}

export function generateSeriesVI(): Problem {
  const Is = niceInt(2, 10);
  const R = niceInt(2, 30);
  const Vs = niceInt(10, 60);
  const vR = round2(Is * R);
  const vx = round2(Vs - vR);

  const variants: Variant[] = [
    { question: `Bereken de stroom door de spanningsbron V<sub>s</sub>.`, unit: 'A', answer: Is },
    { question: `Bereken de spanning v<sub>R</sub> over de weerstand R.`, unit: 'V', answer: vR },
    { question: `Bereken de spanning v<sub>x</sub> over de stroombron (via KVL).`, unit: 'V', answer: vx },
  ];
  const variant = pick(variants);

  const steps = [
    `Belangrijk inzicht: in een serieschakeling loopt overal dezelfde stroom. Een stroombron legt zijn eigen stroom op, dus geldt: I = I<sub>s</sub> = ${fmt(Is)} A — ongeacht de waarden van R en V<sub>s</sub>!`,
    `Met de wet van Ohm: v<sub>R</sub> = I·R = ${fmt(Is)} × ${fmt(R)} = ${fmt(vR)} V.`,
    `Met KVL rond de lus: V<sub>s</sub> − v<sub>R</sub> − v<sub>x</sub> = 0  →  v<sub>x</sub> = ${fmt(Vs)} − ${fmt(vR)} = ${fmt(vx)} V.`,
    `Dus het gevraagde antwoord is ${fmt(variant.answer)} ${variant.unit}.`,
  ];

  return {
    categoryId: 'series-vi',
    accent: 'mixed',
    title: 'Bronnen in serie (V + I)',
    question: variant.question,
    unit: variant.unit,
    answer: variant.answer,
    tolerance: toleranceFor(variant.answer),
    steps,
    circuit: { kind: 'series-vi', Vs, R, Is },
  };
}
