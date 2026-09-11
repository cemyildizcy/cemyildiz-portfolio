# AI Review Desk Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a safe, cited, streaming AI review experience that visibly demonstrates Cem's research, criticism, verification, and human-control workflow.

**Architecture:** Add an isolated App Router page and a typed POST/SSE route. Treat model output as untrusted, verify every citation against a versioned local corpus, calculate verdicts deterministically, and render only allowlisted React components. Start with a fake-provider tracer; enable a real provider, distributed cache, and public entry point only after corpus and evaluation gates pass.

**Tech Stack:** Next.js 16, React 19, TypeScript, native `fetch`/Web Streams, Vitest, Playwright, existing CSS system.

---

## Delivery rules

- Follow RED–GREEN–REFACTOR for every production behavior.
- Commit each completed task with targeted staging.
- Do not introduce an orchestration framework or runtime schema dependency unless tests prove the handwritten boundary insufficient.
- Do not use `dangerouslySetInnerHTML`, free-form input, uploads, open-web search, raw model output, or chain-of-thought.
- Do not enable a real provider or public home/navigation entry until the content, eval, KV, and secret gates pass.
- Preserve all current routes and content.

### Task 1: Closed contracts and strict parsers

**Objective:** Define the only legal requests, role outputs, findings, receipts, and public events.

**Files:**
- Create: `src/lib/review/contracts.ts`
- Test: `src/lib/review/contracts.test.ts`

**RED:** Add focused tests for valid `claimId`/mode requests, unknown fields, invalid UUID/version, forbidden `reasoning`, oversized strings/arrays, unsafe source values, and closed enums. Run `npm test -- src/lib/review/contracts.test.ts`; confirm expected failures because the parser is absent.

**GREEN:** Implement explicit types plus runtime parsers/type guards with stable public error codes. Keep parser input `unknown`; never coerce unknown fields. Re-run the focused test and full `npm test`.

**Commit:** `feat(review-desk): define strict review contracts`

### Task 2: Versioned corpus and citation verification

**Objective:** Bind claims to human-reviewed source excerpts and reject ungrounded findings deterministically.

**Files:**
- Create: `src/data/review-desk/claims.ts`
- Create: `src/lib/review/corpus.ts`
- Create: `src/lib/review/citations.ts`
- Test: `src/lib/review/citations.test.ts`

**RED:** Test known-source acceptance, unknown source rejection, normalized exact quote matching, quote-not-found, locator mismatch, unsafe URL, duplicate finding, and corpus-hash stability. Confirm focused failure.

**GREEN:** Add three draft claim records, each clearly marked `reviewStatus: "draft"`; only the ML case may contain verified public excerpts at this phase. Implement server-only corpus lookup, SHA-256 integrity, and citation verification. Draft cases must not be executable. Re-run focused and full tests.

**Commit:** `feat(review-desk): add bounded corpus verification`

### Task 3: Deterministic editor and SSE serializer

**Objective:** Compute verdicts and event order without an LLM.

**Files:**
- Create: `src/lib/review/editor.ts`
- Create: `src/lib/review/events.ts`
- Test: `src/lib/review/editor.test.ts`
- Test: `src/lib/review/events.test.ts`

**RED:** Test the complete verdict truth table, material-proposition insufficiency, deduplication, rejected finding preservation, canonical result hashing, monotonic sequence, verdict/receipt/completed ordering, and terminal-event enforcement. Confirm failures.

**GREEN:** Implement pure functions only. Summary text comes from fixed Turkish templates. The receipt must omit prompts, raw output, credentials, endpoints, and IP data. Run focused and full tests.

**Commit:** `feat(review-desk): add deterministic verdict pipeline`

### Task 4: Fake-provider tracer API

**Objective:** Prove one `claim-1 + quick` request from validation through a real SSE response.

**Files:**
- Create: `src/lib/review/provider.ts`
- Create: `src/lib/review/roles.ts`
- Create: `src/lib/review/run.ts`
- Create: `src/app/api/review/runs/route.ts`
- Test: `src/lib/review/run.test.ts`
- Test: `src/app/api/review/runs/route.test.ts`

**RED:** Test validation before provider invocation, exact content type/body limit, origin rejection, fake role parallelism, abort propagation, invalid role output, verified findings only, safe error mapping, required SSE headers, and terminal ordering. Confirm failures.

**GREEN:** Implement dependency-injected fake provider and orchestrator using native promises, `AbortSignal`, and Web Streams. Limit this tracer to approved `claim-1 + quick`; return an explicit unavailable event for draft cases/modes. Run focused tests, full tests, lint, and `npx tsc --noEmit`.

