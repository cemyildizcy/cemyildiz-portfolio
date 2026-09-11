import {
  ContractParseError,
  parseReviewRequest,
} from "@/lib/review/contracts";
import {
  type RunReviewOptions,
  runReviewStream,
} from "@/lib/review/run";

const MAX_BODY_BYTES = 4096;

const SSE_HEADERS: Record<string, string> = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  "Connection": "keep-alive",
  "X-Accel-Buffering": "no",
  "X-Content-Type-Options": "nosniff",
};

const ALLOWED_ORIGINS = new Set([
  "https://cemyildiz.net",
  "https://www.cemyildiz.net",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    const normalized = `${parsed.protocol}//${parsed.host.toLowerCase()}`;
    if (ALLOWED_ORIGINS.has(normalized)) {
      return true;
    }
    const vercelProjectUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (vercelProjectUrl && normalized === `https://${vercelProjectUrl.toLowerCase()}`) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function createReviewRunsHandler(options: RunReviewOptions = {}) {
  return async function POST(req: Request): Promise<Response> {
    if (req.method !== "POST") {
      return new Response(null, {
        status: 405,
        headers: {
          Allow: "POST",
        },
      });
    }

    // 1. Origin and Sec-Fetch-Site check
    const secFetchSite = req.headers.get("sec-fetch-site");
    if (secFetchSite && secFetchSite === "cross-site") {
      return new Response(
        JSON.stringify({
          error: {
            code: "forbidden",
            message: "Cross-site requests not allowed",
          },
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const origin = req.headers.get("origin");
    if (!isAllowedOrigin(origin)) {
      return new Response(
        JSON.stringify({
          error: {
            code: "forbidden",
            message: "Origin not allowed",
          },
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 2. Exact Content-Type check
    const rawContentType = req.headers.get("content-type");
    const mimeType = rawContentType
      ? rawContentType.split(";")[0].trim().toLowerCase()
      : "";
    if (mimeType !== "application/json") {
      return new Response(
        JSON.stringify({
          error: {
            code: "invalid_request",
            message: "Content-Type must be application/json",
          },
        }),
        {
          status: 415,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 3. Request body size limit check (4KB)
    const contentLength = req.headers.get("content-length");
    if (contentLength && Number.parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return new Response(
        JSON.stringify({
          error: {
            code: "invalid_request",
            message: `Request body exceeds maximum size of ${MAX_BODY_BYTES} bytes`,
          },
        }),
        {
          status: 413,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const rawText = await req.text();
    if (Buffer.byteLength(rawText, "utf8") > MAX_BODY_BYTES) {
      return new Response(
        JSON.stringify({
          error: {
            code: "invalid_request",
            message: `Request body exceeds maximum size of ${MAX_BODY_BYTES} bytes`,
          },
        }),
        {
          status: 413,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 4. JSON parsing
    let bodyJson: unknown;
    try {
      bodyJson = JSON.parse(rawText);
    } catch {
      return new Response(
        JSON.stringify({
          error: {
            code: "invalid_request",
            message: "Invalid JSON in request body",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 5. Contract validation
    let reviewRequest;
    try {
      reviewRequest = parseReviewRequest(bodyJson);
    } catch (err: unknown) {
      if (err instanceof ContractParseError) {
        if (err.code === "unsupported_version") {
          return new Response(
            JSON.stringify({
              error: {
                code: "contract_mismatch",
                message: `Unsupported contract version: ${err.message}`,
              },
            }),
            {
              status: 409,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        return new Response(
          JSON.stringify({
            error: {
              code: "invalid_request",
              message: err.message,
            },
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({
          error: {
            code: "invalid_request",
            message: "Validation failed",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 6. Run orchestrator and stream SSE
    const stream = await runReviewStream(reviewRequest, {
      ...options,
      signal: req.signal,
    });

    return new Response(stream, {
      status: 200,
      headers: SSE_HEADERS,
    });
  };
}

export const POST = createReviewRunsHandler();
