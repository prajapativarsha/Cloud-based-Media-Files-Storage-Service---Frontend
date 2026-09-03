// src/lib/cache.js
class SimpleCache {
  constructor(ttl = 60000) { // default 60 seconds TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
    });
  }

  invalidate(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const searchCache = new SimpleCache(30000); // 30s cache for search
export const folderCache = new SimpleCache(60000); // 60s cache for folders