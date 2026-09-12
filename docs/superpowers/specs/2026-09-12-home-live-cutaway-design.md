# Home Live Cutaway Production Design Contract

**Status:** Approved for implementation

**Reference:** `sketches/home-mavi-masa-canli-kesit/index.html`, `README.md`, `verification.json`, `desktop.png`, and `mobile-390.png`

**Scope:** Replace the homepage presentation with the approved Mavi Masa / Canlı Kesit direction. Do not redesign or remove existing product capabilities.

## 1. Product outcome

The homepage must present Cem Yıldız as an ESOGÜ Mathematics and Computer Science student who learns machine learning by building products and documents evidence, decisions, AI assistance, and limits separately. The central interaction is a live project file, not a technology résumé or generic card grid.

The opening composition must follow the approved mockup: a blue cutting-mat field, compact identity block and profile photo, the headline **“Kararları görünen işler.”**, primary project/CV actions, and a layered project file. The page remains Turkish-first and uses only truthful claims already represented in repository data or approved copy.

## 2. Non-negotiable preservation contract

The migration must preserve all of the following, with working links and existing route behavior:

- Profile photo: `/images/profile.jpg`, with alt text `Cem Yıldız profil fotoğrafı`.
- Downloadable CV: `/documents/Cem_Yildiz_CV.pdf`.
- Education: Eskişehir Osmangazi Üniversitesi, Matematik ve Bilgisayar Bilimleri, undergraduate, entering year 3 in 2026–2027.
- Every current project: GündemAI, WC2026 AI Simulator, and SleepInfo. Their full data and truthful limitations remain available.
- Every project case route: `/work/gundem-ai`, `/work/wc2026-ai-simulator`, and `/work/sleepinfo`.
- The blog catalog at `/blog`, all current blog article routes, and homepage access to the catalog. The redesign may condense homepage article presentation but must not delete the catalog or its content.
- The three verified LinkedIn project posts already listed on the homepage, preserving their exact URLs.
- GitHub, LinkedIn, and email links.
- Navbar access to `/ai-inceleme-masasi`, labelled `İnceleme Masası` or `AI İnceleme Masası`.
- The entire `/ai-inceleme-masasi` route and `/api/review/runs` behavior, including review selection, run/cancel/reset flow, grounded citations, availability errors, security attributes, telemetry/rate-limit/provider behavior, and existing tests. Homepage work must not modify review-desk source or API contracts.
- Existing metadata, sitemap coverage, 404, case pages, and external-link security behavior.

Where `Requirements.md` says to remove the blog catalog, this contract supersedes that stale item: the current approved product includes and must preserve the blog route and catalog.

## 3. Information architecture and page order

1. Existing global skip link and `Navbar`.
2. Hero/live-cutaway composition:
   - identity, profile photo, educational context;
   - headline and truthful introduction;
   - `Proje dosyalarını aç` anchor action and CV download;
   - current-work note;
   - project selector and live project file.
3. Project ledger containing all three projects and links to their case routes. Selecting `Dosyayı aç` also selects that project in the live cutaway and brings the cutaway into view.
4. Writing area preserving access to the blog catalog and current posts. The three verified LinkedIn posts remain independently identifiable links; blog content must not be relabelled as LinkedIn content.
5. Profile and education content.
6. Current learning/work/method content if not already represented verbatim in the profile/current-work area; no current capability or truthful positioning may be dropped through visual consolidation.
7. GitHub, LinkedIn, email, and footer.

Anchors must remain stable for navbar/deep links: `#work`, `#now`, and `#about`. A writing anchor may be added, but `/blog` remains the catalog URL.

## 4. Data and component contract

`src/data/projects.ts` remains the single source of truth for project identity, status, premise, evidence, contribution, AI role, limits, links, note, and optional image. Extend its type only with presentation-ready fields that cannot be derived without ambiguous indexing, such as a file code or explicit layer copy. Do not duplicate project claims in `page.tsx` or the interactive component.

The live cutaway must use two independent, accessible single-selection tab systems:

- **Project tabs:** GündemAI, WC2026, SleepInfo.
- **Layer tabs:** Çıktı, Karar, AI desteği, Sınırlar.

Each layer has fixed semantics:

- **Çıktı:** shipped/current evidence and user-visible result; never an outcome claim unsupported by evidence.
- **Karar:** Cem’s product, modeling, or design decision and rationale; not a stack list.
- **AI desteği:** the bounded role of AI in research, generation, implementation, debugging, or critique, while retaining Cem’s decision and final-review responsibility.
- **Sınırlar:** maturity, data/model uncertainty, safety boundary, and any claim that must not be made.

Changing project resets the active layer to **Çıktı**. Homepage default project is **WC2026 AI Simulator**, regardless of its position in the canonical project array. The default output panel shows the existing champion-probabilities image and WC2026 repository/demo links. Projects without an image or public links render an honest text-only state without empty placeholders.

Recommended boundary:

- `src/app/page.tsx`: server composition, blog retrieval, static page sections.
- `src/components/EvidenceDesk.tsx`: client-side project/layer state and keyboard interaction; rename only if imports and tests are updated in the same slice.
- `src/components/ProjectLedger.tsx` only if extraction makes shared selection behavior clearer; avoid abstraction otherwise.
- `src/data/projects.ts`: content contract.
- `src/app/globals.css`: tokens and responsive presentation.

No WebGL, video, canvas physics, autoplay media, or new heavy dependency. Use React, Next.js, semantic HTML, CSS, and current repository dependencies only. Do not add a dependency for tabs, scrolling, or animation.

