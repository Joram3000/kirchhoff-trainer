import type { Problem } from '../types';
import { niceInt, pick } from '../utils/random';
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

export function generateMixed(streak = 0): Problem {
  const bankSize = 2 + difficultyLevel(streak);
  const Vs = niceInt(12, 60);
  const R1 = niceInt(2, 25);
  const Rs = Array.from({ length: bankSize }, () => niceInt(2, 25));
  const Req = 1 / Rs.reduce((sum, R) => sum + 1 / R, 0);
  const Itot = round2(Vs / (R1 + Req));
  const Vpar = round2(Itot * Req);
  const currents = Rs.map((R) => round2(Vpar / R));

  const bankNames = Rs.map((_, i) => `R<sub>${i + 2}</sub>`).join(' en ');
  const bankTargets: ResistorTarget = Rs.map((_, i) => `R${i + 2}`);
  const kclSum = Rs.map((_, i) => `i<sub>${i + 2}</sub>`).join(' + ');

  const variants: Variant[] = [
    {
      question: `Bereken de totale stroom I die uit de bron komt.`,
      unit: 'A',
      answer: Itot,
      extra: `Dus I = ${fmt(Itot)} A.`,
      target: null,
    },
    {
      question: `Bereken de spanning v over de parallelcombinatie van ${bankNames}.`,
      unit: 'V',
      answer: Vpar,
      extra: `Dus v = ${fmt(Vpar)} V.`,
      target: bankTargets,
    },
  ];
  Rs.forEach((R, i) => {
    const n = i + 2;
    variants.push({
      question: `Bereken de stroom i<sub>${n}</sub> door R<sub>${n}</sub>.`,
      unit: 'A',
      answer: currents[i],
      extra: `i<sub>${n}</sub> = v/R<sub>${n}</sub> = ${fmt(Vpar)} / ${fmt(R)} = ${fmt(currents[i])} A (KCL: ${kclSum} = I).`,
      target: `R${n}`,
    });
  });
  const variant = pick(variants);

  const reqTerms = Rs.map((_, i) => `1/R<sub>${i + 2}</sub>`).join(' + ');
  const reqNums = Rs.map((R) => `1/${fmt(R)}`).join(' + ');

  const steps = [
    `Combineer eerst ${bankNames} (parallel) tot één vervangingsweerstand: R<sub>eq</sub> = 1/(${reqTerms}) = 1/(${reqNums}) = ${fmt(Req)} Ω.`,
    `Pas KVL toe op de resulterende serielus: V<sub>s</sub> − I·R<sub>1</sub> − I·R<sub>eq</sub> = 0.`,
    `I = V<sub>s</sub> / (R<sub>1</sub> + R<sub>eq</sub>) = ${fmt(Vs)} / (${fmt(R1)} + ${fmt(Req)}) = ${fmt(Itot)} A.`,
    `v = I · R<sub>eq</sub> = ${fmt(Itot)} × ${fmt(Req)} = ${fmt(Vpar)} V.`,
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
    circuit: { kind: 'mixed', Vs, R1, Rs, target: variant.target },
  };
}
