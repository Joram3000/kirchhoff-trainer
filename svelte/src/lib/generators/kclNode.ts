import type { Position, Problem } from '../types';
import { rnd } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';

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

  const enteringStr =
    knownParts
      .filter((k) => k.dir === 'in')
      .map((k) => `i<sub>${k.letter}</sub> = ${fmt(k.value)} A`)
      .join(', ') || 'geen';
  const leavingStr =
    knownParts
      .filter((k) => k.dir === 'out')
      .map((k) => `i<sub>${k.letter}</sub> = ${fmt(k.value)} A`)
      .join(', ') || 'geen';

  const steps = [
    `KCL: de som van de stromen die het knooppunt <b>binnenkomen</b> is gelijk aan de som van de stromen die het <b>verlaten</b>.`,
    `Binnenkomend (volgens de getekende pijlen): ${enteringStr}.`,
    `Verlatend (volgens de getekende pijlen): ${leavingStr}${uDir === 'out' ? ', en i<sub>x</sub>' : ''}.`,
    uDir === 'in'
      ? `${fmt(sumIn)} + i<sub>x</sub> = ${fmt(sumOut)}  →  i<sub>x</sub> = ${fmt(sumOut)} − ${fmt(sumIn)} = ${fmt(answer)} A`
      : `${fmt(sumIn)} = ${fmt(sumOut)} + i<sub>x</sub>  →  i<sub>x</sub> = ${fmt(sumIn)} − ${fmt(sumOut)} = ${fmt(answer)} A`,
  ];
  if (answer < 0) {
    steps.push(
      `Omdat i<sub>x</sub> negatief is, loopt de werkelijke stroom tegengesteld aan de getekende referentiepijl.`,
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
