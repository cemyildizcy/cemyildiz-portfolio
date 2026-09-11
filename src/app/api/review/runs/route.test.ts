import { describe, expect, it } from "vitest";
import { POST } from "./route";

let ipCounter = 1;

function makeJsonRequest(
  body: unknown,
  options?: {
    method?: string;
    headers?: Record<string, string>;
  },
): Request {
  const method = options?.method ?? "POST";
  const bodyText = typeof body === "string" ? body : JSON.stringify(body);
  const headers = new Headers({
    "content-type": "application/json",
    "x-forwarded-for": `198.51.100.${ipCounter++}`,
    ...options?.headers,
  });

  return new Request("https://cemyildiz.net/api/review/runs", {
    method,
    headers,
    body: method !== "GET" && method !== "HEAD" ? bodyText : undefined,
  });
}

describe("POST /api/review/runs Route Handler", () => {
  const validPayload = {
    claimId: "claim-1",
    mode: "quick",
    clientRequestId: "a0000000-0000-4000-8000-000000000001",
    contractVersion: "1",
  };

  it("returns 200 with required SSE headers for a valid claim-1 quick request", async () => {
    const req = makeJsonRequest(validPayload);
    const res = await POST(req);

    expect(res.status).toBe(200);
    const contentType = res.headers.get("content-type") ?? "";
    expect(contentType).toMatch(/text\/event-stream/);
    expect(contentType).toMatch(/charset=utf-8/);
    expect(res.headers.get("cache-control")).toBe("no-cache, no-transform");
    expect(res.headers.get("connection")).toBe("keep-alive");
    expect(res.headers.get("x-accel-buffering")).toBe("no");

    // Read the stream and verify events
    expect(res.body).toBeDefined();
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }

    expect(text).toContain("event: run.started");
    expect(text).toContain("event: run.verdict");
    expect(text).toContain("event: run.completed");
  });

  it("rejects non-POST HTTP methods", async () => {
    const req = new Request("https://cemyildiz.net/api/review/runs", {
      method: "GET",
    });
    const res = await POST(req);
    expect(res.status).toBe(405);
  });

  it("rejects non-JSON Content-Type with 415 or 400", async () => {
    const req = new Request("https://cemyildiz.net/api/review/runs", {
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect([400, 415]).toContain(res.status);
  });

  it("rejects non-exact MIME types such as application/json-patch+json", async () => {
    const req = new Request("https://cemyildiz.net/api/review/runs", {
      method: "POST",
      headers: {
        "content-type": "application/json-patch+json",
      },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(415);
  });

  it("rejects cross-site requests via Sec-Fetch-Site header", async () => {
    const req = makeJsonRequest(validPayload, {
      headers: {
        "sec-fetch-site": "cross-site",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("rejects oversized request bodies exceeding 4KB", async () => {
    // Generate a payload exceeding 4096 bytes
    const hugePayload = {
      ...validPayload,
      padding: "x".repeat(5000),
    };
    const req = makeJsonRequest(hugePayload);

    const res = await POST(req);
    expect([400, 413]).toContain(res.status);
  });

  it("rejects untrusted origins with 403 Forbidden", async () => {
    const req = makeJsonRequest(validPayload, {
      headers: {
        origin: "https://untrusted-malicious-site.com",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("allows trusted origins such as cemyildiz.net and localhost", async () => {
    const req1 = makeJsonRequest(validPayload, {
      headers: {
        origin: "https://cemyildiz.net",
      },
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);

    const req2 = makeJsonRequest(validPayload, {
      headers: {
        origin: "http://localhost:3000",
      },
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
  });

  it("rejects unknown fields in the request body with 400", async () => {
    const req = makeJsonRequest({
      ...validPayload,
      unexpectedField: "foo",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe("invalid_request");
  });

  it("rejects unsupported contract versions with 409 Conflict", async () => {
    const req = makeJsonRequest({
      ...validPayload,
      contractVersion: "999",
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error.code).toBe("contract_mismatch");
  });

  it("handles draft claims (claim-2) by returning unavailable error event or 400", async () => {
    const req = makeJsonRequest({
      ...validPayload,
      claimId: "claim-2",
    });

    const res = await POST(req);
    if (res.status === 200) {
      // Returned SSE with error event
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
      }
      expect(text).toContain("event: run.error");
      expect(text).toContain('"code":"unavailable"');
    } else {
      expect(res.status).toBe(400);
    }
  });

  it("enforces atomic rate limiting returning 429 when IP limit is exceeded", async () => {
    const { createReviewRunsHandler } = await import("./route");
    const { RateLimiter } = await import("@/lib/review/rate-limit");
    const rateLimiter = new RateLimiter({ limit: 5, windowMs: 60_000 });
    const handler = createReviewRunsHandler({ rateLimiter });

    const clientIp = "198.51.100.222";
    const headers = {
      "x-forwarded-for": clientIp,
    };

    // First 5 requests should pass rate limit (they might return 200)
    for (let i = 0; i < 5; i++) {
      const req = makeJsonRequest(validPayload, { headers });
      const res = await handler(req);
      expect(res.status).toBe(200);
    }

    // 6th request must be rejected with 429
    const req6 = makeJsonRequest(validPayload, { headers });
    const res6 = await handler(req6);
    expect(res6.status).toBe(429);
    expect(res6.headers.get("retry-after")).toBeDefined();

    const data = await res6.json();
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe("rate_limit_exceeded");
    expect(data.error.message).toContain("sınırı");
  });

  it("anonymizes IP immediately and never leaks raw IP in response or logs", async () => {
    const { createReviewRunsHandler } = await import("./route");
    const { MemoryTelemetrySink } = await import("@/lib/review/telemetry");
    const telemetry = new MemoryTelemetrySink();
    const handler = createReviewRunsHandler({ telemetry });

    const rawIp = "203.0.113.88";
    const req = makeJsonRequest(validPayload, {
      headers: {
        "x-forwarded-for": `${rawIp}, 10.0.0.1`,
      },
    });

    const res = await handler(req);
    expect(res.status).toBe(200);

    const logged = telemetry.getEvents();
    for (const event of logged) {
      const str = JSON.stringify(event);
      expect(str).not.toContain(rawIp);
      expect(str).not.toContain("203.0.113");
    }
  });
});
