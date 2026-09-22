export type Orientation = 'horizontal' | 'vertical';

const ZIGZAG_HORIZONTAL: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [-0.6, -1],
  [-0.2, 1],
  [0.2, -1],
  [0.6, 1],
  [1, 0],
];

const ZIGZAG_VERTICAL: ReadonlyArray<readonly [number, number]> = [
  [0, -1],
  [-1, -0.6],
  [1, -0.2],
  [-1, 0.2],
  [1, 0.6],
  [0, 1],
];

/**
 * Builds the zigzag `d` path for a resistor symbol centered on (cx, cy).
 * `length` runs along the resistor's own axis, `thickness` is the zigzag
 * amplitude perpendicular to it — the mapping to x/y flips with orientation.
 */
export function resistorPath(
  cx: number,
  cy: number,
  length: number,
  thickness: number,
  orientation: Orientation,
): string {
  const points = orientation === 'horizontal' ? ZIGZAG_HORIZONTAL : ZIGZAG_VERTICAL;
  const xScale = orientation === 'horizontal' ? length : thickness;
  const yScale = orientation === 'horizontal' ? thickness : length;
  return points
    .map(([px, py], i) => {
      const x = (cx + (px * xScale) / 2).toFixed(1);
      const y = (cy + (py * yScale) / 2).toFixed(1);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}
