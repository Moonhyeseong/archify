# Archify integration experiments — 2026-10-25

This is a research and experiment index, not a release announcement. The project owner requested a broad search of code-understanding and diagram projects, followed by independent remote experiment branches with actual rendered images for review. Experiments are authorized; merging, releases, installation changes, and claims of human acceptance are not part of this work.

Base: [`82c7e0f089a02a4d514714adf37dc2061682da5f`](https://github.com/tt-a1i/archify/commit/82c7e0f089a02a4d514714adf37dc2061682da5f) (`dev`, fetched 2026-10-25).

## Selection

Each candidate must solve a concrete reading or authoring problem, reuse Archify's existing capabilities where possible, and have an inspectable input, output, source attribution, and limitation. Star counts are not an eligibility threshold or ranking signal: small and early projects are explicitly included. Existing overlapping PRs are recorded rather than duplicated.

The owner requested continuous discovery and delivery until an explicit stop request. Completing this first batch does not complete the overall goal. Research, implementation, independent review, images, and publication of reviewable branches repeat in batches.

The first batch explores repository-only adapters that produce native Archify artifacts. These are experimental entry points outside the installed Skill and do not expand its public CLI or distribution contract. A useful experiment can later justify a separately reviewed product integration.

## Research

| Area | Report |
| --- | --- |
| Task-view and review maps | [Task-view](scouts/task-view.md) |
| Code and dependency maps | [Code maps](scouts/code-maps.md) |
| Graph exploration and reading | [Graph reading](scouts/graph-reading.md) |
| Text and structured-data diagrams | [Text diagrams](scouts/text-diagrams.md) |
| Runtime traces and timelines | [Traces](scouts/traces-timelines.md) |
| Git history and architecture evidence | [Git and architecture](scouts/git-architecture.md) |
| PRLens and small focused tools | [PRLens and small tools](scouts/prlens-smalltools.md) |
| Existing Archify integration points | [Integration map](integration-map.md) |

## Experiment queue

| Experiment | Inspiration / input | State |
| --- | --- | --- |
| Task review map | gtindo/task-view; declared explanations checked against a pinned Git diff | Implementing |
| Dependency map | dependency-cruiser JSON; native graph with explicit omitted/unresolved entries | Implementing |
| Trace waterfall | Chrome Trace complete events; measured durations on the existing waterfall renderer | Implementing |
| Markdown outline | Markmap; headings and source lines to the existing tree renderer | Implementing |
| DBML ERD | DBML; a documented strict table/relationship subset | Implementing |
| Change coupling | Code Maat CSV; symmetric co-change evidence, not calls or causality | Implementing |

Final branch links, exact candidate revisions, images, validation results, and outstanding defects will be added after implementation and independent review. The index must not label a local draft as pushed or tested.

## Evidence rules

- Images come from the actual generated HTML or native export, not illustrative mockups.
- Synthetic examples, measured traces, declared relationships, and inferred relationships are labelled separately.
- Retain malformed-input failures and rejected ideas; missing measurements are not zero.
- Record the exact base and tested candidate. Focused tests establish only their stated coverage.
- Human review remains pending until the project owner reviews the experiment.
- Research uses primary sources. Ideas are reimplemented independently unless copied material has an explicitly recorded compatible license and attribution.

AI assistance: Codex coordinates research, implementation, and review. Delegated work uses `gpt-6.1-sol` with medium reasoning. This is not a statement of human code or visual acceptance.
