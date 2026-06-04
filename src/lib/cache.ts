type CacheEntry = {
  data: any;
  expiry: number;
};

class SimpleCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, data: any, ttlSeconds: number = 60) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new SimpleCache();
