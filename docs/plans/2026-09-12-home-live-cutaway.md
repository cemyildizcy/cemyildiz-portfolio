# Home Live Cutaway Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Migrate the approved Mavi Masa / Canlı Kesit mockup into the Next.js homepage while preserving every current route, project, article, social link, education/CV detail, and AI İnceleme Masası behavior.

**Architecture:** Keep `page.tsx` as the server-rendered page composer and blog reader. Make project content explicit in `src/data/projects.ts`; let `EvidenceDesk.tsx` own only the two tab states and accessible interaction. Reproduce the approved composition with semantic HTML and CSS, including a bounded native scroll region for the mobile WC2026 graph, without adding dependencies.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4/global CSS, Vitest, Playwright, `@axe-core/playwright`.

**Design contract:** `docs/superpowers/specs/2026-09-12-home-live-cutaway-design.md`

**TDD rule:** Every vertical slice follows RED, verify RED, GREEN, verify GREEN, then refactor. A RED run must fail because the named behavior is absent or incorrect, not because the test cannot compile. Do not edit production code before the corresponding RED result is observed.

---

## Task 0: Establish a preservation baseline

**Objective:** Prove the existing non-homepage behavior is green before changing the homepage.

**Files:**
- Read: `docs/superpowers/specs/2026-09-12-home-live-cutaway-design.md`
- Read: `sketches/home-mavi-masa-canli-kesit/README.md`
- Read: `sketches/home-mavi-masa-canli-kesit/verification.json`
- Read: `tests/e2e/portfolio.spec.ts`
- No production edits

**Step 1: Confirm the working tree and dependency manifest**

Run:

```bash
git status --short
node -e "const p=require('./package.json'); console.log(p.dependencies); console.log(p.devDependencies)"
```

Expected: pre-existing changes are identified and protected; current dependencies are recorded. Do not install a package.

**Step 2: Run the current focused suites**

Run:

```bash
npm test -- src/data/projects.test.ts
npx playwright test tests/e2e/portfolio.spec.ts --grep "İnceleme Masası|claim-1|iptal|erişilemezlik"
```

Expected: PASS. If not, stop and separate the baseline failure from homepage work.

**Step 3: Start the implementation branch checkpoint**

```bash
git add docs/superpowers/specs/2026-09-12-home-live-cutaway-design.md docs/plans/2026-09-12-home-live-cutaway.md
git commit -m "docs: specify homepage live cutaway migration"
```

Expected: only the two approved documents are committed. If the execution request prohibits commits, skip this step and preserve the same file isolation.

---

## Task 1: Make layer semantics explicit in the project catalog

**Objective:** Give the UI a typed, truthful source for Çıktı, Karar, AI desteği, and Sınırlar without indexing arbitrary arrays or duplicating claims.

**Files:**
- Modify: `src/data/projects.test.ts`
- Modify: `src/data/projects.ts`

**Step 1 — RED: Add catalog contract tests**

Add assertions that:

```ts
expect(projects.map((project) => project.slug)).toEqual([
  "gundem-ai",
  "wc2026-ai-simulator",
  "sleepinfo",
]);

for (const project of projects) {
  expect(Object.keys(project.layers)).toEqual(["output", "decision", "ai", "limits"]);
  expect(project.layers.output.title).toBeTruthy();
  expect(project.layers.decision.title).toBeTruthy();
  expect(project.layers.ai.title).toBeTruthy();
  expect(project.layers.limits.title).toBeTruthy();
  expect(project.caseHref).toBe(`/work/${project.slug}`);
}

expect(getProject("wc2026-ai-simulator")?.image?.src).toBe(
  "/images/projects/wc2026/champion-probabilities.png",
);
```

Also retain existing assertions for exact slugs, verified links, limitations, and missing project lookup.

**Step 2 — Verify RED**

Run:

```bash
npm test -- src/data/projects.test.ts
```

Expected: FAIL because `layers` and `caseHref` do not exist.

**Step 3 — GREEN: Add the minimum typed layer model**

In `src/data/projects.ts`, add:

```ts
export const layerOrder = ["output", "decision", "ai", "limits"] as const;
export type LayerKey = (typeof layerOrder)[number];
export type ProjectLayer = {
  label: string;
  title: string;
  body: string;
  facts: string[];
  note: string;
};
```

Extend `Project` with `caseHref`, a short file label, and `layers: Record<LayerKey, ProjectLayer>`. Populate all four layers for every current project from existing truthful `evidence`, `contribution`, `aiRole`, `limits`, and approved mockup copy. Keep existing fields until case-route consumers are migrated or proven unnecessary; do not weaken current case pages.

