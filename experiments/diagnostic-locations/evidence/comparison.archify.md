# Repair the location already present in the diagnostic {#diagnostic-locations}

Three identical error messages now identify three different supplied source rows. The JSON diagnostics and nonzero exit are unchanged.

@answer scope="minimized reproduction · same input SHA before and after · no new diagnostic rules"
@meta locale=en

## Which existing subject identifies each failure? {#subjects}

| Entry | Line and column | Existing JSON path | Component |
| --- | --- | --- | --- |
| diagnostic 1 | 13:1 | `/panels/0/blocks/1/rows/2/id` | comparison |
| diagnostic 2 | 14:1 | `/panels/0/blocks/1/rows/3/id` | comparison |
| diagnostic 3 | 15:1 | `/panels/0/blocks/1/rows/4/id` | comparison |

## What changes in ordinary CLI output? {#text-output}

Before, recorded from the base CLI:

```text
Explainer draft is invalid.
[explainer/duplicate-id] This identity is already used. Use an explicit distinct ID. Fix: Use a valid form, for example: id=request-path-branch.
[explainer/duplicate-id] This identity is already used. Use an explicit distinct ID. Fix: Use a valid form, for example: id=request-path-branch.
[explainer/duplicate-id] This identity is already used. Use an explicit distinct ID. Fix: Use a valid form, for example: id=request-path-branch.
```

After, recorded from the candidate CLI:

```text
Explainer draft is invalid.
[explainer/duplicate-id] (line 13, column 1, path "/panels/0/blocks/1/rows/2/id", component "comparison", panelId "changes") This identity is already used. Use an explicit distinct ID. Fix: Use a valid form, for example: id=request-path-branch.
[explainer/duplicate-id] (line 14, column 1, path "/panels/0/blocks/1/rows/3/id", component "comparison", panelId "changes") This identity is already used. Use an explicit distinct ID. Fix: Use a valid form, for example: id=request-path-branch.
[explainer/duplicate-id] (line 15, column 1, path "/panels/0/blocks/1/rows/4/id", component "comparison", panelId "changes") This identity is already used. Use an explicit distinct ID. Fix: Use a valid form, for example: id=request-path-branch.
```

## Which evidence is actually bound? {#binding}

@facts
| Base revision | 82c7e0f089a02a4d514714adf37dc2061682da5f |
| Input SHA-256 | `fc47419405dd0f47be7e8ce6caebfc6974fd3979f0023759ef82ba9c4a722aec` |
| Machine output | raw JSON stdout byte-identical before and after |
| Exit codes | both text and JSON return 1 on both revisions |

This is a new minimized input reproducing the repeated-label problem. An older receipt lacks an input binding and is not used as proof for this input. Locations are copied from each supplied subject, without guessing missing lines or source spans.
