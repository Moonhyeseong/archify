# What changes when priors is 1? {#recipe-stages}

b has 1 dependency calls before its body and 1 after it. The adapter reads supplied JSON without starting Just, shell commands or expressions. Input provenance is recorded separately; shape alone does not establish origin.

@answer scope="Pinned Just JSON subset; declared stages only; source coverage unknown"

## Where does the recipe body sit? {#stages}

Each side is a dependency group. The arrows connect phases; they do not assert an edge, scheduling order or concurrency between recipes within a group.

@diagram workflow id=recipe-phases source=stages.workflow.json title="Before, body, after from the explicit priors boundary"

## Which dependency is in each group? {#calls}

| Entry | Stage | Qualified identity | Raw dependency recipe | Arguments | Star | Expansion |
| --- | --- | --- | --- | --- | --- | --- |
| dependency-0 | `before` | `a` | `a` | `[]` | `null` | `no-arguments` |
| dependency-1 | `after` | `c` | `c` | `[]` | `null` | `no-arguments` |

## What is known and what remains unexpanded? {#coverage}

- All recipes present in the accepted frozen dump are indexed with module-qualified identity.
- Source coverage is unknown: Just omits disabled_recipes and absent_modules from this dump format.
- Bodies, parameters, dependency arguments, shell text, backticks and env calls are never executed or evaluated.
- This page does not model scheduler behavior, failure recovery, argument expansion or nested dependency bodies.

## Preserve the selected dependency projection {#projection}

The ordered dependency list and priors value are reproduced as JSON. This is the selected recipe projection, not a complete Justfile dump or execution log.

```json
{
  "namepath": "b",
  "module": "",
  "priors": 1,
  "dependencies": [
    {
      "index": 0,
      "stage": "before",
      "recipe": "a",
      "qualified": "a",
      "arguments": [],
      "star": null,
      "expansion": "no-arguments"
    },
    {
      "index": 1,
      "stage": "after",
      "recipe": "c",
      "qualified": "c",
      "arguments": [],
      "star": null,
      "expansion": "no-arguments"
    }
  ],
  "body": [],
  "parameters": []
}
```

## Which dumped recipe identities remain distinct? {#inventory}

No short names are merged across modules. Source paths and settings are not copied into the public page.

```json
[
  "a",
  "b",
  "c"
]
```
