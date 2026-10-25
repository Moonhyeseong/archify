#!/usr/bin/env python3
"""Check the portable gallery's original image bytes and JavaScript syntax."""
import argparse
import base64
from collections import Counter
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import subprocess


HERE = Path(__file__).resolve().parent


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
        self.cards = 0
        self.scripts = []
        self.in_script = False
        self.remote_resources = []
        self.anchors = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "article" and attrs.get("class") == "card":
            self.cards += 1
        if tag == "img" and attrs.get("src"):
            self.images.append(attrs["src"])
        for key in ("src", "srcset", "poster"):
            if key in attrs and not attrs[key].startswith("data:"):
                self.remote_resources.append((tag, key))
        if tag == "link" and attrs.get("href"):
            self.remote_resources.append((tag, "href"))
        if tag == "a":
            self.anchors.append(attrs.get("href", ""))
        if tag == "script":
            self.in_script = True
            self.scripts.append("")

    def handle_endtag(self, tag):
        if tag == "script":
            self.in_script = False

    def handle_data(self, data):
        if self.in_script:
            self.scripts[-1] += data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--node", default="node")
    args = parser.parse_args()
    raw = (HERE / "index.html").read_bytes()
    manifest_raw = (HERE / "manifest.json").read_bytes()
    manifest = json.loads(manifest_raw)
    page = Page()
    page.feed(raw.decode())
    assert page.cards == len(page.images) == len(manifest["items"]) == 27
    assert not page.remote_resources, page.remote_resources
    embedded_hashes = Counter()
    for image in page.images:
        assert image.startswith("data:image/png;base64,")
        data = base64.b64decode(image.split(",", 1)[1], validate=True)
        assert data[:8] == b"\x89PNG\r\n\x1a\n"
        embedded_hashes[hashlib.sha256(data).hexdigest()] += 1
    assert embedded_hashes == Counter(item["image"]["sha256"] for item in manifest["items"])
    for item in manifest["items"]:
        assert item["fixedSourceUrl"] in page.anchors
        assert item["branchUrl"] in page.anchors
    assert len(page.scripts) == 1
    subprocess.run([args.node, "--check", "--input-type=commonjs"], input=page.scripts[0].encode(), check=True)
    assert hashlib.sha256(manifest_raw).hexdigest() in raw.decode()
    assert not any(value in raw.decode() for value in ("/Users/", "/private/tmp/", "file://"))
    result = {
        "kind": "static-byte-and-syntax-verification",
        "htmlSha256": hashlib.sha256(raw).hexdigest(),
        "manifestSha256": hashlib.sha256(manifest_raw).hexdigest(),
        "htmlBytes": len(raw), "experiments": page.cards, "originalPngs": len(page.images),
        "allEmbeddedPngHashesMatchManifest": True,
        "allFixedAndBranchLinksPresent": True, "externalResourceReferences": 0,
        "javascriptSyntax": "pass", "browserInteractions": "not-run-by-builder",
        "limits": "Static checks do not establish rendering, image readability, keyboard behavior, device or human acceptance. Browser evidence is recorded separately by the coordinating agent.",
    }
    (HERE / "verification.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
