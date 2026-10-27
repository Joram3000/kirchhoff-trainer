import type { ResistorTarget } from './utils/target';

/**
 * The pedagogical "law" a category exercises — drives accent color and chip
 * label. `theorem` covers the network theorems (Thévenin/Norton,
 * superposition, maximum power transfer).
 */
export type Accent = 'kcl' | 'kvl' | 'mixed' | 'theorem';

export type CategoryId =
  | 'kcl-node'
  | 'kvl-loop'
  | 'series'
  | 'parallel'
  | 'series-vi'
  | 'parallel-vi'
  | 'power'
  | 'mixed'
  | 'equivalent'
  | 'node-voltage'
  | 'thevenin'
  | 'max-power'
  | 'superposition';

/** Top-level section of the app. */
export type View = 'practice' | 'theory' | 'exam';

/** Compass-style position of a branch/side around a circuit's central shape. */
export type Position = 'boven' | 'rechts' | 'onder' | 'links';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  accent: Accent;
  /** Course block the category belongs to; the tab bar groups by it. */
  group: string;
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
 * One two-terminal element in a node-voltage ladder. As a shunt it hangs
 * between a top-rail node and ground; as a link it sits on the top rail
 * between two neighbouring nodes. `dir` is the source's arrow direction
 * (up/down for shunts, left/right for links); `plus` the + terminal.
 */
export type NvElement =
  | { type: 'R'; ohms: number }
  | { type: 'I'; amps: number; dir: 'up' | 'down' | 'left' | 'right' }
  | { type: 'V'; volts: number; plus: 'top' | 'bottom' | 'left' | 'right' }
  | { type: 'CCCS'; gain: number; ctrl: string; dir: 'up' | 'down' };

export interface NvNode {
  /** Subscript of the node voltage, e.g. '1' for v₁. */
  name: string;
  /** Fixed by a voltage source to ground, so not an unknown. */
  known?: boolean;
}

export interface NvShunt {
  node: number;
  el: NvElement;
}

export interface NvLink {
  el: NvElement;
  /** Reference arrow for the current through this element, labelled i<sub>name</sub>. */
  current?: { name: string; dir: 'left' | 'right' };
}

/** What the question asks about, so the diagram can highlight it. */
export type NvTarget = { node: number } | { link: number } | null;

/**
 * A ladder circuit: nodes along a top rail above a ground rail. Shunts are
 * listed left to right, grouped per node; `links[i]` joins node i and i+1;
 * `bridge` (optional) arcs over the top from the first node to the last.
 */
export interface NodeVoltageSpec {
  nodes: NvNode[];
  shunts: NvShunt[];
  links: NvLink[];
  bridge?: NvLink;
  target: NvTarget;
}

/** A point on the grid-circuit drawing, in grid units (fractions allowed). */
export type Pt = readonly [number, number];

/** Where a label sits relative to an element or point. */
export type Side = 'left' | 'right' | 'above' | 'below';

/**
 * A two-terminal element on an axis-aligned segment between two grid points;
 * the renderer draws the lead wires from `from`/`to` to the symbol. Labels
 * use a mini-markup where `_x` or `_{xy}` is a subscript (e.g. "R_1 = 4 Ω").
 */
export type GridElement = {
  from: Pt;
  to: Pt;
  /** Lets a variant highlight this element via `GridSpec.highlight`. */
  id?: string;
  label?: string;
  /** Defaults to 'right' for vertical and 'above' for horizontal elements. */
  side?: Side;
  /** Ohms, volts or amps — not drawn, but keeps the figure self-describing for analysis. */
  value?: number;
  /** Reference arrow alongside the element; defaults to the side opposite the label. */
  current?: { label: string; toward: 'from' | 'to'; side?: Side };
  /** + and − marks at the element's ends with an optional name between them. */
  polarity?: { plus: 'from' | 'to'; label?: string; side?: Side };
} & (
  | { kind: 'R' }
  | { kind: 'V'; plus: 'from' | 'to' }
  | { kind: 'I'; toward: 'from' | 'to' }
  /** A generic boxed element, e.g. "A" in a KCL network. */
  | { kind: 'box'; name: string }
  | { kind: 'switch'; closed: boolean }
);

export interface GridArrow {
  at: Pt;
  dir: 'up' | 'down' | 'left' | 'right';
  label?: string;
  side?: Side;
  id?: string;
}

export interface GridText {
  at: Pt;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
  /** `sign` for bold +/− marks, `hint` for small secondary text. */
  style?: 'lbl' | 'sign' | 'hint';
  id?: string;
}

/**
 * A free-form schematic: plain wires, elements between grid points, and
 * annotations. Used wherever a fixed topology component doesn't fit — the
 * network-theorem exercises and the exam figures.
 */
export interface GridSpec {
  wires: Pt[][];
  elements: GridElement[];
  dots?: Pt[];
  /** Open terminal circles, e.g. a and b of a two-terminal network. */
  terminals?: { at: Pt; label?: string; side?: Side }[];
  arrows?: GridArrow[];
  texts?: GridText[];
  ground?: Pt;
  /** Ids of elements, arrows and texts to draw in the accent color. */
  highlight?: string[];
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
  | ({ kind: 'node-voltage' } & NodeVoltageSpec)
  | { kind: 'series-vi'; Vs: number; R: number; Is: number; target: ResistorTarget }
  | { kind: 'parallel-vi'; Vs: number; R: number; Is: number; target: ResistorTarget }
  | ({ kind: 'grid' } & GridSpec);

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

/**
 * One scored sub-question of an exam question. Numeric by default; with
 * `choices` it is multiple choice and `answer` is the index of the right one.
 * `question` and `steps` are trusted HTML fragments, like in `Problem`.
 */
export interface ExamPart {
  label: string;
  question: string;
  points: number;
  unit: string;
  answer: number;
  tolerance: number;
  choices?: string[];
  steps: string[];
}

export interface ExamQuestion {
  title: string;
  /** Exam topic, e.g. "Superpositie", shown as a chip. */
  topic: string;
  accent: Accent;
  /** Given values and context, as a trusted HTML fragment. */
  intro: string;
  circuit: CircuitSpec | null;
  parts: ExamPart[];
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  /** Fresh questions on every call for generated exams; the same list for fixed ones. */
  build: () => ExamQuestion[];
  /** Generated exams get a "nieuwe toets" button. */
  generated?: boolean;
}

export interface ExamResult {
  best: number;
  last: number;
  max: number;
  attempts: number;
}
