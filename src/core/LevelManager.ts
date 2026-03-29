export class LevelManager {
  currentStage: number = 1;
  linesThisStage: number = 0;

  getTargetLines(): number {
    return 5 + (this.currentStage - 1) * 3;
  }

  /** Returns true if the stage is now complete. */
  onLinesCleared(count: number): boolean {
    this.linesThisStage += count;
    return this.linesThisStage >= this.getTargetLines();
  }

  advanceStage(): void {
    this.currentStage++;
    this.linesThisStage = 0;
  }

  reset(): void {
    this.currentStage  = 1;
    this.linesThisStage = 0;
  }
}
