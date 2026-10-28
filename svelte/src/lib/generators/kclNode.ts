import type { Position, Problem } from '../types';
import { rnd } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';
import { m, d, num } from '../utils/tex';

const POSITIONS: Position[] = ['boven', 'rechts', 'onder', 'links'];
const LETTERS = ['a', 'b', 'c', 'd'];

export function generateKclNode(): Problem {
  const unknownIdx = rnd(0, 3);
  const dirs = POSITIONS.map(() => (Math.random() < 0.5 ? 'in' : 'out') as 'in' | 'out');
  const values = POSITIONS.map(() => rnd(2, 9));

  let sumIn = 0;
  let sumOut = 0;
  const knownParts: { letter: string; dir: 'in' | 'out'; value: number }[] = [];
  for (let i = 0; i < 4; i++) {
    if (i === unknownIdx) continue;
    if (dirs[i] === 'in') sumIn += values[i];
    else sumOut += values[i];
    knownParts.push({ letter: LETTERS[i], dir: dirs[i], value: values[i] });
  }

  const uDir = dirs[unknownIdx];
  const answer = round2(uDir === 'in' ? sumOut - sumIn : sumIn - sumOut);

  const listOf = (dir: 'in' | 'out') =>
    knownParts
      .filter((k) => k.dir === dir)
      .map((k) => m`i_${k.letter} = ${k.value}\,\mathrm{A}`)
      .join(', ') || 'geen';
  /** The known currents on one side of the KCL equation, written out: "3 + 5", or 0 if there are none. */
  const terms = (dir: 'in' | 'out') =>
    knownParts
      .filter((k) => k.dir === dir)
      .map((k) => num(k.value))
      .join(' + ') || '0';
  const enteringStr = listOf('in');
  const leavingStr = listOf('out');

  const steps = [
    `KCL: de som van de stromen die het knooppunt <b>binnenkomen</b> is gelijk aan de som van de stromen die het <b>verlaten</b>:${d`\sum i_{\mathrm{in}} = \sum i_{\mathrm{uit}}`}`,
    `Binnenkomend (volgens de getekende pijlen): ${enteringStr}.`,
    `Verlatend (volgens de getekende pijlen): ${leavingStr}${uDir === 'out' ? `, en ${m`i_x`}` : ''}.`,
    uDir === 'in'
      ? `Vul in en los op:${d`\begin{aligned} ${terms('in')} + i_x &= ${terms('out')} \\ i_x &= ${sumOut} - ${sumIn} = \boxed{${answer}\,\mathrm{A}} \end{aligned}`}`
      : `Vul in en los op:${d`\begin{aligned} ${terms('in')} &= ${terms('out')} + i_x \\ i_x &= ${sumIn} - ${sumOut} = \boxed{${answer}\,\mathrm{A}} \end{aligned}`}`,
  ];
  if (answer < 0) {
    steps.push(
      `Omdat ${m`i_x`} negatief is, loopt de werkelijke stroom tegengesteld aan de getekende referentiepijl.`,
    );
  }

  return {
    categoryId: 'kcl-node',
    accent: 'kcl',
    title: 'KCL bij een knooppunt',
    question: `Bepaal de onbekende stroom i<sub>x</sub> met behulp van de stroomwet van Kirchhoff (KCL). Let goed op de richting van de pijlen.`,
    unit: 'A',
    answer,
    tolerance: toleranceFor(answer),
    steps,
    circuit: {
      kind: 'kcl-node',
      branches: POSITIONS.map((pos, i) => ({
        pos,
        letter: i === unknownIdx ? 'x' : LETTERS[i],
        dir: dirs[i],
        value: values[i],
        isUnknown: i === unknownIdx,
      })),
    },
  };
}
