import type { StorageAdapter } from "./StorageAdapter";

export type LevelProgress = {
  levelId: string;
  completed: boolean;
  bestMirrorMoves: number | null;
  completedAt: string | null;
};

export type ProgressSnapshot = {
  version: 1;
  levels: Record<string, LevelProgress>;
};

const STORAGE_KEY = "prism-lab:progress:v1";

export class ProgressRepository {
  constructor(private readonly storage: StorageAdapter) {}

  getSnapshot(): ProgressSnapshot {
    return this.storage.get<ProgressSnapshot>(STORAGE_KEY, this.createEmptySnapshot());
  }

  getLevelProgress(levelId: string): LevelProgress {
    const snapshot = this.getSnapshot();
    return snapshot.levels[levelId] ?? this.createEmptyLevelProgress(levelId);
  }

  markLevelCompleted(levelId: string, mirrorMoves: number | null = null, completedAt = new Date().toISOString()): void {
    const snapshot = this.getSnapshot();
    const previous = snapshot.levels[levelId] ?? this.createEmptyLevelProgress(levelId);
    snapshot.levels[levelId] = {
      levelId,
      completed: true,
      bestMirrorMoves: this.pickBestMirrorMoves(previous.bestMirrorMoves, mirrorMoves),
      completedAt
    };
    this.storage.set(STORAGE_KEY, snapshot);
  }

  reset(): void {
    this.storage.remove(STORAGE_KEY);
  }

  private createEmptySnapshot(): ProgressSnapshot {
    return {
      version: 1,
      levels: {}
    };
  }

  private createEmptyLevelProgress(levelId: string): LevelProgress {
    return {
      levelId,
      completed: false,
      bestMirrorMoves: null,
      completedAt: null
    };
  }

  private pickBestMirrorMoves(previous: number | null, next: number | null): number | null {
    if (previous === null) return next;
    if (next === null) return previous;
    return Math.min(previous, next);
  }
}
