# Test failure stages and supplied positions {#test-failure-map}

Unavailable supplied failed stages; 1 supplied failed collectors. Missing stages are not passed. Positions are unverified literals, not root-cause or call-graph proof.

@answer scope="synthetic fixture · no pytest or user code executed · provided records only; no completeness claim"
@meta locale=en

## Which stage actually has a supplied result? {#overview}

| Test | Reported total | Setup | Call | Teardown |
| --- | --- | --- | --- | --- |
| unavailable: no test records | not inferred | not-provided | not-provided | not-provided |

provided records only; no completeness claim. These are original synthetic scenarios, not results of running the exporter.

## Which supplied source positions can be read? {#positions}

| Record and role | Literal display path | Raw line | Display line | Convention |
| --- | --- | --- | --- | --- |
| unavailable | no supplied test/crash/frame positions | unavailable | unavailable | not inferred |

Nodeid identifies collection, not necessarily the definition file. The exporter retains test line but omits location[0], so that file is unavailable. No path or URL was opened; no source text was verified. Frame order is a supplied list, not proof of direct calls or a complete stack.

## What happened during collection? {#collection}

| Collector | Collection outcome | Position |
| --- | --- | --- |
| collector 1: `tests/test_import.py` | failed | not supplied by collector serializer |

## What was omitted and what evidence remains? {#evidence}

@facts
| Source pins | pytest-json-report c6f0bc93a174; pytest 8.4.2 bfae4224fd55 |
| Input classification | synthetic |
| Report SHA-256 | `39583263c80a630fb99e68d802f771f93e4dcfb4e1de1e60cb69fc8a3e1e9747` |
| Scope | supplied stages and literal positions only; source files not read |
| Excluded fields | root, environment, streams, logs, longrepr and unselected fields |

Metadata is not necessarily anonymous. Missing traceback is unavailable, not an empty-stack or success claim. Complete selected evidence remains in the separate `projection.json` file; it is not duplicated in this page.
