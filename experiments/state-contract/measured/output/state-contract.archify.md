# Which state-event pairs are declared? {#state-contract}

Both observed toggle pairs are declared in this official fixture export; the observed event list does not establish a complete business event contract.

@answer scope="Observed toggle only; no events run"
@meta locale=en

## What does the export declare? {#state-graph}

@diagram lifecycle source=state-contract.lifecycle.json

Initial state from the sidecar: ID `1`, label `"inactive"`.

The diagram preserves every supplied event edge, including cycles. Its reading order does not identify a business success path.

## Which observed pairs are declared? {#event-matrix}

| State ID and label | `"toggle"` |
| --- | --- |
| `1` `"inactive"` | declared |
| `2` `"active"` | declared |

Declared means at least one supplied transition has that source state and exact event name. Undeclared means no such transition was supplied.

## Where do declared events point? {#transition-list}

| Edge index | From ID | Event | To ID |
| --- | --- | --- | --- |
| 0 | `1` | `"toggle"` | `2` |
| 1 | `2` | `"toggle"` | `1` |

## What produced this export? {#measured-source}

The complete upstream features module was constructed, including all exported and nested machines. Only its transitions machine was passed once to getDAG. No machine event, interpret, state entry or guard, reducer, action or invoke callback ran.

The source is [robot3-viz at fixed revision 5e931694](https://github.com/jbreckmckye/robot3-viz/blob/5e931694734445b3cd91d20dfc916901035f31c8/test/machines/features.ts). This run produced the complete nodes and edges JSON; the upstream repository did not already contain that export.

The independent sidecar maps constructor current inactive to the unique exported ID 1. Its expected event list contains only the observed toggle label. Two declared and zero undeclared cells do not prove that other business events are absent or supported.

## What remains unknown? {#scope}

Runtime reachability, handler behavior, guard outcomes and business success are not established by this static export.

Events outside the supplied expected list: none.

Labels and event names are displayed as JSON literals. Escaped Unicode notation preserves literal punctuation without making links.
