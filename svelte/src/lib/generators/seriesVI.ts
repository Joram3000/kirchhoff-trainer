import type { Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';
import { m, d } from '../utils/tex';
import type { ResistorTarget } from '../utils/target';

interface Variant {
  question: string;
  unit: string;
  answer: number;
  target: ResistorTarget;
}

export function generateSeriesVI(): Problem {
  const Is = niceInt(2, 10);
  const R = niceInt(2, 30);
  const Vs = niceInt(10, 60);
  const vR = round2(Is * R);
  const vx = round2(Vs - vR);

  const variants: Variant[] = [
    { question: `Bereken de stroom door de spanningsbron V<sub>s</sub>.`, unit: 'A', answer: Is, target: null },
    { question: `Bereken de spanning v<sub>R</sub> over de weerstand R.`, unit: 'V', answer: vR, target: 'R' },
    { question: `Bereken de spanning v<sub>x</sub> over de stroombron (via KVL).`, unit: 'V', answer: vx, target: null },
  ];
  const variant = pick(variants);

  const steps = [
    `Belangrijk inzicht: in een serieschakeling loopt overal dezelfde stroom. Een stroombron legt zijn eigen stroom op, dus geldt: ${m`I = I_s = ${Is}\,\mathrm{A}`} — ongeacht de waarden van R en V<sub>s</sub>!`,
    `Met de wet van Ohm:${d`v_R = I \cdot R = ${Is} \cdot ${R} = ${vR}\,\mathrm{V}`}`,
    `Met KVL rond de lus:${d`\begin{aligned} V_s - v_R - v_x &= 0 \\ v_x &= ${Vs} - ${vR} = ${vx}\,\mathrm{V} \end{aligned}`}`,
    `Het gevraagde antwoord:${d`\boxed{${variant.answer}\,\mathrm{${variant.unit}}}`}`,
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
    circuit: { kind: 'series-vi', Vs, R, Is, target: variant.target },
  };
}
