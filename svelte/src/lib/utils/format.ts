export function round2(n: number): number {
  let r = Math.round(n * 100) / 100;
  if (Object.is(r, -0)) r = 0;
  return r;
}

/** Formats a number with a Dutch decimal comma, trimming trailing zeros. */
export function fmt(n: number): string {
  const r = round2(n);
  let s = r.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  if (s === '' || s === '-') s = '0';
  return s.replace('.', ',');
}
