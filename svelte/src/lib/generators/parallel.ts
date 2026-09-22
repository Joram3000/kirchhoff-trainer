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

export function generateParallel(): Problem {
  const Is = niceInt(3, 15);
  const R1 = niceInt(2, 30);
  const R2 = niceInt(2, 30);
  const Req = 1 / (1 / R1 + 1 / R2);
  const v = round2(Is * Req);
  const i1 = round2(v / R1);
  const i2 = round2(v / R2);

  const variants: Variant[] = [
    {
      question: `Bereken de knooppuntspanning v over R<sub>1</sub> en R<sub>2</sub>.`,
      unit: 'V',
      answer: v,
      extra: `Dus v = ${fmt(v)} V.`,
    },
    {
      question: `Bereken de stroom i<sub>1</sub> door R<sub>1</sub>.`,
      unit: 'A',
      answer: i1,
      extra: `i<sub>1</sub> = v / R<sub>1</sub> = ${fmt(v)} / ${fmt(R1)} = ${fmt(i1)} A.`,
    },
    {
      question: `Bereken de stroom i<sub>2</sub> door R<sub>2</sub>.`,
      unit: 'A',
      answer: i2,
      extra: `i<sub>2</sub> = v / R<sub>2</sub> = ${fmt(v)} / ${fmt(R2)} = ${fmt(i2)} A.`,
    },
  ];
  const variant = pick(variants);

  const steps = [
    `R<sub>1</sub> en R<sub>2</sub> staan parallel, dus ze hebben dezelfde spanning v.`,
    `KCL in het bovenste knooppunt: I<sub>s</sub> = i<sub>1</sub> + i<sub>2</sub> = v/R<sub>1</sub> + v/R<sub>2</sub>.`,
    `v = I<sub>s</sub> / (1/R<sub>1</sub> + 1/R<sub>2</sub>) = ${fmt(Is)} / (1/${fmt(R1)} + 1/${fmt(R2)}) = ${fmt(v)} V.`,
    variant.extra,
  ];

  return {
    categoryId: 'parallel',
    accent: 'kcl',
    title: 'Parallelschakeling',
    question: variant.question,
    unit: variant.unit,
    answer: variant.answer,
    tolerance: toleranceFor(variant.answer),
    steps,
    circuit: { kind: 'parallel', Is, R1, R2 },
  };
}
