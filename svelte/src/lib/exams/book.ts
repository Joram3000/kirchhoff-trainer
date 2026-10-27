import type { Exam, ExamQuestion } from '../types';
import { abTerminals } from '../generators/built';
import { part, choice, grid, sourceWithLoad } from './helpers';

/** Hambley problems assigned in weeks E and F, figures redrawn from the book, answers per the worked solutions. */

const p280 = grid({
  wires: [
    [[0, 2], [4.4, 2]],
    [[2, 0], [4.4, 0]],
  ],
  elements: [
    { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: '10 V', side: 'left', value: 10 },
    { kind: 'R', from: [0, 0], to: [2, 0], label: '10 Ω', value: 10 },
    { kind: 'R', from: [2, 0], to: [2, 2], label: '5 Ω', side: 'left', value: 5 },
    { kind: 'I', from: [3.2, 2], to: [3.2, 0], toward: 'to', label: '1 A', value: 1 },
  ],
  dots: [[2, 0], [2, 2], [3.2, 0], [3.2, 2]],
  ...abTerminals(4.4, 0, 2),
});

const p282 = grid({
  wires: [
    [[0, 0], [1.2, 0]],
    [[0, 2], [4.2, 2]],
    [[3, 0], [4.2, 0]],
  ],
  elements: [
    { kind: 'R', from: [0, 0], to: [0, 2], label: '24 Ω', side: 'left', value: 24 },
    { kind: 'I', from: [1.2, 2], to: [1.2, 0], toward: 'from', label: '3 A', value: 3 },
    { kind: 'R', from: [1.2, 0], to: [3, 0], label: '6 Ω', value: 6 },
    { kind: 'R', from: [3, 0], to: [3, 2], label: '6 Ω', value: 6 },
  ],
  dots: [[1.2, 0], [1.2, 2], [3, 0], [3, 2]],
  ...abTerminals(4.2, 0, 2),
});

