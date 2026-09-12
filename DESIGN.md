# Design system

## Direction
A working research notebook on a blue cutting mat: ruled paper, clipped evidence, margin annotations, and one interactive evidence index. It avoids portfolio cards, neon gradients, tech walls, and decorative dashboards.

## Tokens
- Ink `#172033`; paper `#f3f0e6`; blue mat `#173f67`; signal yellow `#ffd447`; red pencil `#b8483d`; rule `#b9b5aa`.
- Display: `Arial Narrow`, compact and pragmatic. Body: Georgia for notebook reading. Data: Geist Mono only for evidence labels.
- Corners remain small; rules encode structure; shadows suggest physical layering.

## Composition
The home page opens on the blue mat with a compact identity/profile block, the thesis “Kararları görünen işler.”, and a dominant live project file. The file defaults to WC2026 and separates four selectable layers: Çıktı, Karar, AI desteği, and Sınırlar. A project ledger, technical writing/blog access, the three verified LinkedIn posts, education/profile content, and contact links continue below. Project pages remain field notes.

## Motion
Only the project file may enter once and selection/scroll feedback may transition. Reduced motion removes the entrance, transitions, and smooth scrolling. No WebGL, video, or physics effects.

## Responsive behavior
At 900px and below, identity and live file stack. At 560px and below, controls reflow while retaining 44px targets. The WC2026 graph becomes a labelled, focusable, approximately 270px-high native scroll region with a visible “Yana kaydırarak incele” hint; oversized graph content remains contained and never creates document-level horizontal overflow. The page must reflow at 320px, 390px, desktop, and 200% zoom.

## Accessibility
Visible focus, semantic landmarks/buttons/headings, 4.5:1 body contrast, descriptive link text, and no information conveyed by color alone. Project and layer selectors use independent ARIA tablists with roving tabindex, arrow keys, Home, and End. Axe must report no serious or critical homepage violations.
