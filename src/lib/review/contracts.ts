export const CONTRACT_VERSION = "1" as const;

export const CLAIM_IDS = ["claim-1", "claim-2", "claim-3"] as const;
export const REVIEW_MODES = ["quick", "balanced"] as const;
export const ROLE_NAMES = ["researcher", "skeptic", "verifier"] as const;
export const FINDING_STANCES = ["supports", "contradicts", "context"] as const;
export const VERDICTS = ["supported", "revise", "insufficient_evidence"] as const;
export const RESULT_SOURCES = ["live", "cache", "fallback_cache"] as const;
export const RUN_STATUSES = ["researching", "challenging", "verifying", "editing"] as const;
export const REJECTION_CODES = [
  "unknown_source",
  "missing_quote",
  "quote_mismatch",
  "locator_mismatch",
  "unsafe_url",
  "unsupported_component",
  "semantic_mismatch",
  "duplicate_finding",
  "oversized_field",
] as const;
export const PUBLIC_ERROR_CODES = [
  "invalid_request",
  "contract_mismatch",
  "rate_limited",
  "unavailable",
  "timeout",
  "role_failed",
  "internal_error",
] as const;
export const CONTRACT_PARSE_ERROR_CODES = [
  "invalid_type",
  "missing_field",
  "unknown_field",
  "forbidden_field",
  "invalid_enum",
  "invalid_format",
  "too_large",
  "unsafe_url",
  "unsupported_version",
] as const;
export const REVIEW_EVENT_TYPES = [
  "run.started",
  "run.status",
  "role.completed",
  "finding.verified",
  "finding.rejected",
  "run.verdict",
  "run.receipt",
  "run.completed",
  "run.error",
] as const;

export type ClaimId = (typeof CLAIM_IDS)[number];
export type ReviewMode = (typeof REVIEW_MODES)[number];
export type RoleName = (typeof ROLE_NAMES)[number];
export type FindingStance = (typeof FINDING_STANCES)[number];
export type Verdict = (typeof VERDICTS)[number];
export type ResultSource = (typeof RESULT_SOURCES)[number];
export type RunStatus = (typeof RUN_STATUSES)[number];
export type RejectionCode = (typeof REJECTION_CODES)[number];
export type PublicErrorCode = (typeof PUBLIC_ERROR_CODES)[number];
export type ContractParseErrorCode = (typeof CONTRACT_PARSE_ERROR_CODES)[number];
export type ReviewEventType = (typeof REVIEW_EVENT_TYPES)[number];

export interface ReviewRequest {
  claimId: ClaimId;
  mode: ReviewMode;
  clientRequestId: string;
  contractVersion: typeof CONTRACT_VERSION;
}

export interface SourceCitation {
  sourceId: string;
  url: string;
  quote: string;
  locator: string;
}

export interface Finding {
  findingId: string;
  propositionId: string;
  stance: FindingStance;
  summary: string;
  citations: SourceCitation[];
}

export interface RoleOutput {
  role: RoleName;
  summary: string;
  findings: Finding[];
}

export interface VerifiedFinding extends Finding {
  verified: true;
}

export interface RejectedFinding {
  findingId: string;
  propositionId: string;
  role: RoleName;
  summary: string;
  code: RejectionCode;
}

export interface RunReceipt {
  runId: string;
  claimId: ClaimId;
  mode: ReviewMode;
  verdict: Verdict;
  durationMs: number;
  resultSource: ResultSource;
  sourceIds: string[];
  rejectedFindingIds: string[];
  resultHash: string;
  completedAt: string;
  humanReviewLabel: "Son kontrol: Cem.";
}

export type EventPayloadMap = {
  "run.started": { claimId: ClaimId; mode: ReviewMode };
  "run.status": { status: RunStatus; message: string };
  "role.completed": RoleOutput;
  "finding.verified": { finding: VerifiedFinding };
  "finding.rejected": { finding: RejectedFinding };
  "run.verdict": { verdict: Verdict; summary: string };
  "run.receipt": { receipt: RunReceipt };
  "run.completed": { receipt: RunReceipt };
  "run.error": { code: PublicErrorCode; message: string; retryable: boolean };
};

export type ReviewEvent = {
  [K in ReviewEventType]: {
    contractVersion: typeof CONTRACT_VERSION;
    runId: string;
    sequence: number;
    timestamp: string;
    type: K;
    payload: EventPayloadMap[K];
  };
}[ReviewEventType];

export class ContractParseError extends Error {
  constructor(
    public readonly code: ContractParseErrorCode,
    public readonly path: string,
  ) {
    super(`${code} at ${path}`);
    this.name = "ContractParseError";
  }
}