**Step 4 — Verify GREEN**

Run:

```bash
npm test -- src/data/projects.test.ts
npm test
```

Expected: PASS for the catalog and full Vitest suite, including all existing `/api/review/runs` unit tests.

**Step 5 — Refactor and checkpoint**

Remove only obvious text duplication that has no existing consumer. Run `npm test` again, then:

```bash
git add src/data/projects.ts src/data/projects.test.ts
git commit -m "refactor: model project evidence layers"
```

---

## Task 2: Build the accessible live-cutaway interaction

**Objective:** Implement independent project and layer tablists, with WC2026/Çıktı selected by default and correct reset behavior.

**Files:**
- Create: `src/components/EvidenceDesk.test.tsx`
- Modify: `src/components/EvidenceDesk.tsx`
- Modify only if Vitest DOM setup is absent: `vitest.config.ts`
- Create only if required by current config: `src/test/setup.ts`

**Step 1 — RED: Test default and click behavior**

Using the repository’s existing Vitest environment, add behavior-first component tests. If React DOM test helpers are unavailable, do not add a dependency: extract and test a small exported state reducer from `EvidenceDesk.tsx` or `src/components/evidenceDeskState.ts`, then leave DOM semantics to Playwright.

Required assertions:

```ts
expect(initialEvidenceDeskState).toEqual({
  projectSlug: "wc2026-ai-simulator",
  layer: "output",
});
expect(selectLayer(initialEvidenceDeskState, "limits").layer).toBe("limits");
expect(selectProject({ projectSlug: "sleepinfo", layer: "ai" }, "gundem-ai")).toEqual({
  projectSlug: "gundem-ai",
  layer: "output",
});
```

**Step 2 — Verify RED**

Run:

```bash
npm test -- src/components/EvidenceDesk.test.tsx
```

Expected: FAIL because the state contract is absent.

**Step 3 — GREEN: Implement state and semantic markup**

Update `EvidenceDesk.tsx` so:

- default project slug is `wc2026-ai-simulator` via slug lookup, not array index;
- default/reset layer is `output`;
- project and layer tablists each have unique IDs and refs;
- every selected tab alone has `tabIndex={0}`;
- each panel references the selected tab through `aria-labelledby`;
- click and selection functions use the typed keys from `projects.ts`;
- projects with no links/image render no empty shell;
- case-route link is always present.

Use one shared local keyboard helper only if it remains type-safe for both groups. Support `ArrowRight`, `ArrowDown`, `ArrowLeft`, `ArrowUp`, `Home`, and `End`, wrapping at ends and moving focus.

**Step 4 — Verify GREEN**

Run:

```bash
npm test -- src/components/EvidenceDesk.test.tsx
npm test
```

Expected: PASS.

**Step 5 — RED: Add Playwright semantics and keyboard coverage**

Modify `tests/e2e/portfolio.spec.ts` with focused tests that assert:

- project tablist label `Proje dosyaları`; layer tablist label `Dosya katmanları`;
- WC2026 and Çıktı are initially selected and each group has exactly one `tabindex="0"`;
- layer selection changes only layer content;
- selecting SleepInfo after AI desteği resets the layer to Çıktı;
- Arrow/Down/Left/Up/Home/End work and focus follows within each group;
- `aria-controls` resolves to an existing panel and `aria-labelledby` resolves to the active tab.

**Step 6 — Verify RED**

Run:

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "canlı kesit|dosya katmanları"
```

Expected: FAIL against the old one-tablist homepage.

**Step 7 — GREEN: Complete tab behavior**

Make only interaction/semantic changes required for those failures. Do not style the whole page yet.

**Step 8 — Verify GREEN and checkpoint**

Run:

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "canlı kesit|dosya katmanları|sekmeler"
npm test
git add src/components/EvidenceDesk.tsx src/components/EvidenceDesk.test.tsx tests/e2e/portfolio.spec.ts vitest.config.ts src/test/setup.ts
git commit -m "feat: add accessible live project cutaway"
```

Expected: focused e2e and Vitest PASS. Omit nonexistent optional paths from `git add`.

---

## Task 3: Migrate the hero and preservation content as one vertical slice

**Objective:** Install the approved page hierarchy without losing current capabilities.

**Files:**
- Modify: `tests/e2e/portfolio.spec.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/components/layout/Navbar.tsx`

**Step 1 — RED: Add a preservation/content test**

Replace only stale homepage heading assertions. Assert all of these in one named preservation test:

