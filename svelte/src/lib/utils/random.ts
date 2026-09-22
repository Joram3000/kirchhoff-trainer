export function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Values as they typically appear in Dorf & Svoboda ch. 1-2 exercises: clean
 * integers, no "odd" primes, so the arithmetic stays approachable.
 */
const NICE_NUMBERS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 18, 20, 22, 24, 25, 26, 28,
  30, 35, 40, 45, 50, 55, 60, 63, 65, 70, 75, 80, 85, 90, 95, 100,
];

export function niceInt(min: number, max: number): number {
  const pool = NICE_NUMBERS.filter((n) => n >= min && n <= max);
  return pool.length > 0 ? pick(pool) : rnd(min, max);
}
