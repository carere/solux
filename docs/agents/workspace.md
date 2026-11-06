# Workspace and verification

Solux uses Bun workspaces and Moon. `packages/solux` owns the public package,
`apps/website` owns the Solid documentation site, and root tools are shared.
Read [CONTRIBUTING.md](../../CONTRIBUTING.md) for the command inventory and setup.
Project manifests and `moon.yml` files define task availability.

## Choosing checks

- Core behavior or lifecycle: run Bun regressions under default and
  `--conditions=browser` resolution. Both tasks use `packages/solux/test/unit`.
- Public API or packaging: build and run `solux:test-package`. Its isolated
  consumers check NodeNext and Bundler declarations with `skipLibCheck: false`
  and Node server/browser-condition runtime behavior.
- Website: run its build and Playwright tests. Its own typecheck uses browser/Node
  types and strict application checking; the root typecheck covers the library,
  Bun tests and maintainer scripts. This separation avoids combining Vite and Bun
  ambient `ImportMeta` definitions. Website third-party declaration checking is
  skipped for Kobalte's published aliases; Solux's isolated packed consumers
  still use `skipLibCheck: false`. The website imports built public exports.
- Tooling: run affected Moon tasks and root Biome, TypeScript, Knip and manifest
  sorting checks. Run `bun test scripts/tests` for release/build helpers and use
  Cocogitto over the relevant commit range for commit metadata.

Tests are uncached. Build task inputs include shared configs and the lockfile;
Moon's automatic lockfile deduplication is disabled so ordinary checks preserve
tracked inputs. Frozen installation is configured in CI and Moon.

Packed-consumer checks need registry access. Website browser tests select
Chromium and start an owned production preview; they do not certify an installed
Redux DevTools extension. DevTools protocol coverage uses mocks. Report each
check's actual outcome rather than treating a task definition as passing evidence.

## Releases and external actions

Read [the release guide](../releases.md) before version preparation/publication,
and [the hosting guide](../website-hosting.md) before Cloudflare setup/deployment.
Build and dry-run tasks do not publish. Release preparation and npm publication
are separately dispatched; website deployment is independent. Follow the user's
current authorization for external actions.

## Vendored resources

Keep `.agents/skills/` aligned with its recorded source except its Solux-owned
README. Repository tooling excludes the vendor tree. Preserve resources,
notices and executable modes. Verify file hashes/modes when updating the snapshot;
launching skills is not an installation test because launchers may download tools
or open sessions.