- heading `Kararları görünen işler.`;
- profile image and ESOGÜ/department copy;
- CV exact href;
- three project names and `/work/<slug>` links;
- `/blog` catalog link and at least one existing article route;
- all three LinkedIn activity IDs `7470769047601664000`, `7467981878382465024`, `7465489993902411776`;
- GitHub, LinkedIn, and email exact hrefs;
- headings/content for education and current learning direction;
- navbar `İnceleme Masası` link exact href `/ai-inceleme-masasi`;
- stable `#work`, `#now`, and `#about` targets.

Do not delete the existing direct test that clicks through to AI İnceleme Masası.

**Step 2 — Verify RED**

Run:

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "Kararları görünen|korur"
```

Expected: FAIL because the old hero/page composition remains.

**Step 3 — GREEN: Recompose `page.tsx`**

Build the exact order in the design contract. Preserve `getAllPosts()` and current article links; preserve all three LinkedIn URLs. Use `next/image` for the profile. Give the live cutaway/ledger section `id="work"`, current-focus content `id="now"`, and profile/contact content `id="about"`. Ledger project actions link to each case route; if they also control live selection, keep the case link separately available and do not turn navigation into a button-only dead end.

Update `Navbar.tsx` only enough to match stable anchors and the approved compact hierarchy. The AI İnceleme Masası link remains visible at all target widths; do not hide it in the mobile rules.

**Step 4 — Verify GREEN**

Run:

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "Kararları görünen|korur|İnceleme Masası"
```

Expected: PASS.

**Step 5 — Regression check and checkpoint**

Run:

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "blog|vaka sayfasını|sitemap|404"
git add src/app/page.tsx src/components/layout/Navbar.tsx tests/e2e/portfolio.spec.ts
git commit -m "feat: migrate homepage content hierarchy"
```

Expected: preserved route tests PASS.

---

## Task 4: Implement the Mavi Masa responsive visual system

**Objective:** Match the approved visual hierarchy across desktop and narrow layouts using CSS only.

**Files:**
- Modify: `tests/e2e/portfolio.spec.ts`
- Modify: `src/app/globals.css`
- Modify only for required class/element hooks: `src/app/page.tsx`
- Modify only for required class/element hooks: `src/components/EvidenceDesk.tsx`

**Step 1 — RED: Add viewport and target-size acceptance tests**

Create a parameterized Playwright test for:

```ts
const homeViewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow", width: 320, height: 844 },
];
```

For each, assert:

```ts
expect(await page.evaluate(() =>
  document.documentElement.scrollWidth === document.documentElement.clientWidth,
)).toBe(true);
```

Measure every visible homepage `a`, `button`, and focusable graph region. Exempt inline prose links only when their enclosing link has a 44px line box/padding; otherwise fix them. Assert each control’s bounding box is at least 44×44 CSS px. At desktop, assert hero and live cutaway are both visible in the first viewport. At 320/390, assert the cutaway stacks below identity without overlap.

**Step 2 — Verify RED**

Run:

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "homepage viewport contract"
```

Expected: FAIL due to old dimensions/classes and incomplete target sizing.

**Step 3 — GREEN: Replace homepage CSS with approved tokens and hierarchy**

In `globals.css`:

- set the exact contract tokens;
- implement the subtle cutting-mat grid, paper file, ruled structure, narrow display type, serif body, mono labels, restrained shadow;
- use `minmax(0, …)`, `max-width: 100%`, and `min-width: 0` on all grid/flex children;
- implement the two-column desktop hero and one-column mobile layout;
- ensure all visible controls have `min-width`/`min-height: 44px` or equivalent padding;
- keep the AI İnceleme Masası navbar link visible at 320/390, adapting wrapping rather than `display:none`;
- retain styles required by case, blog, error, and review-desk pages; do not globally overwrite their layouts accidentally.

Do not copy the mockup’s script or add a general animation library. One CSS file entrance animation is allowed.

**Step 4 — Verify GREEN**

Run:

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "homepage viewport contract"
```

Expected: PASS at 1440, 390, and 320.

**Step 5 — RED: Add 200% zoom/reflow test**

Use Chromium CDP to emulate page scale factor 2 for a 390×844 viewport, matching the mockup verification approach, then assert:

- document width equals client width;
- heading, tablists, selected panel, CV link, project case links, blog link, and contact links remain visible/reachable;
- no overlap among hero identity, live file header, and tab rows;
- visible controls measure at least 88 device-scaled pixels where Playwright reports scaled geometry, or at least 44 CSS px if geometry remains CSS-based. Document which basis the test uses.

**Step 6 — Verify RED, then GREEN**

Run:

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "200% zoom"
```

Expected RED: failure before zoom-specific wrapping constraints. Apply minimal CSS reflow fixes, then rerun; expected GREEN: PASS.

