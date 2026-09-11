import { createHash } from "node:crypto";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  error?: "rate_limit_exceeded";
}

export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
  reset?(key: string): Promise<void>;
}

export function isLoopbackIp(ip: string): boolean {
  const normalized = ip.trim().toLowerCase();
  return (
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "localhost" ||
    normalized.startsWith("127.") ||
    normalized === "::ffff:127.0.0.1" ||
    normalized.startsWith("::ffff:127.")
  );
}

export function extractClientIp(
  headers: Headers | Record<string, string | string[] | undefined>,
): string {
  function getHeader(name: string): string | undefined {
    if (typeof (headers as Headers).get === "function") {
      return (headers as Headers).get(name) ?? undefined;
    }
    const val = (headers as Record<string, string | string[] | undefined>)[name];
    if (Array.isArray(val)) return val[0];
    return val;
  }

  // 1. x-forwarded-for (first IP)
  const xForwardedFor = getHeader("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0].trim();
    if (first.length > 0) return first;
  }

  // 2. x-real-ip
  const xRealIp = getHeader("x-real-ip");
  if (xRealIp && xRealIp.trim().length > 0) {
    return xRealIp.trim();
  }

  // 3. cf-connecting-ip
  const cfConnectingIp = getHeader("cf-connecting-ip");
  if (cfConnectingIp && cfConnectingIp.trim().length > 0) {
    return cfConnectingIp.trim();
  }

  return "127.0.0.1";
}

export function hashClientIp(
  rawIp: string,
  options?: { salt?: string; dateString?: string },
): string {
  const salt =
    options?.salt ??
    process.env.RATE_LIMIT_SALT ??
    process.env.SECRET_SALT ??
    (options?.dateString ?? new Date().toISOString().slice(0, 10));

  return createHash("sha256")
    .update(`${salt}::${rawIp.trim()}`, "utf8")
    .digest("hex")
    .toLowerCase();
}

export function getRateLimitKey(hashedIp: string, prefix = "rl"): string {
  return `${prefix}:${hashedIp}`;
}

export class InMemoryRateLimitStore implements RateLimitStore {
  private entries = new Map<string, { count: number; resetAt: number }>();

  async increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
    const now = Date.now();
    const existing = this.entries.get(key);

    if (!existing || now >= existing.resetAt) {
      const newEntry = { count: 1, resetAt: now + windowMs };
      this.entries.set(key, newEntry);
      return newEntry;
    }

    existing.count += 1;
    return { count: existing.count, resetAt: existing.resetAt };
  }

  async reset(key: string): Promise<void> {
    this.entries.delete(key);
  }

  // Helper for tests to inspect keys and verify NO raw IP is stored
  getEntries(): ReadonlyMap<string, { count: number; resetAt: number }> {
    return this.entries;
  }
}

export interface UpstashRestConfig {
  url: string;
  token: string;
  fetchFn?: typeof fetch;
}

export class UpstashRestRateLimitStore implements RateLimitStore {
  private url: string;
  private token: string;
  private fetchFn: typeof fetch;

  constructor(config: UpstashRestConfig) {
    this.url = config.url.replace(/\/$/, "");
    this.token = config.token;
    this.fetchFn = config.fetchFn ?? fetch;
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
    const pipelineUrl = `${this.url}/pipeline`;
    const res = await this.fetchFn(pipelineUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["PTTL", key],
      ]),
    });

    if (!res.ok) {
      throw new Error(`Upstash RateLimit failed with status ${res.status}`);
    }

    const data = (await res.json()) as [
      { result: number },
      { result: number },
    ];

    const count = data[0]?.result ?? 1;
    let pttl = data[1]?.result ?? -1;

    if (pttl <= 0) {
      // First hit: set expiration
      await this.fetchFn(`${this.url}/pexpire/${encodeURIComponent(key)}/${windowMs}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` },
      });
      pttl = windowMs;
    }

    return {
      count,
      resetAt: Date.now() + (pttl > 0 ? pttl : windowMs),
    };
  }

  async reset(key: string): Promise<void> {
    await this.fetchFn(`${this.url}/del/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }
}

export interface RateLimiterOptions {
  limit?: number; // default: 5 requests
  windowMs?: number; // default: 60,000ms (1 minute)
  store?: RateLimitStore;
  fallbackToMemory?: boolean;
  salt?: string;
}

export class RateLimiter {
  private explicitLimit?: number;
  private limit: number;
  private windowMs: number;
  private store: RateLimitStore;
  private fallbackStore: InMemoryRateLimitStore;
  private fallbackToMemory: boolean;
  private salt?: string;

  constructor(options: RateLimiterOptions = {}) {
    this.explicitLimit = options.limit;
    this.limit = options.limit ?? 5;
    this.windowMs = options.windowMs ?? 60_000;
    this.fallbackStore = new InMemoryRateLimitStore();
    this.fallbackToMemory = options.fallbackToMemory ?? true;
    this.salt = options.salt;

    if (options.store) {
      this.store = options.store;
    } else {
      const restUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
      const restToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
      if (restUrl && restToken) {
        this.store = new UpstashRestRateLimitStore({
          url: restUrl,
          token: restToken,
        });
      } else {
        this.store = this.fallbackStore;
      }
    }
  }

  async check(
    rawIpOrHashed: string,
    isAlreadyHashed = false,
    options?: { isLoopback?: boolean },
  ): Promise<RateLimitResult> {
    const isLoopback =
      options?.isLoopback ??
      (!isAlreadyHashed && isLoopbackIp(rawIpOrHashed));
    const effectiveLimit =
      this.explicitLimit !== undefined
        ? this.explicitLimit
        : isLoopback
          ? 50
          : this.limit;

    const hashed = isAlreadyHashed
      ? rawIpOrHashed
      : hashClientIp(rawIpOrHashed, { salt: this.salt });
    const key = getRateLimitKey(hashed);

    let count: number;
    let resetAt: number;

    try {
      const res = await this.store.increment(key, this.windowMs);
      count = res.count;
      resetAt = res.resetAt;
    } catch {
      if (this.fallbackToMemory && this.store !== this.fallbackStore) {
        const res = await this.fallbackStore.increment(key, this.windowMs);
        count = res.count;
        resetAt = res.resetAt;
      } else {
        throw new Error("Rate limiting failed");
      }
    }

    if (count > effectiveLimit) {
      return {
        allowed: false,
        limit: effectiveLimit,
        remaining: 0,
        resetAt,
        error: "rate_limit_exceeded",
      };
    }

    return {
      allowed: true,
      limit: effectiveLimit,
      remaining: Math.max(0, effectiveLimit - count),
      resetAt,
    };
  }
}

export const defaultRateLimiter = new RateLimiter();

export async function checkRateLimit(
  req: Request,
  options?: RateLimiterOptions,
): Promise<RateLimitResult> {
  const ip = extractClientIp(req.headers);
  const limiter = options ? new RateLimiter(options) : defaultRateLimiter;
  return limiter.check(ip);
}
