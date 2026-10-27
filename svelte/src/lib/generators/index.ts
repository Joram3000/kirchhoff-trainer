import type { CategoryId, Problem } from '../types';
import { generateKclNode } from './kclNode';
import { generateKvlLoop } from './kvlLoop';
import { generateSeries } from './series';
import { generateParallel } from './parallel';
import { generateMixed } from './mixed';
import { generateNodeVoltage } from './nodeVoltage';
import { generateSeriesVI } from './seriesVI';
import { generateParallelVI } from './parallelVI';
import { generatePower } from './power';
import { generateEquivalent } from './equivalent';
import { generateThevenin } from './thevenin';
import { generateMaxPower } from './maxPower';
import { generateSuperposition } from './superposition';

export const generators: Record<CategoryId, (streak: number) => Problem> = {
  'kcl-node': generateKclNode,
  'kvl-loop': generateKvlLoop,
  series: generateSeries,
  parallel: generateParallel,
  mixed: generateMixed,
  'node-voltage': generateNodeVoltage,
  'series-vi': generateSeriesVI,
  'parallel-vi': generateParallelVI,
  power: generatePower,
  equivalent: generateEquivalent,
  thevenin: generateThevenin,
  'max-power': generateMaxPower,
  superposition: generateSuperposition,
};
