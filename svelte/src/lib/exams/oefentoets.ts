import type { Exam, ExamQuestion } from '../types';
import { abTerminals } from '../generators/built';
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
        `Alles zit in één lus, dus overal loopt dezelfde stroom: i<sub>R</sub> = I = 5 A (met de klok mee).`,
        `KVL met de klok mee: v<sub>I</sub> − i<sub>R</sub>·R − e = 0 → v<sub>I</sub> = 5·5 + 15 = <b>40 V</b>.`,
      ]),
      part('a.2', `Bereken de spanningsbron-stroom i<sub>e</sub>.`, 'A', 5, 2, [
        `Serieschakeling: door de spanningsbron loopt dezelfde stroom als door de stroombron. i<sub>e</sub> = I = <b>5 A</b>.`,
      ]),
      part('b.1', `Bepaal het vermogen dat de <b>stroombron</b> opneemt (positief = opgenomen, negatief = geleverd).`, 'W', -200, 4, [
        `De stroom komt er boven, aan de + kant van v<sub>I</sub>, uit: de bron <b>levert</b>.`,
        `P<sub>I</sub> = −v<sub>I</sub>·I = −40·5 = <b>−200 W</b> (200 W geleverd).`,
      ]),
      part('b.2', `Bepaal het vermogen dat de <b>weerstand</b> opneemt.`, 'W', 125, 3, [
        `P<sub>R</sub> = i<sub>R</sub>²·R = 5²·5 = <b>125 W</b> (opgenomen).`,
      ]),
      part('b.3', `Bepaal het vermogen dat de <b>spanningsbron</b> opneemt (positief = opgenomen, negatief = geleverd).`, 'W', 75, 3, [
        `De stroom loopt de spanningsbron in aan de + kant: de bron <b>neemt op</b> (hij wordt geladen).`,
        `P<sub>e</sub> = +e·i<sub>e</sub> = 15·5 = <b>75 W</b> (opgenomen).`,
        `Controle: −200 + 125 + 75 = 0 ✓`,
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
        `R<sub>1</sub> en R<sub>2</sub> staan parallel: 18 ∥ 9 = 18·9/27 = 6 Ω. R<sub>3</sub> en R<sub>4</sub> staan parallel: 10 ∥ 40 = 400/50 = 8 Ω.`,
        `Er blijft één lus over: de stroombron, 8 Ω, R<sub>5</sub> = 6 Ω en 6 Ω in serie. R<sub>v</sub> = 6 + 6 + 8 = 20 Ω.`,
        `De volle 10 A loopt door R<sub>v</sub>: v = I·R<sub>v</sub> = 10·20 = <b>200 V</b> (+ rechts: de bron levert).`,
      ]),
      part('b.1', `Bepaal de stroom i<sub>1</sub> met stroomdeling.`, 'A', 10 / 3, 5, [
        `De 10 A gaat omhoog door de parallelcombinatie R<sub>1</sub> ∥ R<sub>2</sub>.`,
        `i<sub>1</sub> = I·R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>) = 10·9/27 = <b>3,33 A</b>.`,
      ]),
      part('b.2', `Bepaal de stroom i<sub>2</sub> met stroomdeling.`, 'A', 8, 5, [
        `De 10 A gaat omlaag door R<sub>3</sub> ∥ R<sub>4</sub>.`,
        `i<sub>2</sub> = I·R<sub>4</sub>/(R<sub>3</sub> + R<sub>4</sub>) = 10·40/50 = <b>8 A</b>.`,
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
        `Schakelaar open: e, R<sub>1</sub> en R<sub>2</sub> vormen een gewone spanningsdeler.`,
        `Over R<sub>1</sub> staat 32 − 20 = 12 V, dus i = 12/12 = 1 A.`,
        `R<sub>2</sub> = v/i = 20/1 = <b>20 Ω</b>.`,
      ]),
      part('b', `Bepaal de waarde van R<sub>3</sub>.`, 'Ω', 30, 7, [
        `Schakelaar dicht: R<sub>3</sub> komt parallel aan R<sub>2</sub>. Over R<sub>1</sub> staat nu 32 − 16 = 16 V, dus i = 16/12 = 1,33 A.`,
        `R<sub>2</sub> ∥ R<sub>3</sub> = 16/1,333 = 12 Ω.`,
        `1/R<sub>3</sub> = 1/12 − 1/20 = 2/60 → R<sub>3</sub> = <b>30 Ω</b>.`,
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
        `KCL in knoop 1 (verlatende stromen = 0): v<sub>1</sub>/12 + (v<sub>1</sub> − v<sub>2</sub>)/6 + (v<sub>1</sub> − v<sub>3</sub>)/6 = 0 → (×12) 5v<sub>1</sub> − 2v<sub>2</sub> − 2v<sub>3</sub> = 0`,
        `KCL in knoop 2 (de bron duwt 3 A knoop 2 in): (v<sub>2</sub> − v<sub>1</sub>)/6 + v<sub>2</sub>/24 = 3 → (×24) −4v<sub>1</sub> + 5v<sub>2</sub> = 72`,
        `KCL in knoop 3 (de bron trekt 3 A uit knoop 3): v<sub>3</sub>/6 + (v<sub>3</sub> − v<sub>1</sub>)/6 = −3 → (×6) −v<sub>1</sub> + 2v<sub>3</sub> = −18`,
        `Uit knoop 2 en 3: v<sub>2</sub> = (72 + 4v<sub>1</sub>)/5 en v<sub>3</sub> = (v<sub>1</sub> − 18)/2. Invullen in knoop 1 (×5): 25v<sub>1</sub> − 144 − 8v<sub>1</sub> − 5v<sub>1</sub> + 90 = 0 → 12v<sub>1</sub> = 54.`,
        `v<sub>1</sub> = <b>4,5 V</b>, v<sub>2</sub> = (72 + 18)/5 = <b>18 V</b>, v<sub>3</sub> = (4,5 − 18)/2 = <b>−6,75 V</b>.`,
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
        `Stroombron uit → open. R<sub>3</sub> staat direct parallel aan e en doet voor de rest niet mee.`,
        `Er blijft één lus: e, R<sub>2</sub>, massa, R<sub>1</sub>. De + van e zit links, dus de stroom gaat omhoog door R<sub>2</sub>.`,
        `i′ = −e/(R<sub>1</sub> + R<sub>2</sub>) = −15/15 = <b>−1 A</b>.`,
      ]),
      part('b', `Stap 2: alleen I aan (spanningsbron kortgesloten). Bepaal de bijdrage i″.`, 'A', 2 / 3, 5, [
        `Spanningsbron uit → kortsluiting. De twee bovenknopen worden één knoop en R<sub>3</sub> is kortgesloten.`,
        `R<sub>1</sub> en R<sub>2</sub> staan parallel; stroomdeler: i″ = I·R<sub>1</sub>/(R<sub>1</sub> + R<sub>2</sub>) = 2·5/15 = <b>0,67 A</b>.`,
      ]),
      part('c', `Stap 3: bepaal de stroom i.`, 'A', -1 / 3, 5, [`i = i′ + i″ = −1 + 0,67 = <b>−0,33 A</b> (de stroom loopt dus omhoog door R<sub>2</sub>).`]),
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
        `Spanningsbron kortsluiten, stroombron openen. Vanaf a-b staan de twee 10 Ω-weerstanden parallel: R<sub>t</sub> = 10 ∥ 10 = <b>5 Ω</b>.`,
      ]),
      part('a.2', `Thévenin: bepaal V<sub>t</sub>.`, 'V', 15, 4, [
        `Kortsluitstroom (zie b): I<sub>n</sub> = 3 A. V<sub>t</sub> = I<sub>n</sub>·R<sub>t</sub> = 3·5 = <b>15 V</b>.`,
        `Controle met KCL in a: (V<sub>t</sub> − 10)/10 + V<sub>t</sub>/10 = 2 → 2V<sub>t</sub> = 30 → V<sub>t</sub> = 15 V ✓`,
      ]),
      part('b', `Norton: bepaal de Norton-stroom I<sub>n</sub> (van a naar b door de kortsluiting).`, 'A', 3, 6, [
        `Sluit a-b kort: over de rechter 10 Ω staat dan 0 V, er loopt niets door.`,
        `Door de linker 10 Ω: 10 V/10 Ω = 1 A, plus de 2 A van de stroombron: I<sub>n</sub> = 1 + 2 = <b>3 A</b>. Het Norton-schema is 3 A parallel aan 5 Ω.`,
      ]),
      part('c', `Er wordt een belasting R<sub>load</sub> = 10 Ω op a-b aangesloten. Bepaal de stroom door R<sub>load</sub>.`, 'A', 1, 6, [
        `Gebruik het Thévenin-schema: 15 V in serie met 5 Ω, belast met 10 Ω.`,
        `i<sub>load</sub> = V<sub>t</sub>/(R<sub>t</sub> + R<sub>load</sub>) = 15/(5 + 10) = <b>1 A</b>.`,
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
