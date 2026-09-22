/** Parses user input, accepting a Dutch decimal comma as well as a dot. */
export function parseAnswer(raw: string): number {
  const s = raw.trim().replace(/\s/g, '').replace(',', '.');
  if (s === '') return NaN;
  return parseFloat(s);
}

export function isWithinTolerance(value: number, answer: number, tolerance: number): boolean {
  return Math.abs(value - answer) <= tolerance;
}

/** A 2%-of-magnitude tolerance (minimum 0.05) absorbs rounding in the steps. */
export function toleranceFor(answer: number): number {
  return Math.max(0.05, Math.abs(answer) * 0.02);
}
