import type { NodeVoltageSpec, NvTarget, Problem } from '../types';
import { niceInt, pick } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';
import { m, d, t, sig, coef, par, labelled, system } from '../utils/tex';
import { difficultyLevel } from '../utils/difficulty';
import { solveLinear } from '../utils/linear';

/** Resistances whose reciprocals are short terminating decimals, so the equation coefficients stay exact. */
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
/** HTML for question texts; the steps write the same quantities in TeX. */
const v = (k: string | number) => `v<sub>${k}</sub>`;
/** A coefficient in parentheses when negative. */
const ps = (n: number) => (n < 0 ? `(${sig(n)})` : sig(n));

const KCL_RULE = `KCL per knooppunt: de stromen die het knooppunt <b>verlaten</b> zijn samen gelijk aan de bronstroom die erin gaat.`;

/** How a current source enters the right-hand side of its node's equation. */
function srcNote(amps: number, into: boolean, node: string): string {
  return into
    ? `Bij knooppunt ${node} duwt de bron ${fmt(amps)} A erin, dus rechts ${m`+${amps}`}.`
    : `Bij knooppunt ${node} trekt de bron ${fmt(amps)} A eruit, dus rechts ${m`-${amps}`}.`;
}

/** One standard-form row as [left side, right side], e.g. "0,45 v₁ − 0,25 v₂" and "−3,5". */
function row(coefs: number[], rhs: number, names: string[]): [string, string] {
  let s = '';
  coefs.forEach((c, i) => {
    if (Math.abs(c) < 1e-12) return;
    const body = `${coef(Math.abs(c))}\\,v_${names[i]}`;
    s += s === '' ? (c < 0 ? '-' : '') + body : (c < 0 ? ' - ' : ' + ') + body;
  });
  return [s, sig(rhs)];
}

const standardForm = (G: number[][], I: number[], names: string[]) => system(G.map((r, k) => row(r, I[k], names)));

const ORDINAL = ['eerste', 'tweede', 'derde'];

/** "+ 0,25 v₂" / "− v₃" for a term in a substituted expression; zero terms vanish. */
function term(c: number, name: string): string {
  if (Math.abs(c) < 1e-12) return '';
  return `${c < 0 ? '-' : '+'} ${coef(Math.abs(c))}\\,v_${name}`;
}

/** Joins a constant and signed terms, leaving out a zero constant and a leading "+". */
function sum(constant: number, terms: string[]): string {
  const s = [Math.abs(constant) < 1e-12 ? '' : sig(constant), ...terms].filter(Boolean).join(' ');
  return s.startsWith('+ ') ? s.slice(2) : s || '0';
}

/**
 * Solves the system by substitution, as in the lessons: express the last
 * unknown with one equation, substitute it into the others, solve what is
 * left the same way, then substitute back. The final values are boxed.
 */
function substitution(G: number[][], I: number[], names: string[]): string[] {
  const n = names.length;
  const x = solveLinear(G, I);
  if (n === 1) {
    return [`Deel door de coëfficiënt:${d`v_${names[0]} = \frac{${sig(I[0])}}{${sig(G[0][0])}} = \boxed{${x[0]}\,\mathrm{V}}`}`];
  }
  const k = n - 1;
  const last = names[k];
  // Express the last unknown from the equation where it has the largest coefficient.
  const pr = G.reduce((best, row, r) => (Math.abs(row[k]) > Math.abs(G[best][k]) ? r : best), 0);
  const rest = G.map((_, r) => r).filter((r) => r !== pr);
  const others = names.slice(0, k);
  const numerator = sum(I[pr], others.map((nm, c) => term(-G[pr][c], nm)));
  const G2 = rest.map((r) => others.map((_, c) => G[r][c] - (G[r][k] * G[pr][c]) / G[pr][k]));
  const I2 = rest.map((r) => I[r] - (G[r][k] * I[pr]) / G[pr][k]);
  const backSub = sum(
    I[pr],
    others.map((_, c) => (Math.abs(G[pr][c]) < 1e-12 ? '' : `- ${ps(G[pr][c])} \\cdot ${par(x[c])}`)),
  );

  return [
    `Druk ${m`v_${last}`} uit met de ${ORDINAL[pr]} vergelijking:${d`v_${last} = \frac{${numerator}}{${sig(G[pr][k])}}`}`,
    n === 2
      ? `Vul dat in bij de andere vergelijking en werk de haakjes uit:${d`${coef(G2[0][0])}\,v_${others[0]} = ${sig(I2[0])}`}`
      : `Vul dat in bij de andere twee vergelijkingen en werk de haakjes uit. Er blijven twee onbekenden over:${standardForm(G2, I2, others)}`,
    ...substitution(G2, I2, others),
    `Vul terug in om ${m`v_${last}`} te vinden:${d`v_${last} = \frac{${backSub}}{${sig(G[pr][k])}} = \boxed{${x[k]}\,\mathrm{V}}`}`,
  ];
}

