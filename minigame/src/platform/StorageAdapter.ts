export type StorageAdapter = {
  get<TValue>(key: string, fallback: TValue): TValue;
  set<TValue>(key: string, value: TValue): void;
  remove(key: string): void;
};

export class MemoryStorageAdapter implements StorageAdapter {
  private readonly values = new Map<string, string>();

  get<TValue>(key: string, fallback: TValue): TValue {
    const value = this.values.get(key);
    if (value === undefined) return fallback;
    try {
      return JSON.parse(value) as TValue;
    } catch {
      return fallback;
    }
  }

  set<TValue>(key: string, value: TValue): void {
    this.values.set(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.values.delete(key);
  }
}

export type SyncKeyValueStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export class JsonStorageAdapter implements StorageAdapter {
  constructor(private readonly storage: SyncKeyValueStorage) {}

  get<TValue>(key: string, fallback: TValue): TValue {
    const value = this.storage.getItem(key);
    if (value === null) return fallback;
    try {
      return JSON.parse(value) as TValue;
    } catch {
      return fallback;
    }
  }

  set<TValue>(key: string, value: TValue): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }
}
