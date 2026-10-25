#!/usr/bin/env python3
"""Build an offline gallery from fixed, already published experiment objects.

Run with --worktree-root pointing to the directory containing lab-*/archify.
Only Git/object reads occur in those worktrees. No experiment code is executed.
"""
import argparse
import base64
import hashlib
import html
import json
import os
from pathlib import Path
import re
import struct
import subprocess
from urllib.parse import quote


HERE = Path(__file__).resolve().parent
HUB = HERE.parents[3]
SHA = re.compile(r"^[a-f0-9]{40}$")


def git(repo, *args):
    env = {key: value for key, value in os.environ.items() if not key.upper().startswith("GIT_")}
    env.update(GIT_NO_LAZY_FETCH="1", GIT_ALLOW_PROTOCOL="", GIT_TERMINAL_PROMPT="0",
               GIT_OPTIONAL_LOCKS="0", GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull)
    return subprocess.check_output([
        "git", "--no-pager", "--no-replace-objects", "-c", "core.fsmonitor=false",
        "-c", "core.hooksPath=/dev/null", "-C", str(repo), *args,
    ], env=env)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def source(repo, commit, path, compare_worktree=False):
    assert SHA.fullmatch(commit)
    assert not path.startswith("/") and all(p not in ("", ".", "..") for p in path.split("/"))
    data = git(repo, "show", f"{commit}:{path}")
    if compare_worktree:
        assert (repo / path).read_bytes() == data, f"Working bytes differ: {path}"
    return data, {
        "path": path, "commit": commit, "sha256": digest(data), "bytes": len(data),
        "gitBlob": git(repo, "rev-parse", f"{commit}:{path}").decode().strip(),
    }


