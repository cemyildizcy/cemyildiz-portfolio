# Design system

## Direction

A student's real projects presented like exhibits in an interactive science exhibition: an electric-blue opening followed by quiet evidence galleries. Direct identity comes first; genuine product imagery supplies proof. Not an invented expert persona, dashboard simulator, or catalogue of skill badges. Reading never depends on motion or interaction.

## Tokens

- Canvas `#ffffff`; secondary gallery `#eff4fb`
- Surface `#ffffff`
- Ink `#151a25`
- Muted ink `#566173`
- Rule `#dce3ec`
- Accent blue `#1648da`; dark blue `#1035a1`; soft blue `#eff4fb`
- Display and body: self-hosted Geist Sans, medium weights and tight display tracking.
- Interface: visible 44px controls; squared 0–2px exhibit corners.
- Geist Mono remains available to existing non-home routes only.

## Composition

The full-width blue opening pairs a squared monochrome portrait, literal identity and oversized thesis with a slightly tilted GündemAI exhibit. The phone is a genuine product screenshot, not an invented illustration. Mobile stacks the identity above the exhibit, whose image starts within the initial 844px viewport.

The work sequence is intentionally unequal:

- GündemAI is largest, with a tall real screenshot and the strongest title scale.
- Bike Demand and Fashion-MNIST use compact evidence charts, with their temporal and single-run/synthetic-noise limits stated beside the results.
- WC2026 is more compact, pairing concise copy with an output chart so it cannot dominate.
- SleepInfo remains a quiet link to its case page rather than a featured project; that page flags its unvalidated model metrics.

The dated public work journal connects new work to project dossiers without duplicating stable IDs. Selected writing and the minor AI İnceleme Masası entry share a quieter two-column section. The dark closing section contains biography, education, and contact links.

## Typography and spacing

Headings use a tight sans scale and sentence case, up to 82px for the opening thesis and 35–62px for section heads. Reading text is 15–16px with generous line height. Body copy stays below roughly 65 characters per line where practical. Generous vertical intervals replace card repetition. No tech gradients, fake metrics or icon-topped feature grids.

## Interaction

Links state their destination. Chart plates lift slightly on hover or keyboard focus; content is never hidden. There are no custom cursors, tabs, reveal modes or automatic entrance sequences. Hover is secondary to visible keyboard focus, including white focus rings on dark/blue surfaces. All action targets are at least 44 × 44 pixels.

## Responsive behavior

The hero and project splits stack below 760px. The GündemAI proof panel retains two compact columns. At 320px the navigation and hero retain readable wrapping without document overflow. Blog prose and inline code can break long tokens, while `pre` blocks retain native horizontal scrolling for code inspection.

## Accessibility

The page uses one `h1`, sequential section headings, semantic articles, descriptive image alternatives, and labelled navigation. Focus is visible, reduced motion disables smooth scrolling and transitions, and layouts reflow at 200% zoom. Automated Axe and keyboard/touch checks are acceptance gates, not a claim of complete manual accessibility certification.

## Asset provenance

The profile photograph, actual GündemAI Google Play screenshot, and Bike Demand/Fashion-MNIST/WC2026 result charts are preserved from the existing site. Their descriptions and numerical limitations remain in the curated project registry. No generated visual, fabricated product screen or invented metric was added.
