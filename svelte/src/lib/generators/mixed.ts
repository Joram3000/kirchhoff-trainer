import type { Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';

interface Variant {
  question: string;
  unit: string;
  answer: number;
  extra: string;
}

export function generateMixed(): Problem {
  const Vs = niceInt(12, 60);
  const R1 = niceInt(2, 25);
  const R2 = niceInt(2, 25);
  const R3 = niceInt(2, 25);
  const Req23 = 1 / (1 / R2 + 1 / R3);
  const Itot = round2(Vs / (R1 + Req23));
  const Vpar = round2(Itot * Req23);
  const i2 = round2(Vpar / R2);
  const i3 = round2(Vpar / R3);

  const variants: Variant[] = [
    {
      question: `Bereken de totale stroom I die uit de bron komt.`,
      unit: 'A',
      answer: Itot,
      extra: `Dus I = ${fmt(Itot)} A.`,
    },
    {
      question: `Bereken de spanning v over de parallelcombinatie van R<sub>2</sub> en R<sub>3</sub>.`,
      unit: 'V',
      answer: Vpar,
      extra: `Dus v = ${fmt(Vpar)} V.`,
    },
    {
      question: `Bereken de stroom i<sub>2</sub> door R<sub>2</sub>.`,
      unit: 'A',
      answer: i2,
      extra: `i<sub>2</sub> = v/R<sub>2</sub> = ${fmt(Vpar)} / ${fmt(R2)} = ${fmt(i2)} A (KCL: i<sub>2</sub> + i<sub>3</sub> = I).`,
    },
    {
      question: `Bereken de stroom i<sub>3</sub> door R<sub>3</sub>.`,
      unit: 'A',
      answer: i3,
      extra: `i<sub>3</sub> = v/R<sub>3</sub> = ${fmt(Vpar)} / ${fmt(R3)} = ${fmt(i3)} A (KCL: i<sub>2</sub> + i<sub>3</sub> = I).`,
    },
  ];
  const variant = pick(variants);

  const steps = [
    `Combineer eerst R<sub>2</sub> en R<sub>3</sub> (parallel) tot één vervangingsweerstand: R<sub>eq</sub> = 1/(1/R<sub>2</sub> + 1/R<sub>3</sub>) = ${fmt(Req23)} Ω.`,
    `Pas KVL toe op de resulterende serielus: V<sub>s</sub> − I·R<sub>1</sub> − I·R<sub>eq</sub> = 0.`,
    `I = V<sub>s</sub> / (R<sub>1</sub> + R<sub>eq</sub>) = ${fmt(Vs)} / (${fmt(R1)} + ${fmt(Req23)}) = ${fmt(Itot)} A.`,
    `v = I · R<sub>eq</sub> = ${fmt(Itot)} × ${fmt(Req23)} = ${fmt(Vpar)} V.`,
    variant.extra,
  ];

  return {
    categoryId: 'mixed',
    accent: 'mixed',
    title: 'Gemengde schakeling',
    question: variant.question,
    unit: variant.unit,
    answer: variant.answer,
    tolerance: toleranceFor(variant.answer),
    steps,
    circuit: { kind: 'mixed', Vs, R1, R2, R3 },
  };
}
