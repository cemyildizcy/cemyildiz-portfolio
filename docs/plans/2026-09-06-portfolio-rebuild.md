# Portfolio Rebuild Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a focused evidence-notebook portfolio around three verified projects.

**Architecture:** Keep project facts in a typed data module, render the home interaction in one client component, and statically generate focused work notes. Remove obsolete routes and components rather than preserving compatibility layers.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest, Playwright, axe-core.

---

### Task 1: Establish protocol and product truth
Create the required root documents, design specification, and this plan. Verify every claim against the approved brief or evidence.

### Task 2: Test the evidence catalog
Create `src/data/projects.test.ts` first. Assert exactly three unique, resolvable projects and explicit contribution/AI-role fields. Run the test and confirm RED before implementation, then add `src/data/projects.ts` and confirm GREEN.

### Task 3: Build the notebook shell
Replace root layout, navigation, footer, metadata, and CSS. Build one responsive material world with semantic landmarks, focus states, and reduced motion.

### Task 4: Build home and work notes
Create the evidence selector and static `/work/[slug]` pages from the tested catalog. Remove obsolete blog, about, and generated-project routes.

### Task 5: Add browser verification
Add Playwright and axe tests for core routes, selector behavior, landmarks, keyboard operation, and mobile overflow.

### Task 6: Verify and commit
Run audit, lint, unit tests, build, and E2E. Inspect targeted staged changes and added lines for secrets. Commit on `feat/portfolio-rebuild`; do not push or deploy.
