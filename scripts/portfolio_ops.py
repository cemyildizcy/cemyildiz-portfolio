#!/usr/bin/env python3
"""Publish only explicit, verified public projections. Never scan the raw vault."""
import argparse
from datetime import date
import fcntl
import hashlib
import ipaddress
import json
import os
from pathlib import Path
import re
import ssl
import stat
import subprocess
import tempfile
from urllib.parse import urlsplit
from urllib.request import urlopen

MAX_BYTES = 65536
MAX_PROJECTION = 16 * 1024 * 1024
FIELDS = {"id", "type", "title", "summary", "date", "status", "tags", "problem",
          "outcomes", "contribution", "aiRole", "limitations", "paragraphs", "links"}
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")
SENSITIVE = re.compile(r"(?:/home/|/root/|-----BEGIN |\b(?:sk-[a-zA-Z0-9]{12,}|gh[pousr]_[a-zA-Z0-9]{12,})|(?:api[_-]?key|password|passwd|token|secret)\s*[:=])", re.I)


def text(value, limit=3000):
    if not isinstance(value, str) or not value.strip() or len(value) > limit:
        raise ValueError("Invalid or oversized public text")
    if SENSITIVE.search(value) or "<" in value or ">" in value or "\x00" in value:
        raise ValueError("Unsafe public text; withheld")
    for address in re.findall(r"(?<!\w)(?:\d{1,3}\.){3}\d{1,3}(?!\w)", value):
        try:
            ipaddress.ip_address(address)
        except ValueError:
            continue
        raise ValueError("IP addresses are not public portfolio content")
    return value


