# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- If `docs/context/map.md` exists, read it first, then read each linked context file relevant to the topic.
- Otherwise, read `docs/context/root.md` if it exists.
- In a single-context project, read applicable ADRs directly under `docs/adr/`.
- In a multi-context project, read applicable system ADRs under `docs/adr/root/` and ADRs under each relevant `docs/adr/<context>/` directory.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo (most repos):

```text
docs/
├── context/
│   └── root.md
└── adr/
    ├── 0001-event-sourced-orders.md
    └── 0002-postgres-for-write-model.md
```

Multi-context repo (presence of `docs/context/map.md`):

```text
docs/
├── context/
│   ├── map.md
│   ├── ordering.md
│   └── billing.md
└── adr/
    ├── root/
    ├── ordering/
    └── billing/
```

Use context slugs consistently between `docs/context/<context>.md` and `docs/adr/<context>/`.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant context file. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts `docs/adr/ordering/0007-event-sourced-orders.md`, but worth reopening because…_
