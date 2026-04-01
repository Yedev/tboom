import rawData from './levels.json';
import { targetLines, targetScore } from './LevelFormulas';

export interface SlimeConfig {
  firstSpawn: number;
  spawnInterval: number;
  maxCount: number;
  moveSpeed: number;
  jumpVelocity: number;
  jumpInterval: number;
}

export enum BossRule {
  NONE        = 'none',
  BOMB_DISABLED = 'bomb_disabled',  // player cannot place bombs
  GIANT_SLIME   = 'giant_slime',    // slimes are 2× faster and jump 2× higher
}

/** Levels that are BOSS stages (1-based). */
const BOSS_LEVELS = new Set([4, 7, 10]);

function bossRuleForLevel(id: number): BossRule {
  if (!BOSS_LEVELS.has(id)) return BossRule.NONE;
  if (id === 4)  return BossRule.BOMB_DISABLED;
  if (id === 7)  return BossRule.GIANT_SLIME;
  return BossRule.BOMB_DISABLED;  // fallback for extra boss levels
}

export interface LevelConfig {
  id: number;
  targetScore: number;
  targetLines: number;
  isBoss: boolean;
  bossRule: BossRule;
  slime?: SlimeConfig;
}

interface RawLevel {
  id: number;
  slime?: SlimeConfig;
}

const rawLevels: RawLevel[] = rawData.levels as RawLevel[];

function buildConfig(raw: RawLevel): LevelConfig {
  const isBoss = BOSS_LEVELS.has(raw.id);
  return {
    id: raw.id,
    targetScore: targetScore(raw.id),
    targetLines: targetLines(raw.id),
    isBoss,
    bossRule: bossRuleForLevel(raw.id),
    slime: raw.slime,
  };
}

const allLevels: LevelConfig[] = rawLevels.map(buildConfig);

export function getLevelConfig(level: number): LevelConfig {
  const cfg = allLevels.find(l => l.id === level);
  if (cfg) return cfg;
  // Fallback for levels beyond the defined range
  const last = rawLevels[rawLevels.length - 1];
  return buildConfig({ ...last, id: level });
}

export { allLevels };
