import type { Exam, ExamQuestion, GridElement } from '../types';
import { abTerminals } from '../generators/built';
import { m, d } from '../utils/tex';
import { part, choice, grid } from './helpers';

/** The Les 7 / week G exam-style questions, one per exam topic, with the values shown in class. */

const kclBox = (name: string, from: [number, number], to: [number, number], label: string, toward: 'from' | 'to'): GridElement => ({
  kind: 'box',
  name,
  from,
  to,
  current: { label, toward, side: from[1] === to[1] ? 'above' : 'right' },
});

/** Les 7 Thévenin/Norton values: R1 = 33 Ω, R2 = 8 Ω, R3 = 27 Ω, Is = 30 A. */
const R1 = 33;
const R2 = 8;
const R3 = 27;
const IS = 30;
const RT = (R3 * (R1 + R2)) / (R1 + R2 + R3);
const VT = ((IS * R1) / (R1 + R2 + R3)) * R3;
const IN = (IS * R1) / (R1 + R2);
const PMAX = (VT * VT) / (4 * RT);

const theveninFigure = grid({
  wires: [
    [[0, 0], [1.2, 0]],
    [[0, 2], [4.4, 2]],
    [[3, 0], [4.4, 0]],
  ],
  elements: [
    { kind: 'R', from: [0, 0], to: [0, 2], label: 'R_1', side: 'left', value: R1 },
    { kind: 'I', from: [1.2, 2], to: [1.2, 0], toward: 'to', label: 'I_s', value: IS },
    { kind: 'R', from: [1.2, 0], to: [3, 0], label: 'R_2', value: R2 },
    { kind: 'R', from: [3, 0], to: [3, 2], label: 'R_3', value: R3 },
  ],
  dots: [[1.2, 0], [1.2, 2], [3, 0], [3, 2]],
  ...abTerminals(4.4, 0, 2),
});

const rtSteps = (final: boolean) => [
  `Stroombron openen. Vanaf a-b zie je ${m`R_3`} parallel aan ${m`R_1 + R_2 = 41\,\Omega`}:${d`R_t = 27 \parallel 41 = \frac{27 \cdot 41}{27 + 41} = ${final ? String.raw`\boxed{16{,}279\,\Omega}` : String.raw`16{,}279\,\Omega`}`}`,
];
const vtSteps = (final: boolean) => [
  `Open klemmen: de 30 A verdeelt zich over ${m`R_1`} en de tak ${m`R_2 + R_3 = 35\,\Omega`} (stroomdeler):${d`\begin{aligned}
    i_3 &= 30 \cdot \frac{33}{33 + 35} = 14{,}559\,\mathrm{A} \\
    V_t &= i_3 \cdot R_3 = 14{,}559 \cdot 27 = ${final ? String.raw`\boxed{393{,}088\,\mathrm{V}}` : String.raw`393{,}088\,\mathrm{V}`}
  \end{aligned}`}`,
];

