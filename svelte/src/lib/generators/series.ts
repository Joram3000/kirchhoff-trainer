import type { Problem } from '../types';
import { niceInt, pick, rnd } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';
import { difficultyLevel } from '../utils/difficulty';
import type { ResistorTarget } from '../utils/target';

interface Variant {
  question: string;
  unit: string;
  answer: number;
  extra: string;
  target: ResistorTarget;
}

export function generateSeries(streak = 0): Problem {
  const count = 2 + difficultyLevel(streak);
  const I = rnd(1, 4);
  const Rs = Array.from({ length: count }, () => niceInt(2, 12));
  const Vs = I * Rs.reduce((sum, R) => sum + R, 0);

  const variants: Variant[] = [
    {
      question: `Bereken de stroom I door het circuit.`,
      unit: 'A',
      answer: I,
      extra: `Dus I = ${fmt(I)} A.`,
      target: null,
    },
  ];
  Rs.forEach((R, i) => {
    const n = i + 1;
    const v = round2(I * R);
    const P = round2(I * I * R);
    variants.push({
      question: `Bereken de spanning v<sub>${n}</sub> over R<sub>${n}</sub>.`,
      unit: 'V',
      answer: v,
      extra: `v<sub>${n}</sub> = I·R<sub>${n}</sub> = ${fmt(I)} × ${fmt(R)} = ${fmt(v)} V.`,
      target: `R${n}`,
    });
    variants.push({
      question: `Bereken het vermogen P<sub>${n}</sub> dat R<sub>${n}</sub> dissipeert.`,
      unit: 'W',
      answer: P,
      extra: `P<sub>${n}</sub> = I²·R<sub>${n}</sub> = ${fmt(I)}² × ${fmt(R)} = ${fmt(P)} W.`,
      target: `R${n}`,
    });
  });
  const variant = pick(variants);

  const sumTerm = Rs.map((_, i) => `R<sub>${i + 1}</sub>`).join(' + ');
  const sumNums = Rs.map(fmt).join(' + ');
  const kvlTerms = Rs.map((_, i) => `I·R<sub>${i + 1}</sub>`).join(' − ');

  const steps = [
    `Pas KVL toe rond de lus (met de klok mee vanaf de bron): V<sub>s</sub> − ${kvlTerms} = 0.`,
    `I = V<sub>s</sub> / (${sumTerm}) = ${fmt(Vs)} / (${sumNums}) = ${fmt(I)} A.`,
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
    circuit: { kind: 'series', Vs, Rs, target: variant.target },
  };
}
