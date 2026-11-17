"""Security contract for the public-only memory projection (stdlib only)."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).parents[2] / "scripts" / "portfolio_ops.py"
spec = importlib.util.spec_from_file_location("portfolio_ops", SCRIPT)
assert spec is not None and spec.loader is not None
ops = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ops)

class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.queue = self.root / "queue"
        self.queue.mkdir()
        self.target = self.root / "updates.json"
        self.seed = json.loads((SCRIPT.parent.parent / "content/updates.json").read_text())
        self.entry = copy.deepcopy(self.seed["entries"][0])
        self.envelope = {"visibility": "public", "verified": True, "entry": self.entry,
                         "source_ref": "private/project-note.md"}

    def put(self, data=None, name="portfolio-yenileme.json"):
        (self.queue / name).write_text(json.dumps(data or self.envelope))

    def test_exports_public_fields_without_private_provenance(self):
        self.put()
        result = ops.export_queue(self.queue, self.target, apply=True)
        self.assertTrue(result["changed"])
        exported = json.loads(self.target.read_text())
        self.assertEqual(exported, self.seed)
        self.assertNotIn("source_ref", self.target.read_text())
        self.assertFalse(ops.export_queue(self.queue, self.target, apply=True)["changed"])

    def test_dry_run_does_not_write(self):
        self.put()
        self.assertTrue(ops.export_queue(self.queue, self.target)["changed"])
        self.assertFalse(self.target.exists())

    def test_update_replaces_same_id_instead_of_duplicating(self):
        self.put()
        ops.export_queue(self.queue, self.target, apply=True)
        self.envelope["entry"]["summary"] = "Proje özeti güncellendi."
        self.put()
        result = ops.export_queue(self.queue, self.target, apply=True)
        self.assertEqual(result["entries"], 1)
        self.assertEqual(json.loads(self.target.read_text())["entries"][0]["summary"], "Proje özeti güncellendi.")

    def test_raw_private_or_unverified_content_is_rejected(self):
        for visibility, verified in [("private", True), ("internal", True), ("public", False), ("public", 1)]:
            self.envelope.update(visibility=visibility, verified=verified)
            self.put()
            with self.assertRaises(ValueError):
                ops.export_queue(self.queue, self.target, apply=True)
        self.assertFalse(self.target.exists())

    def test_unknown_fields_never_leak(self):
        self.envelope["entry"]["private_notes"] = "Not for public use"
        self.put()
        with self.assertRaises(ValueError):
            ops.export_queue(self.queue, self.target, apply=True)

    def test_sensitive_text_html_ip_and_unsafe_links_are_rejected(self):
        for value in ["password=example-private-value", "/home/person/private.md", "<script>alert(1)</script>", "Sunucu 192.168.1.1", "Sunucu 203.0.113.12"]:
            entry = copy.deepcopy(self.entry)
            entry["summary"] = value
            with self.assertRaises(ValueError):
                ops.validate_entry(entry)
        for href in ["javascript:alert(1)", "https://localhost/", "https://service.internal/", "https://user:pass@example.com", "https://127.0.0.1/"]:
            entry = copy.deepcopy(self.entry)
            entry["links"] = [{"label": "Link", "href": href}]
            with self.assertRaises(ValueError):
                ops.validate_entry(entry)

    def test_symlinks_and_filename_identity_mismatch_are_rejected(self):
        external = self.root / "private.json"
        external.write_text(json.dumps(self.envelope))
        source = self.queue / "portfolio-yenileme.json"
        source.symlink_to(external)
        with self.assertRaises(OSError):
            ops.export_queue(self.queue, self.target, apply=True)
        source.unlink()
        self.put(name="another-project.json")
        with self.assertRaises(ValueError):
            ops.export_queue(self.queue, self.target, apply=True)

    def test_invalid_batch_is_atomic_and_preserves_previous_projection(self):
        self.target.write_text(json.dumps(self.seed))
        before = self.target.read_bytes()
        self.put()
        (self.queue / "zzz-private.json").write_text('{"visibility":"private"}')
        with self.assertRaises(ValueError):
            ops.export_queue(self.queue, self.target, apply=True)
        self.assertEqual(before, self.target.read_bytes())

    def test_invalid_date_and_oversized_files_are_rejected(self):
        self.envelope["entry"]["date"] = "2999-01-01"
        self.put()
        with self.assertRaises(ValueError):
            ops.export_queue(self.queue, self.target)
        (self.queue / "portfolio-yenileme.json").write_text(" " * 70000)
        with self.assertRaises(ValueError):
            ops.export_queue(self.queue, self.target)

    def test_maintenance_keeps_only_fourteen_valid_content_backups(self):
        state = self.root / "state"
        state.mkdir()
        for i in range(18):
            (state / (f"{i:064x}" + ".json")).write_text(json.dumps(self.seed))
        (state / "health.json").write_text('{"status":"ok"}')
        result = ops.trim_backups(state)
        self.assertEqual(result["retained"], 14)
        self.assertEqual(result["removed"], 4)
        self.assertTrue((state / "health.json").exists())

    def test_backup_restore_is_validated_and_defaults_to_dry_run(self):
        state = self.root / "state"
        state.mkdir()
        identity = "a" * 64
        (state / (identity + ".json")).write_text(json.dumps(self.seed))
        ops.restore_backup(state, identity, self.target)
        self.assertFalse(self.target.exists())
        ops.restore_backup(state, identity, self.target, apply=True)
        self.assertEqual(json.loads(self.target.read_text()), self.seed)
        with self.assertRaises(ValueError):
            ops.restore_backup(state, "../private", self.target, apply=True)

if __name__ == "__main__":
    unittest.main()
