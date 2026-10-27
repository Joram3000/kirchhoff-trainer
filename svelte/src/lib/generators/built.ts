import type { Accent, CategoryId, ExamQuestion, GridSpec, Problem } from '../types';
import { round2 } from '../utils/format';
import { toleranceFor } from '../utils/answer';
import { pick } from '../utils/random';

export interface Variant {
  question: string;
  unit: string;
  answer: number;
  /** Steps only this question needs, shown after the circuit's shared steps. */
  extra: string[];
  highlight?: string[];
}

/**
 * One generated circuit with every question that can be asked about it: the
 * practice tab asks one at random, the exam corner turns several into parts.
 */
export interface Built {
  title: string;
  steps: string[];
  variants: Variant[];
  circuit: GridSpec;
}

export function variant(question: string, unit: string, value: number, extra: string[], highlight?: string[]): Variant {
  return { question, unit, answer: round2(value), extra, highlight };
}

export function problemFrom(categoryId: CategoryId, accent: Accent, built: Built): Problem {
  const v = pick(built.variants);
  return {
    categoryId,
    accent,
    title: built.title,
    question: v.question,
    unit: v.unit,
    answer: v.answer,
    tolerance: toleranceFor(v.answer),
    steps: [...built.steps, ...v.extra],
    circuit: { kind: 'grid', ...built.circuit, highlight: v.highlight },
  };
}

/** Turns the first `count` variants (in authored order: the natural a, b, c) into exam parts. */
export function examQuestionFrom(
  built: Built,
  topic: string,
  accent: Accent,
  intro: string,
  points: number[],
): ExamQuestion {
  const parts = built.variants.slice(0, points.length).map((v, i) => ({
    label: String.fromCharCode(97 + i),
    question: v.question,
    points: points[i],
    unit: v.unit,
    answer: v.answer,
    tolerance: toleranceFor(v.answer),
    steps: [...built.steps, ...v.extra],
  }));
  return { title: built.title, topic, accent, intro, circuit: { kind: 'grid', ...built.circuit }, parts };
}

/** Open terminals a and b at x, with "+ v_ab −" marks beside them so the sign of V_t is unambiguous. */
export function abTerminals(x: number, top: number, bottom: number, label = 'v_{ab}'): Required<Pick<GridSpec, 'terminals' | 'texts'>> {
  return {
    terminals: [
      { at: [x, top], label: 'a', side: 'above' },
      { at: [x, bottom], label: 'b', side: 'below' },
    ],
    texts: [
      { at: [x + 0.08, top + 0.32], text: '+', style: 'sign', anchor: 'start' },
      { at: [x + 0.08, (top + bottom) / 2], text: label, anchor: 'start' },
      { at: [x + 0.08, bottom - 0.32], text: '−', style: 'sign', anchor: 'start' },
    ],
  };
}

export const ohm = (name: string, value: number | null) => (value === null ? name : `${name} = ${fmtLabel(value)} Ω`);
export const volt = (name: string, value: number) => `${name} = ${fmtLabel(value)} V`;
export const amp = (name: string, value: number) => `${name} = ${fmtLabel(value)} A`;

/** Labels live inside SVG text, so they use the plain Dutch decimal comma without markup. */
function fmtLabel(n: number): string {
  return String(round2(n)).replace('.', ',');
}