const WEEK_E: ExamQuestion[] = [
  {
    title: 'P2.80',
    topic: 'Thévenin & Norton',
    accent: 'theorem',
    intro: `Bepaal het Thévenin- en het Norton-equivalent van de tweepool.`,
    circuit: p280,
    parts: [
      part('a', `Bepaal V<sub>t</sub>.`, 'V', 20 / 3, 3, [
        `Knooppuntspanning in a (open klemmen): (V<sub>t</sub> − 10)/10 + V<sub>t</sub>/5 − 1 = 0 → V<sub>t</sub> − 10 + 2V<sub>t</sub> − 10 = 0 → 3V<sub>t</sub> = 20.`,
        `V<sub>t</sub> = <b>6⅔ V ≈ 6,67 V</b>.`,
      ]),
      part('b', `Bepaal R<sub>t</sub>.`, 'Ω', 10 / 3, 3, [`Spanningsbron kort, stroombron open: R<sub>t</sub> = 10 ∥ 5 = <b>3⅓ Ω ≈ 3,33 Ω</b>.`]),
      part('c', `Bepaal I<sub>n</sub>.`, 'A', 2, 3, [
        `I<sub>n</sub> = V<sub>t</sub>/R<sub>t</sub> = 6⅔ / 3⅓ = <b>2 A</b>.`,
        `Of direct: met a-b kortgesloten is de 5 Ω uitgeschakeld; (10 − 0)/10 + 1 = 2 A ✓`,
      ]),
    ],
  },
  {
    title: 'P2.81',
    topic: 'Thévenin uit een meting',
    accent: 'theorem',
    intro: `Een batterij wordt gemodelleerd als spanningsbron met een weerstand in serie. De open klemspanning is 9 V. Met een weerstand van 100 Ω over de klemmen daalt de spanning naar 6 V.`,
    circuit: sourceWithLoad('9 V', 'R_t', '100 Ω'),
    parts: [
      part('a', `Bepaal de inwendige weerstand (Thévenin-weerstand) R<sub>t</sub>.`, 'Ω', 50, 3, [
        `Spanningsdeler: 9·100/(100 + R<sub>t</sub>) = 6 → 900 = 600 + 6R<sub>t</sub> → R<sub>t</sub> = <b>50 Ω</b>.`,
      ]),
    ],
  },
  {
    title: 'P2.82',
    topic: 'Thévenin & Norton',
    accent: 'theorem',
    intro: `Bepaal het Thévenin- en het Norton-equivalent. Let op de richting van de stroombron.`,
    circuit: p282,
    parts: [
      part('a', `Bepaal V<sub>t</sub>.`, 'V', -12, 3, [
        `De twee 6 Ω-weerstanden staan (bij open klemmen) in serie: 12 Ω, parallel aan 24 Ω: 24 ∥ 12 = 8 Ω.`,
        `De bron duwt 3 A naar beneden, dus de spanning boven is negatief: v = −3·8 = −24 V.`,
        `Spanningsdeler over de twee 6 Ω: V<sub>t</sub> = ½·(−24) = <b>−12 V</b>.`,
      ]),
      part('b', `Bepaal R<sub>t</sub>.`, 'Ω', 5, 3, [`Stroombron open: (24 + 6) ∥ 6 = 30 ∥ 6 = <b>5 Ω</b>.`]),
      part('c', `Bepaal I<sub>n</sub>.`, 'A', -2.4, 3, [
        `Kortsluiting a-b: de rechter 6 Ω valt weg; stroomdeler over 24 Ω en 6 Ω: I<sub>n</sub> = −3·24/(24 + 6) = <b>−2,4 A</b>.`,
        `Controle: I<sub>n</sub>·R<sub>t</sub> = −2,4·5 = −12 V ✓`,
      ]),
    ],
  },
  {
    title: 'P2.83',
    topic: 'Thévenin & Norton',
    accent: 'theorem',
    intro: `Bepaal het Thévenin- en het Norton-equivalent van de tweepool.`,
    circuit: grid({
      wires: [
        [[0, 2], [5, 2]],
        [[3.6, 0], [5, 0]],
      ],
      elements: [
        { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: '32 V', side: 'left', value: 32 },
        { kind: 'R', from: [0, 0], to: [1.8, 0], label: '10 Ω', value: 10 },
        { kind: 'R', from: [1.8, 0], to: [1.8, 2], label: '10 Ω', value: 10 },
        { kind: 'R', from: [1.8, 0], to: [3.6, 0], label: '15 Ω', value: 15 },
        { kind: 'R', from: [3.6, 0], to: [3.6, 2], label: '30 Ω', value: 30 },
      ],
      dots: [[1.8, 0], [1.8, 2], [3.6, 0], [3.6, 2]],
      ...abTerminals(5, 0, 2),
    }),
    parts: [
      part('a', `Bepaal V<sub>t</sub>.`, 'V', 9.6, 3, [
        `v<sub>1</sub> = 32·(10 ∥ 45)/(10 + 10 ∥ 45) = 32·8,18/18,18 = 14,4 V.`,
        `V<sub>t</sub> = 14,4·30/(30 + 15) = <b>9,6 V</b>.`,
      ]),
      part('b', `Bepaal R<sub>t</sub>.`, 'Ω', 12, 3, [`R<sub>t</sub> = 30 ∥ (15 + 10 ∥ 10) = 30 ∥ 20 = <b>12 Ω</b>.`]),
      part('c', `Bepaal I<sub>n</sub>.`, 'A', 0.8, 3, [
        `Kortsluiting a-b: 30 Ω valt weg; spanning over de middelste 10 Ω: 32·(10 ∥ 15)/(10 + 10 ∥ 15) = 12 V.`,
        `I<sub>n</sub> = 12/15 = <b>0,8 A</b>. Controle: 0,8·12 = 9,6 V ✓`,
      ]),
    ],
  },
  {
    title: 'P2.84',
    topic: 'Thévenin & Norton',
    accent: 'theorem',
    intro: `Bepaal het Thévenin- en het Norton-equivalent. Let op de polariteit van de spanningsbron en de richting van de stroombron ten opzichte van a en b.`,
    circuit: grid({
      wires: [
        [[0, 0], [1.7, 0]],
        [[3.3, 0], [5, 0]],
        [[1.7, 0], [1.7, -0.9]],
        [[3.3, -0.9], [3.3, 0]],
        [[0, 2], [5, 2]],
      ],
      elements: [
        { kind: 'R', from: [0, 0], to: [0, 2], label: '7 Ω', side: 'left', value: 7 },
        { kind: 'V', from: [1.1, 0], to: [1.1, 2], plus: 'from', label: '12 V', value: 12 },
        { kind: 'R', from: [1.7, 0], to: [3.3, 0], label: '48 Ω', side: 'below', value: 48 },
        { kind: 'I', from: [1.7, -0.9], to: [3.3, -0.9], toward: 'from', label: '1 A', value: 1 },
        { kind: 'R', from: [3.8, 0], to: [3.8, 2], label: '16 Ω', value: 16 },
      ],
      dots: [[1.1, 0], [1.1, 2], [1.7, 0], [3.3, 0], [3.8, 0], [3.8, 2]],
      ...abTerminals(5, 0, 2),
    }),
    parts: [
      part('a', `Bepaal V<sub>t</sub>.`, 'V', -9, 3, [
        `Knooppunt links ligt vast op 12 V. KCL in a (de 1 A-bron trekt stroom uit a): 1 + (V<sub>t</sub> − 12)/48 + V<sub>t</sub>/16 = 0.`,
        `(×48): 48 + V<sub>t</sub> − 12 + 3V<sub>t</sub> = 0 → 4V<sub>t</sub> = −36 → V<sub>t</sub> = <b>−9 V</b>.`,
      ]),
      part('b', `Bepaal R<sub>t</sub>.`, 'Ω', 12, 3, [`Spanningsbron kort (de 7 Ω valt daardoor weg), stroombron open: R<sub>t</sub> = 48 ∥ 16 = <b>12 Ω</b>.`]),
      part('c', `Bepaal I<sub>n</sub>.`, 'A', -0.75, 3, [
        `Kortsluiting a-b: door 48 Ω loopt (12 − 0)/48 = 0,25 A naar a; de bron trekt er 1 A af.`,
        `I<sub>n</sub> = 0,25 − 1 = <b>−0,75 A</b>. Controle: −0,75·12 = −9 V ✓`,
      ]),
      choice(
        'd',
        `Welk effect heeft de 7 Ω-weerstand op de equivalente schakelingen?`,
        ['Geen: hij staat parallel aan de ideale 12 V-bron', 'R<sub>t</sub> wordt kleiner', 'V<sub>t</sub> wordt kleiner'],
        0,
        1,
        [`De 7 Ω hangt direct over de ideale spanningsbron: die legt de spanning toch vast. Bij het uitschakelen wordt hij kortgesloten. Hij heeft dus geen invloed.`],
      ),
    ],
  },
  {
    title: 'P2.85',
    topic: 'Thévenin uit een meting',
    accent: 'theorem',
    intro: `Een autoaccu heeft een open klemspanning van 12,6 V en levert 100 A als er 0,1 Ω op de klemmen wordt aangesloten.`,
    circuit: sourceWithLoad('12,6 V', 'R_t', '0,1 Ω'),
    parts: [
      part('a', `Bepaal R<sub>t</sub> (in mΩ).`, 'mΩ', 26, 3, [
        `v<sub>out</sub> = 100·0,1 = 10 V, dus over R<sub>t</sub> valt 12,6 − 10 = 2,6 V.`,
        `R<sub>t</sub> = 2,6/100 = 0,026 Ω = <b>26 mΩ</b>.`,
      ]),
      part('b', `Welke stroom levert de accu bij kortsluiting?`, 'A', 12.6 / 0.026, 3, [
        `I<sub>sc</sub> = I<sub>n</sub> = 12,6/0,026 = <b>484,6 A</b>. (Het Thévenin-model is hier realistischer: een Norton-model zou ook onbelast intern vermogen verstoken.)`,
      ]),
    ],
  },
  {
    title: 'P2.86',
    topic: 'Thévenin uit een meting',
    accent: 'theorem',
    intro: `Een tweepool heeft een open klemspanning van 15 V. Met een belasting van 2 kΩ is de spanning over de belasting 10 V.`,
    circuit: sourceWithLoad('15 V', 'R_t', '2 kΩ'),
    parts: [
      part('a', `Bepaal R<sub>t</sub> (in kΩ).`, 'kΩ', 1, 3, [
        `v<sub>out</sub> = V<sub>t</sub>·R<sub>L</sub>/(R<sub>t</sub> + R<sub>L</sub>) → 10 = 15·2/(R<sub>t</sub> + 2) → R<sub>t</sub> + 2 = 3 → R<sub>t</sub> = <b>1 kΩ</b>.`,
      ]),
    ],
  },
  {
    title: 'P2.87',
    topic: 'Thévenin uit twee metingen',
    accent: 'theorem',
    intro: `Met een belasting van 2,2 kΩ is de klemspanning 4,4 V. Met 10 kΩ wordt de klemspanning 5 V.`,
    circuit: sourceWithLoad('V_t', 'R_t', 'R_L'),
    parts: (() => {
      const steps = [
        `Twee keer de spanningsdeler (alles in kΩ): 4,4 = V<sub>t</sub>·2,2/(R<sub>t</sub> + 2,2) en 5 = V<sub>t</sub>·10/(R<sub>t</sub> + 10).`,
        `Uit de eerste: V<sub>t</sub> = 2·(R<sub>t</sub> + 2,2) = 2R<sub>t</sub> + 4,4. Invullen in de tweede: 5R<sub>t</sub> + 50 = 20R<sub>t</sub> + 44 → R<sub>t</sub> = 0,4 kΩ.`,
        `V<sub>t</sub> = 2·0,4 + 4,4 = 5,2 V. Controle: 5,2·10/10,4 = 5 V ✓`,
      ];
      return [part('a', `Bepaal V<sub>t</sub>.`, 'V', 5.2, 3, steps), part('b', `Bepaal R<sub>t</sub> (in Ω).`, 'Ω', 400, 3, steps)];
    })(),
  },
  {
    title: 'P2.89',
    topic: 'Maximum power transfer',
    accent: 'theorem',
    intro: `Het netwerk van P2.80. Er wordt een weerstand als belasting op a-b aangesloten.`,
    circuit: p280,
    parts: [
      part('a', `Voor welke belastingsweerstand is het vermogen maximaal?`, 'Ω', 10 / 3, 2, [`R<sub>L</sub> = R<sub>t</sub> = <b>3⅓ Ω</b>.`]),
      part('b', `Hoe groot is dat maximale vermogen?`, 'W', 10 / 3, 3, [
        `v<sub>out</sub> = ½·V<sub>t</sub> = 3⅓ V. P<sub>L</sub> = v<sub>out</sub>²/R<sub>L</sub> = (3⅓)²/3⅓ = <b>3⅓ W</b>.`,
        `Of: V<sub>t</sub>²/(4R<sub>t</sub>) = (6⅔)²/(4·3⅓) = 3⅓ W ✓`,
      ]),
    ],
  },
  {
    title: 'P2.90',
    topic: 'Maximum power transfer',
    accent: 'theorem',
    intro: `Het netwerk van P2.82. Er wordt een weerstand als belasting op a-b aangesloten.`,
    circuit: p282,
    parts: [
      part('a', `Voor welke belastingsweerstand is het vermogen maximaal?`, 'Ω', 5, 2, [`R<sub>L</sub> = R<sub>t</sub> = <b>5 Ω</b>.`]),
      part('b', `Hoe groot is dat maximale vermogen?`, 'W', 7.2, 3, [
        `v<sub>out</sub> = ½·(−12) = −6 V. P<sub>L</sub> = (−6)²/5 = <b>7,2 W</b> — het minteken verdwijnt in het kwadraat.`,
      ]),
    ],
  },
  {
    title: 'P2.91',
    topic: 'Maximum power transfer',
    accent: 'theorem',
    intro: `Een vaste belasting R<sub>L</sub> = 10 Ω hangt aan een Thévenin-bron met V<sub>t</sub> = 20 V. Nu kies je R<sub>t</sub>. (Strikvraag!)`,
    circuit: sourceWithLoad('V_t = 20 V', 'R_t', 'R_L = 10 Ω'),
    parts: [
      part('a', `Voor welke R<sub>t</sub> is het vermogen in R<sub>L</sub> maximaal?`, 'Ω', 0, 2, [
        `R<sub>L</sub> = R<sub>t</sub> geldt alleen als R<sub>L</sub> de variabele is. Hier ligt R<sub>L</sub> vast: elk beetje R<sub>t</sub> kost alleen maar vermogen, dus R<sub>t</sub> = <b>0 Ω</b>.`,
      ]),
      part('b', `Hoe groot is dat maximale vermogen?`, 'W', 40, 3, [`P = V<sub>t</sub>²/R<sub>L</sub> = 20²/10 = <b>40 W</b>.`]),
    ],
  },
];

