/**
 * BlockType.ts
 * Enumerates special locked-block variants.
 * NORMAL is the default; others appear with increasing probability by level.
 */
export enum BlockType {
  NORMAL     = 0,
  HARD       = 1,  // immune to bomb blasts; can only be cleared by line-clear
  CHEST      = 2,  // grants a random reward when destroyed or cleared
  POISON     = 3,  // damages the player when cleared by a line-clear
  BOMB_BLOCK = 4,  // explodes in 3×3 when destroyed by a bomb
}

/**
 * Choose a random block type for a newly locked cell.
 * @param level  Current game level (1-based). Special types start at level 2.
 */
export function randomBlockType(level: number): BlockType {
  if (level < 2) return BlockType.NORMAL;
  const specialChance = Math.min(0.10 * (level - 1), 0.40);
  if (Math.random() > specialChance) return BlockType.NORMAL;
  // Equal weight among special types
  const roll = Math.random();
  if (roll < 0.30) return BlockType.HARD;
  if (roll < 0.55) return BlockType.CHEST;
  if (roll < 0.80) return BlockType.POISON;
  return BlockType.BOMB_BLOCK;
}
