/**
 * LevelFormulas.ts
 *
 * Configurable formulas for per-level requirements.
 * Change the expressions here to tune difficulty scaling.
 *
 * @param level  - 1-based level number (1, 2, 3, …)
 * @returns      - computed requirement value (floored to integer)
 */

/** Target lines to clear for a given level. */
export function targetLines(level: number): number {
  return Math.floor(2 * level + 1);
}

/** Target score to reach for a given level. */
export function targetScore(level: number): number {
  return Math.floor(500 * level * level - 200 * level + 200);
}
