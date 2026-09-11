# AI Review Desk Design

**Status:** Approved direction, implementation pending

**Date:** 2026-09-11

**Primary route:** `/ai-inceleme-masasi`

## 1. Product intent

AI Review Desk turns Cem's AI-first working method into a real, inspectable experience. A visitor selects one of three bounded claims and watches independent roles research, challenge, and verify the same evidence packet before a deterministic editor produces a cited verdict.

The experience must demonstrate orchestration rather than claim expertise. Cem remains presented as an ESOGU Mathematics and Computer Science student strengthening his ML foundations and preparing for deep learning.

### Success criterion

After 30 seconds, at least 80% of cold-test visitors should be able to explain that Cem uses AI to separate research, criticism, and verification, while retaining human responsibility for the final publication decision.

## 2. Experience contract

### First viewport

The existing identity, profile, CV, projects, blog, and links remain intact. The new route opens as an editorial review desk that combines:

- the physical evidence flow of mockup 01;
- the typographic and publishing craft of mockup 02;
- the explicit hypothesis, observation, rejection, and verdict structure of mockup 03.

The primary action is to choose a case and start a review. Dragging may be offered, but every action must have a visible button and keyboard equivalent.

### Initial cases

1. **ML:** “Does high accuracy show that a model is reliable?”
2. **GündemAI:** “Do different sources describe the same event in the same way?”
3. **Portfolio:** “Did AI only generate this project, or did it also criticize and verify the work?”

Exact atomic propositions and source excerpts are a content gate. No case ships until its corpus has human-reviewed sources, verbatim excerpts, locators, and hashes.

### Modes

- **Quick:** researcher and skeptic, one verification pass.
- **Balanced:** researcher, skeptic, and verifier, with the full deterministic verdict gate.

The interface may use “Acımasız” as a future mode only after the MVP meets latency and grounding targets.

### Visible roles

Roles are represented by work, not avatars:

- **Researcher:** finds bounded evidence.
- **Skeptic:** seeks counterexamples and missing assumptions.
- **Verifier:** checks source identity, excerpt match, scope, and contradiction.
- **Editor:** deterministic code; combines only verified findings.

The UI must never show hidden chain-of-thought. It shows short role summaries, evidence, rejection reasons, and verdict rules.

### Verdicts

- Supported
- Revise
- Insufficient evidence

Every completed result includes sources, rejected findings, run ID, duration, live/cache status, and the fixed label **“Son kontrol: Cem.”**

## 3. Visual direction

The surface extends the existing blue cutting-mat and research-notebook world. It uses paper, editorial rules, graphite, source slips, red correction marks, and restrained yellow selection states.

A single orchestrated interaction is the memorable moment: verified evidence slips arrive, a weak sentence is visibly rejected, and the final verdict is stamped. No confetti, particle field, robot portrait, fake terminal, glass panel, neon gradient, technology-logo wall, or generic dashboard grid.

Desktop uses a case tray, central review document, and source margin. Mobile becomes a single vertical review ledger. Reduced-motion mode reveals the same states without translation or rotation.

### Accessibility

- Full keyboard operation and visible focus.
- Minimum 44×44 px touch targets.
- `aria-live="polite"` summary for progress; no noisy per-token announcements.
- Color never carries state alone.
- Source links have descriptive labels.
- No forced drag interaction.
- No horizontal overflow at 390 px.

## 4. Scope

### MVP includes

- One independent App Router page.
- Exactly three closed claims.
- Quick and Balanced modes.
- One server-side model provider behind an adapter.
- Three bounded role runners.
- Deterministic citation verification and editing.
- Typed `POST` plus SSE stream.
- Versioned, read-only local corpus.
- Distributed rate limit and verified-result cache.
- Timeout fallback with an explicit last-verified label.
- Run receipt, sources, rejections, and human-review label.

### MVP excludes

- Free-form prompts.
- File or URL uploads.
- Live open-web search.
- User accounts or persistent personalization.
- Model-generated HTML, JavaScript, CSS, or arbitrary UI.
- Raw model output or chain-of-thought.
- Automatic provider routing.
- Voice agents.
- A2UI or AG-UI as mandatory dependencies.
- Redesign of existing portfolio pages.

## 5. Architecture

### Route and components

- `src/app/ai-inceleme-masasi/page.tsx`: server page and metadata.
- `src/components/review-desk/ReviewDeskClient.tsx`: client state machine and stream consumption.
- `src/components/review-desk/SafeReviewRenderer.tsx`: allowlisted rendering only.
- `src/app/api/review/runs/route.ts`: request validation, rate limit, cache, timeout, orchestration, and SSE.
- `src/lib/review/contracts.ts`: closed runtime schemas and public types.
- `src/lib/review/corpus.ts`: server-only corpus repository and integrity checks.
- `src/lib/review/provider.ts`: server-only provider adapter using native `fetch`.
- `src/lib/review/roles.ts`: bounded parallel role execution.
- `src/lib/review/citations.ts`: deterministic source and excerpt verification.
- `src/lib/review/editor.ts`: deterministic final verdict and receipt.
- `src/lib/review/cache.ts`: verified-result cache repository.
- `src/lib/review/rate-limit.ts`: distributed request limiter.
- `src/data/review-desk/*.json`: reviewed claims and source excerpts.

No orchestration framework is required for the MVP. Runtime validation uses small explicit TypeScript parsers and type guards unless tests prove a dependency is justified.

### Client state machine

`idle → connecting → running → completed | fallback_completed | rate_limited | failed | cancelled`

