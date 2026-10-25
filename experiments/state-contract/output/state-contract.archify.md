# Which state-event pairs are declared? {#state-contract}

2 of 4 expected state-event pairs have no declaration in the supplied export.

@answer scope="Frozen flat export · no machine execution"
@meta locale=en

## What does the export declare? {#state-graph}

@diagram lifecycle source=state-contract.lifecycle.json

Initial state from the sidecar: ID `11`, label `"Off"`.

The diagram preserves every supplied event edge, including cycles. Its reading order does not identify a business success path.

## Which expected events are missing here? {#event-matrix}

| State ID and label | `"toggle"` | `"reset"` |
| --- | --- | --- |
| `11` `"Off"` | declared | undeclared |
| `27` `"On"` | declared | undeclared |

Declared means at least one supplied transition has that source state and exact event name. Undeclared means no such transition was supplied.

## Where do declared events point? {#transition-list}

| Edge index | From ID | Event | To ID |
| --- | --- | --- | --- |
| 0 | `11` | `"toggle"` | `27` |
| 1 | `27` | `"toggle"` | `11` |

## What remains unknown? {#scope}

Runtime reachability, handler behavior, guard outcomes and business success are not established by this static export.

Events outside the supplied expected list: none.

Labels and event names are displayed as JSON literals. Escaped Unicode notation preserves literal punctuation without making links.
