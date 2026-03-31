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

export interface LevelConfig {
  id: number;
  targetScore: number;
  targetLines: number;
  slime?: SlimeConfig;
}

interface RawLevel {
  id: number;
  slime?: SlimeConfig;
}

const rawLevels: RawLevel[] = rawData.levels as RawLevel[];

function buildConfig(raw: RawLevel): LevelConfig {
  return {
    id: raw.id,
    targetScore: targetScore(raw.id),
    targetLines: targetLines(raw.id),
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
