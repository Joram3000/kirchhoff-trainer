import type { Position, Problem } from '../types';
import { niceInt, rnd } from '../utils/random';
import { round2, fmt } from '../utils/format';
import { toleranceFor } from '../utils/answer';

const POSITIONS: Position[] = ['boven', 'rechts', 'onder', 'links'];
const LETTERS = ['a', 'b', 'c', 'd'];

export function generateKvlLoop(): Problem {
  const unknownIdx = rnd(0, 3);
  const orients = POSITIONS.map(() => (Math.random() < 0.5 ? 'stijging' : 'daling') as 'stijging' | 'daling');
  const values = POSITIONS.map(() => niceInt(2, 15));

  let sumKnown = 0;
  const knownParts: { letter: string; orient: 'stijging' | 'daling'; value: number }[] = [];
  for (let i = 0; i < 4; i++) {
    if (i === unknownIdx) continue;
    const contrib = orients[i] === 'stijging' ? values[i] : -values[i];
    sumKnown += contrib;
    knownParts.push({ letter: LETTERS[i], orient: orients[i], value: values[i] });
  }

  const uOrient = orients[unknownIdx];
  const answer = round2(uOrient === 'stijging' ? -sumKnown : sumKnown);

  const termsStr = knownParts.map((k) => `${k.orient === 'stijging' ? '+' : '−'}${fmt(k.value)}`).join(' ');
  const unknownTerm = uOrient === 'stijging' ? '+ Vx' : '− Vx';

  const steps = [
    `KVL: doorloop de lus met de klok mee. Een <b>spanningsstijging</b> (van − naar +) tel je als <b>positief</b>, een <b>spanningsdaling</b> (van + naar −) als <b>negatief</b>. De som over de hele lus is nul.`,
    `${termsStr} ${unknownTerm} = 0`,
    `V<sub>x</sub> = ${fmt(answer)} V`,
  ];

  return {
    categoryId: 'kvl-loop',
    accent: 'kvl',
    title: 'KVL in een lus',
    question: `Bepaal de onbekende spanning V<sub>x</sub> met behulp van de spanningswet van Kirchhoff (KVL).`,
    unit: 'V',
    answer,
    tolerance: toleranceFor(answer),
    steps,
    circuit: {
      kind: 'kvl-loop',
      sides: POSITIONS.map((pos, i) => ({
        pos,
        letter: i === unknownIdx ? 'x' : LETTERS[i],
        orient: orients[i],
        value: values[i],
        isUnknown: i === unknownIdx,
      })),
    },
  };
}
