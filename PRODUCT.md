# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

This is shared product context for the Solux library and its documentation
website. They serve one product and one state/event domain.

## Users

SolidJS and TypeScript developers evaluating or adopting structured state
management. They need to assess fit, create a first working store, and apply the
library correctly in real applications.

## Product Purpose

Solux is the `@carere/solux` state management library for SolidJS. It organizes
updates through typed events and slices while Solid supplies fine-grained
reactive reads and derivations.

Success means developers can evaluate the library, build a working store, and
understand state updates, integration, and ownership well enough to use it
correctly. The documentation and interactive examples support those jobs.

## Positioning

Typed events. Fine-grained Solid state. Explicit store ownership.

Solux combines event-driven updates with Solid's reactive store machinery,
normalized entity helpers, optional RxJS epics, and opt-in Redux DevTools
integration. Explain this mechanism through working examples and precise API
contracts.

## Operating Context

Developers install the public package into SolidJS applications, read guides and
API reference material, and try counter and independent-store examples on the
documentation website. The website consumes public package exports.

English and French documentation cover the same workflows. Preserve language
parity, localized controls, searchable content, and direct links to articles.

## Capabilities and Constraints

- Preserve the public package name, exports, and TypeScript inference.
- Use the established terms: event, event creator, handler, slice, store,
  enhancer, middleware, and epic. See [the domain guide](docs/agents/domain.md).
- Handlers update state synchronously; asynchronous work belongs in epics or
  caller-owned effects.
- Store creators own disposal and independent live-state isolation. Teach those
  responsibilities and the limits of disposal and DevTools time travel using
  [the lifecycle contract](CODING_STANDARD.md#state-events-and-lifecycle).
- Distinguish current source behavior from released package capabilities.
  The documentation's release-status guidance is the source for that distinction;
  a checkout's version field alone does not establish publication.
- Preserve server-safe library imports and request-specific state ownership.

## Brand Commitments

The name is Solux; the public package is `@carere/solux`.
[images/solux.svg](images/solux.svg) is the compact Solux S mark and also serves
as the documentation website's favicon. The user authorized simplifying the
original mesh logo during the Open Space redesign.

The website follows the spacious, light composition of the user's
[Morrow reference](https://www.whichai.dev/with-design-skill/sol-6-1/1), with a
simple mark and Zaidan interface components. Its visual system is documented
in [the website design guide](apps/website/DESIGN.md).

Use clear, technically precise explanations grounded in actual behavior.

## Evidence on Hand

- [Package guide](packages/solux/README.md), public implementation, and consumer
  regressions in `packages/solux`.
- English and French articles in `apps/website/src/docs.ts` and `docs.fr.ts`.
- Working counter and independent chart-store examples in
  `apps/website/src/examples`; chart data are synthetic.
- [Website guide](apps/website/README.md) and Playwright coverage for navigation,
  localization, SSR, examples, themes, and mobile behavior. Coverage is not a
  substitute for reporting checks actually run.

Claims about adoption, performance, or customer outcomes require evidence beyond
these examples; initialization established no testimonials or benchmarks.

## Product Principles

1. Teach the real public API through examples developers can run and inspect.
2. Make store ownership and lifecycle responsibilities explicit.
3. Preserve Solid reactivity and useful TypeScript inference.
4. Keep source behavior, release status, and demonstrated guarantees distinct.
5. Keep English and French learning paths complete and consistent.

## Accessibility & Inclusion

Preserve keyboard navigation, visible focus, accessible control names, the skip
link, mobile navigation focus management, and system-theme support. Keep article
content available in server-rendered HTML and declare the selected language.

No additional accessibility conformance target was established during
initialization.
