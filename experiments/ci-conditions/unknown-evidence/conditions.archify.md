# Unknown CI conditions {#ci-conditions}

Needs describe dependencies, not which jobs will run. Conditions are not evaluated; run outcomes remain unknown.

@answer scope="synthetic snapshot · execution not run · static reading only"
@meta locale=en

## What are the declared gates? {#overview}

| Job | Raw if or availability | Status gate | Declared matrix |
| --- | --- | --- | --- |
| quality | no explicit if (verified absent) | implicit success() | 3 declared combinations |
| package | unknown: source unavailable | unknown: not analyzed | unknown: dynamic expression |
| publish | `contains(github.event.head_commit.message, 'always()')` | unknown: not analyzed | no matrix declared |

All conditions remain not evaluated. Counts describe declarations, not observed runs. Complete raw values and source ranges follow below.

## Which jobs depend on earlier jobs? {#needs}

@diagram architecture source=needs.json

## quality: conditions and matrix {#job-quality}

implicit success(): no explicit if in supplied source snapshot. Run outcome: unknown.

```json
{
  "id": "quality",
  "needs": [],
  "condition": {
    "availability": "verified-absent"
  },
  "statusGate": "implicit success(): no explicit if in supplied source snapshot",
  "matrix": {
    "kind": "literal",
    "axes": {
      "node": [
        20,
        22,
        24
      ]
    },
    "modifiers": [],
    "combinations": 3,
    "meaning": "declared axis product only; no observed executions"
  },
  "sourceLines": [
    13,
    29
  ],
  "runOutcome": "unknown: no run data"
}
```

## package: conditions and matrix {#job-package}

unknown: source condition unavailable; not unconditional. Run outcome: unknown.

```json
{
  "id": "package",
  "needs": [
    "quality"
  ],
  "condition": {
    "availability": "unavailable"
  },
  "statusGate": "unknown: source condition unavailable; not unconditional",
  "matrix": {
    "kind": "dynamic",
    "raw": "${{ fromJSON(needs.quality.outputs.matrix) }}",
    "combinations": null,
    "meaning": "unknown; expression preserved and not expanded"
  },
  "sourceLines": [
    31,
    44
  ],
  "runOutcome": "unknown: no run data"
}
```

## publish: conditions and matrix {#job-publish}

unknown: status-function analysis outside supported syntax; supplied if not evaluated. Run outcome: unknown.

```json
{
  "id": "publish",
  "needs": [
    "package"
  ],
  "condition": {
    "availability": "provided",
    "raw": "contains(github.event.head_commit.message, 'always()')"
  },
  "statusGate": "unknown: status-function analysis outside supported syntax; supplied if not evaluated",
  "matrix": {
    "kind": "none",
    "meaning": "no matrix declared in snapshot; one job definition, not one observed run"
  },
  "sourceLines": [
    46,
    54
  ],
  "runOutcome": "unknown: no run data"
}
```

## What was inspected and omitted? {#coverage}

This is an explicitly curated snapshot, not a complete YAML parser or runner. Status-function analysis is a bounded syntax reading, never expression evaluation. Matrix counts are declarations, not observed runs.

```json
{
  "source": {
    "classification": "synthetic",
    "url": "https://github.com/feruzkarimovv/gha-graph/blob/d3f156ec59279f134dff38c333f476e177706f9b/examples/realistic-release/.github/workflows/release.yml",
    "commit": "d3f156ec59279f134dff38c333f476e177706f9b",
    "path": "examples/realistic-release/.github/workflows/release.yml",
    "sha256": "24c37719dcd797c18c6b194fe39156a43f6465c7e288d2839f4a9e2b7ba2131f"
  },
  "coverage": {
    "stepConditions": "not-inspected",
    "outputs": "not-inspected",
    "reusableWorkflows": "not-inspected",
    "execution": "not-run"
  }
}
```
