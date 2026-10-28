import type { Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';
import { m, d, num } from '../utils/tex';
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
  const kclSum = Rs.map((_, i) => `i_${i + 2}`).join(' + ');

  const variants: Variant[] = [
    {
      question: `Bereken de totale stroom I die uit de bron komt.`,
      unit: 'A',
      answer: Itot,
      extra: `Het antwoord:${d`I = \boxed{${Itot}\,\mathrm{A}}`}`,
      target: null,
    },
    {
      question: `Bereken de spanning v over de parallelcombinatie van ${bankNames}.`,
      unit: 'V',
      answer: Vpar,
      extra: `Het antwoord:${d`v = \boxed{${Vpar}\,\mathrm{V}}`}`,
      target: bankTargets,
    },
  ];
  Rs.forEach((R, i) => {
    const n = i + 2;
    variants.push({
      question: `Bereken de stroom i<sub>${n}</sub> door R<sub>${n}</sub>.`,
      unit: 'A',
      answer: currents[i],
      extra: `Wet van Ohm voor R<sub>${n}</sub> (controle met KCL: ${m`${kclSum} = I`}):${d`i_${n} = \frac{v}{R_${n}} = \frac{${Vpar}}{${R}} = \boxed{${currents[i]}\,\mathrm{A}}`}`,
      target: `R${n}`,
    });
  });
  const variant = pick(variants);

  const reqTerms = Rs.map((_, i) => `\\frac{1}{R_${i + 2}}`).join(' + ');
  const reqNums = Rs.map((R) => `\\frac{1}{${num(R)}}`).join(' + ');

  const steps = [
    `Combineer eerst ${bankNames} (parallel) tot één vervangingsweerstand:${d`R_{\mathrm{eq}} = \frac{1}{${reqTerms}} = \frac{1}{${reqNums}} = ${Req}\,\Omega`}`,
    `Pas KVL toe op de serielus die overblijft, en los I op:${d`\begin{aligned} V_s - I R_1 - I R_{\mathrm{eq}} &= 0 \\ I &= \frac{V_s}{R_1 + R_{\mathrm{eq}}} = \frac{${Vs}}{${R1} + ${Req}} = ${Itot}\,\mathrm{A} \end{aligned}`}`,
    `De spanning over de parallelcombinatie:${d`v = I \cdot R_{\mathrm{eq}} = ${Itot} \cdot ${Req} = ${Vpar}\,\mathrm{V}`}`,
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
