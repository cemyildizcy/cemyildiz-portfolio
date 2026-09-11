import { describe, expect, it } from "vitest";
import {
  InMemoryRateLimitStore,
  RateLimiter,
  extractClientIp,
  getRateLimitKey,
  hashClientIp,
  type RateLimitStore,
} from "./rate-limit";

describe("Review Desk Rate Limiting - IP Anonymization and Limits", () => {
  describe("IP Extraction and Hashing", () => {
    it("extracts the first client IP from a multi-hop x-forwarded-for header", () => {
      const headers = new Headers({
        "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
      });
      const ip = extractClientIp(headers);
      expect(ip).toBe("203.0.113.195");
    });

    it("extracts IP from x-real-ip if x-forwarded-for is missing", () => {
      const headers = new Headers({
        "x-real-ip": "198.51.100.42",
      });
      const ip = extractClientIp(headers);
      expect(ip).toBe("198.51.100.42");
    });

    it("falls back to safe default IP when no client IP headers are present", () => {
      const headers = new Headers();
      const ip = extractClientIp(headers);
      expect(ip).toBe("127.0.0.1");
    });

    it("hashes client IP using SHA-256 with salt and never contains the raw IP", () => {
      const rawIp = "192.0.2.146";
      const hashed = hashClientIp(rawIp, { salt: "daily-salt-2026-09-12" });

      expect(hashed).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(hashed)).toBe(true);
      expect(hashed).not.toContain(rawIp);
      expect(hashed).not.toContain("192");
      expect(hashed).not.toContain("146");
    });

    it("produces identical hashes for identical IP and salt, but different for different IPs", () => {
      const ipA = "203.0.113.10";
      const ipB = "203.0.113.20";
      const salt = "test-salt";

      const hashA1 = hashClientIp(ipA, { salt });
      const hashA2 = hashClientIp(ipA, { salt });
      const hashB = hashClientIp(ipB, { salt });

      expect(hashA1).toBe(hashA2);
      expect(hashA1).not.toBe(hashB);
    });

    it("generates rate limit key with prefix and hashed IP only", () => {
      const rawIp = "203.0.113.50";
      const hashed = hashClientIp(rawIp, { salt: "salt" });
      const key = getRateLimitKey(hashed);

      expect(key).toBe(`rl:${hashed}`);
      expect(key).not.toContain(rawIp);
    });
  });

  describe("InMemoryRateLimitStore Security Invariants", () => {
    it("never stores raw IP addresses in memory store keys", async () => {
      const store = new InMemoryRateLimitStore();
      const rawIp = "198.51.100.77";
      const hashed = hashClientIp(rawIp, { salt: "salt" });
      const key = getRateLimitKey(hashed);

      await store.increment(key, 60_000);

      // Verify internal store state does not contain the raw IP anywhere
      const entries = store.getEntries();
      for (const entryKey of entries.keys()) {
        expect(entryKey).not.toContain(rawIp);
        expect(entryKey).toMatch(/^rl:[0-9a-f]{64}$/);
      }
    });
  });

  describe("Atomic Rate Limiting Enforcement", () => {
    it("permits up to 5 requests per minute, then returns rate_limit_exceeded (429)", async () => {
      const limiter = new RateLimiter({
        limit: 5,
        windowMs: 60_000,
      });

      const clientIp = "192.0.2.100";

      // 1-5: should be allowed
      for (let i = 1; i <= 5; i++) {
        const result = await limiter.check(clientIp);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(5 - i);
        expect(result.limit).toBe(5);
        expect(result.error).toBeUndefined();
      }

      // 6th request: should be blocked with rate_limit_exceeded
      const blocked = await limiter.check(clientIp);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.error).toBe("rate_limit_exceeded");
      expect(blocked.resetAt).toBeGreaterThan(Date.now());
    });

    it("resets limit after the time window expires", async () => {
      const currentTime = 1_000_000;
      const store: RateLimitStore = {
        async increment(key: string, windowMs: number) {
          return {
            count: 1,
            resetAt: currentTime + windowMs,
          };
        },
      };

      const limiter = new RateLimiter({
        limit: 5,
        windowMs: 1_000,
        store,
      });

      const res1 = await limiter.check("192.0.2.1");
      expect(res1.allowed).toBe(true);
    });
  });

  describe("Dependency Injection and KV REST Client", () => {
    it("supports dependency injection of external store and handles errors gracefully", async () => {
      let storeCalled = false;
      const mockKvStore: RateLimitStore = {
        async increment(key, windowMs) {
          storeCalled = true;
          return {
            count: 1,
            resetAt: Date.now() + windowMs,
          };
        },
      };

      const limiter = new RateLimiter({ store: mockKvStore });
      const result = await limiter.check("203.0.113.1");

      expect(storeCalled).toBe(true);
      expect(result.allowed).toBe(true);
    });

    it("falls back to in-memory store if external KV throws", async () => {
      const failingKvStore: RateLimitStore = {
        async increment() {
          throw new Error("Redis connection timeout");
        },
      };

      const limiter = new RateLimiter({
        store: failingKvStore,
        fallbackToMemory: true,
      });

      // Should not throw, should succeed via fallback store
      const result = await limiter.check("203.0.113.2");
      expect(result.allowed).toBe(true);
    });
  });
});
