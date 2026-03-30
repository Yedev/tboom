const STORAGE_KEY = 'tboom_level_progress';
export const MAX_LEVELS = 10;

export class LevelProgress {
  private static instance: LevelProgress;

  unlockedLevel: number = 1;
  clearedLevels: Set<number> = new Set();

  static getInstance(): LevelProgress {
    if (!LevelProgress.instance) {
      LevelProgress.instance = new LevelProgress();
      LevelProgress.instance.load();
    }
    return LevelProgress.instance;
  }

  isUnlocked(level: number): boolean {
    return level <= this.unlockedLevel;
  }

  isCleared(level: number): boolean {
    return this.clearedLevels.has(level);
  }

  isFirstClear(level: number): boolean {
    return !this.clearedLevels.has(level);
  }

  markCleared(level: number): void {
    if (level < 1 || level > MAX_LEVELS) return;
    this.clearedLevels.add(level);
    if (level >= this.unlockedLevel && level < MAX_LEVELS) {
      this.unlockedLevel = level + 1;
    }
    this.save();
  }

  reset(): void {
    this.unlockedLevel = 1;
    this.clearedLevels.clear();
    this.save();
  }

  save(): void {
    const data = {
      unlockedLevel: this.unlockedLevel,
      clearedLevels: Array.from(this.clearedLevels),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }

  load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.unlockedLevel = data.unlockedLevel ?? 1;
        this.clearedLevels = new Set(data.clearedLevels ?? []);
      }
    } catch {
      // Ignore parse errors, use defaults
    }
  }
}
