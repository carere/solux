<div align="center">
  <img src="images/solux.svg" alt="Solux" width="108" />
  <h1>Solux</h1>
  <p>Typed events. Fine-grained Solid state. Explicit store ownership.</p>
</div>

Solux is a state management library for SolidJS. Events and slices organize
updates while Solid provides reactive reads and derivations. The package includes
normalized entities, optional RxJS epics, and opt-in Redux DevTools integration.

```sh
bun add @carere/solux
```

Read the [package guide](packages/solux/README.md) for API usage. The documentation
website is prepared for **https://solux.carere.dev**; hosting has not been deployed
by this change. Run it locally with `bun moon run website:dev`.

## Repository

This is a Bun workspace with two Moon projects:

| Project | Path | Purpose |
| --- | --- | --- |
| `solux` | `packages/solux` | Published `@carere/solux` library and consumer regressions |
| `website` | `apps/website` | Documentation and executable examples using the package exports |

The root and website are private. The package name, ESM exports, and current
version `4.0.1` are preserved. Unreleased lifecycle and DevTools guarantees require
a new published v4 release before downstream adoption; this checkout is not the
existing npm artifact. See [CHANGELOG.md](CHANGELOG.md).

## Development

Use the pinned toolchain in `.prototools`: Bun 1.4.4, Node 24.22.1,
npm 11.19.1, and Moon 2.6.5.
Install [proto](https://moonrepo.dev/proto) and Cocogitto, then:

```sh
proto use
bun install --frozen-lockfile
bun lefthook install
bun moon run website:dev
```

Moon owns project commands. Run shared static tools directly from the root:

```sh
bun moon run solux:build website:build
bun tsc --noEmit
bun biome check . --error-on-warnings
bun knip
bun sort-package-json --check package.json 'apps/*/package.json' 'packages/*/package.json'
bun moon run solux:test-unit solux:test-unit-browser solux:test-package
bun moon run website:test-browser website:deploy-check
```

Install Chromium once before browser tests: `bun playwright install chromium`
from `apps/website` (CI also installs browser system dependencies).

See [CONTRIBUTING.md](CONTRIBUTING.md) for tasks and verification,
[the hosting guide](docs/website-hosting.md) for Cloudflare preparation, and
[the release guide](docs/releases.md) for the separately authorized npm workflow.

## Ownership and scope

Create fresh slices and nested state for every independent store or SSR request.
The store creator owns `store.dispose()` and all external subscriptions. Disposal
closes store observers and per-store DevTools resources; it does not cancel epics
or middleware side effects. Read the package's lifecycle and time-travel guide
before adopting the unreleased changes.

Repository skills are in [.agents/skills](.agents/skills/README.md), copied from
Gurafu with their resources and notices. [AGENTS.md](AGENTS.md) routes agents to
Solux-specific guidance; installing skills does not authorize external writes.

MIT © Kevin Abatan. See [LICENSE](LICENSE).
