import { getLevelConfig, LevelConfig } from '../data/LevelConfig';

export class LevelManager {
  currentStage: number = 1;
  linesThisStage: number = 0;
  private config: LevelConfig;

  constructor() {
    this.config = getLevelConfig(1);
  }

  setStage(stage: number): void {
    this.currentStage = stage;
    this.linesThisStage = 0;
    this.config = getLevelConfig(stage);
  }

  getConfig(): LevelConfig {
    return this.config;
  }

  getTargetLines(): number {
    return this.config.targetLines;
  }

  getTargetScore(): number {
    return this.config.targetScore;
  }

  /** Returns true if the stage is now complete. */
  onLinesCleared(count: number): boolean {
    this.linesThisStage += count;
    return this.linesThisStage >= this.getTargetLines();
  }

  advanceStage(): void {
    this.currentStage++;
    this.linesThisStage = 0;
    this.config = getLevelConfig(this.currentStage);
  }

  reset(): void {
    this.currentStage  = 1;
    this.linesThisStage = 0;
    this.config = getLevelConfig(1);
  }
}
