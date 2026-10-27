import type { CategoryMeta } from './types';

/** In course order; `group` follows the NET1 week blocks so the tab bar reads like the syllabus. */
export const CATEGORIES: CategoryMeta[] = [
  { id: 'kcl-node', label: 'KCL bij een knooppunt', accent: 'kcl', group: 'Week A–B · Kirchhoff' },
  { id: 'kvl-loop', label: 'KVL in een lus', accent: 'kvl', group: 'Week A–B · Kirchhoff' },
  { id: 'series-vi', label: 'Bronnen in serie (V + I)', accent: 'mixed', group: 'Week A–B · Kirchhoff' },
  { id: 'parallel-vi', label: 'Bronnen in parallel (V + I)', accent: 'mixed', group: 'Week A–B · Kirchhoff' },
  { id: 'power', label: 'Vermogen & tekenconventie', accent: 'mixed', group: 'Week A–B · Kirchhoff' },
  { id: 'series', label: 'Serieschakeling', accent: 'kvl', group: 'Week C · Weerstandsnetwerken' },
  { id: 'parallel', label: 'Parallelschakeling', accent: 'kcl', group: 'Week C · Weerstandsnetwerken' },
  { id: 'mixed', label: 'Gemengde schakeling', accent: 'mixed', group: 'Week C · Weerstandsnetwerken' },
  { id: 'equivalent', label: 'Vervangingsweerstand', accent: 'mixed', group: 'Week C · Weerstandsnetwerken' },
  { id: 'node-voltage', label: 'Knooppuntspanning', accent: 'kcl', group: 'Week D · Knooppuntspanning' },
  { id: 'thevenin', label: 'Thévenin & Norton', accent: 'theorem', group: 'Week E–F · Netwerktheorema’s' },
  { id: 'max-power', label: 'Maximaal vermogen', accent: 'theorem', group: 'Week E–F · Netwerktheorema’s' },
  { id: 'superposition', label: 'Superpositie', accent: 'theorem', group: 'Week E–F · Netwerktheorema’s' },
];
