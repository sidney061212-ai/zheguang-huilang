export type StorageAdapter = {
  get<TValue>(key: string, fallback: TValue): TValue;
  set<TValue>(key: string, value: TValue): void;
  remove(key: string): void;
};

export class MemoryStorageAdapter implements StorageAdapter {
  private readonly values = new Map<string, string>();

  get<TValue>(key: string, fallback: TValue): TValue {
    const value = this.values.get(key);
    if (!value) return fallback;
    return JSON.parse(value) as TValue;
  }

  set<TValue>(key: string, value: TValue): void {
    this.values.set(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.values.delete(key);
  }
}
