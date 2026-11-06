# Domain docs

Solux uses a single-context layout for its core state/event domain. The public
library and documentation site do not introduce separate bounded contexts.

## Before exploring

- Read `docs/context/root.md` if it exists.
- Read applicable ADRs directly under `docs/adr/` if present.
- Use the public package entry point, implementation, tests, and README to
  establish current behavior. After relocation these live under
  `packages/solux`; before relocation inspect root `src/` and `test/`.

If context files or ADRs do not exist, proceed silently. Do not suggest creating
them upfront. Domain-modeling workflows may add them later when a real term or
decision is resolved; skill installation does not generate a model or ADRs.

## Vocabulary and scope

An **event** has a string `type`; an **event creator** builds events and exposes
`type` and `match`. A **handler** receives state and an event. A **slice** supplies
initial state and a handler; `combineSlices` composes slices. A **store** exposes
reactive state, dispatch, store/event subscriptions, and explicit disposal.
**Enhancers** extend stores; **middleware** wraps dispatch. An **epic** consumes
an RxJS event stream, state, and an optional container and emits events.
`SoluxProvider` / `useSolux` provide Solid context access.

Preserve the existing lifecycle and DevTools scope documented in
[CODING_STANDARD.md](../../CODING_STANDARD.md): explicit owner-managed disposal,
per-connection DevTools cleanup, detached snapshots, caller-owned live-state
isolation, and no automatic cancellation of epics or middleware effects.
Gurafu is a downstream adoption context, not a separate Solux domain.

If a glossary exists, use its defined terms in issues, tests, and proposals.
Reconsider invented synonyms or record a concrete gap for later modeling. If a
proposal conflicts with an existing ADR, name the ADR and explain the conflict.

## Layout if documentation is needed later

Use `docs/context/root.md` and flat `docs/adr/NNNN-<decision>.md` files. Do not
create a context map or per-package contexts solely because this is a workspace.
