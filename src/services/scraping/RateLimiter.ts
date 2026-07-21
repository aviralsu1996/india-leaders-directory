export class RateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60_000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      const oldest = this.timestamps[0];
      const waitMs = this.windowMs - (now - oldest) + 50;
      await new Promise((r) => setTimeout(r, waitMs));
      return this.acquire();
    }

    this.timestamps.push(Date.now());
  }

  reset(): void {
    this.timestamps = [];
  }
}

export const defaultRateLimiter = new RateLimiter(10, 60_000);
