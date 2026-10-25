# Test failure stages and supplied positions {#test-failure-map}

3 supplied failed stages; 0 supplied failed collectors. Missing stages are not passed. Positions are unverified literals, not root-cause or call-graph proof.

@answer scope="provided redacted report · this reader does not execute pytest or user code · provided records only; no completeness claim"
@meta locale=en

## Which stage actually has a supplied result? {#overview}

| Test | Reported total | Setup | Call | Teardown |
| --- | --- | --- | --- | --- |
| test 1: `tests/test_cases.py::test_setup_failure` | error | failed | not-provided | passed |
| test 2: `tests/test_cases.py::test_call_failure` | failed | passed | failed | passed |
| test 3: `tests/test_cases.py::test_teardown_failure` | error | passed | passed | failed |

Traceback coverage for test 1: setup: supplied 1 frames (completeness unknown); call: stage missing; teardown: not provided (unavailable).

Traceback coverage for test 2: setup: not provided (unavailable); call: supplied 1 frames (completeness unknown); teardown: not provided (unavailable).

Traceback coverage for test 3: setup: not provided (unavailable); call: not provided (unavailable); teardown: supplied 1 frames (completeness unknown).

provided records only; no completeness claim. The sidecar classifies this input as a provided redacted report. Classification is supplied metadata, not an anonymization or authenticity guarantee. The reader does not verify how the report was produced.

## Which supplied source positions can be read? {#positions}

| Record and role | Literal display path | Raw line | Display line | Convention |
| --- | --- | --- | --- | --- |
| location 1: `tests/test_cases.py::test_setup_failure reported test line (file unavailable)` | `unavailable: definition file not exported` | 8 | 9 | zero-based test.lineno + 1 |
| location 2: `tests/test_cases.py::test_setup_failure setup crash` | `tests/conftest.py` | 12 | 12 | one-based; unchanged |
| location 3: `tests/test_cases.py::test_setup_failure setup frame` | `tests/conftest.py` | 12 | 12 | one-based; unchanged |
| location 4: `tests/test_cases.py::test_call_failure reported test line (file unavailable)` | `unavailable: definition file not exported` | 11 | 12 | zero-based test.lineno + 1 |
| location 5: `tests/test_cases.py::test_call_failure call crash` | `tests/test_cases.py` | 13 | 13 | one-based; unchanged |
| location 6: `tests/test_cases.py::test_call_failure call frame` | `tests/test_cases.py` | 13 | 13 | one-based; unchanged |
| location 7: `tests/test_cases.py::test_teardown_failure reported test line (file unavailable)` | `unavailable: definition file not exported` | 14 | 15 | zero-based test.lineno + 1 |
| location 8: `tests/test_cases.py::test_teardown_failure teardown crash` | `tests/conftest.py` | 17 | 17 | one-based; unchanged |
| location 9: `tests/test_cases.py::test_teardown_failure teardown frame` | `tests/conftest.py` | 17 | 17 | one-based; unchanged |

| Location | Selected message |
| --- | --- |
| location 2 | literal retained in selected evidence below |
| location 3 | `AssertionError` |
| location 5 | literal retained in selected evidence below |
| location 6 | `AssertionError` |
| location 8 | literal retained in selected evidence below |
| location 9 | `AssertionError` |

Nodeid identifies collection, not necessarily the definition file. The exporter retains test line but omits location[0], so that file is unavailable. No path or URL was opened; no source text was verified. Frame order is a supplied list, not proof of direct calls or a complete stack.

## What happened during collection? {#collection}

| Collector | Collection outcome | Position |
| --- | --- | --- |
| collector 1: `unavailable: collector identity not allowlisted` | passed | not supplied by collector serializer |
| collector 2: `tests/test_cases.py` | passed | not supplied by collector serializer |

## What was omitted and what evidence remains? {#evidence}

@facts
| Source pins | pytest-json-report c6f0bc93a174; pytest 8.4.2 bfae4224fd55 |
| Input classification | redacted |
| Report SHA-256 | `ae843399872eefbe5f0c774d88b807c4ddc1cb60df2e47cecc57951499369677` |
| Scope | supplied stages and literal positions only; source files not read |
| Excluded fields | root, environment, streams, logs, longrepr and unselected fields |

Metadata is not necessarily anonymous. Missing traceback is unavailable, not an empty-stack or success claim. Complete selected evidence remains in the separate `projection.json` file; it is not duplicated in this page.

Only table values requiring literal detail are repeated here, without interpreting their content.

```json
[
  {
    "field": "location 2 message",
    "value": "AssertionError: DESIGNED setup failure\nassert 2 == 3\n +  where 2 = <function total at 0x10adb0e00>([1, 1])\n +    where <function total at 0x10adb0e00> = domain.total"
  },
  {
    "field": "location 5 message",
    "value": "AssertionError: DESIGNED call failure\nassert 3 == 99\n +  where 3 = <function total at 0x10adb0e00>([1, 2])\n +    where <function total at 0x10adb0e00> = domain.total"
  },
  {
    "field": "location 8 message",
    "value": "AssertionError: DESIGNED teardown failure\nassert 4 == 5\n +  where 4 = <function total at 0x10adb0e00>([2, 2])\n +    where <function total at 0x10adb0e00> = domain.total"
  }
]
```
