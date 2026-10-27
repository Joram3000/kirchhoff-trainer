import type { Exam, ExamQuestion, GridElement } from '../types';
import { abTerminals } from '../generators/built';
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

const rtSteps = [
  `Stroombron openen. Vanaf a-b zie je R<sub>3</sub> parallel aan R<sub>2</sub> + R<sub>1</sub> = 41 Ω.`,
  `R<sub>t</sub> = 27 ∥ 41 = 27·41/68 = <b>16,279 Ω</b>.`,
];
const vtSteps = [
  `Open klemmen: de 30 A verdeelt zich over R<sub>1</sub> en de tak R<sub>2</sub> + R<sub>3</sub> = 35 Ω. Stroom door R<sub>3</sub>: 30·33/68 = 14,559 A.`,
  `V<sub>t</sub> = 14,559·27 = <b>393,088 V</b>.`,
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
        `Bepaal per weerstand + en −, teken de stroomrichtingen en schrijf elke stroom als i = (v<sub>+</sub> − v<sub>−</sub>)/R. v<sub>1</sub> is gegeven, dus er blijven twee onbekenden over.`,
        `KCL knoop 2 (verlatende stromen = bronstroom erin): (v<sub>2</sub> − v<sub>1</sub>)/5 + (v<sub>2</sub> − v<sub>3</sub>)/8 = 2 → (×40) 13v<sub>2</sub> − 5v<sub>3</sub> = 80 + 8·4,757 = 118,06`,
        `KCL knoop 3: v<sub>3</sub>/2 + (v<sub>3</sub> − v<sub>2</sub>)/8 + (v<sub>3</sub> − v<sub>1</sub>)/4 = 0 → (×8) −v<sub>2</sub> + 7v<sub>3</sub> = 2·4,757 = 9,514`,
        `Druk v<sub>2</sub> uit in v<sub>3</sub>: v<sub>2</sub> = 7v<sub>3</sub> − 9,514. Invullen: 13(7v<sub>3</sub> − 9,514) − 5v<sub>3</sub> = 118,06 → 86v<sub>3</sub> = 241,74.`,
        `v<sub>3</sub> = <b>2,81 V</b> en v<sub>2</sub> = 7·2,811 − 9,514 = <b>10,16 V</b>.`,
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
        `Linkerknoop (alles wat aan de linker verticale draad hangt): erin komt i<sub>b</sub>, eruit gaan i<sub>a</sub> en i<sub>c</sub>.`,
        `i<sub>b</sub> = i<sub>a</sub> + i<sub>c</sub> → i<sub>a</sub> = −4 − 6 = <b>−10 A</b>.`,
      ]),
      part('b', `Geef de waarde van i<sub>d</sub>.`, 'A', 15.5, 3, [
        `Middenknoop (tussen B, D, E en G): erin komen i<sub>g</sub> en i<sub>e</sub>, eruit gaan i<sub>b</sub> en i<sub>d</sub>.`,
        `6 + 5,5 = −4 + i<sub>d</sub> → i<sub>d</sub> = <b>15,5 A</b>.`,
      ]),
      part('c', `Geef de waarde van i<sub>h</sub>.`, 'A', -0.5, 3, [
        `Onderste knoop (tussen C, E en H): erin komen i<sub>c</sub> en i<sub>h</sub>, eruit gaat i<sub>e</sub>.`,
        `i<sub>c</sub> + i<sub>h</sub> = i<sub>e</sub> → i<sub>h</sub> = 5,5 − 6 = <b>−0,5 A</b>.`,
        `Controle in de bovenknoop: i<sub>f</sub> = i<sub>a</sub> + i<sub>d</sub> = 5,5 A, en rechts: i<sub>f</sub> = i<sub>g</sub> + i<sub>h</sub> = 5,5 A ✓`,
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
        `Alleen U<sub>B1</sub> (stroombron open): R<sub>1</sub> en R<sub>2</sub> in serie: i′ = 12/(17 + 10) = 0,444 A.`,
        `Alleen I<sub>B2</sub> (spanningsbron kortgesloten): R<sub>1</sub> ∥ R<sub>2</sub>; stroomdeler: i″ = 8·17/27 = 5,037 A.`,
        `i<sub>R2</sub> = 0,444 + 5,037 = <b>5,481 A</b>.`,
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
        [`Thévenin = spanningsbron V<sub>t</sub> in serie met R<sub>t</sub>. Norton = stroombron I<sub>n</sub> parallel aan R<sub>t</sub>.`],
      ),
      part('b', `Bepaal de Thévenin-vervangingsweerstand R<sub>t</sub>.`, 'Ω', RT, 3, rtSteps),
      part('c', `Wat is de Thévenin-bronwaarde V<sub>t</sub>?`, 'V', VT, 5, vtSteps),
      part('d', `Wat is de Norton-bronwaarde I<sub>n</sub>?`, 'A', IN, 4, [
        `I<sub>n</sub> = V<sub>t</sub>/R<sub>t</sub> = 393,088/16,279 = <b>24,146 A</b>.`,
        `Of direct: kortsluiting over a-b schakelt R<sub>3</sub> uit; stroomdeler over R<sub>1</sub> en R<sub>2</sub>: 30·33/41 = 24,146 A ✓`,
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
      part('a', `Welke waarde moet er worden gekozen voor R<sub>L</sub>?`, 'Ω', RT, 2, [...rtSteps, `Maximaal vermogen bij R<sub>L</sub> = R<sub>t</sub> = <b>16,279 Ω</b>.`]),
      part('b', `Hoe groot is het maximale vermogen P<sub>max</sub> in R<sub>L</sub>?`, 'W', PMAX, 3, [
        ...vtSteps,
        `P<sub>max</sub> = V<sub>t</sub>²/(4·R<sub>t</sub>) = 393,088²/(4·16,279) = <b>2372,9 W</b>.`,
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
        `Pel af vanaf de klemmen: 7 Ω staat vooraan in serie, dus de rest is 11 − 7 = 4 Ω.`,
        `Die 4 Ω is 8 Ω parallel aan de tak met R: 1/R<sub>tak</sub> = 1/4 − 1/8 = 1/8 → R<sub>tak</sub> = 8 Ω.`,
        `Achter R zit 12 ∥ 6 = 4 Ω, dus R + 4 = 8 → R = <b>4 Ω</b>.`,
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
