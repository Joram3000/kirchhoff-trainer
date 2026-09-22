import type { CategoryId } from '../types';

/** Categories whose generator grows the circuit (more resistors) as the streak climbs. */
export const SCALING_CATEGORIES: readonly CategoryId[] = ['series', 'parallel', 'mixed'];

/** Every 5 correct answers in a row unlocks one more component, up to `maxLevel` extra. */
export function difficultyLevel(streak: number, maxLevel = 2): number {
  return Math.min(maxLevel, Math.floor(streak / 5));
}