type RecordValue = Record<string, unknown>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA256 = /^[0-9a-f]{64}$/i;
const FORBIDDEN_FIELDS = new Set([
  "reasoning",
  "prompt",
  "rawoutput",
  "chainofthought",
  "credentials",
  "apikey",
]);

function fail(code: ContractParseErrorCode, path: string): never {
  throw new ContractParseError(code, path);
}

function assertNever(value: never): never {
  throw new Error(`Unhandled discriminant: ${JSON.stringify(value)}`);
}

function objectAt(input: unknown, path: string): RecordValue {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    fail("invalid_type", path);
  }
  const proto = Object.getPrototypeOf(input);
  if (proto !== null && proto !== Object.prototype) {
    fail("invalid_type", path);
  }
  return input as RecordValue;
}

function exactObject(input: unknown, keys: readonly string[], path: string): RecordValue {
  const value = objectAt(input, path);
  const ownKeys = Object.keys(value);

  for (const key of ownKeys) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (FORBIDDEN_FIELDS.has(normalized)) {
      fail("forbidden_field", `${path}.${key}`);
    }
    if (!keys.includes(key)) {
      fail("unknown_field", `${path}.${key}`);
    }
  }

  for (const key of keys) {
    if (!Object.hasOwn(value, key)) {
      fail("missing_field", `${path}.${key}`);
    }
  }

  return value;
}

function stringAt(input: unknown, path: string, max: number, pattern?: RegExp): string {
  if (typeof input !== "string") fail("invalid_type", path);
  if (input.length === 0) fail("invalid_format", path);
  if (input.length > max) fail("too_large", path);
  if (pattern && !pattern.test(input)) fail("invalid_format", path);
  return input;
}

function enumAt<const T extends readonly string[]>(input: unknown, values: T, path: string): T[number] {
  if (typeof input !== "string") fail("invalid_type", path);
  if (!(values as readonly string[]).includes(input)) fail("invalid_enum", path);
  return input as T[number];
}

function integerAt(input: unknown, path: string, min: number, max: number): number {
  if (typeof input !== "number") fail("invalid_type", path);
  if (!Number.isSafeInteger(input) || input < min) fail("invalid_format", path);
  if (input > max) fail("too_large", path);
  return input;
}

function booleanAt(input: unknown, path: string): boolean {
  if (typeof input !== "boolean") fail("invalid_type", path);
  return input;
}

function arrayAt<T>(input: unknown, path: string, max: number, parse: (item: unknown, path: string) => T): T[] {
  if (!Array.isArray(input)) fail("invalid_type", path);
  if (input.length > max) fail("too_large", path);
  return input.map((item, index) => parse(item, `${path}[${index}]`));
}

function uuidAt(input: unknown, path: string): string {
  return stringAt(input, path, 36, UUID);
}

function idAt(input: unknown, path: string): string {
  return stringAt(input, path, 100, SAFE_ID);
}

function timestampAt(input: unknown, path: string): string {
  const value = stringAt(input, path, 24);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) || Number.isNaN(Date.parse(value))) {
    fail("invalid_format", path);
  }
  return value;
}

const DISALLOWED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "169.254.169.254",
  "0.0.0.0",
]);

function isPrivateOrLocalIp(hostname: string): boolean {
  if (DISALLOWED_HOSTNAMES.has(hostname.toLowerCase())) return true;
  if (hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return true;
  }
  const ipv4Parts = hostname.split(".");
  if (ipv4Parts.length === 4 && ipv4Parts.every((p) => /^\d+$/.test(p))) {
    const [p0, p1] = ipv4Parts.map(Number);
    if (p0 === 10) return true;
    if (p0 === 127) return true;
    if (p0 === 169 && p1 === 254) return true;
    if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;
    if (p0 === 192 && p1 === 168) return true;
    if (p0 === 0) return true;
  }
  return false;
}

function httpsUrlAt(input: unknown, path: string): string {
  const value = stringAt(input, path, 2048);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return fail("unsafe_url", path);
  }

  if (url.protocol !== "https:") fail("unsafe_url", path);
  if (url.username || url.password) fail("unsafe_url", path);
  if (!url.hostname || url.hash) fail("unsafe_url", path);
  if (url.port !== "" && url.port !== "443") fail("unsafe_url", path);
  if (isPrivateOrLocalIp(url.hostname)) fail("unsafe_url", path);
  if (!url.hostname.includes(".")) fail("unsafe_url", path);

  return url.href;
}

function contractVersionAt(input: unknown, path: string): typeof CONTRACT_VERSION {
  if (typeof input !== "string") fail("invalid_type", path);
  if (input !== CONTRACT_VERSION) fail("unsupported_version", path);
  return CONTRACT_VERSION;
}

