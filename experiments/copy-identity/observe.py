"""Observe the fixed list-copy construction using only the Python standard library.

Original observation harness: contributed under the repository Apache-2.0 license.
The marked construction is reused verbatim from memory_graph, Copyright (c) 2023
Bas Terwijn, SPDX-License-Identifier: BSD-2-Clause. See source/LICENSE.txt.
This program never imports memory_graph or executes the downloaded source file.
"""

import copy
import hashlib
import itertools
import json
from pathlib import Path
import platform

HERE = Path(__file__).resolve().parent
source = (HERE / "source/copy_mutable.py").read_bytes()
source_sha = hashlib.sha256(source).hexdigest()
if source_sha != "ea76c0f64542e239a7ab77e468564d5e3c358d8abdef80ba7b932c69ba2bd31b":
    raise ValueError("The fixed upstream source bytes changed")
body = b"".join(source.splitlines(keepends=True)[7:13])
own_source = Path(__file__).read_bytes()
marked = own_source.split(b"# BEGIN CONSTRUCTION\n", 1)[1].split(b"# END CONSTRUCTION", 1)[0]
if marked != body:
    raise ValueError("The literal construction differs from upstream lines 8–13")

# BEGIN CONSTRUCTION
a = [ [1, 2], ['x', 'y'] ] # a nested list (a list containing lists)

# three different ways to make a "copy" of 'a':
c1 = a
c2 = copy.copy(a) # equivalent to:  a.copy() a[:] list(a)
c3 = copy.deepcopy(a)
# END CONSTRUCTION

roots = {"a": a, "c1": c1, "c2": c2, "c3": c3}
objects = []
labels = iter(["A", "B", "C", "P", "Q", "R", "S"])


def intern(value):
    for label, known in objects:
        if value is known:
            return label
    label = next(labels)
    objects.append((label, value))
    return label


bindings = [{"variable": name, "target": intern(value)} for name, value in roots.items()]
references = []
lists = []
index = 0
while index < len(objects):
    label, value = objects[index]
    elements = []
    for item_index, item in enumerate(value):
        if isinstance(item, list):
            target = intern(item)
            references.append({"from": label, "index": item_index, "to": target})
            elements.append({"index": item_index, "listReference": target})
        else:
            elements.append({"index": item_index, "embeddedValue": item})
    lists.append({"symbol": label, "elements": elements})
    index += 1

pairs = [
    {"left": left, "right": right, "sameObject": roots[left] is roots[right],
     "equalContents": roots[left] == roots[right]}
    for left, right in itertools.combinations(roots, 2)
]
print(json.dumps({
    "kind": "actual-stdlib-observation-of-fixed-teaching-construction",
    "scope": "Four selected variables and reachable list identities only; no scalar identity claim or mutation",
    "sourceSha256": source_sha,
    "constructionSha256": hashlib.sha256(body).hexdigest(),
    "sourceLines": {"first": 8, "last": 13},
    "runtime": {"implementation": platform.python_implementation(), "version": platform.python_version()},
    "symbolPolicy": "A/B/C/P/Q/R/S are traversal labels, not addresses or persistent IDs",
    "variableBindings": bindings,
    "lists": lists,
    "listReferences": references,
    "rootPairs": pairs,
    "upstreamToolImported": False,
    "upstreamRenderCalled": False,
    "mutationPerformed": False
}, ensure_ascii=False, indent=2))
