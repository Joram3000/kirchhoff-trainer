import type { Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';
import type { ResistorTarget } from '../utils/target';

interface Variant {
  question: string;
  unit: string;
  answer: number;
  target: ResistorTarget;
}

export function generateParallelVI(): Problem {
  const Vs = niceInt(10, 60);
  const R = niceInt(2, 30);
  const Is = niceInt(2, 15);
  const iR = round2(Vs / R);
  const iVs = round2(Is - iR);

  const variants: Variant[] = [
    { question: `Bereken de spanning over de weerstand R (dat is ook de spanning van de bron).`, unit: 'V', answer: Vs, target: 'R' },
    { question: `Bereken de stroom i<sub>R</sub> door de weerstand R.`, unit: 'A', answer: iR, target: 'R' },
    { question: `Bereken de stroom i<sub>v</sub> door de spanningsbron V<sub>s</sub> (via KCL).`, unit: 'A', answer: iVs, target: null },
  ];
  const variant = pick(variants);

  const steps = [
    `Belangrijk inzicht: in een parallelschakeling staat overal dezelfde spanning. Een spanningsbron legt zijn eigen spanning op, dus geldt: v = V<sub>s</sub> = ${fmt(Vs)} V — ongeacht de waarden van R en I<sub>s</sub>!`,
    `Met de wet van Ohm: i<sub>R</sub> = v/R = ${fmt(Vs)} / ${fmt(R)} = ${fmt(iR)} A.`,
    `Met KCL in het bovenste knooppunt: I<sub>s</sub> = i<sub>R</sub> + i<sub>v</sub>  →  i<sub>v</sub> = I<sub>s</sub> − i<sub>R</sub> = ${fmt(Is)} − ${fmt(iR)} = ${fmt(iVs)} A.`,
    `Dus het gevraagde antwoord is ${fmt(variant.answer)} ${variant.unit}.`,
  ];

  return {
    categoryId: 'parallel-vi',
    accent: 'mixed',
    title: 'Bronnen in parallel (V + I)',
    question: variant.question,
    unit: variant.unit,
    answer: variant.answer,
    tolerance: toleranceFor(variant.answer),
    steps,
    circuit: { kind: 'parallel-vi', Vs, R, Is, target: variant.target },
  };
}
