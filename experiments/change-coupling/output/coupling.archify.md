# Co-change evidence, with its limits {#change-coupling}

This original synthetic fixture demonstrates the adapter; no repository was measured.

- Scores are symmetric and do not imply calls, causality, conditional probability or predicted change impact.
- Missing files and pairs remain unknown. An empty report proves no absence of coupling.

@answer scope="3 supplied pairs; 0 identical duplicate rows collapsed; sampling window is recorded only in evidence.json when provided."
@meta locale=en
@source formula title="Code Maat logical coupling source" url=https://github.com/adamtornhill/code-maat/blob/50537abb8dffa1b1ba4e91a605ee5c558c01b224/src/code_maat/analysis/logical_coupling.clj

## Which files belong to each observed pair? {#pairs}

@diagram architecture source=coupling.architecture.json

Pair nodes point to their two members. These arrows express membership only. Repeated file labels are the same file shown in separate pairs.

## What are the original counts? {#counts}

| Pair | File A | File B | Score | Average revisions | A / B revisions | Shared |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `src/export.mjs` | `src/reader.mjs` | 75 | 8 | 8 / 8 | 6 |
| 2 | `src/format,legacy.mjs` | `src/reader.mjs` | 40 | 10 | 12 / 8 | 4 |
| 3 | `src/render.mjs` | `src/validate.mjs` | 50 | 10 | 12 / 8 | 5 |

Score equals the integer part of 200 times shared revisions divided by the sum of both revision counts. Average revisions is rounded up.[](source:formula) Counts omitted by the default CSV stay unknown; the score alone cannot recover them.

## What should a reader check? {#review}

- [ ] Check the supplied report window and filters in evidence.json. Their absence means unknown.
- [ ] Read the paired source files before making a design decision.
- [ ] Check broad commits, generated files and renames before interpreting co-change.
