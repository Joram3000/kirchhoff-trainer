import type { LabPreset } from './analyze';

/** Circuits from the course material, ready to play with. Loops are the meshes, walked clockwise. */
export const LAB_PRESETS: LabPreset[] = [
  {
    id: 'p249',
    title: 'Zwevende bron (P2.49)',
    description:
      'Een spanningsbron tussen twee knooppunten, met een weerstand eroverheen en een stroombron rechts. Zet een bron uit en kijk wat er met de stromen gebeurt: dat is superpositie.',
    elements: [
      { id: 'R3', name: 'R_3', kind: 'R', from: [0, -0.5], to: [2.8, -0.5], value: 5 },
      { id: 'e', name: 'e', kind: 'V', from: [0, 1], to: [2.8, 1], value: 10, plus: 'from', side: 'below', currentSide: 'above' },
      { id: 'R1', name: 'R_1', kind: 'R', from: [0, 1], to: [0, 2.8], value: 5, side: 'left' },
      { id: 'R2', name: 'R_2', kind: 'R', from: [2.8, 1], to: [2.8, 2.8], value: 10, side: 'left' },
      { id: 'I', name: 'I_s', kind: 'I', from: [4.4, 2.8], to: [4.4, 1], value: 1, toward: 'to' },
    ],
    wires: [
      [[0, -0.5], [0, 1]],
      [[2.8, -0.5], [2.8, 1]],
      [[2.8, 1], [4.4, 1]],
      [[0, 2.8], [4.4, 2.8]],
    ],
    dots: [[0, 1], [2.8, 1], [2.8, 2.8]],
    nodes: [
      { name: '1', at: [0, 1], labelAt: [-0.22, 0.82], anchor: 'end' },
      { name: '2', at: [2.8, 1], labelAt: [2.98, 0.8], anchor: 'start' },
      { name: '0', at: [2.8, 2.8], labelAt: [2.98, 3.02], anchor: 'start' },
    ],
    ground: [2.8, 2.8],
    loops: [
      { name: 'boven', path: [['R3', 1], ['e', -1]] },
      { name: 'links', path: [['e', 1], ['R2', 1], ['R1', -1]] },
      { name: 'rechts', path: [['I', -1], ['R2', -1]] },
    ],
  },
  {
    id: 'two-sources',
    title: 'Twee spanningsbronnen (les 6)',
    description:
      'Het superpositievoorbeeld uit les 6: twee spanningsbronnen voeden een T-netwerk. Zet V₂ uit en weer aan, en vergelijk de stroom door de middelste weerstand.',
    elements: [
      { id: 'V1', name: 'V_1', kind: 'V', from: [0, 0], to: [0, 2], value: 30, plus: 'from', side: 'left' },
      { id: 'R1', name: 'R_1', kind: 'R', from: [0, 0], to: [2, 0], value: 10 },
      { id: 'R2', name: 'R_2', kind: 'R', from: [2, 0], to: [2, 2], value: 10, side: 'left' },
      { id: 'R3', name: 'R_3', kind: 'R', from: [2, 0], to: [4, 0], value: 10 },
      { id: 'V2', name: 'V_2', kind: 'V', from: [4, 0], to: [4, 2], value: 90, plus: 'from' },
    ],
    wires: [[[0, 2], [4, 2]]],
    dots: [[2, 0], [2, 2]],
    nodes: [
      { name: '1', at: [0, 0], labelAt: [-0.15, -0.3], anchor: 'end' },
      { name: '2', at: [2, 0], labelAt: [2, -0.42] },
      { name: '3', at: [4, 0], labelAt: [4.15, -0.3], anchor: 'start' },
      { name: '0', at: [2, 2], labelAt: [2.18, 2.22], anchor: 'start' },
    ],
    ground: [2, 2],
    loops: [
      { name: 'links', path: [['V1', -1], ['R1', 1], ['R2', 1]] },
      { name: 'rechts', path: [['R2', -1], ['R3', 1], ['V2', 1]] },
    ],
  },
  {
    id: 'three-nodes',
    title: 'Drie knooppunten (oefentoets 4)',
    description:
      'Drie onbekende knooppuntspanningen, een stroombron tussen twee knooppunten en een overbruggende weerstand. Hier zie je KCL in elk knooppunt kloppen.',
    elements: [
      { id: 'R2', name: 'R_2', kind: 'R', from: [0, -0.3], to: [5.6, -0.3], value: 6 },
      { id: 'R3', name: 'R_3', kind: 'R', from: [0, 1.1], to: [2.8, 1.1], value: 6, currentSide: 'below' },
      { id: 'I', name: 'I', kind: 'I', from: [2.8, 1.1], to: [5.6, 1.1], value: 3, toward: 'from' },
      { id: 'R1', name: 'R_1', kind: 'R', from: [0, 1.1], to: [0, 2.9], value: 12, side: 'left' },
      { id: 'R4', name: 'R_4', kind: 'R', from: [2.8, 1.1], to: [2.8, 2.9], value: 24 },
      { id: 'R5', name: 'R_5', kind: 'R', from: [5.6, 1.1], to: [5.6, 2.9], value: 6 },
    ],
    wires: [
      [[0, -0.3], [0, 1.1]],
      [[5.6, -0.3], [5.6, 1.1]],
      [[0, 2.9], [5.6, 2.9]],
    ],
    dots: [[0, 1.1], [2.8, 1.1], [5.6, 1.1], [2.8, 2.9]],
    nodes: [
      { name: '1', at: [0, 1.1], labelAt: [-0.2, 0.92], anchor: 'end' },
      { name: '2', at: [2.8, 1.1], labelAt: [2.95, 1.36], anchor: 'start' },
      { name: '3', at: [5.6, 1.1], labelAt: [5.8, 0.92], anchor: 'start' },
      { name: '0', at: [2.8, 2.9], labelAt: [3.18, 3.14], anchor: 'start' },
    ],
    ground: [2.8, 2.9],
    loops: [
      { name: 'boven', path: [['R2', 1], ['I', -1], ['R3', -1]] },
      { name: 'linksonder', path: [['R3', 1], ['R4', 1], ['R1', -1]] },
      { name: 'rechtsonder', path: [['I', 1], ['R5', 1], ['R4', -1]] },
    ],
  },
  {
    id: 'loop',
    title: 'Serielus met twee bronnen (oefentoets 1)',
    description:
      'Eén lus met een stroombron, een weerstand en een spanningsbron. Draai aan e en kijk hoe het vermogen van de spanningsbron van opgenomen naar geleverd gaat.',
    elements: [
      { id: 'I', name: 'I_s', kind: 'I', from: [0, 2], to: [0, 0], value: 5, toward: 'to', side: 'left' },
      { id: 'R', name: 'R', kind: 'R', from: [0, 0], to: [2.6, 0], value: 5 },
      { id: 'e', name: 'e', kind: 'V', from: [2.6, 0], to: [2.6, 2], value: 15, plus: 'from', currentSide: 'left' },
    ],
    wires: [[[0, 2], [2.6, 2]]],
    nodes: [
      { name: '1', at: [0, 0], labelAt: [-0.15, -0.3], anchor: 'end' },
      { name: '2', at: [2.6, 0], labelAt: [2.75, -0.3], anchor: 'start' },
      { name: '0', at: [1.3, 2], labelAt: [1.48, 2.22], anchor: 'start' },
    ],
    ground: [1.3, 2],
    loops: [{ name: 'lus', path: [['I', 1], ['R', 1], ['e', 1]] }],
  },
];
