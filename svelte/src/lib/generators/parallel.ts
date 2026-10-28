import type { Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';
import { d, num } from '../utils/tex';
import { difficultyLevel } from '../utils/difficulty';
import type { ResistorTarget } from '../utils/target';

interface Variant {
  question: string;
  unit: string;
  answer: number;
  extra: string;
  target: ResistorTarget;
}

export function generateParallel(streak = 0): Problem {
  const count = 2 + difficultyLevel(streak);
  const Is = niceInt(3, 15);
  const Rs = Array.from({ length: count }, () => niceInt(2, 30));
  const Req = 1 / Rs.reduce((sum, R) => sum + 1 / R, 0);
  const v = round2(Is * Req);
  const currents = Rs.map((R) => round2(v / R));

  const allNames = Rs.map((_, i) => `R<sub>${i + 1}</sub>`).join(' en ');
  const allTargets: ResistorTarget = Rs.map((_, i) => `R${i + 1}`);

  const variants: Variant[] = [
    {
      question: `Bereken de knooppuntspanning v over ${allNames}.`,
      unit: 'V',
      answer: v,
      extra: `Het antwoord:${d`v = \boxed{${v}\,\mathrm{V}}`}`,
      target: allTargets,
    },
  ];
  Rs.forEach((R, i) => {
    const n = i + 1;
    variants.push({
      question: `Bereken de stroom i<sub>${n}</sub> door R<sub>${n}</sub>.`,
      unit: 'A',
      answer: currents[i],
      extra: `Wet van Ohm voor R<sub>${n}</sub>:${d`i_${n} = \frac{v}{R_${n}} = \frac{${v}}{${R}} = \boxed{${currents[i]}\,\mathrm{A}}`}`,
      target: `R${n}`,
    });
  });
  const variant = pick(variants);

  const kclExpanded = Rs.map((_, i) => `\\frac{v}{R_${i + 1}}`).join(' + ');
  const kclSum = Rs.map((_, i) => `i_${i + 1}`).join(' + ');
  const reqTerms = Rs.map((_, i) => `\\frac{1}{R_${i + 1}}`).join(' + ');
  const reqNums = Rs.map((R) => `\\frac{1}{${num(R)}}`).join(' + ');

  const steps = [
    `${allNames} staan parallel, dus ze hebben dezelfde spanning v.`,
    `KCL in het bovenste knooppunt:${d`I_s = ${kclSum} = ${kclExpanded}`}`,
    `Haal v buiten haakjes en los op:${d`v = \frac{I_s}{${reqTerms}} = \frac{${Is}}{${reqNums}} = ${v}\,\mathrm{V}`}`,
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
    circuit: { kind: 'parallel', Is, Rs, target: variant.target },
  };
}
