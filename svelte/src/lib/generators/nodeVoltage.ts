import type { Problem } from '../types';
import { niceInt } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';

export function generateNodeVoltage(): Problem {
  const Is = niceInt(3, 12);
  const R1 = niceInt(2, 20);
  const R2 = niceInt(2, 20);
  const V2 = niceInt(2, 20);
  const v1 = round2((Is + V2 / R2) / (1 / R1 + 1 / R2));

  const steps = [
    `Stel de KCL-vergelijking op in knooppunt 1 (som van de stromen die het knooppunt verlaten = de ingaande bronstroom):`,
    `I<sub>s</sub> = v<sub>1</sub>/R<sub>1</sub> + (v<sub>1</sub> − V<sub>2</sub>)/R<sub>2</sub>`,
    `${fmt(Is)} = v<sub>1</sub>/${fmt(R1)} + (v<sub>1</sub> − ${fmt(V2)})/${fmt(R2)}`,
    `Werk uit en los op naar v<sub>1</sub>: v<sub>1</sub> = (I<sub>s</sub> + V<sub>2</sub>/R<sub>2</sub>) / (1/R<sub>1</sub> + 1/R<sub>2</sub>) = ${fmt(v1)} V.`,
  ];

  return {
    categoryId: 'node-voltage',
    accent: 'kcl',
    title: 'Knooppuntspanning',
    question: `Bepaal de knooppuntspanning v<sub>1</sub> met de knooppuntspanningsmethode (gebaseerd op KCL).`,
    unit: 'V',
    answer: v1,
    tolerance: toleranceFor(v1),
    steps,
    circuit: { kind: 'node-voltage', Is, R1, R2, V2 },
  };
}