export function parseReviewRequest(input: unknown): ReviewRequest {
  const value = exactObject(input, ["claimId", "mode", "clientRequestId", "contractVersion"], "$request");
  return {
    claimId: enumAt(value.claimId, CLAIM_IDS, "$request.claimId"),
    mode: enumAt(value.mode, REVIEW_MODES, "$request.mode"),
    clientRequestId: uuidAt(value.clientRequestId, "$request.clientRequestId"),
    contractVersion: contractVersionAt(value.contractVersion, "$request.contractVersion"),
  };
}

export function parseSourceCitation(input: unknown, path = "$citation"): SourceCitation {
  const value = exactObject(input, ["sourceId", "url", "quote", "locator"], path);
  return {
    sourceId: idAt(value.sourceId, `${path}.sourceId`),
    url: httpsUrlAt(value.url, `${path}.url`),
    quote: stringAt(value.quote, `${path}.quote`, 2000),
    locator: stringAt(value.locator, `${path}.locator`, 200),
  };
}

export function parseFinding(input: unknown, path = "$finding"): Finding {
  const value = exactObject(input, ["findingId", "propositionId", "stance", "summary", "citations"], path);
  return {
    findingId: idAt(value.findingId, `${path}.findingId`),
    propositionId: idAt(value.propositionId, `${path}.propositionId`),
    stance: enumAt(value.stance, FINDING_STANCES, `${path}.stance`),
    summary: stringAt(value.summary, `${path}.summary`, 500),
    citations: arrayAt(value.citations, `${path}.citations`, 10, parseSourceCitation),
  };
}

export function parseRoleOutput(input: unknown, path = "$roleOutput"): RoleOutput {
  const value = exactObject(input, ["role", "summary", "findings"], path);
  return {
    role: enumAt(value.role, ROLE_NAMES, `${path}.role`),
    summary: stringAt(value.summary, `${path}.summary`, 1000),
    findings: arrayAt(value.findings, `${path}.findings`, 20, parseFinding),
  };
}

export function parseVerifiedFinding(input: unknown, path = "$verifiedFinding"): VerifiedFinding {
  const value = exactObject(input, ["findingId", "propositionId", "stance", "summary", "citations", "verified"], path);
  if (typeof value.verified !== "boolean") fail("invalid_type", `${path}.verified`);
  if (value.verified !== true) fail("invalid_format", `${path}.verified`);
  const base = parseFinding({
    findingId: value.findingId,
    propositionId: value.propositionId,
    stance: value.stance,
    summary: value.summary,
    citations: value.citations,
  }, path);
  return { ...base, verified: true };
}

export function parseRejectedFinding(input: unknown, path = "$rejectedFinding"): RejectedFinding {
  const value = exactObject(input, ["findingId", "propositionId", "role", "summary", "code"], path);
  return {
    findingId: idAt(value.findingId, `${path}.findingId`),
    propositionId: idAt(value.propositionId, `${path}.propositionId`),
    role: enumAt(value.role, ROLE_NAMES, `${path}.role`),
    summary: stringAt(value.summary, `${path}.summary`, 500),
    code: enumAt(value.code, REJECTION_CODES, `${path}.code`),
  };
}

export function parseRunReceipt(input: unknown, path = "$receipt"): RunReceipt {
  const keys = [
    "runId",
    "claimId",
    "mode",
    "verdict",
    "durationMs",
    "resultSource",
    "sourceIds",
    "rejectedFindingIds",
    "resultHash",
    "completedAt",
    "humanReviewLabel",
  ] as const;
  const value = exactObject(input, keys, path);
  const label = stringAt(value.humanReviewLabel, `${path}.humanReviewLabel`, 18);
  if (label !== "Son kontrol: Cem.") fail("invalid_enum", `${path}.humanReviewLabel`);
  return {
    runId: uuidAt(value.runId, `${path}.runId`),
    claimId: enumAt(value.claimId, CLAIM_IDS, `${path}.claimId`),
    mode: enumAt(value.mode, REVIEW_MODES, `${path}.mode`),
    verdict: enumAt(value.verdict, VERDICTS, `${path}.verdict`),
    durationMs: integerAt(value.durationMs, `${path}.durationMs`, 0, 120_000),
    resultSource: enumAt(value.resultSource, RESULT_SOURCES, `${path}.resultSource`),
    sourceIds: arrayAt(value.sourceIds, `${path}.sourceIds`, 50, idAt),
    rejectedFindingIds: arrayAt(value.rejectedFindingIds, `${path}.rejectedFindingIds`, 50, idAt),
    resultHash: stringAt(value.resultHash, `${path}.resultHash`, 64, SHA256).toLowerCase(),
    completedAt: timestampAt(value.completedAt, `${path}.completedAt`),
    humanReviewLabel: label,
  };
}

