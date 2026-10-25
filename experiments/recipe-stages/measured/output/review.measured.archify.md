# What changes when priors is 1? {#recipe-stages}

b has 1 dependency calls before its body and 1 after it. The adapter reads supplied JSON without starting Just, shell commands or expressions. Input provenance is recorded separately; shape alone does not establish origin.

@answer scope="Pinned Just JSON subset; declared stages only; source coverage unknown"

## Where does the recipe body sit? {#stages}

Each side is a dependency group. The arrows connect phases; they do not assert an edge, scheduling order or concurrency between recipes within a group.

@diagram workflow id=recipe-phases source=stages.measured.workflow.json title="Before, body, after from the explicit priors boundary"

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

## Where did this measured input come from? {#measured-provenance}

This example uses a real Just 1.59.0 dump of an official test effective input, not a production project.

The selected body is empty. No recipe body, shell payload or Just expression was executed.

| Record | Identity and scope |
| --- | --- |
| Producer | Official Just 1.59.0 release, source commit 2638e9c0941edb1f409da7426fa7842887656973 |
| Fixture | Official test literal: 39 bytes; upstream harness unindent yields the 16-byte effective input |
| Contract | Adapter schema checked against d6fee036379c531369dc37f67f8d4640f6bf1e2d; this is not the binary producer commit |
| Published copy | Derived from raw dump by replacing only its machine source location; not an original export |
| Scope | Declared phase grouping; no recipe execution, scheduler trace or production acceptance |

The full natural cross-platform example was also dumped successfully. This adapter refused its assignments; no accepted graph was made from it.

The display legend uses an authored Recipe phase label. The underlying adapter JSON is retained unchanged.
