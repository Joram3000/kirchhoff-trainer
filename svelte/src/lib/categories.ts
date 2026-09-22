import type { CategoryMeta } from './types';

export const CATEGORIES: CategoryMeta[] = [
  { id: 'kcl-node', label: 'KCL bij een knooppunt', accent: 'kcl' },
  { id: 'kvl-loop', label: 'KVL in een lus', accent: 'kvl' },
  { id: 'series', label: 'Serieschakeling', accent: 'kvl' },
  { id: 'parallel', label: 'Parallelschakeling', accent: 'kcl' },
  { id: 'series-vi', label: 'Bronnen in serie (V + I)', accent: 'mixed' },
  { id: 'parallel-vi', label: 'Bronnen in parallel (V + I)', accent: 'mixed' },
  { id: 'mixed', label: 'Gemengde schakeling', accent: 'mixed' },
  { id: 'node-voltage', label: 'Knooppuntspanning', accent: 'kcl' },
];