export function parseReviewEvent(input: unknown): ReviewEvent {
  const path = "$event";
  const value = exactObject(input, ["contractVersion", "runId", "sequence", "timestamp", "type", "payload"], path);
  const contractVersion = contractVersionAt(value.contractVersion, `${path}.contractVersion`);
  const runId = uuidAt(value.runId, `${path}.runId`);
  const sequence = integerAt(value.sequence, `${path}.sequence`, 0, Number.MAX_SAFE_INTEGER);
  const timestamp = timestampAt(value.timestamp, `${path}.timestamp`);
  const type = enumAt(value.type, REVIEW_EVENT_TYPES, `${path}.type`);
  const payloadPath = `${path}.payload`;

  switch (type) {
    case "run.started": {
      const p = exactObject(value.payload, ["claimId", "mode"], payloadPath);
      return {
        contractVersion,
        runId,
        sequence,
        timestamp,
        type,
        payload: {
          claimId: enumAt(p.claimId, CLAIM_IDS, `${payloadPath}.claimId`),
          mode: enumAt(p.mode, REVIEW_MODES, `${payloadPath}.mode`),
        },
      };
    }
    case "run.status": {
      const p = exactObject(value.payload, ["status", "message"], payloadPath);
      return {
        contractVersion,
        runId,
        sequence,
        timestamp,
        type,
        payload: {
          status: enumAt(p.status, RUN_STATUSES, `${payloadPath}.status`),
          message: stringAt(p.message, `${payloadPath}.message`, 300),
        },
      };
    }
    case "role.completed": {
      return {
        contractVersion,
        runId,
        sequence,
        timestamp,
        type,
        payload: parseRoleOutput(value.payload, payloadPath),
      };
    }
    case "finding.verified": {
      const p = exactObject(value.payload, ["finding"], payloadPath);
      return {
        contractVersion,
        runId,
        sequence,
        timestamp,
        type,
        payload: {
          finding: parseVerifiedFinding(p.finding, `${payloadPath}.finding`),
        },
      };
    }
    case "finding.rejected": {
      const p = exactObject(value.payload, ["finding"], payloadPath);
      return {
        contractVersion,
        runId,
        sequence,
        timestamp,
        type,
        payload: {
          finding: parseRejectedFinding(p.finding, `${payloadPath}.finding`),
        },
      };
    }
    case "run.verdict": {
      const p = exactObject(value.payload, ["verdict", "summary"], payloadPath);
      return {
        contractVersion,
        runId,
        sequence,
        timestamp,
        type,
        payload: {
          verdict: enumAt(p.verdict, VERDICTS, `${payloadPath}.verdict`),
          summary: stringAt(p.summary, `${payloadPath}.summary`, 1000),
        },
      };
    }
    case "run.receipt":
    case "run.completed": {
      const p = exactObject(value.payload, ["receipt"], payloadPath);
      return {
        contractVersion,
        runId,
        sequence,
        timestamp,
        type,
        payload: {
          receipt: parseRunReceipt(p.receipt, `${payloadPath}.receipt`),
        },
      };
    }
    case "run.error": {
      const p = exactObject(value.payload, ["code", "message", "retryable"], payloadPath);
      return {
        contractVersion,
        runId,
        sequence,
        timestamp,
        type,
        payload: {
          code: enumAt(p.code, PUBLIC_ERROR_CODES, `${payloadPath}.code`),
          message: stringAt(p.message, `${payloadPath}.message`, 300),
          retryable: booleanAt(p.retryable, `${payloadPath}.retryable`),
        },
      };
    }
    default:
      assertNever(type);
  }
}

export function isReviewRequest(input: unknown): input is ReviewRequest {
  try {
    parseReviewRequest(input);
    return true;
  } catch {
    return false;
  }
}

export function isRoleOutput(input: unknown): input is RoleOutput {
  try {
    parseRoleOutput(input);
    return true;
  } catch {
    return false;
  }
}

export function isFinding(input: unknown): input is Finding {
  try {
    parseFinding(input);
    return true;
  } catch {
    return false;
  }
}

export function isVerifiedFinding(input: unknown): input is VerifiedFinding {
  try {
    parseVerifiedFinding(input);
    return true;
  } catch {
    return false;
  }
}

export function isRejectedFinding(input: unknown): input is RejectedFinding {
  try {
    parseRejectedFinding(input);
    return true;
  } catch {
    return false;
  }
}

export function isRunReceipt(input: unknown): input is RunReceipt {
  try {
    parseRunReceipt(input);
    return true;
  } catch {
    return false;
  }
}

export function isReviewEvent(input: unknown): input is ReviewEvent {
  try {
    parseReviewEvent(input);
    return true;
  } catch {
    return false;
  }
}
