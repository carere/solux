# Wayfinder map spec template

Convert the completed map into a decision-complete implementation spec. Treat the map as the index and read every linked resolved ticket, research artifact, and prototype note needed to recover the final decisions. Reconcile amendments and superseded decisions into one current design. Write the destination state rather than replaying the map's chronology.

Title the published issue `Spec: <destination-oriented name>`.

Begin the body with a compact provenance note:

> **Origin:** distilled from the completed wayfinding map [<map title>](<map URL>). Every decision below traces to a resolved ticket on that map, linked inline. This spec is the map's destination.

## Problem Statement

State the user's problem in their language. Synthesize the map's destination, motivating constraints, and the shortcomings of the current system into one coherent account. Preserve concrete facts that explain why the work matters.

## Solution

Describe the resolved end state from the user's perspective. Present one coherent solution assembled from the map's decisions, including its major surfaces and observable behavior. Make the organizing idea and boundaries clear before introducing implementation detail.

## User Stories

Write an extensive numbered list covering every user-visible behavior, edge case, safety property, compatibility promise, and maintainer outcome locked by the map.

Use this format:

1. As an <actor>, I want <behavior>, so that <benefit>.

For a multi-part destination, group the stories under short bold thematic labels while keeping one continuous numbered list.

## Implementation Decisions

Turn the resolved tickets into an exhaustive, buildable design:

- Open with a one-sentence overview of the implementation layers or dependency order.
- Use one descriptive `###` subsection per coherent decision cluster. Link the map tickets that established that cluster directly in its heading or opening sentence.
- State the selected design, contracts, invariants, data shapes, interactions, boundaries, configuration, failure behavior, and compatibility consequences precisely enough that implementation requires no new product or architecture decisions.
- Record the trade-offs and rejected alternatives that explain non-obvious choices. Preserve measured facts, research conclusions, and prototype results when they constrain the implementation.
- Include specific modules, file paths, interfaces, schemas, or short decision-rich snippets when the map established them and they materially remove ambiguity.
- Fold amendments into the current decision. Mention a superseded choice only when knowing the reversal prevents the implementer from following stale map material.

Account for every in-scope decision from the map and its resolved tickets exactly once in this section or in Out of Scope. Organize by the system that will be built, not by ticket chronology.

## Testing Decisions

Define what a good test observes at the highest available seam. Then list the agreed seams in priority order. For each seam, specify:

- The externally observable behaviors it must prove
- The real parts of the system and the fakes at that boundary
- Existing test files or patterns to copy
- Required harness or test-utility extensions

Call out concurrency controls, failure recovery, persistence invariants, migrations, or compatibility behavior that need direct proof. Identify thin UI or integration wiring that is intentionally covered elsewhere, and name any indispensable manual verification.

## Out of Scope

List the map's explicit exclusions, rejected expansions, deferred follow-ups, and dissolved fog. Give enough reason to keep implementation from accidentally reopening a settled boundary. Link the relevant ticket when the boundary would otherwise be surprising.

## Further Notes

Keep only information useful during implementation: dependency-aware build order, rollout constraints, prototype or research artifacts, verified environment facts, security or migration obligations, and known follow-ups. Mark prototype branches as design evidence rather than merge-ready code when applicable.

Before publishing, verify that every destination branch and every resolved map decision is represented, inline links provide traceability to the map tickets, superseded material has been reconciled, and the resulting spec can be implemented without another design pass.