**Step 7 — Checkpoint**

```bash
git add src/app/globals.css src/app/page.tsx src/components/EvidenceDesk.tsx tests/e2e/portfolio.spec.ts
git commit -m "style: apply mavi masa homepage system"
```

---

## Task 5: Make the WC2026 graph a bounded, discoverable scroll region

**Objective:** Keep the graph readable on mobile without causing page overflow.

**Files:**
- Modify: `tests/e2e/portfolio.spec.ts`
- Modify: `src/components/EvidenceDesk.tsx`
- Modify: `src/app/globals.css`

**Step 1 — RED: Add graph behavior tests**

At 390×844 and 320×844, select WC2026/Çıktı and assert:

- a region named `WC2026 şampiyonluk olasılıkları grafiği, kaydırılabilir bölge` exists;
- it has `tabindex="0"`, computed `overflow-x: auto|scroll`, width no larger than its panel, and height near 270px;
- the image is wider than the region and keeps its descriptive alt text;
- `Yana kaydırarak incele` is visible before scrolling;
- setting `scrollLeft` changes the region’s scroll position;
- document scroll width still equals client width.

Also assert the graph region is absent for GündemAI and SleepInfo output layers.

**Step 2 — Verify RED**

Run:

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "kaydırılabilir grafik"
```

Expected: FAIL because the production graph is not yet a named focusable bounded region.

**Step 3 — GREEN: Implement the graph region**

Use semantic `<figure>` with a focusable inner region, visible hint, `next/image` or `<Image>` configured so the image preserves a readable mobile width, and `<figcaption>`. CSS must use `overflow:auto`, `overscroll-behavior:contain`, `max-width:100%`, thin/high-contrast scrollbar styling where supported, and a sticky leading hint. Do not use global `overflow-x:hidden` to mask page bugs.

**Step 4 — Verify GREEN**

Run:

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "kaydırılabilir grafik|homepage viewport contract|200% zoom"
```

Expected: PASS.

**Step 5 — Checkpoint**

```bash
git add src/components/EvidenceDesk.tsx src/app/globals.css tests/e2e/portfolio.spec.ts
git commit -m "feat: bound mobile evidence graph scrolling"
```

---

## Task 6: Enforce reduced motion, focus, skip link, and Axe

**Objective:** Close accessibility behavior gaps before visual sign-off.

**Files:**
- Modify: `tests/e2e/portfolio.spec.ts`
- Modify: `src/app/globals.css`
- Modify only if semantics require it: `src/app/page.tsx`
- Modify only if semantics require it: `src/components/EvidenceDesk.tsx`

**Step 1 — RED: Add accessibility behavior tests**

Add focused tests that:

- emulate `reducedMotion: "reduce"` and verify file animation duration is `0s`/`none` and ledger navigation does not request smooth behavior;
- confirm the skip link is outside the viewport when idle and fully visible after focus;
- tab through both tablists and the graph region with visible focus styles;
- run Axe on `/` and assert no serious or critical violations;
- retain the existing `/ai-inceleme-masasi` zero-violation test unchanged.

**Step 2 — Verify RED**

Run:

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "reduced motion|skip link|homepage Axe"
```

Expected: at least one new requirement fails before final CSS/behavior.

**Step 3 — GREEN: Apply minimal accessibility fixes**

Add/adjust `@media (prefers-reduced-motion: reduce)` to disable all homepage transitions/animations and smooth scroll. Make focus styles visible on mat, paper, tabs, and graph. Keep the idle skip link entirely above the viewport; reveal it at a stable 16px inset.

**Step 4 — Verify GREEN and regressions**

Run:

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "reduced motion|skip link|homepage Axe|sekmeler|kaydırılabilir grafik"
npx playwright test tests/e2e/portfolio.spec.ts --grep "ai-inceleme-masasi rotasında Axe|klavye ile vaka"
```

Expected: PASS.

**Step 5 — Checkpoint**

```bash
git add src/app/globals.css src/app/page.tsx src/components/EvidenceDesk.tsx tests/e2e/portfolio.spec.ts
git commit -m "fix: close homepage accessibility requirements"
```

---

## Task 7: Perform screenshot and visual review

**Objective:** Compare real production rendering with the approved mockup before declaring the migration complete.

**Files:**
- Create: `reports/home-live-cutaway/desktop-1440x1000.png`
- Create: `reports/home-live-cutaway/mobile-390x844.png`
- Create: `reports/home-live-cutaway/narrow-320x844.png`
- Create: `reports/home-live-cutaway/zoom-200-390x844.png`
- Create: `reports/home-live-cutaway/visual-review.md`
- Modify only if defects are found: homepage source/tests above

