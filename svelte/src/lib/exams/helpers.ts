import type { CircuitSpec, ExamPart, GridSpec } from '../types';
import { toleranceFor } from '../utils/answer';

export function part(label: string, question: string, unit: string, answer: number, points: number, steps: string[]): ExamPart {
  return { label, question, unit, answer, tolerance: toleranceFor(answer), points, steps };
}

/** A multiple-choice part; `correct` is the index into `choices`. */
export function choice(
  label: string,
  question: string,
  choices: string[],
  correct: number,
  points: number,
  steps: string[],
): ExamPart {
  return { label, question, unit: '', answer: correct, tolerance: 0, choices, points, steps };
}

export const grid = (spec: GridSpec): CircuitSpec => ({ kind: 'grid', ...spec });

/** v_t in series with R_t, terminals a-b, and a load across them — the figure for the battery-model problems. */
export function sourceWithLoad(vt: string, rt: string, load: string): CircuitSpec {
  return grid({
    wires: [
      [[0, 2], [3.4, 2]],
      [[2.2, 0], [3.4, 0]],
    ],
    elements: [
      { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: vt, side: 'left' },
      { kind: 'R', from: [0, 0], to: [2.2, 0], label: rt },
      { kind: 'R', from: [3.4, 0], to: [3.4, 2], label: load, polarity: { plus: 'from', label: 'v_L', side: 'left' } },
    ],
    terminals: [
      { at: [2.2, 0], label: 'a', side: 'above' },
      { at: [2.2, 2], label: 'b', side: 'below' },
    ],
  });
}
