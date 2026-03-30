import rawData from './levels.json';

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

const allLevels: LevelConfig[] = rawData.levels as LevelConfig[];

export function getLevelConfig(level: number): LevelConfig {
  const cfg = allLevels.find(l => l.id === level);
  if (cfg) return cfg;
  // Fallback for levels beyond the defined range
  const last = allLevels[allLevels.length - 1];
  return { ...last, id: level };
}

export { allLevels };
