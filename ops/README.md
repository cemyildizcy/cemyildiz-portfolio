# Public work publisher

**Installation status:** these are tested implementation/templates, not evidence of an installed server timer. Remote installation must be verified on the target server before claiming the automation is running.

## Trust boundary
The writer (the companion's project-session workflow) produces one JSON file per stable project/update ID in a dedicated public queue. The publisher never walks the memory vault or sends notes to an LLM. Files must explicitly have `visibility: public`, `verified: true`, and an `entry` matching the public schema. Optional private `source_ref` is discarded. Only the projected `entry` is committed to the public site. Whitelisting is the primary privacy boundary; the token/IP/HTML checks are extra safeguards, not a promise to detect every possible private sentence.

New `project` IDs get `/work/<id>` and `/updates/<id>`; existing IDs update without duplication. `update` IDs get a dated journal page only. Existing curated project pages remain authoritative: use a journal entry to announce changes to those case studies, and edit their reviewed source if the case-study evidence itself changed. The publisher does not overwrite evidence in the curated historical project registry.

Example envelope: construct `{"visibility":"public","verified":true,"entry": <one entry from content/updates.json>}` and save it under `<entry.id>.json`. A session operator writes it after verifying facts; ordinary private notes do not automatically become public. No manual approval is needed for each subsequent valid queue item under the user's standing authorization.

## Local checks

- `python3 -m unittest discover -s tests/ops -v`
- `python3 scripts/portfolio_ops.py export --queue /absolute/public-queue` (read-only)
- `python3 scripts/portfolio_ops.py export --queue /absolute/public-queue --apply`
- `npm run lint && npm test && npm run build`

The production publisher additionally requires a clean dedicated master clone with the exact expected origin, a non-overlapping lock, a fast-forward pull, validated JSON, and passing lint/tests/build before committing **only** `content/updates.json`. Failed validation changes nothing. Failed checks restore only that projection. A failed network push keeps the tested commit and is retried by a later run. Other pending work is never silently committed.

## Installation prerequisites and steps

A server operator must have authenticated SSH access; no passwords or tokens belong in chat, this repo or the env example. Use a dedicated `portfolio-publisher` system account, not root. Install Python 3.10+, Git and the same supported Node/npm runtime as the site. Clone this repository to `/srv/cemyildiz-portfolio`; install dependencies there. Give this account a separately approved repository-scoped push credential using the server's existing secure credential mechanism. Do not copy a personal SSH key/token from another account.

Set its home to `/var/lib/portfolio-publisher`; make its clone and state owned by that account. Make only the public queue readable to it and restrict queue writes to the trusted session/sync writer. The raw vault must not be world-readable. Copy `ops/portfolio-publisher.env.example` to `/etc/portfolio-publisher.env` with the actual queue path. If memory is synced to the server, use that sync's dedicated public queue, not a broad new vault sync. Do not alter an existing sync without inspecting it first.

Copy the four service/timer files into `/etc/systemd/system/`; `systemd-analyze verify` them. Run the publish service once manually, inspect its exit status/logs, confirm the pushed commit and Vercel deployment, and run maintenance once. Only then enable both timers with `systemctl enable --now portfolio-publish.timer portfolio-maintenance.timer`. Read back `systemctl list-timers`, `systemctl show ... -p Result -p ExecMainStatus`, and the health/state JSON before reporting success. Unit files have bounded time, memory, CPU and filesystem access.

Maintenance validates HTTPS/certificate trust and the expected journal response, checks backup readability/schema, and keeps the fourteen newest content-addressed content backups. Failures are visible in the systemd journal and service result. It does not upgrade the operating system, install packages, rewrite arbitrary application code or spend model credits. Off-machine backup and external alerts are not implemented by these units.

## Recovery

Stop the publishing timer first. For content recovery, `python3 scripts/portfolio_ops.py restore --state /var/lib/portfolio-publisher/state --backup <64-hex-id>` validates and previews a stored backup. Add `--apply` to restore the content file; then run the checks, review the diff, commit only the restored projection, and push. For a code/design regression, revert the explicit bad site commit on master (never reset shared history) or promote the known previous Vercel deployment using the existing authorized deployment account. Confirm the actual live route before restarting the timer. A passing local restore test is not a production rollback drill.
