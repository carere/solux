# Domain Context Format

Domain context files live under `docs/context/`. Create the directory lazily when the first context file is needed.

## Structure

```md
# {Context Name}

{One or two sentence description of what this context is and why it exists.}

## Language

**Order**:
{A one or two sentence description of the term}
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account
```

## Rules

- **Be opinionated.** When multiple words exist for the same concept, pick the best one and list the others under `_Avoid_`.
- **Keep definitions tight.** One or two sentences max. Define what it IS, not what it does.
- **Only include terms specific to this project's context.** General programming concepts (timeouts, error types, utility patterns) don't belong even if the project uses them extensively. Before adding a term, ask: is this a concept unique to this context, or a general programming concept? Only the former belongs.
- **Group terms under subheadings** when natural clusters emerge. If all terms belong to a single cohesive area, a flat list is fine.

## Single vs multi-context repos

**Single context (most repos):** Use `docs/context/root.md`.

**Multiple contexts:** Use `docs/context/map.md` plus one sibling file per context:

```md
# Context Map

## Contexts

- [Ordering](./ordering.md): receives and tracks customer orders
- [Billing](./billing.md): generates invoices and processes payments
- [Fulfillment](./fulfillment.md): manages warehouse picking and shipping

## Relationships

- **Ordering → Fulfillment**: Ordering emits `OrderPlaced` events; Fulfillment consumes them to start picking
- **Fulfillment → Billing**: Fulfillment emits `ShipmentDispatched` events; Billing consumes them to generate invoices
- **Ordering ↔ Billing**: Shared types for `CustomerId` and `Money`
```

Keep links relative to `map.md`. Describe ownership, direction, exchanged concepts, and integration constraints. Name a DDD relationship pattern only when the evidence establishes it; event consumption alone does not imply conformist, and shared identifiers alone do not imply a shared kernel.

The skill infers which structure applies:

- If `docs/context/map.md` exists, read it to find contexts
- If only `docs/context/root.md` exists, use the single context
- If neither exists, create `docs/context/root.md` lazily when the first term is resolved unless the work clearly establishes multiple contexts

When multiple contexts exist, infer which one the current topic relates to. If unclear, ask. Define a term in the context that owns its meaning; record ownership and sharing relationships in `map.md` rather than turning the map into a second glossary.

If both canonical entry points exist, named context files exist without `map.md`, or the map links to a missing file, resolve the layout before writing. When moving to multiple contexts, split `root.md`, create `map.md`, and remove `root.md`; do not copy the whole root glossary into every context.
