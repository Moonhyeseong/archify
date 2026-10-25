# Test failure stages and supplied positions {#test-failure-map}

1 supplied failed stages; unavailable supplied failed collectors. Missing stages are not passed. Positions are unverified literals, not root-cause or call-graph proof.

@answer scope="synthetic supplied fixture · this reader does not execute pytest or user code · provided records only; no completeness claim"
@meta locale=en

## Which stage actually has a supplied result? {#overview}

| Test | Reported total | Setup | Call | Teardown |
| --- | --- | --- | --- | --- |
| test 1: `tests/test_orders.py::test_total` | error | passed | passed | failed |

Traceback coverage for test 1: setup: not provided (unavailable); call: not provided (unavailable); teardown: supplied 1 frames (completeness unknown).

provided records only; no completeness claim. The sidecar classifies this input as a synthetic supplied fixture. Classification is supplied metadata, not an anonymization or authenticity guarantee. The reader does not verify how the report was produced.

## Which supplied source positions can be read? {#positions}

| Record and role | Literal display path | Raw line | Display line | Convention |
| --- | --- | --- | --- | --- |
| location 1: `tests/test_orders.py::test_total reported test line (file unavailable)` | `unavailable: definition file not exported` | 9 | 10 | zero-based test.lineno + 1 |
| location 2: `tests/test_orders.py::test_total teardown crash` | `tests/conftest.py` | 32 | 32 | one-based; unchanged |
| location 3: `tests/test_orders.py::test_total teardown frame` | `tests/conftest.py` | 32 | 32 | one-based; unchanged |

| Location | Selected message |
| --- | --- |
| location 2 | `Synthetic cleanup failure` |
| location 3 | `Synthetic cleanup frame` |

Nodeid identifies collection, not necessarily the definition file. The exporter retains test line but omits location[0], so that file is unavailable. No path or URL was opened; no source text was verified. Frame order is a supplied list, not proof of direct calls or a complete stack.

## What happened during collection? {#collection}

| Collector | Collection outcome | Position |
| --- | --- | --- |
| unavailable | no collector records supplied | no inference |

## What was omitted and what evidence remains? {#evidence}

@facts
| Source pins | pytest-json-report c6f0bc93a174; pytest 8.4.2 bfae4224fd55 |
| Input classification | synthetic |
| Report SHA-256 | `2c52e35b40789513d7797b6cabbe92734008f59dbee3b8e509e86668989e64bf` |
| Scope | supplied stages and literal positions only; source files not read |
| Excluded fields | root, environment, streams, logs, longrepr and unselected fields |

Metadata is not necessarily anonymous. Missing traceback is unavailable, not an empty-stack or success claim. Complete selected evidence remains in the separate `projection.json` file; it is not duplicated in this page.