def validate_entry(entry):
    if not isinstance(entry, dict) or set(entry) != FIELDS:
        raise ValueError("Unexpected or missing public fields")
    if not isinstance(entry["id"], str) or not SLUG.fullmatch(entry["id"]) or len(entry["id"]) > 90:
        raise ValueError("Invalid stable ID")
    if entry["type"] not in ("project", "update") or entry["status"] not in ("in-progress", "completed", "published"):
        raise ValueError("Invalid publication kind/status")
    if not isinstance(entry["date"], str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", entry["date"]):
        raise ValueError("Use an ISO calendar date")
    if date.fromisoformat(entry["date"]) > date.today():
        raise ValueError("Future publications withheld")
    for key in ("title", "summary", "problem", "aiRole", "limitations"):
        text(entry[key], 180 if key == "title" else 3000)
    for key in ("tags", "outcomes", "contribution", "paragraphs"):
        values = entry[key]
        if not isinstance(values, list) or not 1 <= len(values) <= 20:
            raise ValueError("Invalid public text list")
        for item in values:
            text(item, 3000)
    if not isinstance(entry["links"], list) or len(entry["links"]) > 10:
        raise ValueError("Invalid links")
    for link in entry["links"]:
        if not isinstance(link, dict) or set(link) != {"label", "href"}:
            raise ValueError("Unexpected link fields")
        text(link["label"], 100)
        text(link["href"], 1500)
        parsed = urlsplit(link["href"])
        host = parsed.hostname or ""
        if parsed.scheme != "https" or not host or parsed.username or parsed.password or parsed.port not in (None, 443):
            raise ValueError("Only public HTTPS links are allowed")
        if "." not in host or host.endswith((".local", ".internal", ".localhost")):
            raise ValueError("Private host withheld")
        try:
            ipaddress.ip_address(host)
        except ValueError:
            pass
        else:
            raise ValueError("Literal IP links withheld")
    return entry


def read_json(path, max_bytes=MAX_BYTES):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(fd, "r", encoding="utf-8") as handle:
        info = os.fstat(handle.fileno())
        if not stat.S_ISREG(info.st_mode) or info.st_size > max_bytes:
            raise ValueError("Non-regular or oversized publication")
        return json.load(handle)


def encode(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def atomic_write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.parent.is_symlink() or path.parent.stat().st_mode & stat.S_IWOTH:
        raise ValueError("Output directory must be trusted and not world-writable")
    if path.is_symlink():
        raise ValueError("Refusing symlink target")
    fd, temporary = tempfile.mkstemp(prefix=".portfolio-", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temporary, 0o644)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def export_queue(queue, target, apply=False):
    queue, target = Path(queue), Path(target)
    if queue.is_symlink() or not queue.is_dir():
        raise ValueError("Explicit public queue directory is required")
    if queue.stat().st_mode & stat.S_IWOTH:
        raise ValueError("Public queue must not be world-writable")
    entries = {}
    if target.exists():
        existing = read_json(target, MAX_PROJECTION)
        if set(existing) != {"version", "entries"} or existing["version"] != 1:
            raise ValueError("Unknown existing projection")
        for entry in existing["entries"]:
            validate_entry(entry)
            if entry["id"] in entries:
                raise ValueError("Duplicate existing ID")
            entries[entry["id"]] = entry
    sources = sorted(queue.glob("*.json"))
    if len(sources) > 500:
        raise ValueError("Queue exceeds bounded publication batch")
    for source in sources:
        envelope = read_json(source)
        if not isinstance(envelope, dict) or set(envelope) - {"visibility", "verified", "entry", "source_ref"}:
            raise ValueError("Unexpected envelope fields")
        if envelope.get("visibility") != "public" or envelope.get("verified") is not True:
            raise ValueError("Private or unverified content withheld")
        entry = validate_entry(envelope.get("entry"))
        if source.stem != entry["id"]:
            raise ValueError("Filename must match stable public ID")
        entries[entry["id"]] = entry
    result = {"version": 1, "entries": sorted(entries.values(), key=lambda item: (item["date"], item["id"]), reverse=True)}
    payload = encode(result)
    if len(payload.encode()) > MAX_PROJECTION:
        raise ValueError("Public projection exceeds bounded size")
    changed = not target.exists() or read_json(target, MAX_PROJECTION) != result
    if apply and changed:
        atomic_write(target, payload)
    return {"changed": changed, "entries": len(entries), "queue_files": len(sources),
            "sha256": hashlib.sha256(payload.encode()).hexdigest(), "applied": bool(apply and changed)}


def command(args, repo, timeout=600):
    return subprocess.run(args, cwd=repo, check=True, text=True, capture_output=True, timeout=timeout).stdout.strip()


def push_public_content(repo):
    """Only content commits may be retried; a clean tree alone is insufficient."""
    ahead = "origin/master..HEAD"
    if command(["git", "rev-list", "--merges", ahead], repo):
        raise ValueError("Unexpected pending merge commit")
    paths = set(command(["git", "log", "--format=", "--name-only", ahead], repo).splitlines()) - {""}
    if paths - {"content/updates.json"}:
        raise ValueError("Pending commits include non-publication files")
    command(["git", "push", "origin", "master"], repo, 90)


def publish(queue, repo, state):
    repo, state = Path(repo).resolve(), Path(state).resolve()
    state.mkdir(parents=True, exist_ok=True, mode=0o700)
    with (state / "publisher.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if command(["git", "status", "--porcelain"], repo):
            raise ValueError("Publisher requires a clean dedicated clone")
        remote = command(["git", "remote", "get-url", "origin"], repo)
        if remote not in ("https://github.com/cemyildizcy/cemyildiz-portfolio.git", "git@github.com:cemyildizcy/cemyildiz-portfolio.git"):
            raise ValueError("Unexpected publication remote")
        if command(["git", "branch", "--show-current"], repo) != "master":
            raise ValueError("Publisher requires master branch")
        command(["git", "pull", "--ff-only", "origin", "master"], repo, 90)
        target = repo / "content/updates.json"
        old = encode(read_json(target, MAX_PROJECTION))
        result = export_queue(queue, target, apply=True)
        if not result["changed"]:
            # Retry an earlier successful commit whose network push failed.
            push_public_content(repo)
            return result
        atomic_write(state / (hashlib.sha256(old.encode()).hexdigest() + ".json"), old)
        try:
            command(["npm", "run", "lint"], repo)
            command(["npm", "test", "--", "--reporter=dot"], repo)
            command(["npm", "run", "build"], repo)
            command(["git", "add", "--", "content/updates.json"], repo)
            command(["git", "commit", "-m", "content: sync verified public work updates"], repo)
        except Exception:
            command(["git", "restore", "--staged", "--worktree", "--", "content/updates.json"], repo)
            raise
        push_public_content(repo)
        atomic_write(state / "last-success.json", encode(result))
        return result


def restore_backup(state, identity, target, apply=False):
    if not isinstance(identity, str) or not re.fullmatch(r"[a-f0-9]{64}", identity):
        raise ValueError("Invalid backup identity")
    projection = read_json(Path(state) / (identity + ".json"), MAX_PROJECTION)
    if not isinstance(projection, dict) or set(projection) != {"version", "entries"} or projection["version"] != 1:
        raise ValueError("Invalid backup projection")
    ids = set()
    for entry in projection["entries"]:
        validate_entry(entry)
        if entry["id"] in ids:
            raise ValueError("Duplicate backup ID")
        ids.add(entry["id"])
    if apply:
        atomic_write(Path(target), encode(projection))
    return {"backup": identity, "entries": len(ids), "applied": apply}


def trim_backups(state, keep=14):
    state = Path(state)
    backups = [p for p in state.glob("*.json") if re.fullmatch(r"[a-f0-9]{64}", p.stem)]
    for backup in backups:
        restore_backup(state, backup.stem, state / "unused-validation-target")
    backups.sort(key=lambda p: (p.stat().st_mtime_ns, p.name), reverse=True)
    for backup in backups[keep:]:
        backup.unlink()
    return {"retained": min(len(backups), keep), "removed": max(0, len(backups) - keep)}


def healthcheck(state):
    state = Path(state)
    # Fixed destination; queue content never controls network destinations.
    with urlopen("https://cemyildiz.net/updates", timeout=20, context=ssl.create_default_context()) as response:
        if response.status != 200 or b"Yaparken" not in response.read(100000):
            raise ValueError("Production journal health check failed")
    result: dict[str, object] = {"status": "ok", "date": date.today().isoformat(), "target": "https://cemyildiz.net/updates"}
    result["backups"] = trim_backups(state)
    atomic_write(state / "health.json", encode(result))
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("export", "publish", "health", "restore"))
    parser.add_argument("--backup", help="restore only: 64-character backup identity")
    parser.add_argument("--queue", type=Path)
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--state", type=Path, default=Path.home() / ".local/state/portfolio")
    parser.add_argument("--apply", action="store_true", help="export only: default is read-only")
    args = parser.parse_args()
    try:
        if args.action == "restore":
            result = restore_backup(args.state, args.backup, args.repo / "content/updates.json", args.apply)
        elif args.action == "health":
            result = healthcheck(args.state)
        else:
            if not args.queue:
                parser.error("--queue is required")
            result = publish(args.queue, args.repo, args.state) if args.action == "publish" else export_queue(args.queue, args.repo / "content/updates.json", args.apply)
        print(encode(result), end="")
    except (ValueError, OSError, subprocess.SubprocessError, json.JSONDecodeError) as error:
        # Never dump source content or command stdout/stderr into public logs.
        print(encode({"status": "failed", "error_type": type(error).__name__}), end="")
        raise SystemExit(1)

if __name__ == "__main__":
    main()
