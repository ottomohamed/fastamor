// طبقة التخزين المؤقت - تعمل حتى بدون Redis
export class APICache {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  
  constructor() {
    // تنظيف الكاش كل ساعة
    setInterval(() => this.clean(), 3600000);
  }

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    // البحث في الكاش المحلي أولاً
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      console.log(`🎯 Cache HIT: ${key}`);
      return cached.data as T;
    }

    console.log(`⏳ Cache MISS: ${key}`);
    const fresh = await fetcher();
    
    // تخزين في الكاش المحلي
    this.cache.set(key, {
      data: fresh,
      expires: Date.now() + (ttl * 1000)
    });
    
    return fresh;
  }

  private clean() {
    const now = Date.now();
    for (const [key, value] of this.cache) {
      if (value.expires <= now) {
        this.cache.delete(key);
      }
    }
  }
}