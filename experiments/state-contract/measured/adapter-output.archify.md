# Which state-event pairs are declared? {#state-contract}

0 of 2 expected state-event pairs have no declaration in the supplied export.

@answer scope="Frozen flat export · no machine execution"
@meta locale=en

## What does the export declare? {#state-graph}

@diagram lifecycle source=state-contract.lifecycle.json

Initial state from the sidecar: ID `1`, label `"inactive"`.

The diagram preserves every supplied event edge, including cycles. Its reading order does not identify a business success path.

## Which expected events are missing here? {#event-matrix}

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

## What remains unknown? {#scope}

Runtime reachability, handler behavior, guard outcomes and business success are not established by this static export.

Events outside the supplied expected list: none.

Labels and event names are displayed as JSON literals. Escaped Unicode notation preserves literal punctuation without making links.
