# Portfolio Rebuild Design

## Purpose
Replace the broad, claim-heavy portfolio with a focused evidence notebook for three projects.

## Information architecture
Home contains the thesis, evidence index, learning-now notes, and contact. `/work/[slug]` contains one honest case note per project. Old blog and generated project routes are removed.

## Visual direction
Experience mode. A blue research desk holds a large ruled sheet. The first viewport behaves like an evidence index: selecting a project changes the clipped proof sheet while preserving a ledger-like list. Yellow annotations and red pencil marks create one recognizable material world.

## Content model
Each project stores premise, status, evidence, contribution, AI role, limits, links, and notes. Missing verification is stated rather than filled.

## Interaction
A keyboard-operable three-item selector is the only memorable motion. Content is visible without animation and respects reduced-motion.

## Testing
Unit tests validate the project catalog and slugs. Playwright checks routes, keyboard interaction, mobile overflow, and axe accessibility. Lint and production build remain release gates.
