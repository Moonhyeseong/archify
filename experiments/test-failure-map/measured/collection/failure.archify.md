# Test failure stages and supplied positions {#test-failure-map}

0 supplied failed stages; 1 supplied failed collectors. Missing stages are not passed. Positions are unverified literals, not root-cause or call-graph proof.

@answer scope="provided redacted report · this reader does not execute pytest or user code · provided records only; no completeness claim"
@meta locale=en

## Which stage actually has a supplied result? {#overview}

| Test | Reported total | Setup | Call | Teardown |
| --- | --- | --- | --- | --- |
| unavailable: no test records | not inferred | not-provided | not-provided | not-provided |

provided records only; no completeness claim. The sidecar classifies this input as a provided redacted report. Classification is supplied metadata, not an anonymization or authenticity guarantee. The reader does not verify how the report was produced.

## Which supplied source positions can be read? {#positions}

| Record and role | Literal display path | Raw line | Display line | Convention |
| --- | --- | --- | --- | --- |
| unavailable | no supplied test/crash/frame positions | unavailable | unavailable | not inferred |

Nodeid identifies collection, not necessarily the definition file. The exporter retains test line but omits location[0], so that file is unavailable. No path or URL was opened; no source text was verified. Frame order is a supplied list, not proof of direct calls or a complete stack.

## What happened during collection? {#collection}

| Collector | Collection outcome | Position |
| --- | --- | --- |
| collector 1: `unavailable: collector identity not allowlisted` | passed | not supplied by collector serializer |
| collector 2: `tests/test_collection_failure.py` | failed | not supplied by collector serializer |

## What was omitted and what evidence remains? {#evidence}

@facts
| Source pins | pytest-json-report c6f0bc93a174; pytest 8.4.2 bfae4224fd55 |
| Input classification | redacted |
| Report SHA-256 | `6cd2e81ede4316f6ed8e567da67aac7a7a588206f9396947577e33f85253d30b` |
| Scope | supplied stages and literal positions only; source files not read |
| Excluded fields | root, environment, streams, logs, longrepr and unselected fields |

Metadata is not necessarily anonymous. Missing traceback is unavailable, not an empty-stack or success claim. Complete selected evidence remains in the separate `projection.json` file; it is not duplicated in this page.
