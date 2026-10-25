# What changed in this API payload sample? {#payload-delta}

The two original synthetic samples for GET /inventory differ in 6 records. Compare the named call with its nearby JSON Pointer table. Array policy: idKey=sku; exact string/number identity; no guessing.

@answer scope="Synthetic payload values only; not a schema compatibility verdict or captured traffic"

## Which call do these samples describe? {#call}

Caller: Inventory dashboard. Callee: Synthetic inventory API. Operation: GET /inventory. Array policy: idKey=sku; exact string/number identity; no guessing.

@diagram sequence id=sample-call source=call.sequence.json title="Named synthetic call and explicit array policy"

## Which exact values changed? {#changes}

Table code cells are literal; backticks and control characters use visible Unicode escapes, with exact raw pointers and values retained in delta.json. Pointers are displayed as JSON strings using RFC 6901 escaping; the empty JSON string denotes the root. JSON string escaping distinguishes control characters from literal backslashes. Old and new pointers are shown separately when id matching moves an item. MISSING means absent, distinct from null. Array membership/order records include the whole array and overlap the detailed field records; these are records, not a count of independent edits.

| Record | Kind | Before pointer | After pointer | Before (type and value) | After (type and value) | Note |
| --- | --- | --- | --- | --- | --- | --- |
| change-1 | modified | `"/count"` | `"/count"` | `string: "2"` | `number: 2` | `Value comparison` |
| change-2 | removed | `"/cursor"` | `MISSING` | `null: null` | `MISSING` | `Value comparison` |
| change-3 | modified | `"/items"` | `"/items"` | `array: [{"sku":"A-10","stock":12},{"sku":"B-20","stock":4}]` | `array: [{"sku":"B-20","stock":6},{"sku":"A-10","stock":12}]` | `Array membership/order changed; matching by sku` |
| change-4 | modified | `"/items/1/stock"` | `"/items/0/stock"` | `number: 4` | `number: 6` | `Value comparison` |
| change-5 | removed | `"/legacy"` | `MISSING` | `boolean: true` | `MISSING` | `Value comparison` |
| change-6 | added | `MISSING` | `"/next"` | `MISSING` | `null: null` | `Value comparison` |

## Before sample {#before}

```json
{
  "items": [
    {
      "sku": "A-10",
      "stock": 12
    },
    {
      "sku": "B-20",
      "stock": 4
    }
  ],
  "cursor": null,
  "legacy": true,
  "count": "2"
}
```

## After sample {#after}

```json
{
  "items": [
    {
      "sku": "B-20",
      "stock": 6
    },
    {
      "sku": "A-10",
      "stock": 12
    }
  ],
  "count": 2,
  "next": null
}
```

## What can this page establish? {#limits}

It compares the explicitly supplied values using the displayed policy. It does not infer required fields, runtime reachability, traffic, schema breaking changes, test coverage or approval. Caller, callee and operation are supplied labels, not repository-derived facts.
