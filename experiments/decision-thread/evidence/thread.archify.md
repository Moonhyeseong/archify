# Queue rollout decision thread {#decision-thread}

Recorded decisions: m6. Explicitly unresolved objections: m4. Agreement is not inferred.

@answer scope="fictional input · message order only · equal spacing is not elapsed time · no agreement inferred"
@meta locale=en

## What was said in order? {#message-order}

@diagram sequence source=thread.sequence.json

## m1: proposal {#event-m1}

From atlas to birch. References: none.

```json
{
  "id": "m1",
  "from": "atlas",
  "to": "birch",
  "order": 1,
  "kind": "proposal",
  "text": "Proposal: enable the queue for every tenant tomorrow.",
  "references": []
}
```

## m2: objection {#event-m2}

From birch to atlas. References: m1. Input-declared objection status: withdrawn.

```json
{
  "id": "m2",
  "from": "birch",
  "to": "atlas",
  "order": 2,
  "kind": "objection",
  "text": "I object: rollback ownership is missing. Do not treat this as approval.",
  "references": [
    "m1"
  ],
  "objectionStatus": "withdrawn"
}
```

## m3: revision {#event-m3}

From atlas to cedar. References: m1, m2.

```json
{
  "id": "m3",
  "from": "atlas",
  "to": "cedar",
  "order": 3,
  "kind": "revision",
  "text": "Revision: try one fictional tenant only. Cedar owns rollback. This revises m1; it does not erase m2.",
  "references": [
    "m1",
    "m2"
  ]
}
```

## m4: objection {#event-m4}

From cedar to atlas. References: m3. Input-declared objection status: unresolved.

```json
{
  "id": "m4",
  "from": "cedar",
  "to": "atlas",
  "order": 4,
  "kind": "objection",
  "text": "I still object: the queue-age alert has no tested threshold. This objection remains unresolved even if a trial is chosen.",
  "references": [
    "m3"
  ],
  "objectionStatus": "unresolved"
}
```

## m5: withdrawal {#event-m5}

From birch to atlas. References: m2, m3.

```json
{
  "id": "m5",
  "from": "birch",
  "to": "atlas",
  "order": 5,
  "kind": "withdrawal",
  "text": "I withdraw only my rollback-ownership objection m2 because the revised proposal names an owner. I am not speaking for Cedar.",
  "references": [
    "m2",
    "m3"
  ]
}
```

## m6: decision {#event-m6}

From atlas to cedar. References: m3, m4, m5.

```json
{
  "id": "m6",
  "from": "atlas",
  "to": "cedar",
  "order": 6,
  "kind": "decision",
  "text": "My recorded decision: prepare the isolated trial, but do not deploy until the alert threshold is checked. This is my statement, not unanimous agreement.",
  "references": [
    "m3",
    "m4",
    "m5"
  ]
}
```

## m7: message {#event-m7}

From cedar to birch. References: m4, m6.

```json
{
  "id": "m7",
  "from": "cedar",
  "to": "birch",
  "order": 7,
  "kind": "message",
  "text": "I acknowledge receipt of m6. My objection m4 stays unresolved. No production rollout has happened in this fictional example.",
  "references": [
    "m4",
    "m6"
  ]
}
```