## 5. Visual contract

The reference mockup is authoritative for visual hierarchy and character, not a command to copy its monolithic HTML/CSS/JavaScript structure.

- Palette: mat `#16466f`, deep mat `#0d3455`, paper `#f3f0e6`, light paper `#fffdf5`, ink `#172033`, muted `#5c6470`, rule `#aaa79d`, blue rule `#b7cad8`, signal yellow `#ffd447`, red pencil `#ae493e`, green `#295f50`, warm white `#fffdf7`.
- Typography: narrow system sans for display/navigation, Georgia serif for reading, existing Geist Mono or a system monospace for file labels. No new font dependency.
- Physical cues: ruled paper, clipped-file hierarchy, restrained small corners and offset shadow. No portfolio-card grid, neon gradient, glassmorphism, decorative dashboard, or technology wall.
- Desktop at 1440×1000: hero uses the approved two-column identity/live-file hierarchy; the live file is the dominant evidence object and remains substantially visible in the first viewport.
- Mobile at 390×844 and 320×844: one-column flow; profile identity stays compact; actions and all visible controls meet target sizing; no document-level horizontal overflow.
- At 200% browser zoom with a 390px CSS viewport: content reflows without loss, clipping, overlap, or document-level horizontal overflow.

Pixel identity is not required. Relative hierarchy, palette, typography roles, live-file composition, and responsive behavior are required. Visual review compares production screenshots against `desktop.png` and `mobile-390.png` and records intentional differences.

## 6. Mobile graph contract

The WC2026 graph is large evidence, not a responsive thumbnail. At narrow widths it must render inside an explicitly labelled, keyboard-focusable, bounded scroll region:

- The scroll region has a stable accessible name, such as `WC2026 şampiyonluk olasılıkları grafiği, kaydırılabilir bölge`.
- `tabIndex={0}` makes the region keyboard reachable; native two-axis scrolling remains available.
- The viewport is bounded to the content width and approximately 270px high at 320/390 widths.
- The image keeps a readable intrinsic/minimum width inside the region rather than shrinking unreadably.
- `overflow: auto`, `overscroll-behavior: contain`, and `max-width: 100%` prevent page overflow and scroll chaining.
- A visible mobile hint, `Yana kaydırarak incele`, appears at the region’s leading edge and remains discoverable before scrolling. It is supplemental; accessibility does not rely on the hint alone.
- The image retains descriptive alt text and a visible caption. No graph information may be conveyed only through a background image.
- Any descendants wider than the viewport are permitted only inside this bounded scroll container; `document.documentElement.scrollWidth` must still equal `clientWidth`.

## 7. Interaction and accessibility contract

Both tablists implement the WAI-ARIA automatic-activation tabs pattern:

- container `role="tablist"` with a specific Turkish accessible label;
- each button has `role="tab"`, stable unique `id`, `aria-selected`, `aria-controls`, and roving `tabIndex` (`0` only for the selected tab, `-1` otherwise);
- panel has `role="tabpanel"`, stable `id`, and `aria-labelledby` pointing to the selected tab;
- click/tap selects; `ArrowRight`/`ArrowDown` select next with wrap; `ArrowLeft`/`ArrowUp` select previous with wrap; `Home` selects first; `End` selects last; focus follows selection;
- project and layer tab groups do not interfere with one another.

All visible interactive targets must be at least 44×44 CSS px. Focus indicators must be visible against both mat and paper. The skip link is fully off-screen when idle and fully visible when focused. Headings remain sequential, landmarks are semantic, and color is never the only selected-state cue.

Reduced motion must disable the file entrance animation and smooth scrolling. Ledger-to-file navigation must use instant scrolling when `prefers-reduced-motion: reduce` is active. The page must remain fully usable if animation never runs.

Axe acceptance is zero serious or critical violations on the homepage; the existing stricter zero-violation review-desk test remains unchanged. Keyboard acceptance includes reaching every control, operating both tablists, opening the case/blog/contact links, and scrolling the mobile graph.

## 8. Content acceptance matrix

| Capability | Homepage acceptance |
|---|---|
| Identity | Name, profile photo, ESOGÜ field, truthful ML/deep-learning position |
| CV | Download link to exact current PDF |
| Projects | All three in project tabs and ledger; case route for each |
| Default | WC2026 selected; Çıktı selected; graph visible |
| Layers | Exact labels Çıktı, Karar, AI desteği, Sınırlar; truthful project-specific content |
| Blog | `/blog` catalog link plus current homepage article access; article routes untouched |
| LinkedIn posts | All three existing post titles and exact activity URLs |
| Contact | GitHub, LinkedIn, `mailto:cemyildizcy@hotmail.com` |
| Education | Institution, department, undergraduate/year detail |
| Review desk | Navbar link plus untouched route/API behavior |

## 9. Acceptance gates

Implementation is complete only when:

1. Focused unit/component tests prove the project/layer model and both tab systems.
2. Playwright proves preservation, WC2026 default, layer changes, roving keyboard behavior, mobile graph semantics, 44px targets, no page overflow at 320, 390, desktop, and 200% zoom, reduced motion, case/blog/review routes, and Axe.
3. Production screenshots at 1440×1000, 390×844, 320×844, and 390×844 at 200% zoom receive human visual review against the approved mockup.
4. `npm audit`, `npm run lint`, `npm test`, `npx tsc --noEmit`, `npm run build`, and `npm run test:e2e` pass from a clean working tree except intended implementation changes.
5. No production behavior outside the homepage has regressed, and no new dependency has been introduced.
