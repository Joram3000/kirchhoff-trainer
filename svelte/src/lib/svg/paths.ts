export type Orientation = 'horizontal' | 'vertical';

/** The zigzag body never grows past this; any extra `length` becomes straight lead wire. */
const MAX_BODY = 34;
const MAX_AMPLITUDE = 6;
const PEAKS = 6;

/**
 * Builds the `d` path for a resistor symbol centered on (cx, cy): a compact
 * zigzag of three full periods with straight leads filling the rest of
 * `length`, so callers can reserve any span without the symbol looking coarse.
 * `length` runs along the resistor's own axis, `thickness` caps the zigzag
 * height perpendicular to it — the mapping to x/y flips with orientation.
 */
export function resistorPath(
  cx: number,
  cy: number,
  length: number,
  thickness: number,
  orientation: Orientation,
): string {
  const body = Math.min(length, MAX_BODY);
  const amp = Math.min(thickness / 2, MAX_AMPLITUDE);
  const along: [number, number][] = [
    [-length / 2, 0],
    [-body / 2, 0],
    ...Array.from({ length: PEAKS }, (_, k): [number, number] => [
      -body / 2 + ((2 * k + 1) * body) / (2 * PEAKS),
      k % 2 === 0 ? -amp : amp,
    ]),
    [body / 2, 0],
    [length / 2, 0],
  ];
  return along
    .map(([a, b], i) => {
      const x = (orientation === 'horizontal' ? cx + a : cx + b).toFixed(1);
      const y = (orientation === 'horizontal' ? cy + b : cy + a).toFixed(1);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}
