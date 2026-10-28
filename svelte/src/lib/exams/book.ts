import type { Exam, ExamQuestion } from '../types';
import { abTerminals } from '../generators/built';
import { m, d } from '../utils/tex';
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
        `Knooppuntvergelijking in a, met open klemmen:${d`\begin{aligned}
          \frac{V_t - 10}{10} + \frac{V_t}{5} - 1 &= 0 \\
          V_t - 10 + 2V_t - 10 &= 0 \\
          3V_t &= 20 \;\Rightarrow\; V_t = \boxed{6\tfrac{2}{3}\,\mathrm{V} \approx 6{,}67\,\mathrm{V}}
        \end{aligned}`}`,
      ]),
      part('b', `Bepaal R<sub>t</sub>.`, 'Ω', 10 / 3, 3, [
        `Spanningsbron kort, stroombron open:${d`R_t = 10 \parallel 5 = \frac{10 \cdot 5}{10 + 5} = \boxed{3\tfrac{1}{3}\,\Omega \approx 3{,}33\,\Omega}`}`,
      ]),
      part('c', `Bepaal I<sub>n</sub>.`, 'A', 2, 3, [
        `Uit ${m`V_t`} en ${m`R_t`}:${d`I_n = \frac{V_t}{R_t} = \frac{6\tfrac{2}{3}}{3\tfrac{1}{3}} = \boxed{2\,\mathrm{A}}`}`,
        `Of direct: met a-b kortgesloten is de 5 Ω uitgeschakeld:${d`I_n = \frac{10 - 0}{10} + 1 = 2\,\mathrm{A} \;\checkmark`}`,
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
        `Spanningsdeler over ${m`R_t`} en de 100 Ω:${d`\begin{aligned}
          9 \cdot \frac{100}{100 + R_t} &= 6 \\
          900 &= 600 + 6R_t \\
          R_t &= \boxed{50\,\Omega}
        \end{aligned}`}`,
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
        `Bij open klemmen staan de twee 6 Ω-weerstanden in serie (12 Ω), parallel aan 24 Ω. De bron duwt 3 A naar beneden, dus de spanning boven is negatief:${d`\begin{aligned}
          24 \parallel 12 &= \frac{24 \cdot 12}{24 + 12} = 8\,\Omega \\
          v &= -3 \cdot 8 = -24\,\mathrm{V}
        \end{aligned}`}`,
        `Spanningsdeler over de twee gelijke 6 Ω-weerstanden:${d`V_t = \frac{6}{6 + 6} \cdot (-24) = \boxed{-12\,\mathrm{V}}`}`,
      ]),
      part('b', `Bepaal R<sub>t</sub>.`, 'Ω', 5, 3, [
        `Stroombron open:${d`R_t = (24 + 6) \parallel 6 = \frac{30 \cdot 6}{30 + 6} = \boxed{5\,\Omega}`}`,
      ]),
      part('c', `Bepaal I<sub>n</sub>.`, 'A', -2.4, 3, [
        `Kortsluiting a-b: de rechter 6 Ω valt weg. Stroomdeler over 24 Ω en 6 Ω:${d`I_n = -3 \cdot \frac{24}{24 + 6} = \boxed{-2{,}4\,\mathrm{A}}`}`,
        `Controle:${d`I_n \cdot R_t = -2{,}4 \cdot 5 = -12\,\mathrm{V} = V_t \;\checkmark`}`,
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
        `Twee keer de spanningsdeler. Achter de eerste 10 Ω zit ${m`10 \parallel (15 + 30) = 8{,}18\,\Omega`}:${d`\begin{aligned}
          v_1 &= 32 \cdot \frac{8{,}18}{10 + 8{,}18} = 14{,}4\,\mathrm{V} \\
          V_t &= v_1 \cdot \frac{30}{30 + 15} = 14{,}4 \cdot \frac{30}{45} = \boxed{9{,}6\,\mathrm{V}}
        \end{aligned}`}`,
      ]),
      part('b', `Bepaal R<sub>t</sub>.`, 'Ω', 12, 3, [
        `Spanningsbron kort:${d`R_t = 30 \parallel (15 + 10 \parallel 10) = 30 \parallel 20 = \boxed{12\,\Omega}`}`,
      ]),
      part('c', `Bepaal I<sub>n</sub>.`, 'A', 0.8, 3, [
        `Kortsluiting a-b: de 30 Ω valt weg. Spanning over de middelste 10 Ω, met ${m`10 \parallel 15 = 6\,\Omega`}:${d`\begin{aligned}
          v_2 &= 32 \cdot \frac{6}{10 + 6} = 12\,\mathrm{V} \\
          I_n &= \frac{12}{15} = \boxed{0{,}8\,\mathrm{A}}
        \end{aligned}`}`,
        `Controle:${d`I_n \cdot R_t = 0{,}8 \cdot 12 = 9{,}6\,\mathrm{V} \;\checkmark`}`,
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
        `Het linker knooppunt ligt vast op 12 V. KCL in a, waarbij de 1 A-bron stroom uit a trekt:${d`\begin{aligned}
          1 + \frac{V_t - 12}{48} + \frac{V_t}{16} &= 0 \quad (\times 48) \\
          48 + V_t - 12 + 3V_t &= 0 \\
          4V_t &= -36 \;\Rightarrow\; V_t = \boxed{-9\,\mathrm{V}}
        \end{aligned}`}`,
      ]),
      part('b', `Bepaal R<sub>t</sub>.`, 'Ω', 12, 3, [
        `Spanningsbron kort (de 7 Ω valt daardoor weg), stroombron open:${d`R_t = 48 \parallel 16 = \frac{48 \cdot 16}{48 + 16} = \boxed{12\,\Omega}`}`,
      ]),
      part('c', `Bepaal I<sub>n</sub>.`, 'A', -0.75, 3, [
        `Kortsluiting a-b: door 48 Ω loopt stroom naar a, en de bron trekt er 1 A af:${d`I_n = \frac{12 - 0}{48} - 1 = 0{,}25 - 1 = \boxed{-0{,}75\,\mathrm{A}}`}`,
        `Controle:${d`I_n \cdot R_t = -0{,}75 \cdot 12 = -9\,\mathrm{V} \;\checkmark`}`,
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
        `De klemspanning onder belasting, en wat er over ${m`R_t`} overblijft:${d`\begin{aligned}
          v_{\text{uit}} &= 100 \cdot 0{,}1 = 10\,\mathrm{V} \\
          R_t &= \frac{12{,}6 - 10}{100} = 0{,}026\,\Omega = \boxed{26\,\mathrm{m}\Omega}
        \end{aligned}`}`,
      ]),
      part('b', `Welke stroom levert de accu bij kortsluiting?`, 'A', 12.6 / 0.026, 3, [
        `${d`I_{sc} = I_n = \frac{12{,}6}{0{,}026} = \boxed{484{,}6\,\mathrm{A}}`}Het Thévenin-model is hier realistischer: een Norton-model zou ook onbelast intern vermogen verstoken.`,
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
        `Spanningsdeler (alles in kΩ):${d`\begin{aligned}
          v_{\text{uit}} &= V_t \cdot \frac{R_L}{R_t + R_L} \\
          10 &= 15 \cdot \frac{2}{R_t + 2} \;\Rightarrow\; R_t + 2 = 3 \;\Rightarrow\; R_t = \boxed{1\,\mathrm{k}\Omega}
        \end{aligned}`}`,
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
        `Twee keer de spanningsdeler (alles in kΩ):${d`\left\{\begin{aligned}
          4{,}4 &= V_t \cdot \frac{2{,}2}{R_t + 2{,}2} \\
          5 &= V_t \cdot \frac{10}{R_t + 10}
        \end{aligned}\right.`}`,
        `Uit de eerste vergelijking volgt ${m`V_t`}; vul die in de tweede in:${d`\begin{aligned}
          V_t &= 2\,(R_t + 2{,}2) = 2R_t + 4{,}4 \\
          5\,(R_t + 10) &= 10\,(2R_t + 4{,}4) \\
          5R_t + 50 &= 20R_t + 44 \;\Rightarrow\; R_t = 0{,}4\,\mathrm{k}\Omega = 400\,\Omega
        \end{aligned}`}`,
        `Dan:${d`V_t = 2 \cdot 0{,}4 + 4{,}4 = 5{,}2\,\mathrm{V} \qquad \text{controle: } 5{,}2 \cdot \frac{10}{10{,}4} = 5\,\mathrm{V} \;\checkmark`}`,
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
      part('a', `Voor welke belastingsweerstand is het vermogen maximaal?`, 'Ω', 10 / 3, 2, [
        `Uit P2.80:${d`R_L = R_t = \boxed{3\tfrac{1}{3}\,\Omega}`}`,
      ]),
      part('b', `Hoe groot is dat maximale vermogen?`, 'W', 10 / 3, 3, [
        `Met ${m`R_L = R_t`} staat de helft van ${m`V_t`} over de belasting:${d`\begin{aligned}
          v_{\text{uit}} &= \tfrac{1}{2} V_t = 3\tfrac{1}{3}\,\mathrm{V} \\
          P_L &= \frac{v_{\text{uit}}^2}{R_L} = \frac{(3\tfrac{1}{3})^2}{3\tfrac{1}{3}} = \boxed{3\tfrac{1}{3}\,\mathrm{W}}
        \end{aligned}`}`,
        `Of met de formule:${d`P_{\max} = \frac{V_t^2}{4R_t} = \frac{(6\tfrac{2}{3})^2}{4 \cdot 3\tfrac{1}{3}} = 3\tfrac{1}{3}\,\mathrm{W} \;\checkmark`}`,
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
      part('a', `Voor welke belastingsweerstand is het vermogen maximaal?`, 'Ω', 5, 2, [`Uit P2.82:${d`R_L = R_t = \boxed{5\,\Omega}`}`]),
      part('b', `Hoe groot is dat maximale vermogen?`, 'W', 7.2, 3, [
        `Het minteken van ${m`V_t`} verdwijnt in het kwadraat:${d`\begin{aligned}
          v_{\text{uit}} &= \tfrac{1}{2} \cdot (-12) = -6\,\mathrm{V} \\
          P_L &= \frac{(-6)^2}{5} = \boxed{7{,}2\,\mathrm{W}}
        \end{aligned}`}`,
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
        `${m`R_L = R_t`} geldt alleen als ${m`R_L`} de variabele is. Hier ligt ${m`R_L`} vast: elk beetje ${m`R_t`} kost alleen maar vermogen.${d`R_t = \boxed{0\,\Omega}`}`,
      ]),
      part('b', `Hoe groot is dat maximale vermogen?`, 'W', 40, 3, [
        `Met ${m`R_t = 0`} staat de volle bronspanning over de belasting:${d`P = \frac{V_t^2}{R_L} = \frac{20^2}{10} = \boxed{40\,\mathrm{W}}`}`,
      ]),
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
      part('a', `Bepaal i<sub>v</sub> (alleen de spanningsbron).`, 'A', 2, 2, [
        `Stroombron open: 10 Ω en 5 Ω staan in serie.${d`i_v = \frac{30}{10 + 5} = \boxed{2\,\mathrm{A}}`}`,
      ]),
      part('b', `Bepaal i<sub>c</sub> (alleen de stroombron).`, 'A', 2, 2, [
        `Spanningsbron kort: 10 Ω en 5 Ω staan parallel, dus een stroomdeler:${d`i_c = 3 \cdot \frac{10}{5 + 10} = \boxed{2\,\mathrm{A}}`}`,
      ]),
      part('c', `Bepaal i.`, 'A', 4, 2, [`Tel op:${d`i = i_v + i_c = 2 + 2 = \boxed{4\,\mathrm{A}}`}`]),
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
        `De bovenste 5 Ω is kortgesloten. De 1 A verdeelt zich over de linker 5 Ω en de 10 Ω; het deel naar de linker 5 Ω moet naar links door de kortsluiting, tegen de pijl in:${d`i_{s1} = -1 \cdot \frac{10}{5 + 10} = \boxed{-\tfrac{2}{3}\,\mathrm{A} \approx -0{,}67\,\mathrm{A}}`}`,
      ]),
      part('b', `Alleen de spanningsbron (stroombron open): bepaal i<sub>s2</sub>.`, 'A', -8 / 3, 2, [
        `Door de bovenste 5 Ω (direct over de bron) en door de lus 5 Ω + 10 Ω:${d`i_a = \frac{10}{5} = 2\,\mathrm{A} \qquad i_b = \frac{10}{5 + 10} = \tfrac{2}{3}\,\mathrm{A}`}`,
        `KCL in ${m`v_1`}:${d`i_a + i_b + i_{s2} = 0 \;\Rightarrow\; i_{s2} = \boxed{-2\tfrac{2}{3}\,\mathrm{A} \approx -2{,}67\,\mathrm{A}}`}`,
      ]),
      part('c', `Bepaal i<sub>s</sub>.`, 'A', -10 / 3, 2, [
        `Tel op:${d`i_s = i_{s1} + i_{s2} = -\tfrac{2}{3} - 2\tfrac{2}{3} = \boxed{-3\tfrac{1}{3}\,\mathrm{A} \approx -3{,}33\,\mathrm{A}}`}`,
      ]),
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
      part('a', `Alleen de 2 A-bron: bepaal de bijdrage aan i<sub>1</sub>.`, 'A', (-2 * 5) / 35, 2, [
        `De 2 A verdeelt zich over 5 Ω en de tak 10 + 20 = 30 Ω. Door de 10 Ω loopt dat deel naar links, tegen de pijl in:${d`i_1' = -2 \cdot \frac{5}{5 + 10 + 20} = \boxed{-0{,}286\,\mathrm{A}}`}`,
      ]),
      part('b', `Alleen de 1 A-bron: bepaal de bijdrage aan i<sub>1</sub>.`, 'A', 20 / 35, 2, [
        `Stroomdeler over 20 Ω en de tak 10 + 5 Ω:${d`i_1'' = 1 \cdot \frac{20}{20 + 10 + 5} = \boxed{0{,}571\,\mathrm{A}}`}`,
      ]),
      part('c', `Bepaal i<sub>1</sub>.`, 'A', 10 / 35, 2, [`Tel op:${d`i_1 = -0{,}286 + 0{,}571 = \boxed{0{,}286\,\mathrm{A}}`}`]),
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
      part('a', `Alleen de 20 A-bron: bepaal de bijdrage aan i<sub>1</sub>.`, 'A', 15, 2, [
        `10 A-bron open. Stroomdeler over 2 Ω en 6 Ω:${d`i_1' = 20 \cdot \frac{6}{2 + 6} = \boxed{15\,\mathrm{A}}`}`,
      ]),
      part('b', `Alleen de 10 A-bron: bepaal de bijdrage aan i<sub>1</sub>.`, 'A', -7.5, 2, [
        `20 A-bron open. De 10 A-bron trekt stroom omhoog door de weerstanden, dus tegen de pijl in:${d`i_1'' = -10 \cdot \frac{6}{2 + 6} = \boxed{-7{,}5\,\mathrm{A}}`}`,
      ]),
      part('c', `Bepaal i<sub>1</sub>.`, 'A', 7.5, 2, [`Tel op:${d`i_1 = 15 - 7{,}5 = \boxed{7{,}5\,\mathrm{A}}`}`]),
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
        `Stel ${m`v_2 = 1\,\mathrm{V}`}. Werk terug naar de bron:${d`\begin{aligned}
          i_{25} &= \frac{1}{5} = 0{,}2\,\mathrm{A} \qquad v_1 = 0{,}2 \cdot (25 + 5) = 6\,\mathrm{V} \\
          i_{30} &= \frac{6}{30} = 0{,}2\,\mathrm{A} \qquad i_{10} = \frac{6}{10} = 0{,}6\,\mathrm{A} \\
          i &= 0{,}2 + 0{,}2 + 0{,}6 = 1\,\mathrm{A} \\
          v_s &= 3 \cdot 1 + 6 + 3 \cdot 1 = 12\,\mathrm{V}
        \end{aligned}`}`,
      ];
      return [
        part('a', `Welke v<sub>s</sub> hoort bij v<sub>2</sub> = 1 V?`, 'V', 12, 2, [...steps, `Dus:${d`v_s = \boxed{12\,\mathrm{V}}`}`]),
        part('b', `Bepaal v<sub>2</sub> bij v<sub>s</sub> = 12 V.`, 'V', 1, 2, [
          ...steps,
          `${m`v_2`} is evenredig met ${m`v_s`}, en dit is precies de gegeven 12 V. Schalen is niet nodig:${d`v_2 = \boxed{1\,\mathrm{V}}`}`,
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
        `Stel ${m`i_2 = 1\,\mathrm{A}`}. Beide 6 Ω-weerstanden staan parallel, dus door de andere loopt ook 1 A:${d`\begin{aligned}
          v_x &= 6 \cdot 1 = 6\,\mathrm{V} \\
          i_1 &= 1 + 1 = 2\,\mathrm{A} \qquad v_{2\Omega} = 2 \cdot 2 = 4\,\mathrm{V} \\
          v_s &= 4 + 6 = 10\,\mathrm{V}
        \end{aligned}`}`,
      ];
      return [
        part('a', `Welke bronspanning hoort bij i<sub>2</sub> = 1 A?`, 'V', 10, 2, [...steps, `Dus:${d`v_s = \boxed{10\,\mathrm{V}}`}`]),
        part('b', `Bepaal i<sub>2</sub> bij de gegeven bron van 5 V.`, 'A', 0.5, 2, [
          ...steps,
          `Alles is evenredig met de bron, dus schaal met ${m`\tfrac{5}{10}`}:${d`i_2 = 1\,\mathrm{A} \cdot \frac{5}{10} = \boxed{0{,}5\,\mathrm{A}}`}`,
        ]),
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
      part('a', `Bepaal v met alleen de 2 A-bron actief.`, 'V', 12, 1, [`Alle 2 A gaat door A:${d`i = 2\,\mathrm{A} \;\Rightarrow\; v = 3 \cdot 2^2 = \boxed{12\,\mathrm{V}}`}`]),
      part('b', `Bepaal v met alleen de 0,5 A-bron actief.`, 'V', 0.75, 1, [
        `Alle 0,5 A gaat door A:${d`i = 0{,}5\,\mathrm{A} \;\Rightarrow\; v = 3 \cdot 0{,}5^2 = \boxed{0{,}75\,\mathrm{V}}`}`,
      ]),
      part('c', `Bepaal v met beide bronnen actief.`, 'V', 18.75, 1, [
        `Samen gaat er 2,5 A door A:${d`i = 2{,}5\,\mathrm{A} \;\Rightarrow\; v = 3 \cdot 2{,}5^2 = \boxed{18{,}75\,\mathrm{V}} \neq 12 + 0{,}75`}`,
      ]),
      choice(
        'd',
        `Waarom klopt superpositie hier niet?`,
        ['Element A is niet-lineair', 'Er zijn twee stroombronnen', 'Stroombronnen mag je niet uitschakelen'],
        0,
        1,
        [`Superpositie mag alleen in lineaire netwerken, en ${m`v = 3i^2`} is niet lineair.`],
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