function nodeVariant(name: string, node: number, value: number, extra: string[] = []): Variant {
  return {
    question: `Bepaal de knooppuntspanning ${v(name)} (t.o.v. de referentieknoop).`,
    unit: 'V',
    answer: round2(value),
    extra,
    target: { node },
  };
}

/** Ohm's law over one resistor between two nodes, written out and substituted. */
function branchCurrent(name: string, from: string, to: string, R: number, vFrom: number, vTo: number): string {
  const i = (vFrom - vTo) / R;
  return `Wet van Ohm over de ${fmt(R)} Ω-weerstand:${d`${name} = \frac{v_${from} - v_${to}}{${R}} = \frac{${vFrom} - ${par(vTo)}}{${R}} = \boxed{${i}\,\mathrm{A}}`}`;
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
      `Kies de onderste knoop als referentie. Knooppunt 2 zit via de spanningsbron vast aan de referentie, dus ${m`v_2 = ${V2}\,\mathrm{V}`}. Er blijft één onbekende over: ${m`v_1`}.`,
      `${KCL_RULE} Voor knooppunt 1:${d`\frac{v_1}{${R1}} + \frac{v_1 - ${V2}}{${R2}} = ${Is}`}`,
      `Zet de termen met ${m`v_1`} links en de bekende termen rechts:${d`\begin{aligned}
        \left(\frac{1}{${R1}} + \frac{1}{${R2}}\right) v_1 &= ${Is} + \frac{${V2}}{${R2}} \\
        ${coef(G)}\,v_1 &= ${sig(rhs)}
      \end{aligned}`}`,
      `Deel door de coëfficiënt:${d`v_1 = \frac{${sig(rhs)}}{${sig(G)}} = \boxed{${v1}\,\mathrm{V}}`}`,
    ],
    variants: [
      nodeVariant('1', 0, v1),
      {
        question: `Bepaal de stroom i door de ${fmt(R2)} Ω-weerstand (richting zoals aangegeven).`,
        unit: 'A',
        answer: round2(i),
        extra: [branchCurrent('i', '1', '2', R2, v1, V2)],
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
  const names = ['1', '2'];

  return {
    title: 'Knooppuntspanning · twee knooppunten',
    steps: [
      `Referentieknoop = onderste knoop (massa). Onbekenden: ${m`v_1`} en ${m`v_2`}. De stroom van knooppunt n naar k door een weerstand R is ${m`\tfrac{v_n - v_k}{R}`}.`,
      `${KCL_RULE} ${srcNote(I1, in1, '1')} ${srcNote(I2, in2, '2')}${labelled([
        ['knooppunt 1', t`\frac{v_1}{${Ra}} + \frac{v_1 - v_2}{${Rb}} = ${s1}`],
        ['knooppunt 2', t`\frac{v_2}{${Rc}} + \frac{v_2 - v_1}{${Rb}} = ${s2}`],
      ])}`,
      `Schrijf het stelsel in standaardvorm (onbekenden links, bronnen rechts):${standardForm(G, I, names)}`,
      ...substitution(G, I, names),
    ],
    variants: [
      nodeVariant('1', 0, v1),
      nodeVariant('2', 1, v2),
      {
        question: `Bepaal de stroom i<sub>1</sub> door de ${fmt(Rb)} Ω-weerstand.`,
        unit: 'A',
        answer: round2((v1 - v2) / Rb),
        extra: [branchCurrent('i_1', '1', '2', Rb, v1, v2)],
        target: { link: 0 },
      },
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
      `De referentieknoop ligt aan de min-kant van de spanningsbron, dus ${m`v_3 = ${Vs}\,\mathrm{V}`} is meteen bekend. Onbekenden: ${m`v_1`} en ${m`v_2`}.`,
      `${KCL_RULE}${labelled([
        ['knooppunt 1', t`\frac{v_1}{${Ra}} + \frac{v_1 - v_2}{${Rb}} = ${Is}`],
        ['knooppunt 2', t`\frac{v_2}{${Rc}} + \frac{v_2 - v_1}{${Rb}} + \frac{v_2 - ${Vs}}{${Rd}} = 0`],
      ])}`,
      `Breng de bekende term ${m`\tfrac{${Vs}}{${Rd}} = ${sig(Vs / Rd)}`} naar rechts. In standaardvorm:${standardForm(G, I, names)}`,
      ...substitution(G, I, names),
    ],
    variants: [
      nodeVariant('1', 0, v1),
      nodeVariant('2', 1, v2),
      {
        question: `Bepaal de stroom i door de ${fmt(Rd)} Ω-weerstand (richting zoals aangegeven).`,
        unit: 'A',
        answer: round2(i),
        extra: [branchCurrent('i', '2', '3', Rd, v2, Vs)],
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
  const dv = plusLeft ? Vs : -Vs;
  const [v1, v2] = solveLinear(
    [
      [1 / Ra, 1 / Rb],
      [1, -1],
    ],
    [s, dv],
  );
  const iSrc = s - v1 / Ra;
  const G = 1 / Ra + 1 / Rb;

  // Substitute the KVL relation for the node on the plus side, solve for the other.
  const solve = plusLeft
    ? `Vul ${m`v_1 = v_2 + ${Vs}`} in en los ${m`v_2`} op:${d`\begin{aligned}
        \frac{v_2 + ${Vs}}{${Ra}} + \frac{v_2}{${Rb}} &= ${s} \\
        ${coef(G)}\,v_2 &= ${sig(s - Vs / Ra)} \\
        v_2 &= \boxed{${v2}\,\mathrm{V}}
      \end{aligned}`}`
    : `Vul ${m`v_2 = v_1 + ${Vs}`} in en los ${m`v_1`} op:${d`\begin{aligned}
        \frac{v_1}{${Ra}} + \frac{v_1 + ${Vs}}{${Rb}} &= ${s} \\
        ${coef(G)}\,v_1 &= ${sig(s - Vs / Rb)} \\
        v_1 &= \boxed{${v1}\,\mathrm{V}}
      \end{aligned}`}`;
  const other = plusLeft
    ? `Dan volgt ${m`v_1`} uit de KVL-vergelijking:${d`v_1 = v_2 + ${Vs} = ${v2} + ${Vs} = \boxed{${v1}\,\mathrm{V}}`}`
    : `Dan volgt ${m`v_2`} uit de KVL-vergelijking:${d`v_2 = v_1 + ${Vs} = ${v1} + ${Vs} = \boxed{${v2}\,\mathrm{V}}`}`;

  return {
    title: 'Knooppuntspanning · supernode',
    steps: [
      `Tussen knooppunt 1 en 2 zit een spanningsbron: de stroom daardoor is onbekend, dus in knooppunt 1 of 2 los kun je geen KCL opschrijven. Teken een <b>supernode</b> om de bron heen.`,
      `KVL over de bron (de + zit ${plusLeft ? 'links' : 'rechts'}):${plusLeft ? d`v_1 - v_2 = ${Vs}` : d`v_2 - v_1 = ${Vs}`}`,
      `KCL voor de supernode: de stromen die het gesloten oppervlak verlaten zijn samen gelijk aan de bronstroom erin. ${srcNote(Is, into, '1')}${d`\frac{v_1}{${Ra}} + \frac{v_2}{${Rb}} = ${s}`}`,
      solve,
      other,
    ],
    variants: [
      nodeVariant('1', 0, v1),
      nodeVariant('2', 1, v2),
      {
        question: `Bepaal de stroom i<sub>s</sub> door de spanningsbron (richting zoals aangegeven).`,
        unit: 'A',
        answer: round2(iSrc),
        extra: [
          `KCL in knooppunt 1 alleen, nu mét de stroom door de bron:${d`\begin{aligned}
            ${s} &= \frac{v_1}{${Ra}} + i_s \\
            i_s &= ${s} - \frac{${v1}}{${Ra}} = \boxed{${iSrc}\,\mathrm{A}}
          \end{aligned}`}`,
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
  const names = ['1', '2', '3'];
  const node2 = midSource
    ? t`\frac{v_2 - v_1}{${R12}} + \frac{v_2 - v_3}{${R23}} = ${s2}`
    : t`\frac{v_2 - v_1}{${R12}} + \frac{v_2}{${Rb}} + \frac{v_2 - v_3}{${R23}} = 0`;

  return {
    title: 'Knooppuntspanning · drie knooppunten',
    steps: [
      `Geen enkele weerstand staat zuiver in serie of parallel (de ${fmt(R13)} Ω overbrugt knooppunt 1 en 3), dus vervangingsweerstanden helpen niet. Onbekenden: ${m`v_1, v_2, v_3`}.`,
      `${KCL_RULE}${midSource ? ` ${srcNote(I2, in2, '2')}` : ''}${labelled([
        ['knooppunt 1', t`\frac{v_1}{${Ra}} + \frac{v_1 - v_2}{${R12}} + \frac{v_1 - v_3}{${R13}} = ${Is}`],
        ['knooppunt 2', node2],
        ['knooppunt 3', t`\frac{v_3 - v_2}{${R23}} + \frac{v_3}{${Rc}} + \frac{v_3 - v_1}{${R13}} = 0`],
      ])}`,
      `In standaardvorm:${standardForm(G, I, names)}`,
      ...substitution(G, I, names),
    ],
    variants: [
      nodeVariant('1', 0, v1),
      nodeVariant('2', 1, v2),
      nodeVariant('3', 2, v3),
      {
        question: `Bepaal de stroom i<sub>1</sub> door de ${fmt(R12)} Ω-weerstand.`,
        unit: 'A',
        answer: round2((v1 - v2) / R12),
        extra: [branchCurrent('i_1', '1', '2', R12, v1, v2)],
        target: { link: 0 },
      },
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
    const names = ['1', '2'];
    const ki = t`${k}\,i_x`;

    return {
      title: 'Knooppuntspanning · gestuurde bron',
      steps: [
        `Behandel de gestuurde bron eerst als een gewone stroombron van ${m`${ki}`}; die stroom verlaat knooppunt 2 naar beneden.`,
        `${KCL_RULE}${labelled([
          ['knooppunt 1', t`\frac{v_1}{${Ra}} + \frac{v_1 - v_2}{${Rb}} = ${Is}`],
          ['knooppunt 2', t`\frac{v_2 - v_1}{${Rb}} + \frac{v_2}{${Rc}} + ${ki} = 0`],
        ])}`,
        `Druk de stuurgrootheid uit in knooppuntspanningen en vul die in bij knooppunt 2:${d`i_x = \frac{v_1 - v_2}{${Rb}}`}`,
        `In standaardvorm:${standardForm(G, I, names)}`,
        ...substitution(G, I, names),
      ],
      variants: [
        nodeVariant('1', 0, v1),
        nodeVariant('2', 1, v2),
        {
          question: `Bepaal de stuurstroom i<sub>x</sub>.`,
          unit: 'A',
          answer: round2((v1 - v2) / Rb),
          extra: [branchCurrent('i_x', '1', '2', Rb, v1, v2)],
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