const WEEK_F: ExamQuestion[] = [
  {
    title: 'P2.94',
    topic: 'Superpositie',
    accent: 'theorem',
    intro: `Gebruik superpositie om i te bepalen. Zet eerst de stroombron op nul en bepaal i<sub>v</sub>; zet dan de spanningsbron op nul en bepaal i<sub>c</sub>.`,
    circuit: grid({
      wires: [
        [[0, 2], [3.3, 2]],
        [[2, 0], [3.3, 0]],
      ],
      elements: [
        { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: '30 V', side: 'left', value: 30 },
        { kind: 'R', from: [0, 0], to: [2, 0], label: '10 Ω', value: 10 },
        { kind: 'R', from: [2, 0], to: [2, 2], label: '5 Ω', side: 'left', value: 5, current: { label: 'i', toward: 'to' } },
        { kind: 'I', from: [3.3, 2], to: [3.3, 0], toward: 'to', label: '3 A', value: 3 },
      ],
      dots: [[2, 0], [2, 2]],
      ground: [2, 2],
    }),
    parts: [
      part('a', `Bepaal i<sub>v</sub> (alleen de spanningsbron).`, 'A', 2, 2, [`Stroombron open: i<sub>v</sub> = 30/(10 + 5) = <b>2 A</b>.`]),
      part('b', `Bepaal i<sub>c</sub> (alleen de stroombron).`, 'A', 2, 2, [`Spanningsbron kort: stroomdeler i<sub>c</sub> = 3·10/(5 + 10) = <b>2 A</b>.`]),
      part('c', `Bepaal i.`, 'A', 4, 2, [`i = i<sub>v</sub> + i<sub>c</sub> = <b>4 A</b>.`]),
    ],
  },
  {
    title: 'P2.95',
    topic: 'Superpositie',
    accent: 'theorem',
    intro: `Netwerk van figuur P2.49. Bepaal i<sub>s</sub> door de spanningsbron met superpositie.`,
    circuit: grid({
      wires: [
        [[0, 0], [0, 1]],
        [[2, 0], [2, 1]],
        [[2, 1], [3.3, 1]],
        [[0, 2.6], [3.3, 2.6]],
      ],
      elements: [
        { kind: 'R', from: [0, 0], to: [2, 0], label: '5 Ω', value: 5 },
        { kind: 'V', from: [0, 1], to: [2, 1], plus: 'from', label: '10 V', side: 'below', value: 10, current: { label: 'i_s', toward: 'to', side: 'above' } },
        { kind: 'R', from: [0, 1], to: [0, 2.6], label: '5 Ω', side: 'left', value: 5 },
        { kind: 'R', from: [2, 1], to: [2, 2.6], label: '10 Ω', side: 'left', value: 10 },
        { kind: 'I', from: [3.3, 2.6], to: [3.3, 1], toward: 'to', label: '1 A', value: 1 },
      ],
      dots: [[0, 1], [2, 1], [2, 2.6]],
      texts: [
        { at: [-0.2, 0.85], text: 'v_1', anchor: 'end' },
        { at: [2.2, 0.85], text: 'v_2', anchor: 'start' },
      ],
      ground: [2, 2.6],
    }),
    parts: [
      part('a', `Alleen de stroombron (spanningsbron kortgesloten): bepaal i<sub>s1</sub>.`, 'A', -2 / 3, 2, [
        `De bovenste 5 Ω is kortgesloten. De 1 A verdeelt zich over de linker 5 Ω en de 10 Ω; naar de linker 5 Ω gaat 1·10/15 = ⅔ A, en die moet naar links door de kortsluiting.`,
        `i<sub>s1</sub> = <b>−⅔ A ≈ −0,67 A</b>.`,
      ]),
      part('b', `Alleen de spanningsbron (stroombron open): bepaal i<sub>s2</sub>.`, 'A', -8 / 3, 2, [
        `Door de bovenste 5 Ω (direct over de bron): i<sub>a</sub> = 10/5 = 2 A. Door de lus 5 Ω + 10 Ω: i<sub>b</sub> = 10/15 = ⅔ A.`,
        `KCL in v<sub>1</sub>: i<sub>a</sub> + i<sub>b</sub> + i<sub>s2</sub> = 0 → i<sub>s2</sub> = <b>−2⅔ A ≈ −2,67 A</b>.`,
      ]),
      part('c', `Bepaal i<sub>s</sub>.`, 'A', -10 / 3, 2, [`i<sub>s</sub> = −⅔ − 2⅔ = <b>−3⅓ A ≈ −3,33 A</b>.`]),
    ],
  },
  {
    title: 'P2.96',
    topic: 'Superpositie',
    accent: 'theorem',
    intro: `Netwerk van figuur P2.48. Zet eerst de 1 A-bron op nul (alleen de 2 A-bron actief), dan de 2 A-bron.`,
    circuit: grid({
      wires: [
        [[0, 0], [1.2, 0]],
        [[0, 2], [4.6, 2]],
        [[3.4, 0], [4.6, 0]],
      ],
      elements: [
        { kind: 'I', from: [0, 2], to: [0, 0], toward: 'to', label: '1 A', side: 'left', value: 1 },
        { kind: 'R', from: [1.2, 0], to: [1.2, 2], label: '20 Ω', value: 20 },
        { kind: 'R', from: [1.2, 0], to: [3.4, 0], label: '10 Ω', value: 10, current: { label: 'i_1', toward: 'to' } },
        { kind: 'R', from: [3.4, 0], to: [3.4, 2], label: '5 Ω', value: 5 },
        { kind: 'I', from: [4.6, 2], to: [4.6, 0], toward: 'to', label: '2 A', value: 2 },
      ],
      dots: [[1.2, 0], [1.2, 2], [3.4, 0], [3.4, 2]],
      ground: [2.3, 2],
    }),
    parts: [
      part('a', `Alleen de 2 A-bron: bepaal de bijdrage aan i<sub>1</sub>.`, 'A', -2 * 5 / 35, 2, [
        `De 2 A verdeelt zich over 5 Ω en de tak 10 + 20 = 30 Ω. Door de 10 Ω loopt 2·5/35 = 0,286 A naar links.`,
        `Bijdrage = <b>−0,286 A</b>.`,
      ]),
      part('b', `Alleen de 1 A-bron: bepaal de bijdrage aan i<sub>1</sub>.`, 'A', 20 / 35, 2, [`Stroomdeler: 1·20/(20 + 10 + 5) = <b>0,571 A</b>.`]),
      part('c', `Bepaal i<sub>1</sub>.`, 'A', 10 / 35, 2, [`i<sub>1</sub> = −0,286 + 0,571 = <b>0,286 A</b>.`]),
    ],
  },
  {
    title: 'P2.97',
    topic: 'Superpositie',
    accent: 'theorem',
    intro: `Netwerk van figuur P2.34. Bepaal i<sub>1</sub> met superpositie.`,
    circuit: grid({
      wires: [
        [[0, 0], [4, 0]],
        [[0, 2], [4, 2]],
      ],
      elements: [
        { kind: 'I', from: [0, 2], to: [0, 0], toward: 'to', label: '20 A', side: 'left', value: 20 },
        { kind: 'R', from: [1.2, 0], to: [1.2, 2], label: '2 Ω', value: 2, current: { label: 'i_1', toward: 'to', side: 'left' } },
        { kind: 'R', from: [2.7, 0], to: [2.7, 2], label: '6 Ω', value: 6, current: { label: 'i_2', toward: 'to', side: 'left' } },
        { kind: 'I', from: [4, 2], to: [4, 0], toward: 'from', label: '10 A', value: 10 },
      ],
      dots: [[1.2, 0], [1.2, 2], [2.7, 0], [2.7, 2]],
    }),
    parts: [
      part('a', `Alleen de 20 A-bron: bepaal de bijdrage aan i<sub>1</sub>.`, 'A', 15, 2, [`10 A-bron open. Stroomdeler: 20·6/(2 + 6) = <b>15 A</b>.`]),
      part('b', `Alleen de 10 A-bron: bepaal de bijdrage aan i<sub>1</sub>.`, 'A', -7.5, 2, [
        `20 A-bron open. De 10 A-bron trekt stroom omhoog door de weerstanden: −10·6/(2 + 6) = <b>−7,5 A</b>.`,
      ]),
      part('c', `Bepaal i<sub>1</sub>.`, 'A', 7.5, 2, [`i<sub>1</sub> = 15 − 7,5 = <b>7,5 A</b>.`]),
    ],
  },
  {
    title: 'P2.98',
    topic: 'Evenredigheid (lineariteit)',
    accent: 'theorem',
    intro: `Netwerk van figuur P2.24 met v<sub>s</sub> = 12 V. Methode: neem aan dat v<sub>2</sub> = 1 V en werk terug naar de bron.`,
    circuit: grid({
      wires: [
        [[1.8, 0], [3, 0]],
        [[1.8, 2], [4.8, 2]],
      ],
      elements: [
        { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: 'v_s', side: 'left', value: 12 },
        { kind: 'R', from: [0, 0], to: [1.8, 0], label: '3 Ω', value: 3 },
        { kind: 'R', from: [1.8, 2], to: [0, 2], label: '3 Ω', side: 'below', value: 3 },
        { kind: 'R', from: [1.8, 0], to: [1.8, 2], label: '10 Ω', side: 'left', value: 10 },
        { kind: 'R', from: [3, 0], to: [3, 2], label: '30 Ω', value: 30, polarity: { plus: 'from', label: 'v_1', side: 'left' } },
        { kind: 'R', from: [3, 0], to: [4.8, 0], label: '25 Ω', value: 25 },
        { kind: 'R', from: [4.8, 0], to: [4.8, 2], label: '5 Ω', value: 5, polarity: { plus: 'from', label: 'v_2', side: 'left' } },
      ],
      dots: [[1.8, 0], [1.8, 2], [3, 0], [3, 2]],
    }),
    parts: (() => {
      const steps = [
        `Stel v<sub>2</sub> = 1 V. Dan loopt door 5 Ω (en 25 Ω) 1/5 = 0,2 A, dus v<sub>1</sub> = 0,2·(25 + 5) = 6 V.`,
        `Door 30 Ω: 6/30 = 0,2 A; door 10 Ω: 6/10 = 0,6 A. Samen loopt er 0,2 + 0,2 + 0,6 = 1 A door de twee 3 Ω-weerstanden.`,
        `v<sub>s</sub> = 3·1 + 6 + 3·1 = 12 V.`,
      ];
      return [
        part('a', `Welke v<sub>s</sub> hoort bij v<sub>2</sub> = 1 V?`, 'V', 12, 2, steps),
        part('b', `Bepaal v<sub>2</sub> bij v<sub>s</sub> = 12 V.`, 'V', 1, 2, [
          ...steps,
          `v<sub>2</sub> is evenredig met v<sub>s</sub>. Precies de gevraagde 12 V, dus v<sub>2</sub> = <b>1 V</b> — schalen is niet nodig.`,
        ]),
      ];
    })(),
  },
  {
    title: 'P2.99',
    topic: 'Evenredigheid (lineariteit)',
    accent: 'theorem',
    intro: `Netwerk van figuur P2.23 met een bron van 5 V. Methode: neem aan dat i<sub>2</sub> = 1 A en werk terug naar de bron.`,
    circuit: grid({
      wires: [
        [[0, 0], [2.4, 0]],
        [[1, 1.1], [2.4, 1.1]],
        [[0, 2.6], [2.4, 2.6]],
      ],
      elements: [
        { kind: 'V', from: [0, 0], to: [0, 2.6], plus: 'from', label: '5 V', side: 'left', value: 5 },
        { kind: 'R', from: [2.4, 0], to: [2.4, 1.1], label: '2 Ω', value: 2 },
        { kind: 'R', from: [1, 1.1], to: [1, 2.6], label: '6 Ω', side: 'left', value: 6, polarity: { plus: 'from', label: 'v_x', side: 'right' } },
        { kind: 'R', from: [2.4, 1.1], to: [2.4, 2.6], label: '6 Ω', value: 6, current: { label: 'i_2', toward: 'to', side: 'left' } },
      ],
      arrows: [{ at: [0.6, 0], dir: 'right', label: 'i_1' }],
      dots: [[2.4, 1.1], [1, 2.6]],
    }),
    parts: (() => {
      const steps = [
        `Stel i<sub>2</sub> = 1 A. Dan staat er 6 V over beide 6 Ω-weerstanden (parallel), dus ook 1 A door de andere 6 Ω.`,
        `Door 2 Ω loopt 1 + 1 = 2 A → 4 V. v<sub>s</sub> = 4 + 6 = 10 V.`,
      ];
      return [
        part('a', `Welke bronspanning hoort bij i<sub>2</sub> = 1 A?`, 'V', 10, 2, steps),
        part('b', `Bepaal i<sub>2</sub> bij de gegeven bron van 5 V.`, 'A', 0.5, 2, [...steps, `Evenredigheid: i<sub>2</sub> = 1 A · 5/10 = <b>0,5 A</b>.`]),
      ];
    })(),
  },
  {
    title: 'P2.101',
    topic: 'Superpositie (grenzen)',
    accent: 'theorem',
    intro: `Element A heeft v = 3i² voor i ≥ 0 (en v = 0 voor i < 0).`,
    circuit: grid({
      wires: [
        [[0, 0], [2.8, 0]],
        [[0, 2], [2.8, 2]],
      ],
      elements: [
        { kind: 'I', from: [0, 2], to: [0, 0], toward: 'to', label: '2 A', side: 'left' },
        { kind: 'box', name: 'A', from: [1.4, 0], to: [1.4, 2], current: { label: 'i', toward: 'to', side: 'left' }, polarity: { plus: 'from', label: 'v', side: 'right' } },
        { kind: 'I', from: [2.8, 2], to: [2.8, 0], toward: 'to', label: '0,5 A' },
      ],
      dots: [[1.4, 0], [1.4, 2]],
    }),
    parts: [
      part('a', `Bepaal v met alleen de 2 A-bron actief.`, 'V', 12, 1, [`i = 2 A → v = 3·2² = <b>12 V</b>.`]),
      part('b', `Bepaal v met alleen de 0,5 A-bron actief.`, 'V', 0.75, 1, [`i = 0,5 A → v = 3·0,5² = <b>0,75 V</b>.`]),
      part('c', `Bepaal v met beide bronnen actief.`, 'V', 18.75, 1, [`i = 2,5 A → v = 3·2,5² = <b>18,75 V</b> ≠ 12 + 0,75.`]),
      choice(
        'd',
        `Waarom klopt superpositie hier niet?`,
        ['Element A is niet-lineair', 'Er zijn twee stroombronnen', 'Stroombronnen mag je niet uitschakelen'],
        0,
        1,
        [`Superpositie mag alleen in lineaire netwerken. v = 3i² is niet lineair.`],
      ),
    ],
  },
];

export const bookWeekE: Exam = {
  id: 'boek-e',
  title: 'Boekopgaven week E',
  description: 'Thévenin, Norton en maximale vermogensoverdracht: P2.80 t/m P2.91 uit Hambley, met uitwerkingen.',
  build: () => WEEK_E,
};

export const bookWeekF: Exam = {
  id: 'boek-f',
  title: 'Boekopgaven week F',
  description: 'Superpositie en evenredigheid: P2.94 t/m P2.101 uit Hambley, met uitwerkingen.',
  build: () => WEEK_F,
};
