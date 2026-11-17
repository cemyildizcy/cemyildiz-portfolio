# Release acceptance — 17 November 2026

## Passed locally

- Independent final review: PASS, with no concrete unresolved security or logic finding in the trusted-public-projection model.
- 186 TypeScript/Vitest tests.
- 13 Python operations tests, including actual Git push rejection/retry and unrelated-ahead-commit rejection.
- 98 real browser tests across desktop and mobile, including legacy API flows, accessibility scans, responsive reflow, real-image loading and the new journal/project routes.
- Production build, TypeScript, ESLint, whitespace checks and changed-file credential/private-infrastructure scan.
- Local syntax verification of all four systemd service/timer templates.
- Actual public projection import followed by an idempotent second run.

## Public behavior

An electric-blue exhibition-style portfolio preserves real project evidence and existing case/blog/tool routes. The work journal publishes dated, verified public projections and produces new project dossiers. Same stable ID updates the projected entry rather than duplicating it. Private provenance is not exported. The public portfolio project remains in-progress because server automation is not yet installed.

## Honest deployment limits

These results certify the checked local artifact, not an installed remote service. Production deployment must be read back from the real host after Git push. Server SSH is currently inaccessible; service templates, prerequisites and recovery commands are provided in `ops/README.md`. Server user/credential provisioning, first timer run, remote state readback and a production restore drill remain open. No autonomous OS upgrades, broad raw-vault publication or paid model jobs were installed.
