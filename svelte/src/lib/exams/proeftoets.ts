import type { Exam, ExamQuestion, Problem } from '../types';
import { pick } from '../utils/random';
import { toleranceFor } from '../utils/answer';
import { examQuestionFrom } from '../generators/built';
import { buildPowerLoop } from '../generators/power';
import { buildEquivalent } from '../generators/equivalent';
import { buildNodeVoltage } from '../generators/nodeVoltage';
import { generateKclNode } from '../generators/kclNode';
import { buildSuperposition } from '../generators/superposition';
import { buildThevenin } from '../generators/thevenin';
import { buildMaxPower } from '../generators/maxPower';

const FROM_FIGURE = 'Alle gegeven waarden staan in het schema.';

function singlePart(p: Problem, topic: string, points: number): ExamQuestion {
  return {
    title: p.title,
    topic,
    accent: p.accent,
    intro: FROM_FIGURE,
    circuit: p.circuit,
    parts: [{ label: 'a', question: p.question, points, unit: p.unit, answer: p.answer, tolerance: p.tolerance, steps: p.steps }],
  };
}

function nodeVoltageQuestion(): ExamQuestion {
  const nv = buildNodeVoltage(pick([1, 2]));
  const points = [8, 7];
  return {
    title: nv.title,
    topic: 'Knooppuntspanningsmethode',
    accent: 'kcl',
    intro: `${FROM_FIGURE} Gebruik de knooppuntspanningsmethode systematisch.`,
    circuit: { kind: 'node-voltage', ...nv.circuit, target: null },
    parts: nv.variants.slice(0, 2).map((v, i) => ({
      label: String.fromCharCode(97 + i),
      question: v.question,
      points: points[i],
      unit: v.unit,
      answer: v.answer,
      tolerance: toleranceFor(v.answer),
      steps: [...nv.steps, ...v.extra],
    })),
  };
}

/** One question per exam topic, 100 points in total, fresh values on every call. */
function build(): ExamQuestion[] {
  const questions = [
    examQuestionFrom(buildPowerLoop(), 'Vermogen & tekenconventie', 'mixed', FROM_FIGURE, [5, 5, 5]),
    examQuestionFrom(buildEquivalent(pick([1, 2]), true), 'Vervangingsweerstand', 'mixed', FROM_FIGURE, [10]),
    nodeVoltageQuestion(),
    singlePart(generateKclNode(), 'Stroomwet van Kirchhoff', 10),
    examQuestionFrom(buildSuperposition(2), 'Superpositie', 'theorem', `${FROM_FIGURE} Geef duidelijk je plan van aanpak.`, [5, 5, 5]),
    examQuestionFrom(buildThevenin(2), 'Thévenin & Norton', 'theorem', FROM_FIGURE, [6, 7, 7]),
    examQuestionFrom(buildMaxPower(1), 'Maximum power transfer', 'theorem', FROM_FIGURE, [5, 10]),
  ];
  return questions.map((q, i) => ({ ...q, title: `Opgave ${i + 1}` }));
}

export const proeftoets: Exam = {
  id: 'proeftoets',
  title: 'Proeftoets (willekeurig)',
  description: 'Elke keer een nieuwe toets van 100 punten met alle tentamenonderwerpen, opgebouwd zoals de oefentoets. Werk alles uit, vul in en laat hem pas aan het eind nakijken.',
  build,
  generated: true,
};
