import type { ResistorTarget } from './utils/target';

/** The pedagogical "law" a category exercises — drives accent color and chip label. */
export type Accent = 'kcl' | 'kvl' | 'mixed';

export type CategoryId =
  | 'kcl-node'
  | 'kvl-loop'
  | 'series'
  | 'parallel'
  | 'series-vi'
  | 'parallel-vi'
  | 'mixed'
  | 'node-voltage';

/** Compass-style position of a branch/side around a circuit's central shape. */
export type Position = 'boven' | 'rechts' | 'onder' | 'links';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  accent: Accent;
}

export interface KclBranchSpec {
  pos: Position;
  letter: string;
  dir: 'in' | 'out';
  value: number;
  isUnknown: boolean;
}

export interface KvlSideSpec {
  pos: Position;
  letter: string;
  orient: 'stijging' | 'daling';
  value: number;
  isUnknown: boolean;
}

/**
 * Everything a circuit component needs to draw itself, keyed by `kind` so the
 * dispatching component can narrow to the right prop shape per generator.
 */
export type CircuitSpec =
  | { kind: 'kcl-node'; branches: KclBranchSpec[] }
  | { kind: 'kvl-loop'; sides: KvlSideSpec[] }
  | { kind: 'series'; Vs: number; Rs: number[]; target: ResistorTarget }
  | { kind: 'parallel'; Is: number; Rs: number[]; target: ResistorTarget }
  | { kind: 'mixed'; Vs: number; R1: number; Rs: number[]; target: ResistorTarget }
  | { kind: 'node-voltage'; Is: number; R1: number; R2: number; V2: number }
  | { kind: 'series-vi'; Vs: number; R: number; Is: number; target: ResistorTarget }
  | { kind: 'parallel-vi'; Vs: number; R: number; Is: number; target: ResistorTarget };

/**
 * A fully generated exercise. `question` and `steps` are small trusted HTML
 * fragments (only `<sub>`/`<b>`, never user input) so they can carry
 * subscripted quantities like "i<sub>a</sub>".
 */
export interface Problem {
  categoryId: CategoryId;
  accent: Accent;
  title: string;
  question: string;
  unit: string;
  answer: number;
  tolerance: number;
  steps: string[];
  circuit: CircuitSpec;
}

export interface CategoryStats {
  attempts: number;
  correct: number;
  streak: number;
  best: number;
}
