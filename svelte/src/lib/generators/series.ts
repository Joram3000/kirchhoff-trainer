import type { Problem } from '../types';
import { niceInt, pick, rnd } from '../utils/random';
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
      extra: `Het antwoord:${d`I = \boxed{${I}\,\mathrm{A}}`}`,
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
      extra: `Wet van Ohm voor R<sub>${n}</sub>:${d`v_${n} = I \cdot R_${n} = ${I} \cdot ${R} = \boxed{${v}\,\mathrm{V}}`}`,
      target: `R${n}`,
    });
    variants.push({
      question: `Bereken het vermogen P<sub>${n}</sub> dat R<sub>${n}</sub> dissipeert.`,
      unit: 'W',
      answer: P,
      extra: `Vermogen in R<sub>${n}</sub>:${d`P_${n} = I^2 \cdot R_${n} = ${I}^2 \cdot ${R} = \boxed{${P}\,\mathrm{W}}`}`,
      target: `R${n}`,
    });
  });
  const variant = pick(variants);

  const sumTerm = Rs.map((_, i) => `R_${i + 1}`).join(' + ');
  const sumNums = Rs.map(num).join(' + ');
  const kvlTerms = Rs.map((_, i) => `I R_${i + 1}`).join(' - ');

  const steps = [
    `Pas KVL toe rond de lus (met de klok mee vanaf de bron):${d`V_s - ${kvlTerms} = 0`}`,
    `Door alle weerstanden loopt dezelfde stroom, dus:${d`I = \frac{V_s}{${sumTerm}} = \frac{${Vs}}{${sumNums}} = ${I}\,\mathrm{A}`}`,
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
