---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing domain context docs, or recording or editing an ADR.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline: challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely *reading* the domain context docs for vocabulary is not this skill: that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

## File structure

Most repos have a single context:

```
docs/
├── context/
│   └── root.md
└── adr/
    ├── 0001-event-sourced-orders.md
    └── 0002-postgres-for-write-model.md
```

If `docs/context/map.md` exists, the repo has multiple contexts. The map points to the sibling context files:

```
docs/
├── context/
│   ├── map.md
│   ├── ordering.md
│   └── billing.md
└── adr/
    ├── root/                         # system-wide and cross-context decisions
    ├── ordering/                     # Ordering decisions
    └── billing/                      # Billing decisions
```

Choose multiple contexts from actual domain boundaries, ownership, and relationships, not repository size or package count alone. A monorepo can have one bounded context; a small repository can contain several.

Before selecting or creating the layout, scan for legacy root `CONTEXT.md`, `CONTEXT-MAP.md`, `GLOSSARY.md` or `GLOSSARY-MAP.md`, nested `src/*/CONTEXT.md` or `src/*/GLOSSARY.md`, and nested `src/*/docs/adr/`. If canonical and legacy paths coexist, resolve the migration before writing. Do not leave old and new layouts in parallel.

Create files lazily: only when you have something to write. If neither canonical context entry point exists, create `docs/context/root.md` when the first term is resolved unless the work clearly establishes multiple contexts. If no ADR directory exists in the applicable scope, create it when the first ADR is needed.

When a single context becomes multi-context, split the glossary into named context files, create `docs/context/map.md`, and remove `docs/context/root.md`. Move system ADRs to `docs/adr/root/` and context ADRs to the applicable `docs/adr/<context>/`. Detect filename collisions, choose unambiguous scoped numbers, and update links to moved ADRs.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in the relevant context file, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account': do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"

### Update the relevant context file inline

When a term is resolved, update `docs/context/root.md` for a single context, or the mapped `docs/context/<context>.md` for multiple contexts. Don't batch these up: capture them as they happen. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

Context files should be totally devoid of implementation details. Do not treat them as specs, scratch pads, or repositories for implementation decisions. They are glossaries and nothing else.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).