def link(repo, kind, revision, path=""):
    return f"{repo}/{kind}/{quote(revision, safe='/')}/{quote(path, safe='/')}".rstrip("/")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--worktree-root", required=True, type=Path)
    args = parser.parse_args()
    seed = json.loads((HERE / "selection.json").read_text())
    hub_bytes, hub_source = source(HUB, seed["hubCommit"], seed["hubPath"])
    rows = {}
    pattern = re.compile(r"\| \[([^]]+)\]\(https://github.com/tt-a1i/archify/tree/(codex/[^/]+)/(experiments/[^)]+)\) \| (.*?) \| `([a-f0-9]+)` \| (.*?) \| (.*?) \|$")
    for line in hub_bytes.decode().splitlines():
        match = pattern.fullmatch(line)
        if match:
            name, branch, directory, value, revision, _, limits = match.groups()
            rows[branch] = dict(title=name, directory=directory, value=value, revision=revision, limits=limits)
    assert len(rows) == len(seed["items"]) == 27
    assert set(rows) == {item["branch"] for item in seed["items"]}
    manifest = {
        "version": 1, "kind": "offline-original-png-gallery", "date": "2026-10-25",
        "repository": seed["repository"], "hub": hub_source,
        "policy": "27 published experiments from the fixed hub. Original PNG bytes only; card previews are CSS crops. No network request, analytics, dependency or experiment execution. Branch publication is not merge, release, CI success or human acceptance.",
        "groups": seed["groups"], "visualSources": [], "items": [], "deferred": seed["deferred"],
    }
    for path in seed["visualSourcePaths"]:
        _, entry = source(HUB, seed["hubCommit"], path)
        manifest["visualSources"].append(entry)
    cards = {key: [] for key in seed["groups"]}
    total_png_bytes = 0
    for item in seed["items"]:
        row = rows[item["branch"]]
        assert row["directory"] == item["directory"] and item["commit"].startswith(row["revision"])
        repo = args.worktree_root / item["branch"].removeprefix("codex/") / "archify"
        assert git(repo, "rev-parse", "HEAD").decode().strip() == item["commit"]
        assert git(repo, "rev-parse", "refs/remotes/origin/" + item["branch"]).decode().strip() == item["commit"]
        _, readme = source(repo, item["commit"], item["directory"] + "/README.md", True)
        png, image = source(repo, item["commit"], item["imagePath"], True)
        assert png[:8] == b"\x89PNG\r\n\x1a\n" and png[12:16] == b"IHDR"
        image["width"], image["height"] = struct.unpack(">II", png[16:24])
        image["mime"] = "image/png"
        image["caption"] = item["imageCaption"]
        image["byteIdentity"] = "Working file bytes equal fixed HEAD Git blob; embedded unchanged."
        total_png_bytes += len(png)
        entry = {
            **item, "title": row["title"], "value": row["value"], "limits": row["limits"],
            "readme": readme, "image": image,
            "fixedSourceUrl": link(seed["repository"], "tree", item["commit"], item["directory"]),
            "branchUrl": link(seed["repository"], "tree", item["branch"], item["directory"]),
            "imageSourceUrl": link(seed["repository"], "blob", item["commit"], item["imagePath"]),
        }
        manifest["items"].append(entry)
        esc = html.escape
        search = " ".join([row["title"], row["value"], row["limits"], item["inputKind"], item["branch"], seed["groups"][item["group"]]["label"]])
        data_uri = "data:image/png;base64," + base64.b64encode(png).decode()
        cards[item["group"]].append(f'''<article class="card" id="{esc(item['id'])}" data-search="{esc(search, quote=True)}">
  <div class="card-copy"><div class="card-tags"><span>{esc(item['inputKind'])}</span><code>{esc(item['commit'][:8])}</code></div>
  <h3>{esc(row['title'])}</h3><p class="value">{esc(row['value'])}</p></div>
  <button type="button" class="image-open" aria-label="查看 {esc(row['title'], quote=True)} 完整原图" data-title="{esc(row['title'], quote=True)}" data-caption="{esc(item['imageCaption'], quote=True)}" data-size="{image['width']} × {image['height']}" data-sha="{image['sha256']}" data-source="{esc(entry['imageSourceUrl'], quote=True)}">
    <img src="{data_uri}" width="{image['width']}" height="{image['height']}" alt="{esc(item['imageCaption'], quote=True)}" loading="lazy" decoding="async"><span class="preview-note">预览已裁切 · 点击完整图</span>
  </button>
  <div class="card-detail"><p class="image-caption">{esc(item['imageCaption'])}</p><p class="limits"><strong>验证边界</strong>{esc(row['limits'])}</p>
  <div class="card-links"><a href="{esc(entry['fixedSourceUrl'], quote=True)}" target="_blank" rel="noopener noreferrer">固定提交说明 ↗</a><a href="{esc(entry['branchUrl'], quote=True)}" target="_blank" rel="noopener noreferrer">分支 ↗</a></div></div>
</article>''')
    groups_html = []
    for key, group in seed["groups"].items():
        count = len(cards[key])
        groups_html.append(f'''<section class="group" data-group="{key}" aria-labelledby="heading-{key}"><header class="group-head"><div><h2 id="heading-{key}">{html.escape(group['label'])}<span class="group-count">{count}</span></h2><p>{html.escape(group['description'])}</p></div></header><div class="grid">{''.join(cards[key])}</div></section>''')
    manifest["summary"] = {"experiments": 27, "images": 27, "pngBytes": total_png_bytes, "groupCounts": {key: len(value) for key, value in cards.items()}, "deferredCountedAsPublished": False}
    manifest_bytes = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode()
    (HERE / "manifest.json").write_bytes(manifest_bytes)
    deferred = seed["deferred"]
    deferred_url = link(seed["repository"], "tree", deferred["commit"], deferred["directory"])
    template = (HERE / "template.html").read_text()
    page = template.replace("<!-- GALLERY -->", "\n".join(groups_html)).replace("<!-- DEFERRED -->", f'<a href="{html.escape(deferred_url, quote=True)}" target="_blank" rel="noopener noreferrer">Relation return · {deferred["commit"][:8]} ↗</a><p>{html.escape(deferred["reason"])}</p>')
    page = page.replace("__MANIFEST_SHA__", digest(manifest_bytes)).replace("__HUB_COMMIT__", seed["hubCommit"])
    assert "<!-- GALLERY -->" not in page and page.count('class="card"') == 27
    for forbidden in ("/Users/", "/private/tmp/", "file://", "http://localhost"):
        assert forbidden not in page and forbidden not in manifest_bytes.decode()
    (HERE / "index.html").write_text(page)
    print(json.dumps({**manifest["summary"], "htmlBytes": len(page.encode()), "htmlSha256": digest(page.encode()), "manifestSha256": digest(manifest_bytes)}, indent=2))


if __name__ == "__main__":
    main()
