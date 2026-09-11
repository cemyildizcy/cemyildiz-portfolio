import type {
  ClaimId,
  PublicErrorCode,
  ResultSource,
  ReviewMode,
  Verdict,
} from "./contracts";

export interface SafeTelemetryEvent {
  eventName:
    | "run.started"
    | "run.completed"
    | "run.error"
    | "cache.hit"
    | "cache.miss"
    | "cache.fallback"
    | "cache.write"
    | "rate_limit.checked"
    | "rate_limit.exceeded";
  timestamp: string;
  runId?: string;
  claimId?: ClaimId;
  mode?: ReviewMode;
  durationMs?: number;
  resultSource?: ResultSource;
  verdict?: Verdict;
  errorCode?: PublicErrorCode | string;
  verifiedCount?: number;
  rejectedCount?: number;
  sourceCount?: number;
  retryable?: boolean;
}

const FORBIDDEN_LOG_KEYS = new Set([
  "prompt",
  "apikey",
  "key",
  "secret",
  "token",
  "credentials",
  "rawoutput",
  "reasoning",
  "chainofthought",
  "ip",
  "clientip",
  "rawip",
  "authorization",
  "cookie",
]);

export function sanitizeTelemetryPayload(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (FORBIDDEN_LOG_KEYS.has(normalized)) {
      continue;
    }
    if (typeof value === "string") {
      // Guard against potential API keys or oversized raw text
      if (value.startsWith("sk-") || value.length > 500) {
        continue;
      }
    }
    clean[key] = value;
  }
  return clean;
}

export interface TelemetrySink {
  log(event: SafeTelemetryEvent): void;
}

export class MemoryTelemetrySink implements TelemetrySink {
  private events: SafeTelemetryEvent[] = [];

  log(event: SafeTelemetryEvent): void {
    const sanitized = sanitizeTelemetryPayload(
      event as unknown as Record<string, unknown>,
    ) as unknown as SafeTelemetryEvent;
    this.events.push(sanitized);
  }

  getEvents(): readonly SafeTelemetryEvent[] {
    return this.events;
  }

  clear(): void {
    this.events = [];
  }
}

export class ConsoleTelemetrySink implements TelemetrySink {
  log(event: SafeTelemetryEvent): void {
    const sanitized = sanitizeTelemetryPayload(
      event as unknown as Record<string, unknown>,
    );
    if (process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify(sanitized));
    }
  }
}

export const defaultTelemetry: TelemetrySink = new ConsoleTelemetrySink();