**Step 1: Start production-like rendering**

Run:

```bash
npm run build
npm run start
```

Run the server in a managed background terminal if using Hermes tools. Verify readiness from `http://127.0.0.1:3000/`; do not rely on a blind sleep.

**Step 2: Capture screenshots**

Use Playwright with exact target viewports. Capture full-page screenshots at 1440×1000, 390×844, 320×844, and 390×844 under the same 200% zoom emulation used by the automated test. Save them to the exact report paths above.

**Step 3: Review against approved references**

Compare with:

- `sketches/home-mavi-masa-canli-kesit/desktop.png`
- `sketches/home-mavi-masa-canli-kesit/mobile-390.png`

Record pass/fail for palette, typography roles, hero balance, live-file prominence, paper/rule/shadow cues, mobile order, graph discoverability, no overlap/clipping, preserved sections, and focus appearance. List every intentional difference and why it preserves the production contract.

**Step 4: Fix defects using RED-GREEN**

For each functional/responsive defect, first add a focused failing Playwright assertion, observe RED, apply the minimum CSS/markup fix, and observe GREEN. For purely visual defects not expressible as stable behavior, record the screenshot evidence, apply the smallest CSS fix, recapture, and rerun the related viewport test.

**Step 5: Checkpoint**

```bash
git add reports/home-live-cutaway tests/e2e/portfolio.spec.ts src/app/page.tsx src/app/globals.css src/components/EvidenceDesk.tsx
git commit -m "test: record homepage visual acceptance"
```

Omit unchanged paths.

---

## Task 8: Run the complete release gate

**Objective:** Verify security, static quality, unit behavior, compilation, production build, all routes, and e2e behavior.

**Files:**
- Modify: `reports/README.md` with observed results only
- No feature changes unless a failing gate receives its own RED-GREEN fix

**Step 1: Run all gates in required order**

```bash
npm audit
npm run lint
npm test
npx tsc --noEmit
npm run build
npm run test:e2e
```

Expected:

- `npm audit`: zero unresolved vulnerabilities, or stop and report the exact advisory; do not silently change dependencies.
- lint: exit 0.
- Vitest: exit 0.
- TypeScript: exit 0.
- Next.js build: exit 0.
- Playwright: exit 0, including homepage and unchanged AI İnceleme Masası/API behavior.

**Step 2: Re-run explicit route-preservation smoke checks**

```bash
npx playwright test tests/e2e/portfolio.spec.ts --grep "vaka sayfasını|blog|sitemap|İnceleme Masası|claim-1|iptal|erişilemezlik"
```

Expected: PASS.

**Step 3: Record observed evidence**

Append exact command, timestamp, exit result, and test counts to `reports/README.md`. Never infer a result from a previous run.

**Step 4: Inspect scope and whitespace**

```bash
git status --short
git diff --stat
git diff --check
git diff -- package.json package-lock.json src/app/ai-inceleme-masasi src/app/api/review src/components/review-desk src/lib/review
```

Expected: `git diff --check` exits 0; package manifests and review-desk route/API implementation have no unintended diff. Investigate any output before proceeding.

**Step 5: Final checkpoint**

```bash
git add reports/README.md
git commit -m "docs: record homepage migration verification"
```

Expected: only observed verification evidence is committed. Confirm `git status --short` contains no unintended files. Do not push until explicitly requested by the implementation owner.

## Completion checklist

- [ ] WC2026/Çıktı is the homepage default.
- [ ] Çıktı, Karar, AI desteği, and Sınırlar have exact semantics for all projects.
- [ ] Both tablists pass click, roving keyboard, Home/End, wrap, and ARIA tests.
- [ ] Profile, CV, education, all projects/case routes, blog catalog/articles, three LinkedIn posts, and contact links remain.
- [ ] Navbar AI İnceleme Masası link and the entire route/API behavior remain green.
- [ ] Mobile graph is a labelled, focusable, bounded scroll region with a visible hint.
- [ ] No document overflow at 1440, 390, 320, or 390 at 200% zoom.
- [ ] Every visible interactive target is at least 44×44 CSS px.
- [ ] Reduced-motion and skip-link behavior pass.
- [ ] Homepage Axe has no serious/critical violations; review desk remains zero violations.
- [ ] No WebGL, video, physics, or new heavy dependency.
- [ ] Four screenshots and visual review are recorded.
- [ ] Audit, lint, unit tests, `tsc`, build, and full e2e pass.
- [ ] `git diff --check` passes and no unrelated source is changed.
