import type { Exam, ExamQuestion } from '../types';
import { abTerminals } from '../generators/built';
import { m, d } from '../utils/tex';
import { part, grid } from './helpers';

/** "Oefentoets DC" from the course, figures redrawn; the worked solutions are ours. */
const QUESTIONS: ExamQuestion[] = [
  {
    title: 'Opgave 1',
    topic: 'Vermogen & tekenconventie',
    accent: 'mixed',
    intro: `Gegeven: I = 5 A, R = 5 Ω, e = 15 V. De referentierichtingen staan in het schema: v<sub>I</sub> met de + boven, i<sub>e</sub> van + naar − door de spanningsbron.`,
    circuit: grid({
      wires: [[[0, 2], [2.6, 2]]],
      elements: [
        { kind: 'I', from: [0, 2], to: [0, 0], toward: 'to', label: 'I', side: 'left', value: 5, polarity: { plus: 'to', label: 'v_I', side: 'right' } },
        { kind: 'R', from: [0, 0], to: [2.6, 0], label: 'R', value: 5 },
        { kind: 'V', from: [2.6, 0], to: [2.6, 2], plus: 'from', label: 'e', value: 15, current: { label: 'i_e', toward: 'to', side: 'left' } },
      ],
      arrows: [{ at: [0.45, 0], dir: 'right', label: 'i_R' }],
    }),
    parts: [
      part('a.1', `Bereken de stroombron-spanning v<sub>I</sub>.`, 'V', 40, 3, [
        `Alles zit in één lus, dus overal loopt dezelfde stroom (met de klok mee):${d`i_R = I = 5\,\mathrm{A}`}`,
        `KVL met de klok mee (van − naar + is een stijging):${d`\begin{aligned}
          v_I - i_R\,R - e &= 0 \\
          v_I &= 5 \cdot 5 + 15 = \boxed{40\,\mathrm{V}}
        \end{aligned}`}`,
      ]),
      part('a.2', `Bereken de spanningsbron-stroom i<sub>e</sub>.`, 'A', 5, 2, [
        `Serieschakeling: door de spanningsbron loopt dezelfde stroom als door de stroombron.${d`i_e = I = \boxed{5\,\mathrm{A}}`}`,
      ]),
      part('b.1', `Bepaal het vermogen dat de <b>stroombron</b> opneemt (positief = opgenomen, negatief = geleverd).`, 'W', -200, 4, [
        `De stroom komt er boven, aan de + kant van ${m`v_I`}, uit: de bron <b>levert</b>.${d`P_I = -v_I \cdot I = -40 \cdot 5 = \boxed{-200\,\mathrm{W}}`}Dus 200 W geleverd.`,
      ]),
      part('b.2', `Bepaal het vermogen dat de <b>weerstand</b> opneemt.`, 'W', 125, 3, [
        `Een weerstand neemt altijd op:${d`P_R = i_R^2 \cdot R = 5^2 \cdot 5 = \boxed{125\,\mathrm{W}}`}`,
      ]),
      part('b.3', `Bepaal het vermogen dat de <b>spanningsbron</b> opneemt (positief = opgenomen, negatief = geleverd).`, 'W', 75, 3, [
        `De stroom loopt de spanningsbron in aan de + kant: de bron <b>neemt op</b> (hij wordt geladen).${d`P_e = +e \cdot i_e = 15 \cdot 5 = \boxed{75\,\mathrm{W}}`}`,
        `Controle:${d`P_I + P_R + P_e = -200 + 125 + 75 = 0 \;\checkmark`}`,
      ]),
    ],
  },
  {
    title: 'Opgave 2',
    topic: 'Vervangingsweerstand & stroomdeling',
    accent: 'mixed',
    intro: `Gegeven: I = 10 A, R<sub>1</sub> = 18 Ω, R<sub>2</sub> = 9 Ω, R<sub>3</sub> = 10 Ω, R<sub>4</sub> = 40 Ω, R<sub>5</sub> = 6 Ω.`,
    circuit: grid({
      wires: [
        [[0, 0], [1, 0]],
        [[3, 0], [4, 0]],
        [[0, 2], [1, 2]],
        [[3, 2], [4, 2]],
      ],
      elements: [
        { kind: 'R', from: [0, 0], to: [0, 2], label: 'R_1', side: 'left', value: 18, current: { label: 'i_1', toward: 'from', side: 'right' } },
        { kind: 'R', from: [1, 0], to: [1, 2], label: 'R_2', side: 'right', value: 9 },
        { kind: 'I', from: [1, 0], to: [3, 0], toward: 'to', label: 'I', value: 10, polarity: { plus: 'to', label: 'v', side: 'below' } },
        { kind: 'R', from: [3, 0], to: [3, 2], label: 'R_3', side: 'left', value: 10, current: { label: 'i_2', toward: 'to', side: 'right' } },
        { kind: 'R', from: [4, 0], to: [4, 2], label: 'R_4', side: 'right', value: 40 },
        { kind: 'R', from: [1, 2], to: [3, 2], label: 'R_5', value: 6 },
      ],
      dots: [[1, 0], [3, 0], [1, 2], [3, 2]],
    }),
    parts: [
      part('a', `Bepaal de spanning v met de methode van vervangingsweerstanden.`, 'V', 200, 10, [
        `Combineer de parallelle paren:${d`\begin{aligned}
          R_1 \parallel R_2 &= \frac{18 \cdot 9}{18 + 9} = 6\,\Omega \\
          R_3 \parallel R_4 &= \frac{10 \cdot 40}{10 + 40} = 8\,\Omega
        \end{aligned}`}`,
        `Er blijft één lus over: de stroombron met 6 Ω, ${m`R_5`} en 8 Ω in serie.${d`R_v = 6 + 6 + 8 = 20\,\Omega`}`,
        `De volle 10 A loopt door ${m`R_v`} (+ rechts: de bron levert):${d`v = I \cdot R_v = 10 \cdot 20 = \boxed{200\,\mathrm{V}}`}`,
      ]),
      part('b.1', `Bepaal de stroom i<sub>1</sub> met stroomdeling.`, 'A', 10 / 3, 5, [
        `De 10 A gaat omhoog door de parallelcombinatie ${m`R_1 \parallel R_2`}. Stroomdeler:${d`i_1 = I \cdot \frac{R_2}{R_1 + R_2} = 10 \cdot \frac{9}{27} = \boxed{3{,}33\,\mathrm{A}}`}`,
      ]),
      part('b.2', `Bepaal de stroom i<sub>2</sub> met stroomdeling.`, 'A', 8, 5, [
        `De 10 A gaat omlaag door ${m`R_3 \parallel R_4`}. Stroomdeler:${d`i_2 = I \cdot \frac{R_4}{R_3 + R_4} = 10 \cdot \frac{40}{50} = \boxed{8\,\mathrm{A}}`}`,
      ]),
    ],
  },
  {
    title: 'Opgave 3',
    topic: 'Spanningsdeler',
    accent: 'kvl',
    intro: `Gegeven: R<sub>1</sub> = 12 Ω en e = 32 V. Met de schakelaar open (stand 0) meet je v = 20 V; met de schakelaar gesloten (stand 1) meet je v = 16 V.`,
    circuit: grid({
      wires: [[[0, 2], [3.4, 2]]],
      elements: [
        { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: 'e', side: 'left', value: 32 },
        { kind: 'R', from: [0, 0], to: [2, 0], label: 'R_1', value: 12 },
        { kind: 'R', from: [2, 0], to: [2, 2], label: 'R_2', side: 'left', value: 20, polarity: { plus: 'from', label: 'v', side: 'right' } },
        { kind: 'switch', from: [2, 0], to: [3.4, 0], closed: false, label: '0 → 1' },
        { kind: 'R', from: [3.4, 0], to: [3.4, 2], label: 'R_3', value: 30 },
      ],
      dots: [[2, 0], [2, 2]],
    }),
    parts: [
      part('a', `Bepaal de waarde van R<sub>2</sub>.`, 'Ω', 20, 8, [
        `Schakelaar open: ${m`e`}, ${m`R_1`} en ${m`R_2`} vormen een gewone spanningsdeler. Over ${m`R_1`} staat het verschil, en daar volgt de stroom uit:${d`\begin{aligned}
          v_{R_1} &= 32 - 20 = 12\,\mathrm{V} \\
          i &= \frac{12}{12} = 1\,\mathrm{A} \\
          R_2 &= \frac{v}{i} = \frac{20}{1} = \boxed{20\,\Omega}
        \end{aligned}`}`,
      ]),
      part('b', `Bepaal de waarde van R<sub>3</sub>.`, 'Ω', 30, 7, [
        `Schakelaar dicht: ${m`R_3`} komt parallel aan ${m`R_2`}. Bepaal eerst de parallelwaarde:${d`\begin{aligned}
          v_{R_1} &= 32 - 16 = 16\,\mathrm{V} \\
          i &= \frac{16}{12} = 1{,}33\,\mathrm{A} \\
          R_2 \parallel R_3 &= \frac{16}{1{,}333} = 12\,\Omega
        \end{aligned}`}`,
        `Reken terug naar ${m`R_3`}:${d`\frac{1}{R_3} = \frac{1}{12} - \frac{1}{20} = \frac{2}{60} \;\Rightarrow\; R_3 = \boxed{30\,\Omega}`}`,
      ]),
    ],
  },
  {
    title: 'Opgave 4',
    topic: 'Knooppuntspanningsmethode',
    accent: 'kcl',
    intro: `Gegeven: I = 3 A, R<sub>1</sub> = 12 Ω, R<sub>2</sub> = 6 Ω, R<sub>3</sub> = 6 Ω, R<sub>4</sub> = 24 Ω, R<sub>5</sub> = 6 Ω. Knoop 0 is de referentie. Bepaal de knooppuntspanningen door systematische toepassing van de knooppuntspanningsmethode.`,
    circuit: grid({
      wires: [
        [[0, 0], [0, 1]],
        [[4, 0], [4, 1]],
        [[0, 2.4], [4, 2.4]],
      ],
      elements: [
        { kind: 'R', from: [0, 0], to: [4, 0], label: 'R_2', value: 6 },
        { kind: 'R', from: [0, 1], to: [2, 1], label: 'R_3', value: 6 },
        { kind: 'I', from: [2, 1], to: [4, 1], toward: 'from', label: 'I', value: 3 },
        { kind: 'R', from: [0, 1], to: [0, 2.4], label: 'R_1', side: 'left', value: 12 },
        { kind: 'R', from: [2, 1], to: [2, 2.4], label: 'R_4', value: 24 },
        { kind: 'R', from: [4, 1], to: [4, 2.4], label: 'R_5', value: 6 },
      ],
      dots: [[0, 1], [2, 1], [4, 1], [2, 2.4]],
      texts: [
        { at: [-0.18, 0.82], text: '1', anchor: 'end' },
        { at: [2.12, 0.78], text: '2', anchor: 'start' },
        { at: [4.18, 0.82], text: '3', anchor: 'start' },
        { at: [2.38, 2.62], text: '0', anchor: 'start' },
      ],
      ground: [2, 2.4],
    }),
    parts: (() => {
      const steps = [
        `KCL per knoop: de stromen die de knoop verlaten zijn samen gelijk aan de bronstroom erin. De bron duwt 3 A knoop 2 in en trekt 3 A uit knoop 3.${d`\begin{aligned}
          \text{knoop 1:}\quad & \frac{v_1}{12} + \frac{v_1 - v_2}{6} + \frac{v_1 - v_3}{6} = 0 \\[4pt]
          \text{knoop 2:}\quad & \frac{v_2 - v_1}{6} + \frac{v_2}{24} = 3 \\[4pt]
          \text{knoop 3:}\quad & \frac{v_3}{6} + \frac{v_3 - v_1}{6} = -3
        \end{aligned}`}`,
        `Vermenigvuldig met de noemers (×12, ×24, ×6) om de breuken kwijt te raken:${d`\left\{\begin{aligned}
          5v_1 - 2v_2 - 2v_3 &= 0 \\
          -4v_1 + 5v_2 &= 72 \\
          -v_1 + 2v_3 &= -18
        \end{aligned}\right.`}`,
        `Druk ${m`v_2`} en ${m`v_3`} uit in ${m`v_1`} en vul in bij de eerste vergelijking (×5):${d`\begin{aligned}
          v_2 &= \frac{72 + 4v_1}{5}, \qquad v_3 = \frac{v_1 - 18}{2} \\
          25v_1 - 2(72 + 4v_1) - 5(v_1 - 18) &= 0 \\
          12v_1 &= 54
        \end{aligned}`}`,
        `Dus:${d`v_1 = \boxed{4{,}5\,\mathrm{V}} \qquad v_2 = \frac{72 + 18}{5} = \boxed{18\,\mathrm{V}} \qquad v_3 = \frac{4{,}5 - 18}{2} = \boxed{-6{,}75\,\mathrm{V}}`}`,
      ];
      return [
        part('a', `Bepaal v<sub>1</sub>.`, 'V', 4.5, 5, steps),
        part('b', `Bepaal v<sub>2</sub>.`, 'V', 18, 5, steps),
        part('c', `Bepaal v<sub>3</sub>.`, 'V', -6.75, 5, steps),
      ];
    })(),
  },
  {
    title: 'Opgave 5',
    topic: 'Superpositie',
    accent: 'theorem',
    intro: `Gegeven: e = 15 V, I = 2 A, R<sub>1</sub> = 5 Ω, R<sub>2</sub> = 10 Ω, R<sub>3</sub> = 5 Ω. Bepaal door toepassing van het superpositiebeginsel de stroom i. Geef duidelijk je plan van aanpak.`,
    circuit: grid({
      wires: [
        [[0, 0], [0, 1]],
        [[2, 0], [2, 1]],
        [[2, 1], [3.3, 1]],
        [[0, 2.6], [3.3, 2.6]],
      ],
      elements: [
        { kind: 'R', from: [0, 0], to: [2, 0], label: 'R_3', value: 5 },
        { kind: 'V', from: [0, 1], to: [2, 1], plus: 'from', label: 'e', side: 'below', value: 15 },
        { kind: 'R', from: [0, 1], to: [0, 2.6], label: 'R_1', side: 'left', value: 5 },
        { kind: 'R', from: [2, 1], to: [2, 2.6], label: 'R_2', side: 'left', value: 10, current: { label: 'i', toward: 'to' } },
        { kind: 'I', from: [3.3, 2.6], to: [3.3, 1], toward: 'to', label: 'I', value: 2 },
      ],
      dots: [[0, 1], [2, 1], [2, 2.6]],
    }),
    parts: [
      part('a', `Stap 1: alleen e aan (stroombron open). Bepaal de bijdrage i′.`, 'A', -1, 5, [
        `Stroombron uit → open. ${m`R_3`} staat direct parallel aan ${m`e`} en doet voor de rest niet mee.`,
        `Er blijft één lus: ${m`e`}, ${m`R_2`}, massa, ${m`R_1`}. De + van ${m`e`} zit links, dus de stroom gaat omhoog door ${m`R_2`} — tegen de pijl in:${d`i' = -\frac{e}{R_1 + R_2} = -\frac{15}{5 + 10} = \boxed{-1\,\mathrm{A}}`}`,
      ]),
      part('b', `Stap 2: alleen I aan (spanningsbron kortgesloten). Bepaal de bijdrage i″.`, 'A', 2 / 3, 5, [
        `Spanningsbron uit → kortsluiting. De twee bovenknopen worden één knoop en ${m`R_3`} is kortgesloten.`,
        `${m`R_1`} en ${m`R_2`} staan parallel, dus een stroomdeler:${d`i'' = I \cdot \frac{R_1}{R_1 + R_2} = 2 \cdot \frac{5}{15} = \boxed{0{,}67\,\mathrm{A}}`}`,
      ]),
      part('c', `Stap 3: bepaal de stroom i.`, 'A', -1 / 3, 5, [
        `Tel de bijdragen op:${d`i = i' + i'' = -1 + 0{,}67 = \boxed{-0{,}33\,\mathrm{A}}`}De stroom loopt dus omhoog door ${m`R_2`}.`,
      ]),
    ],
  },
  {
    title: 'Opgave 6',
    topic: 'Thévenin & Norton',
    accent: 'theorem',
    intro: `Bekijk het netwerkdeel links van het klemmenpaar a-b. Hint: de kortsluitstroom is eenvoudig te bepalen.`,
    circuit: grid({
      wires: [
        [[0, 2], [4.4, 2]],
        [[2, 0], [4.4, 0]],
      ],
      elements: [
        { kind: 'V', from: [0, 0], to: [0, 2], plus: 'from', label: '10 V', side: 'left', value: 10 },
        { kind: 'R', from: [0, 0], to: [2, 0], label: '10 Ω', value: 10 },
        { kind: 'R', from: [2, 0], to: [2, 2], label: '10 Ω', side: 'left', value: 10 },
        { kind: 'I', from: [3.2, 2], to: [3.2, 0], toward: 'to', label: '2 A', value: 2 },
      ],
      dots: [[2, 0], [2, 2], [3.2, 0], [3.2, 2]],
      ...abTerminals(4.4, 0, 2),
    }),
    parts: [
      part('a.1', `Thévenin: bepaal R<sub>t</sub>.`, 'Ω', 5, 4, [
        `Spanningsbron kortsluiten, stroombron openen. Vanaf a-b staan de twee 10 Ω-weerstanden parallel:${d`R_t = 10 \parallel 10 = \frac{10 \cdot 10}{10 + 10} = \boxed{5\,\Omega}`}`,
      ]),
      part('a.2', `Thévenin: bepaal V<sub>t</sub>.`, 'V', 15, 4, [
        `Met de kortsluitstroom uit onderdeel b (3 A):${d`V_t = I_n \cdot R_t = 3 \cdot 5 = \boxed{15\,\mathrm{V}}`}`,
        `Controle met KCL in a (open klemmen):${d`\frac{V_t - 10}{10} + \frac{V_t}{10} = 2 \;\Rightarrow\; 2V_t = 30 \;\Rightarrow\; V_t = 15\,\mathrm{V} \;\checkmark`}`,
      ]),
      part('b', `Norton: bepaal de Norton-stroom I<sub>n</sub> (van a naar b door de kortsluiting).`, 'A', 3, 6, [
        `Sluit a-b kort: over de rechter 10 Ω staat dan 0 V, er loopt niets door. Door de linker 10 Ω komt 1 A, plus de 2 A van de stroombron:${d`I_n = \frac{10}{10} + 2 = \boxed{3\,\mathrm{A}}`}Het Norton-schema is 3 A parallel aan 5 Ω.`,
      ]),
      part('c', `Er wordt een belasting R<sub>load</sub> = 10 Ω op a-b aangesloten. Bepaal de stroom door R<sub>load</sub>.`, 'A', 1, 6, [
        `Gebruik het Thévenin-schema: 15 V in serie met 5 Ω, belast met 10 Ω.${d`i_{\text{load}} = \frac{V_t}{R_t + R_{\text{load}}} = \frac{15}{5 + 10} = \boxed{1\,\mathrm{A}}`}`,
      ]),
    ],
  },
];

export const oefentoetsDC: Exam = {
  id: 'oefentoets-dc',
  title: 'Oefentoets DC',
  description: 'De zes opgaven uit de oefentoets van het vak (100 punten): vermogen, vervangingsweerstand, spanningsdeler, knooppuntspanning, superpositie en Thévenin/Norton.',
  build: () => QUESTIONS,
};
