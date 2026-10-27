import type { NodeVoltageSpec, NvTarget, Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { round2, fmt, fmtSig } from '../utils/format';
import { toleranceFor } from '../utils/answer';
import { difficultyLevel } from '../utils/difficulty';
import { solveLinear } from '../utils/linear';

/** Resistances whose reciprocals are short terminating decimals, so G-matrix entries stay exact. */
const R_POOL = [2, 4, 5, 8, 10, 20, 25, 40, 50] as const;

interface Variant {
  question: string;
  unit: string;
  answer: number;
  extra: string[];
  target: NvTarget;
}

interface Built {
  title: string;
  steps: string[];
  variants: Variant[];
  circuit: Omit<NodeVoltageSpec, 'target'>;
}

const randR = () => pick(R_POOL);
const v = (k: string | number) => `v<sub>${k}</sub>`;
const g = (j: number, k: number) => `g<sub>${j}${k}</sub>`;
const f = fmtSig;

/** Source current pushed into a node: positive when the arrow points into it. */
function srcNote(amps: number, into: boolean, node: string): string {
  return into
    ? `(de ${fmt(amps)} A-bron duwt stroom knooppunt ${node} in → +${fmt(amps)})`
    : `(de ${fmt(amps)} A-bron trekt stroom uit knooppunt ${node} → −${fmt(amps)})`;
}

/** One standard-form row, e.g. "0,45·v₁ − 0,25·v₂ = −3,5". */
function row(coefs: number[], rhs: number, names: string[]): string {
  let s = '';
  coefs.forEach((c, i) => {
    if (Math.abs(c) < 1e-12) return;
    const body = `${f(Math.abs(c))}·${v(names[i])}`;
    s += s === '' ? (c < 0 ? '−' : '') + body : (c < 0 ? ' − ' : ' + ') + body;
  });
  return `${s} = ${f(rhs)}`;
}

function cramer2(G: number[][], I: number[], names: string[]): string[] {
  const D = G[0][0] * G[1][1] - G[0][1] * G[1][0];
  const x1 = (I[0] * G[1][1] - G[0][1] * I[1]) / D;
  const x2 = (G[0][0] * I[1] - I[0] * G[1][0]) / D;
  return [
    `Los op, bijvoorbeeld met de regel van Cramer: D = ${g(1, 1)}·${g(2, 2)} − ${g(1, 2)}·${g(2, 1)} = ${f(G[0][0])}·${f(G[1][1])} − (${f(G[0][1])})·(${f(G[1][0])}) = ${f(D)}.`,
    `${v(names[0])} = (i<sub>1</sub>·${g(2, 2)} − ${g(1, 2)}·i<sub>2</sub>) / D = (${f(I[0])}·${f(G[1][1])} − (${f(G[0][1])})·${f(I[1])}) / ${f(D)} = <b>${fmt(x1)} V</b>`,
    `${v(names[1])} = (${g(1, 1)}·i<sub>2</sub> − i<sub>1</sub>·${g(2, 1)}) / D = (${f(G[0][0])}·${f(I[1])} − ${f(I[0])}·(${f(G[1][0])})) / ${f(D)} = <b>${fmt(x2)} V</b>`,
  ];
}

const SHORTCUT =
  `Snelle methode (alleen weerstanden + onafhankelijke stroombronnen): ${g(1, 1)}, ${g(2, 2)}, … = som van de conductanties aan dat knooppunt; ${g(1, 2)} = −(conductantie tussen knooppunt 1 en 2); i<sub>k</sub> = bronstroom die knooppunt k in wordt geduwd.`;

function nodeVariant(name: string, node: number, value: number, extra: string[] = []): Variant {
  return {
    question: `Bepaal de knooppuntspanning ${v(name)} (t.o.v. de referentieknoop).`,
    unit: 'V',
    answer: round2(value),
    extra,
    target: { node },
  };
}

function conductanceVariant(j: number, k: number, value: number, why: string): Variant {
  return {
    question: `Schrijf de knooppuntvergelijkingen in matrixvorm G·v = i. Hoe groot is ${g(j, k)}? Geef het antwoord in mS.`,
    unit: 'mS',
    answer: round2(value * 1000),
    extra: [`${g(j, k)} = ${why} = ${f(value)} S = <b>${fmt(value * 1000)} mS</b>.`],
    target: null,
  };
}

/** Level 1 — Hambley Ex. 2.9-style: one unknown node, the other fixed by a source to ground. */
function oneUnknown(): Built {
  const Is = niceInt(1, 9);
  const R1 = randR();
  const R2 = randR();
  const V2 = niceInt(2, 24);
  const G = 1 / R1 + 1 / R2;
  const rhs = Is + V2 / R2;
  const v1 = rhs / G;
  const i = (v1 - V2) / R2;

  return {
    title: 'Knooppuntspanning · één onbekende',
    steps: [
      `Kies de onderste knoop als referentie. Knooppunt 2 zit via de spanningsbron vast aan de referentie: ${v(2)} = ${fmt(V2)} V. Er blijft één onbekende over: ${v(1)}.`,
      `KCL in knooppunt 1 (som van de stromen die het knooppunt verlaten = bronstroom die erin gaat): ${v(1)}/${fmt(R1)} + (${v(1)} − ${fmt(V2)})/${fmt(R2)} = ${fmt(Is)}`,
      `Standaardvorm: (1/${fmt(R1)} + 1/${fmt(R2)})·${v(1)} = ${fmt(Is)} + ${fmt(V2)}/${fmt(R2)} → ${f(G)}·${v(1)} = ${f(rhs)}`,
      `${v(1)} = ${f(rhs)} / ${f(G)} = <b>${fmt(v1)} V</b>`,
    ],
    variants: [
      nodeVariant('1', 0, v1),
      {
        question: `Bepaal de stroom i door de ${fmt(R2)} Ω-weerstand (richting zoals aangegeven).`,
        unit: 'A',
        answer: round2(i),
        extra: [`i = (${v(1)} − ${v(2)})/${fmt(R2)} = (${fmt(v1)} − ${fmt(V2)})/${fmt(R2)} = <b>${fmt(i)} A</b>`],
        target: { link: 0 },
      },
    ],
    circuit: {
      nodes: [{ name: '1' }, { name: '2', known: true }],
      shunts: [
        { node: 0, el: { type: 'I', amps: Is, dir: 'up' } },
        { node: 0, el: { type: 'R', ohms: R1 } },
        { node: 1, el: { type: 'V', volts: V2, plus: 'top' } },
      ],
      links: [{ el: { type: 'R', ohms: R2 }, current: { name: '', dir: 'right' } }],
    },
  };
}

/** Level 1 — Hambley P2.48 / P2.50: two unknown nodes, current sources only. */
function twoNodes(): Built {
  const I1 = niceInt(1, 9);
  const I2 = niceInt(1, 9);
  const in1 = Math.random() < 0.75;
  const in2 = Math.random() < 0.6;
  const s1 = in1 ? I1 : -I1;
  const s2 = in2 ? I2 : -I2;
  const Ra = randR();
  const Rb = randR();
  const Rc = randR();
  const G = [
    [1 / Ra + 1 / Rb, -1 / Rb],
    [-1 / Rb, 1 / Rb + 1 / Rc],
  ];
  const I = [s1, s2];
  const [v1, v2] = solveLinear(G, I);
  const i1 = (v1 - v2) / Rb;
  const names = ['1', '2'];

  return {
    title: 'Knooppuntspanning · twee knooppunten',
    steps: [
      `Referentieknoop = onderste knoop (massa). Onbekenden: ${v(1)} en ${v(2)}. Stroom van knooppunt n naar k door R: (v<sub>n</sub> − v<sub>k</sub>)/R.`,
      `KCL knooppunt 1: ${v(1)}/${fmt(Ra)} + (${v(1)} − ${v(2)})/${fmt(Rb)} = ${fmt(s1)} ${srcNote(I1, in1, '1')}`,
      `KCL knooppunt 2: ${v(2)}/${fmt(Rc)} + (${v(2)} − ${v(1)})/${fmt(Rb)} = ${fmt(s2)} ${srcNote(I2, in2, '2')}`,
      SHORTCUT,
      `Standaardvorm: ${row(G[0], I[0], names)} en ${row(G[1], I[1], names)}`,
      ...cramer2(G, I, names),
    ],
    variants: [
      nodeVariant('1', 0, v1),
      nodeVariant('2', 1, v2),
      {
        question: `Bepaal de stroom i<sub>1</sub> door de ${fmt(Rb)} Ω-weerstand.`,
        unit: 'A',
        answer: round2(i1),
        extra: [`i<sub>1</sub> = (${v(1)} − ${v(2)})/${fmt(Rb)} = (${fmt(v1)} − ${fmt(v2)})/${fmt(Rb)} = <b>${fmt(i1)} A</b>`],
        target: { link: 0 },
      },
      conductanceVariant(1, 1, G[0][0], `1/${fmt(Ra)} + 1/${fmt(Rb)} (alle conductanties aan knooppunt 1)`),
      conductanceVariant(1, 2, G[0][1], `−1/${fmt(Rb)} (min de conductantie tussen knooppunt 1 en 2)`),
    ],
    circuit: {
      nodes: [{ name: '1' }, { name: '2' }],
      shunts: [
        { node: 0, el: { type: 'I', amps: I1, dir: in1 ? 'up' : 'down' } },
        { node: 0, el: { type: 'R', ohms: Ra } },
        { node: 1, el: { type: 'R', ohms: Rc } },
        { node: 1, el: { type: 'I', amps: I2, dir: in2 ? 'up' : 'down' } },
      ],
      links: [{ el: { type: 'R', ohms: Rb }, current: { name: '1', dir: 'right' } }],
    },
  };
}

/** Level 2 — Hambley Ex. 2.9 / Ex. 2.11: two unknowns plus a node fixed by a voltage source. */
function knownNode(): Built {
  const Is = niceInt(1, 9);
  const Vs = niceInt(5, 30);
  const Ra = randR();
  const Rb = randR();
  const Rc = randR();
  const Rd = randR();
  const G = [
    [1 / Ra + 1 / Rb, -1 / Rb],
    [-1 / Rb, 1 / Rb + 1 / Rc + 1 / Rd],
  ];
  const I = [Is, Vs / Rd];
  const [v1, v2] = solveLinear(G, I);
  const i = (v2 - Vs) / Rd;
  const names = ['1', '2'];

  return {
    title: 'Knooppuntspanning · bekende knoop',
    steps: [
      `De referentieknoop ligt aan de min-kant van de spanningsbron, dus ${v(3)} = ${fmt(Vs)} V is meteen bekend. Onbekenden: ${v(1)} en ${v(2)}.`,
      `KCL knooppunt 1: ${v(1)}/${fmt(Ra)} + (${v(1)} − ${v(2)})/${fmt(Rb)} = ${fmt(Is)}`,
      `KCL knooppunt 2: ${v(2)}/${fmt(Rc)} + (${v(2)} − ${v(1)})/${fmt(Rb)} + (${v(2)} − ${fmt(Vs)})/${fmt(Rd)} = 0`,
      `Breng de bekende term ${fmt(Vs)}/${fmt(Rd)} = ${f(Vs / Rd)} naar rechts. Standaardvorm: ${row(G[0], I[0], names)} en ${row(G[1], I[1], names)}`,
      ...cramer2(G, I, names),
    ],
    variants: [
      nodeVariant('1', 0, v1),
      nodeVariant('2', 1, v2),
      {
        question: `Bepaal de stroom i door de ${fmt(Rd)} Ω-weerstand (richting zoals aangegeven).`,
        unit: 'A',
        answer: round2(i),
        extra: [`i = (${v(2)} − ${v(3)})/${fmt(Rd)} = (${fmt(v2)} − ${fmt(Vs)})/${fmt(Rd)} = <b>${fmt(i)} A</b>`],
        target: { link: 1 },
      },
    ],
    circuit: {
      nodes: [{ name: '1' }, { name: '2' }, { name: '3', known: true }],
      shunts: [
        { node: 0, el: { type: 'I', amps: Is, dir: 'up' } },
        { node: 0, el: { type: 'R', ohms: Ra } },
        { node: 1, el: { type: 'R', ohms: Rc } },
        { node: 2, el: { type: 'V', volts: Vs, plus: 'top' } },
      ],
      links: [
        { el: { type: 'R', ohms: Rb } },
        { el: { type: 'R', ohms: Rd }, current: { name: '', dir: 'right' } },
      ],
    },
  };
}

/** Level 2 — Hambley Fig. 2.25 / P2.49: a voltage source between two nodes → supernode + KVL. */
function supernode(): Built {
  const Is = niceInt(1, 9);
  const into = Math.random() < 0.75;
  const s = into ? Is : -Is;
  const Vs = niceInt(2, 20);
  const plusLeft = Math.random() < 0.5;
  const Ra = randR();
  const Rb = randR();
  // KVL: plus left → v1 − v2 = Vs; plus right → v2 − v1 = Vs.
  const d = plusLeft ? Vs : -Vs;
  const [v1, v2] = solveLinear(
    [
      [1 / Ra, 1 / Rb],
      [1, -1],
    ],
    [s, d],
  );
  const iSrc = s - v1 / Ra;
  const kvl = plusLeft ? `${v(1)} − ${v(2)} = ${fmt(Vs)}` : `${v(2)} − ${v(1)} = ${fmt(Vs)}`;
  const sub = plusLeft
    ? `Vul ${v(1)} = ${v(2)} + ${fmt(Vs)} in: (${v(2)} + ${fmt(Vs)})/${fmt(Ra)} + ${v(2)}/${fmt(Rb)} = ${fmt(s)} → ${f(1 / Ra + 1 / Rb)}·${v(2)} = ${f(s - Vs / Ra)}`
    : `Vul ${v(2)} = ${v(1)} + ${fmt(Vs)} in: ${v(1)}/${fmt(Ra)} + (${v(1)} + ${fmt(Vs)})/${fmt(Rb)} = ${fmt(s)} → ${f(1 / Ra + 1 / Rb)}·${v(1)} = ${f(s - Vs / Rb)}`;

  return {
    title: 'Knooppuntspanning · supernode',
    steps: [
      `Tussen knooppunt 1 en 2 zit een spanningsbron: de stroom daardoor is onbekend, dus in knooppunt 1 of 2 los kun je geen KCL opschrijven. Teken een <b>supernode</b> om de bron heen.`,
      `KVL over de bron (de + kant zit ${plusLeft ? 'links' : 'rechts'}): ${kvl}`,
      `KCL voor de supernode (stromen die het gesloten oppervlak verlaten): ${v(1)}/${fmt(Ra)} + ${v(2)}/${fmt(Rb)} = ${fmt(s)} ${srcNote(Is, into, '1')}`,
      sub,
      `Dus ${v(1)} = <b>${fmt(v1)} V</b> en ${v(2)} = <b>${fmt(v2)} V</b>.`,
    ],
    variants: [
      nodeVariant('1', 0, v1),
      nodeVariant('2', 1, v2),
      {
        question: `Bepaal de stroom i<sub>s</sub> door de spanningsbron (richting zoals aangegeven).`,
        unit: 'A',
        answer: round2(iSrc),
        extra: [
          `KCL in knooppunt 1 (nu mét de bronstroom): ${fmt(s)} = ${v(1)}/${fmt(Ra)} + i<sub>s</sub> → i<sub>s</sub> = ${fmt(s)} − ${fmt(v1)}/${fmt(Ra)} = <b>${fmt(iSrc)} A</b>`,
        ],
        target: { link: 0 },
      },
    ],
    circuit: {
      nodes: [{ name: '1' }, { name: '2' }],
      shunts: [
        { node: 0, el: { type: 'I', amps: Is, dir: into ? 'up' : 'down' } },
        { node: 0, el: { type: 'R', ohms: Ra } },
        { node: 1, el: { type: 'R', ohms: Rb } },
      ],
      links: [
        { el: { type: 'V', volts: Vs, plus: plusLeft ? 'left' : 'right' }, current: { name: 's', dir: 'right' } },
      ],
    },
  };
}

/** Level 3 — Hambley Ex. 2.8 / P2.51: three unknowns with a bridging resistor (no series/parallel shortcut). */
function threeNodes(): Built {
  const Is = niceInt(1, 9);
  const Ra = randR();
  const R12 = randR();
  const R23 = randR();
  const R13 = randR();
  const Rc = randR();
  // The middle node gets either a resistor or a second current source to ground.
  const midSource = Math.random() < 0.5;
  const Rb = randR();
  const I2 = niceInt(1, 9);
  const in2 = Math.random() < 0.5;
  const s2 = midSource ? (in2 ? I2 : -I2) : 0;
  const gb = midSource ? 0 : 1 / Rb;

  const G = [
    [1 / Ra + 1 / R12 + 1 / R13, -1 / R12, -1 / R13],
    [-1 / R12, 1 / R12 + gb + 1 / R23, -1 / R23],
    [-1 / R13, -1 / R23, 1 / R23 + 1 / Rc + 1 / R13],
  ];
  const I = [Is, s2, 0];
  const [v1, v2, v3] = solveLinear(G, I);
  const i1 = (v1 - v2) / R12;
  const names = ['1', '2', '3'];
  const node2Lhs = midSource
    ? `(${v(2)} − ${v(1)})/${fmt(R12)} + (${v(2)} − ${v(3)})/${fmt(R23)} = ${fmt(s2)} ${srcNote(I2, in2, '2')}`
    : `(${v(2)} − ${v(1)})/${fmt(R12)} + ${v(2)}/${fmt(Rb)} + (${v(2)} − ${v(3)})/${fmt(R23)} = 0`;

  return {
    title: 'Knooppuntspanning · drie knooppunten',
    steps: [
      `Geen enkele weerstand staat zuiver in serie of parallel (de ${fmt(R13)} Ω overbrugt knooppunt 1 en 3), dus vervangingsweerstanden helpen niet. Onbekenden: ${v(1)}, ${v(2)}, ${v(3)}.`,
      `KCL knooppunt 1: ${v(1)}/${fmt(Ra)} + (${v(1)} − ${v(2)})/${fmt(R12)} + (${v(1)} − ${v(3)})/${fmt(R13)} = ${fmt(Is)}`,
      `KCL knooppunt 2: ${node2Lhs}`,
      `KCL knooppunt 3: (${v(3)} − ${v(2)})/${fmt(R23)} + ${v(3)}/${fmt(Rc)} + (${v(3)} − ${v(1)})/${fmt(R13)} = 0`,
      SHORTCUT,
      `Standaardvorm:<br>${row(G[0], I[0], names)}<br>${row(G[1], I[1], names)}<br>${row(G[2], I[2], names)}`,
      `Los het stelsel op (rekenmachine, eliminatie of V = G<sup>−1</sup>·I): ${v(1)} = <b>${fmt(v1)} V</b>, ${v(2)} = <b>${fmt(v2)} V</b>, ${v(3)} = <b>${fmt(v3)} V</b>.`,
    ],
    variants: [
      nodeVariant('1', 0, v1),
      nodeVariant('2', 1, v2),
      nodeVariant('3', 2, v3),
      {
        question: `Bepaal de stroom i<sub>1</sub> door de ${fmt(R12)} Ω-weerstand.`,
        unit: 'A',
        answer: round2(i1),
        extra: [`i<sub>1</sub> = (${v(1)} − ${v(2)})/${fmt(R12)} = (${fmt(v1)} − ${fmt(v2)})/${fmt(R12)} = <b>${fmt(i1)} A</b>`],
        target: { link: 0 },
      },
      conductanceVariant(1, 1, G[0][0], `1/${fmt(Ra)} + 1/${fmt(R12)} + 1/${fmt(R13)}`),
      conductanceVariant(1, 3, G[0][2], `−1/${fmt(R13)} (min de conductantie tussen knooppunt 1 en 3)`),
    ],
    circuit: {
      nodes: [{ name: '1' }, { name: '2' }, { name: '3' }],
      shunts: [
        { node: 0, el: { type: 'I', amps: Is, dir: 'up' } },
        { node: 0, el: { type: 'R', ohms: Ra } },
        { node: 1, el: midSource ? { type: 'I', amps: I2, dir: in2 ? 'up' : 'down' } : { type: 'R', ohms: Rb } },
        { node: 2, el: { type: 'R', ohms: Rc } },
      ],
      links: [
        { el: { type: 'R', ohms: R12 }, current: { name: '1', dir: 'right' } },
        { el: { type: 'R', ohms: R23 } },
      ],
      bridge: { el: { type: 'R', ohms: R13 } },
    },
  };
}

/** Level 3 — Hambley Ex. 2.10 / P2.56: a current-controlled current source. */
function dependentSource(): Built {
  for (;;) {
    const Is = niceInt(1, 9);
    const Ra = randR();
    const Rb = randR();
    const Rc = randR();
    const k = pick([0.5, 2, 3] as const);
    const G = [
      [1 / Ra + 1 / Rb, -1 / Rb],
      [-(1 - k) / Rb, (1 - k) / Rb + 1 / Rc],
    ];
    const D = G[0][0] * G[1][1] - G[0][1] * G[1][0];
    if (Math.abs(D) < 1e-4) continue;
    const I = [Is, 0];
    const [v1, v2] = solveLinear(G, I);
    if (Math.abs(v1) > 500 || Math.abs(v2) > 500) continue;
    const ix = (v1 - v2) / Rb;
    const names = ['1', '2'];
    const ki = `${fmt(k)}·i<sub>x</sub>`;

    return {
      title: 'Knooppuntspanning · gestuurde bron',
      steps: [
        `Behandel de gestuurde bron eerst als een gewone stroombron van ${ki}; die stroom verlaat knooppunt 2 naar beneden.`,
        `KCL knooppunt 1: ${v(1)}/${fmt(Ra)} + (${v(1)} − ${v(2)})/${fmt(Rb)} = ${fmt(Is)}`,
        `KCL knooppunt 2: (${v(2)} − ${v(1)})/${fmt(Rb)} + ${v(2)}/${fmt(Rc)} + ${ki} = 0`,
        `Druk de stuurgrootheid uit in knooppuntspanningen: i<sub>x</sub> = (${v(1)} − ${v(2)})/${fmt(Rb)}. Vul in bij knooppunt 2.`,
        `Standaardvorm: ${row(G[0], I[0], names)} en ${row(G[1], I[1], names)} (let op: G is nu niet symmetrisch — de snelle methode werkt niet bij gestuurde bronnen).`,
        ...cramer2(G, I, names),
      ],
      variants: [
        nodeVariant('1', 0, v1),
        nodeVariant('2', 1, v2),
        {
          question: `Bepaal de stuurstroom i<sub>x</sub>.`,
          unit: 'A',
          answer: round2(ix),
          extra: [`i<sub>x</sub> = (${v(1)} − ${v(2)})/${fmt(Rb)} = (${fmt(v1)} − ${fmt(v2)})/${fmt(Rb)} = <b>${fmt(ix)} A</b>`],
          target: { link: 0 },
        },
      ],
      circuit: {
        nodes: [{ name: '1' }, { name: '2' }],
        shunts: [
          { node: 0, el: { type: 'I', amps: Is, dir: 'up' } },
          { node: 0, el: { type: 'R', ohms: Ra } },
          { node: 1, el: { type: 'R', ohms: Rc } },
          { node: 1, el: { type: 'CCCS', gain: k, ctrl: 'x', dir: 'down' } },
        ],
        links: [{ el: { type: 'R', ohms: Rb }, current: { name: 'x', dir: 'right' } }],
      },
    };
  }
}

/** Each difficulty level unlocks two more circuit types, following Hambley §2.4. */
const TEMPLATES_BY_LEVEL: ReadonlyArray<ReadonlyArray<() => Built>> = [
  [oneUnknown, twoNodes],
  [knownNode, supernode],
  [threeNodes, dependentSource],
];

/** A random circuit up to `level` with every question about it — the exam corner asks several at once. */
export function buildNodeVoltage(level: number) {
  return pick(TEMPLATES_BY_LEVEL.slice(0, level + 1).flat())();
}

export function generateNodeVoltage(streak = 0): Problem {
  const built = buildNodeVoltage(difficultyLevel(streak));
  const variant = pick(built.variants);

  return {
    categoryId: 'node-voltage',
    accent: 'kcl',
    title: built.title,
    question: variant.question,
    unit: variant.unit,
    answer: variant.answer,
    tolerance: toleranceFor(variant.answer),
    steps: [...built.steps, ...variant.extra],
    circuit: { kind: 'node-voltage', ...built.circuit, target: variant.target },
  };
}
