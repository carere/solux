# Solux coding standard

## Style and package boundaries

- Follow the repository's TypeScript and Biome configuration: strict typing,
  type-only imports where applicable, two-space indentation, double quotes, and
  existing naming conventions. Let configured tooling settle formatting.
- Keep `@carere/solux`'s entry point, exported types, ESM runtime, and packed
  declarations usable by consumers. Avoid website-only dependencies or browser
  globals in the core package's import path.
- Keep examples aligned with the exported API. The website consumes the public
  package rather than private implementation paths.
- Preserve useful generic inference for events, slices, stores, and epics.
  Explain unavoidable casts or lint suppressions locally. Avoid unrelated
  abstractions and new dependencies for small changes.

## State, events, and lifecycle

- Use Solux terms: event, event creator, handler, slice, store, enhancer,
  middleware, and epic. Handlers synchronously update state through the existing
  Solid store machinery; asynchronous work belongs in epics or caller-owned
  effects.
- Preserve handler, notification, enhancer, and middleware ordering. Live store
  subscriptions replay the latest event; their return values are RxJS
  subscriptions released with `.unsubscribe()`.
- A store's creator owns explicit, idempotent `dispose()`. Neither unmounting
  `SoluxProvider` nor disposing a Solid owner automatically disposes the store.
  Core dispatch becomes a no-op after disposal; new core subscriptions are
  closed without replay. Keep the final state readable.
- Preserve enhancer-only `onDispose`, `initialState`, and `setState` without
  exposing them on the public store. Custom enhancers retain lifecycle methods.
- Live-state isolation is caller-owned: create fresh slices and fresh nested
  initial/preloaded state per independent store or SSR request. A detached
  DevTools snapshot is not a guarantee of independent live state.
- DevTools is opt-in and safe without `window` or the extension. Cleanup is per
  connection, never the extension's global `disconnect()`. Preserve detached
  snapshots, the construction RESET baseline, and suppression of late callbacks.
  Keep chart handles, DOM nodes, and disposers outside serializable state.
- Store disposal does not cancel epics, timers, or middleware side effects.
  Middleware wrappers can still execute around a disposed core dispatch. Do not
  claim stronger cancellation or isolation semantics without implementing and
  testing a separately requested API change.

## Verification

Use [the workspace guide](docs/agents/workspace.md) for commands and check
selection. For behavior changes, add focused Bun tests at the public boundary;
cover the actual failure and relevant lifecycle or type-inference regressions.
Exercise both default and browser conditions when Solid runtime behavior matters.
Keep packed-consumer declaration and runtime checks for packaging changes.

Run the checks relevant to the change and report failures or unavailable tasks
plainly. A successful source typecheck alone does not establish that published
declarations resolve. Do not rewrite vendored skills to satisfy format or unused
code tooling; configure repository tooling outside the vendor tree instead.
