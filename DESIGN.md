# Design system

## Direction

A calm editorial portfolio with the directness of a well-edited product profile. The person comes first; real product imagery supplies the visual identity. The page is understandable on arrival and does not depend on interaction.

## Tokens

- Canvas `#f7f7f5`
- Surface `#ffffff`
- Ink `#17191d`
- Muted ink `#5f6670`
- Rule `#d9dce1`
- Accent blue `#245aa5`; dark blue `#173f78`; soft blue `#eaf1fa`
- Display: Georgia for a human editorial tone.
- Interface/body: Arial/Helvetica for compact clarity.
- Geist Mono remains available to existing non-home routes only.

## Composition

The opening composition pairs a circular portrait and literal biography with a compact GündemAI product panel. On mobile, the portrait, name, positioning, and recognizable real product screenshot fit in the first viewport.

The work sequence is intentionally unequal:

- GündemAI is largest, with a tall real screenshot and the strongest title scale.
- SleepInfo uses a broad pale-blue illustration field and medium title scale.
- WC2026 is more compact, pairing concise copy with an output chart so it cannot dominate.

Selected writing and the minor AI İnceleme Masası entry share a quieter two-column section. The dark closing section contains biography, education, and contact links.

## Typography and spacing

Headings use a tight serif scale and sentence case. Body copy stays below roughly 65 characters per line where practical. Generous vertical intervals replace card repetition. Rules encode section boundaries; corners, shadows, gradients, and labels are used sparingly.

## Interaction

Links state their destination. There are no custom cursors, tabs, reveal modes, automatic entrance sequences, or decorative motion. Hover is secondary to visible keyboard focus. All action targets are at least 44 × 44 pixels.

## Responsive behavior

The hero and project splits stack below 900px. Below 600px the opening layout compresses into a portrait/name row followed by a compact two-column GündemAI proof panel. At 320px the navigation and hero retain readable wrapping without document overflow. Blog prose and inline code can break long tokens, while `pre` blocks retain native horizontal scrolling for code inspection.

## Accessibility

The page uses one `h1`, sequential section headings, semantic articles and an aside, descriptive image alternatives, and labelled navigation. Focus is visible, contrast meets WCAG AA, reduced motion disables smooth scrolling and transition duration, and all layouts reflow at 200% zoom.