**Commit:** `feat(review-desk): stream verified review runs`

### Task 5: Hybrid production surface

**Objective:** Implement the approved 01+02+03 visual direction as an accessible route.

**Files:**
- Create: `src/app/ai-inceleme-masasi/page.tsx`
- Create: `src/components/review-desk/ReviewDeskClient.tsx`
- Create: `src/components/review-desk/SafeReviewRenderer.tsx`
- Create: `src/components/review-desk/review-desk.css`
- Test: `src/components/review-desk/ReviewDeskClient.test.tsx` only if the current test environment supports DOM tests without adding a heavy dependency
- Modify: `tests/e2e/portfolio.spec.ts`

**RED:** Add Playwright tests first for route metadata, case/mode selection, start/cancel/retry, progressive fake SSE states, visible citation/rejection/verdict/receipt, fixed “Son kontrol: Cem”, keyboard completion, reduced motion, source security attributes, 390 px overflow, and Axe. Confirm new tests fail against the missing route.

**GREEN:** Build the client state machine and allowlisted renderer. Use the existing blue cutting-mat/notebook tokens, mockup 01 flow, mockup 02 editorial finish, and mockup 03 state clarity. Minimum touch target is 44×44 px. Dragging is optional and never required. Run focused E2E, then full E2E, lint, unit, typecheck, and build.

**Commit:** `feat(review-desk): build interactive review surface`

### Task 6: Content and golden evaluation gate

**Objective:** Make all three claims publishable and select real model aliases by evidence.

**Files:**
- Modify: `src/data/review-desk/claims.ts`
- Create: `src/data/review-desk/golden-cases.ts`
- Create: `src/lib/review/evals.ts`
- Test: `src/lib/review/evals.test.ts`
- Create: `reports/ai-review-desk-eval.md`

**RED:** Test six golden scenarios: supported, revise, insufficient, quote mismatch, role failure, and contradiction. Require 100% displayed-citation grounding and zero unsupported definitive verdicts.

**GREEN:** Nolan verifies source metadata/excerpts; Leo defines atomic ML propositions and expected verdicts; Cem's published project evidence supplies project cases. Benchmark candidate quick/balanced models through the same adapter without recording secrets. Record only aliases, aggregate latency, grounding, and verdict outcomes.

**Gate:** Stop if any source/excerpt cannot be independently verified or any candidate misses grounding requirements.

**Commit:** `test(review-desk): establish grounded golden evaluations`

### Task 7: Production resilience

**Objective:** Add distributed rate limiting, verified cache fallback, timeout enforcement, and safe telemetry.

**Files:**
- Create: `src/lib/review/cache.ts`
- Create: `src/lib/review/rate-limit.ts`
- Create: `src/lib/review/telemetry.ts`
- Modify: `src/lib/review/run.ts`
- Modify: `src/app/api/review/runs/route.ts`
- Test: `src/lib/review/cache.test.ts`
- Test: `src/lib/review/rate-limit.test.ts`
- Test: `src/lib/review/run.test.ts`

**RED:** Test atomic limits, no raw-IP storage, cache hash/schema validation, no partial cache writes, 12-second abort, dated timeout fallback, missing-role incomplete review, and secret/raw-output log exclusion.

**GREEN:** Use a Vercel-compatible REST KV through native fetch and dependency injection. Secret names enter only deployment configuration. Run focused integration tests and the complete suite.

**Commit:** `feat(review-desk): harden production review runs`

### Task 8: Independent review and preview release

**Objective:** Prove the feature is secure, understandable, accessible, performant, and reversible before public discovery.

**Files:**
- Modify: `reports/README.md`
- Modify: `Verification.md` if stable new commands are introduced
- Modify: `src/components/layout/Navbar.tsx` and/or `src/app/page.tsx` only after preview approval

**Verification commands:**

```bash
npm audit
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run test:e2e
```

Run targeted secret scanning, dependency audit, hostile input tests, desktop/mobile browser captures, Axe, reduced-motion, keyboard-only completion, timeout/cache/rate-limit integration, and live preview HTTP/DOM checks. Ethan must return no P0/P1 and no unresolved P2 security/accessibility defect.

Conduct 5–8 cold visitor tests. At least 80% must correctly explain Cem's use of research, skepticism, verification, and final human responsibility after 30 seconds.

Only then add a visible home/navigation entry, push the release commit, verify production, and retain a one-commit rollback point.

**Commit:** `feat: publish AI review desk`