A new run aborts the previous request. A terminal event closes the run; subsequent events with the same run ID are ignored.

### API

`POST /api/review/runs`

Request:

```json
{
  "claimId": "claim-1",
  "mode": "quick",
  "clientRequestId": "uuid",
  "contractVersion": "1"
}
```

Validation:

- maximum 2 KB body;
- exact JSON content type;
- unknown fields rejected;
- closed claim and mode allowlists;
- contract mismatch returns `409`;
- production origin allowlist;
- invalid requests never reach corpus, cache, or provider code.

Response is `text/event-stream` with `Cache-Control: no-cache, no-transform`, `X-Content-Type-Options: nosniff`, and `X-Accel-Buffering: no`.

### SSE contract

Allowed events:

1. `run.started`
2. `run.status`
3. `role.completed`
4. `finding.verified`
5. `finding.rejected`
6. `run.verdict`
7. `run.receipt`
8. `run.completed`
9. `run.error`

Every event has contract version, run ID, monotonic sequence, timestamp, and an event-specific payload. `run.verdict`, `run.receipt`, and `run.completed` are emitted in that order. `run.completed` or `run.error` is terminal. Model tokens and raw provider text never enter the stream.

### Corpus integrity

Each claim is split into atomic propositions and bound to at least two human-selected sources. Sources store HTTPS URL, publisher, dates, locator, bounded verbatim excerpt, license note, and normalized excerpt SHA-256.

Citation verification rejects unknown source IDs, missing quotes, quote/excerpt mismatches, unsafe URLs, unsupported components, oversized fields, and duplicate findings. A confidence score may rank findings but never serves as proof.

### Deterministic editor

The editor is not an LLM. It deduplicates verified atomic findings, applies fixed verdict rules, emits public components, and hashes the canonical result. A material proposition without verified support prevents a fully supported verdict.

## 6. Reliability and security

- Treat every model output as untrusted data.
- Keep provider credentials server-side and out of logs, receipts, and bundles.
- Use native `fetch` with `AbortSignal`; total run deadline is 12 seconds.
- Run genuinely independent roles in parallel; do not add decorative personas.
- Cache only fully validated results.
- On timeout, show a dated, verified cached result with an explicit fallback label.
- If one required role fails, show “incomplete review” and withhold a definitive verdict.
- Derive rate-limit keys without storing raw IP addresses.
- Enforce production and preview origin allowlists without wildcards.
- Render text as React text nodes; never use `dangerouslySetInnerHTML`.
- Permit only validated HTTPS source URLs with `noopener noreferrer`.
- Log run stages, safe role status, durations, cache state, source IDs, and rejection codes; never log prompts, excerpts beyond approved public data, secrets, or raw model output.

## 7. Performance budgets

- First meaningful status or cached artifact: ≤2 seconds.
- Live verdict target: ≤8 seconds; hard deadline: 12 seconds.
- p95 completed experience: <12 seconds.
- No layout shift from arriving evidence slips.
- The route must preserve current home-page performance and bundle behavior.

## 8. TDD and evaluation gates

Implementation follows RED–GREEN–REFACTOR. Required test layers:

### Unit

- strict request and role-output parsing;
- citation normalization and exact excerpt matching;
- unsafe URL and unknown source rejection;
- deterministic verdict truth table;
- SSE ordering and terminal invariants;
- canonical receipt hashing;
- cache integrity checks.

### Integration

- route validation before provider execution;
- parallel role behavior and abort propagation;
- 12-second timeout;
- verified-cache hit and timeout fallback;
- invalid model output rejection;
- distributed rate-limit behavior;
- no partial cache write.

### E2E

- all three cases and both modes;
- progressive event rendering;
- visible source, rejection, verdict, receipt, and “Son kontrol: Cem” states;
- keyboard completion, cancellation, focus management, and reduced motion;
- 390 px mobile without horizontal overflow;
- Axe critical/serious violations: zero;
- existing portfolio routes remain functional.

### Golden evaluation

Before a real provider is enabled, define six versioned golden cases covering supported, revise, insufficient, quote mismatch, role failure, and contradiction. Release requires 100% citation grounding for displayed findings and zero unsupported definitive verdicts.

## 9. Release strategy

1. Build contracts, parsers, citation verifier, deterministic editor, and tests.
2. Ship one `claim-1 + quick` tracer path using a fake provider.
3. Add the real provider only after golden evaluation.
4. Add distributed cache, rate limit, fallback, and observability.
5. Complete all cases, modes, responsive states, and accessibility checks.
6. Deploy to preview with pre-verified cache records.
7. Conduct 5–8 cold visitor tests.
8. Publish only after security review, source approval, full CI, live HTTP/DOM verification, and rollback readiness.

## 10. Implementation gate

Production coding may start on the deterministic core and fake-provider tracer. A live provider and public deployment remain blocked until:

- all three claim corpora and atomic propositions are human-reviewed;
- six golden expected results are recorded;
- candidate models pass the same evaluation;
- a Vercel-compatible distributed KV choice is confirmed;
- required secret names are configured through the deployment environment without exposing values.

## 11. Approved prototypes

All three prototypes are retained as complementary design evidence:

- `sketches/ai-inceleme-masasi/01-kanit-akisi/`
- `sketches/ai-inceleme-masasi/02-vaka-dosyasi/`
- `sketches/ai-inceleme-masasi/03-inceleme-panosu/`

Production direction: mockup 01 interaction model, mockup 02 editorial finish, mockup 03 scientific state clarity.