const QUESTIONS: ExamQuestion[] = [
  {
    title: 'Vraag 1',
    topic: 'Knooppuntspanningsmethode',
    accent: 'kcl',
    intro: `R<sub>1</sub> = 4 Ω, R<sub>2</sub> = 5 Ω, R<sub>3</sub> = 8 Ω, R<sub>4</sub> = 8 Ω, R<sub>5</sub> = 2 Ω, I<sub>s</sub> = 2 A. Gegeven is dat v<sub>1</sub> = 4,757 V. Gebruik de knooppuntspanningsmethode om v<sub>2</sub> en v<sub>3</sub> te berekenen.`,
    circuit: grid({
      wires: [
        [[0, 0], [0, 1]],
        [[4, 0], [4, 1]],
        [[0, 2.4], [4, 2.4]],
      ],
      elements: [
        { kind: 'R', from: [0, 0], to: [4, 0], label: 'R_1', value: 4 },
        { kind: 'R', from: [0, 1], to: [2, 1], label: 'R_2', value: 5 },
        { kind: 'R', from: [2, 1], to: [4, 1], label: 'R_3', value: 8 },
        { kind: 'R', from: [0, 1], to: [0, 2.4], label: 'R_4', side: 'left', value: 8 },
        { kind: 'I', from: [2, 2.4], to: [2, 1], toward: 'to', label: 'I_s', value: 2 },
        { kind: 'R', from: [4, 1], to: [4, 2.4], label: 'R_5', value: 2 },
      ],
      dots: [[0, 1], [2, 1], [4, 1], [2, 2.4]],
      texts: [
        { at: [-0.2, 1], text: 'v_1', anchor: 'end' },
        { at: [2.12, 0.74], text: 'v_2', anchor: 'start' },
        { at: [4.2, 1], text: 'v_3', anchor: 'start' },
      ],
      ground: [2, 2.4],
    }),
    parts: (() => {
      const steps = [
        `Bepaal per weerstand + en −, teken de stroomrichtingen en schrijf elke stroom als ${m`i = \tfrac{v_+ - v_-}{R}`}. ${m`v_1`} is gegeven, dus er blijven twee onbekenden over.`,
        `KCL per knoop (verlatende stromen = bronstroom erin):${d`\begin{aligned}
          \text{knoop 2:}\quad & \frac{v_2 - v_1}{5} + \frac{v_2 - v_3}{8} = 2 \\[4pt]
          \text{knoop 3:}\quad & \frac{v_3}{2} + \frac{v_3 - v_2}{8} + \frac{v_3 - v_1}{4} = 0
        \end{aligned}`}`,
        `Vul ${m`v_1 = 4{,}757`} in en vermenigvuldig met de noemers (×40 en ×8):${d`\left\{\begin{aligned}
          13v_2 - 5v_3 &= 80 + 8 \cdot 4{,}757 = 118{,}06 \\
          -v_2 + 7v_3 &= 2 \cdot 4{,}757 = 9{,}514
        \end{aligned}\right.`}`,
        `Druk ${m`v_2`} uit in ${m`v_3`} en vul in:${d`\begin{aligned}
          v_2 &= 7v_3 - 9{,}514 \\
          13(7v_3 - 9{,}514) - 5v_3 &= 118{,}06 \\
          86\,v_3 &= 241{,}74
        \end{aligned}`}`,
        `Dus:${d`v_3 = \boxed{2{,}81\,\mathrm{V}} \qquad v_2 = 7 \cdot 2{,}811 - 9{,}514 = \boxed{10{,}16\,\mathrm{V}}`}`,
      ];
      return [part('a', `Bereken v<sub>2</sub>.`, 'V', 10.162, 3, steps), part('b', `Bereken v<sub>3</sub>.`, 'V', 2.811, 3, steps)];
    })(),
  },
  {
    title: 'Vraag 2',
    topic: 'Stroomwet van Kirchhoff',
    accent: 'kcl',
    intro: `In het netwerk zijn enkele stromen gegeven: i<sub>b</sub> = −4 A, i<sub>g</sub> = 6 A, i<sub>e</sub> = 5,5 A, i<sub>c</sub> = 6 A. Bepaal eerst de knooppunten, en pas dan KCL toe — kies zelf of je "erin" of "eruit" positief telt, maar doe het consequent.`,
    circuit: grid({
      wires: [
        [[0, 0], [0, 2]],
        [[4.6, 0], [4.6, 2]],
        [[1.8, 1], [2.4, 1]],
      ],
      elements: [
        kclBox('A', [0, 0], [1.8, 0], 'i_a', 'to'),
        kclBox('F', [1.8, 0], [4.6, 0], 'i_f', 'to'),
        kclBox('B', [0, 1], [1.8, 1], 'i_b', 'from'),
        kclBox('G', [2.4, 1], [4.6, 1], 'i_g', 'from'),
        kclBox('C', [0, 2], [2.4, 2], 'i_c', 'to'),
        kclBox('H', [2.4, 2], [4.6, 2], 'i_h', 'from'),
        kclBox('D', [1.8, 1], [1.8, 0], 'i_d', 'to'),
        kclBox('E', [2.4, 2], [2.4, 1], 'i_e', 'to'),
      ],
      dots: [[0, 1], [4.6, 1], [1.8, 0], [1.8, 1], [2.4, 1], [2.4, 2]],
    }),
    parts: [
      part('a', `Geef de waarde van i<sub>a</sub>.`, 'A', -10, 3, [
        `Linkerknoop (alles wat aan de linker verticale draad hangt): erin komt ${m`i_b`}, eruit gaan ${m`i_a`} en ${m`i_c`}.${d`\begin{aligned} i_b &= i_a + i_c \\ i_a &= -4 - 6 = \boxed{-10\,\mathrm{A}} \end{aligned}`}`,
      ]),
      part('b', `Geef de waarde van i<sub>d</sub>.`, 'A', 15.5, 3, [
        `Middenknoop (tussen B, D, E en G): erin komen ${m`i_g`} en ${m`i_e`}, eruit gaan ${m`i_b`} en ${m`i_d`}.${d`\begin{aligned} i_g + i_e &= i_b + i_d \\ 6 + 5{,}5 &= -4 + i_d \\ i_d &= \boxed{15{,}5\,\mathrm{A}} \end{aligned}`}`,
      ]),
      part('c', `Geef de waarde van i<sub>h</sub>.`, 'A', -0.5, 3, [
        `Onderste knoop (tussen C, E en H): erin komen ${m`i_c`} en ${m`i_h`}, eruit gaat ${m`i_e`}.${d`\begin{aligned} i_c + i_h &= i_e \\ i_h &= 5{,}5 - 6 = \boxed{-0{,}5\,\mathrm{A}} \end{aligned}`}`,
        `Controle in de bovenknoop en rechts:${d`i_f = i_a + i_d = 5{,}5\,\mathrm{A} \qquad i_f = i_g + i_h = 5{,}5\,\mathrm{A} \;\checkmark`}`,
      ]),
    ],
  },
  {
    title: 'Vraag 3',
    topic: 'Superpositie',
    accent: 'theorem',
    intro: `U<sub>B1</sub> = 12 V, I<sub>B2</sub> = 8 A, R<sub>1</sub> = 17 Ω, R<sub>2</sub> = 10 Ω. Bepaal de stroom i<sub>R2</sub> door gebruik te maken van het superpositiebeginsel.`,
    circuit: grid({
      wires: [
        [[0, 2], [3.3, 2]],
        [[2, 0], [3.3, 0]],
      ],
      elements: [
        { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: 'U_{B1}', side: 'left', value: 12 },
        { kind: 'R', from: [0, 0], to: [2, 0], label: 'R_1', value: 17 },
        { kind: 'R', from: [2, 0], to: [2, 2], label: 'R_2', side: 'left', value: 10, current: { label: 'i_{R2}', toward: 'to' } },
        { kind: 'I', from: [3.3, 2], to: [3.3, 0], toward: 'to', label: 'I_{B2}', value: 8 },
      ],
      dots: [[2, 0], [2, 2]],
      ground: [2, 2],
    }),
    parts: [
      part('a', `Geef de stroom i<sub>R2</sub> zoals aangegeven in het schema.`, 'A', 12 / 27 + (8 * 17) / 27, 8, [
        `<b>Alleen ${m`U_{B1}`}</b> (stroombron open): ${m`R_1`} en ${m`R_2`} staan in serie.${d`i' = \frac{12}{17 + 10} = 0{,}444\,\mathrm{A}`}`,
        `<b>Alleen ${m`I_{B2}`}</b> (spanningsbron kortgesloten): ${m`R_1 \parallel R_2`}, dus een stroomdeler:${d`i'' = 8 \cdot \frac{17}{17 + 10} = 5{,}037\,\mathrm{A}`}`,
        `Tel op:${d`i_{R2} = i' + i'' = 0{,}444 + 5{,}037 = \boxed{5{,}481\,\mathrm{A}}`}`,
      ]),
    ],
  },
  {
    title: 'Vraag 4',
    topic: 'Thévenin & Norton',
    accent: 'theorem',
    intro: `R<sub>1</sub> = 33 Ω, R<sub>2</sub> = 8 Ω, R<sub>3</sub> = 27 Ω. De stroombron I<sub>s</sub> geeft een stroom van 30 A. Bepaal het Norton- en Thévenin-vervangingsschema voor de klemmen a-b.`,
    circuit: theveninFigure,
    parts: [
      choice(
        'a',
        `Bevat het Thévenin-equivalent een spanningsbron of een stroombron?`,
        ['Een spanningsbron, in serie met R<sub>t</sub>', 'Een stroombron, parallel aan R<sub>t</sub>'],
        0,
        1,
        [`Thévenin = spanningsbron ${m`V_t`} in serie met ${m`R_t`}. Norton = stroombron ${m`I_n`} parallel aan ${m`R_t`}.`],
      ),
      part('b', `Bepaal de Thévenin-vervangingsweerstand R<sub>t</sub>.`, 'Ω', RT, 3, rtSteps(true)),
      part('c', `Wat is de Thévenin-bronwaarde V<sub>t</sub>?`, 'V', VT, 5, vtSteps(true)),
      part('d', `Wat is de Norton-bronwaarde I<sub>n</sub>?`, 'A', IN, 4, [
        `Uit ${m`V_t`} en ${m`R_t`}:${d`I_n = \frac{V_t}{R_t} = \frac{393{,}088}{16{,}279} = \boxed{24{,}146\,\mathrm{A}}`}`,
        `Of direct: een kortsluiting over a-b schakelt ${m`R_3`} uit; stroomdeler over ${m`R_1`} en ${m`R_2`}:${d`I_n = 30 \cdot \frac{33}{33 + 8} = 24{,}146\,\mathrm{A} \;\checkmark`}`,
      ]),
    ],
  },
  {
    title: 'Vraag 5',
    topic: 'Maximum power transfer',
    accent: 'theorem',
    intro: `Zelfde netwerk als vraag 4. Er wordt een belasting op a-b aangesloten, met als doel het vermogen in deze belasting te maximaliseren.`,
    circuit: theveninFigure,
    parts: [
      part('a', `Welke waarde moet er worden gekozen voor R<sub>L</sub>?`, 'Ω', RT, 2, [
        ...rtSteps(false),
        `Maximaal vermogen bij:${d`R_L = R_t = \boxed{16{,}279\,\Omega}`}`,
      ]),
      part('b', `Hoe groot is het maximale vermogen P<sub>max</sub> in R<sub>L</sub>?`, 'W', PMAX, 3, [
        ...rtSteps(false),
        ...vtSteps(false),
        `Vul in:${d`P_{\max} = \frac{V_t^2}{4\,R_t} = \frac{393{,}088^2}{4 \cdot 16{,}279} = \boxed{2372{,}9\,\mathrm{W}}`}`,
      ]),
    ],
  },
  {
    title: 'Vraag 6',
    topic: 'Vervangingsweerstand',
    accent: 'mixed',
    intro: `R<sub>ab</sub> = R<sub>eq</sub> = 11 Ω.`,
    circuit: grid({
      wires: [
        [[0, 2.2], [4.6, 2.2]],
        [[3.4, 0], [4.6, 0]],
      ],
      elements: [
        { kind: 'R', from: [0, 0], to: [1.8, 0], label: '7 Ω', value: 7 },
        { kind: 'R', from: [1.8, 0], to: [1.8, 2.2], label: '8 Ω', value: 8 },
        { kind: 'R', id: 'R', from: [1.8, 0], to: [3.4, 0], label: 'R = ?', value: 4 },
        { kind: 'R', from: [3.4, 0], to: [3.4, 2.2], label: '12 Ω', value: 12 },
        { kind: 'R', from: [4.6, 0], to: [4.6, 2.2], label: '6 Ω', value: 6 },
      ],
      dots: [[1.8, 0], [1.8, 2.2], [3.4, 0], [3.4, 2.2]],
      terminals: [
        { at: [0, 0], label: 'a', side: 'left' },
        { at: [0, 2.2], label: 'b', side: 'left' },
      ],
      highlight: ['R'],
    }),
    parts: [
      part('a', `Wat is de waarde van R?`, 'Ω', 4, 6, [
        `Schrijf de opbouw op, van de klemmen naar binnen:${d`R_{ab} = 7 + 8 \parallel \bigl(R + (12 \parallel 6)\bigr) = 11\,\Omega`}`,
        `Pel af vanaf de klemmen: haal de 7 Ω in serie eraf, en daarna de 8 Ω die parallel staat:${d`\begin{aligned}
          11 - 7 &= 4\,\Omega \\
          \frac{1}{R_{\text{tak}}} &= \frac{1}{4} - \frac{1}{8} = \frac{1}{8} \;\Rightarrow\; R_{\text{tak}} = 8\,\Omega
        \end{aligned}`}`,
        `Achter R zit ${m`12 \parallel 6 = 4\,\Omega`}:${d`\begin{aligned} R + 4 &= 8 \\ R &= \boxed{4\,\Omega} \end{aligned}`}`,
      ]),
    ],
  },
];

export const weekG: Exam = {
  id: 'week-g',
  title: 'Tentamenvragen week G',
  description: 'De zes tentamenonderwerpen uit les 7, met de vragen en waarden uit de les: knooppuntspanning, KCL, superpositie, Thévenin & Norton, maximum power transfer en vervangingsweerstand.',
  build: () => QUESTIONS,
};
