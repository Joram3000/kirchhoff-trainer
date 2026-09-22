import type { Problem } from '../types';
import { niceInt, pick, rnd } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';

interface Variant {
  question: string;
  unit: string;
  answer: number;
  extra: string;
}

export function generateSeries(): Problem {
  const I = rnd(1, 4);
  const R1 = niceInt(2, 12);
  const R2 = niceInt(2, 12);
  const Vs = I * (R1 + R2);
  const v2 = round2(I * R2);
  const P1 = round2(I * I * R1);

  const variants: Variant[] = [
    {
      question: `Bereken de stroom I door het circuit.`,
      unit: 'A',
      answer: I,
      extra: `Dus I = ${fmt(I)} A.`,
    },
    {
      question: `Bereken de spanning v<sub>2</sub> over R<sub>2</sub>.`,
      unit: 'V',
      answer: v2,
      extra: `v<sub>2</sub> = I·R<sub>2</sub> = ${fmt(I)} × ${fmt(R2)} = ${fmt(v2)} V.`,
    },
    {
      question: `Bereken het vermogen P<sub>1</sub> dat R<sub>1</sub> dissipeert.`,
      unit: 'W',
      answer: P1,
      extra: `P<sub>1</sub> = I²·R<sub>1</sub> = ${fmt(I)}² × ${fmt(R1)} = ${fmt(P1)} W.`,
    },
  ];
  const variant = pick(variants);

  const steps = [
    `Pas KVL toe rond de lus (met de klok mee vanaf de bron): V<sub>s</sub> − I·R<sub>1</sub> − I·R<sub>2</sub> = 0.`,
    `I = V<sub>s</sub> / (R<sub>1</sub> + R<sub>2</sub>) = ${fmt(Vs)} / (${fmt(R1)} + ${fmt(R2)}) = ${fmt(I)} A.`,
    variant.extra,
  ];

  return {
    categoryId: 'series',
    accent: 'kvl',
    title: 'Serieschakeling',
    question: variant.question,
    unit: variant.unit,
    answer: variant.answer,
    tolerance: toleranceFor(variant.answer),
    steps,
    circuit: { kind: 'series', Vs, R1, R2 },
  };
}
