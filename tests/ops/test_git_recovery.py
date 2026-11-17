"""Real local Git transport tests: no GitHub access or mocked push outcomes."""
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("ops", Path(__file__).parents[2] / "scripts/portfolio_ops.py")
assert spec is not None and spec.loader is not None
ops = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ops)

class GitRecoveryTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.bare = self.root / "remote.git"
        self.repo = self.root / "work"
        self.git(["init", "--bare", "-b", "master", str(self.bare)], self.root)
        self.git(["init", "-b", "master", str(self.repo)], self.root)
        self.git(["config", "user.name", "Publication transport test"])
        self.git(["config", "user.email", "test@example.invalid"])
        (self.repo / "content").mkdir()
        self.target = self.repo / "content/updates.json"
        self.target.write_text(json.dumps({"version": 1, "entries": []}))
        self.git(["add", "content/updates.json"])
        self.git(["commit", "-m", "Initial public projection"])
        self.git(["remote", "add", "origin", str(self.bare)])
        self.git(["push", "-u", "origin", "master"])

    def git(self, args, cwd=None):
        return subprocess.run(["git", *args], cwd=cwd or self.repo, check=True, capture_output=True, text=True).stdout.strip()

    def test_committed_push_failure_is_clean_and_can_be_retried(self):
        seed = Path(__file__).parents[2] / "content/updates.json"
        self.target.write_text(seed.read_text())
        self.git(["add", "content/updates.json"])
        self.git(["commit", "-m", "Public content update"])
        hook = self.bare / "hooks/pre-receive"
        hook.write_text("#!/bin/sh\nexit 1\n")
        hook.chmod(0o700)
        with self.assertRaises(subprocess.CalledProcessError):
            ops.push_public_content(self.repo)
        self.assertEqual(ops.command(["git", "status", "--porcelain"], self.repo), "")
        hook.unlink()
        ops.push_public_content(self.repo)
        self.assertEqual(self.git(["rev-parse", "HEAD"]), self.git(["rev-parse", "refs/heads/master"], self.bare))

    def test_clean_but_non_content_ahead_commit_is_never_pushed(self):
        before = self.git(["rev-parse", "refs/heads/master"], self.bare)
        (self.repo / "unexpected.txt").write_text("Not a public projection")
        self.git(["add", "unexpected.txt"])
        self.git(["commit", "-m", "Unrelated work must not be sent"])
        self.assertEqual(ops.command(["git", "status", "--porcelain"], self.repo), "")
        with self.assertRaises(ValueError):
            ops.push_public_content(self.repo)
        self.assertEqual(before, self.git(["rev-parse", "refs/heads/master"], self.bare))

if __name__ == "__main__":
    unittest.main()
