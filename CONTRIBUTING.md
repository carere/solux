# Contributing to Solux

Read [CODING_STANDARD.md](CODING_STANDARD.md) and [AGENTS.md](AGENTS.md). The root
is the workspace; `packages/solux` is the only npm package, and `apps/website` is
private. Do not add project scripts or another formatter: Moon owns task execution,
Biome owns formatting/linting, and TypeScript checks types.

## Setup

Install proto and Cocogitto. `proto use` installs the Bun, Node, and Moon versions
in `.prototools`. Run `bun install --frozen-lockfile` and `bun lefthook install`
from the root. Package dependencies use Bun workspaces and one `bun.lock`.

Paraglide UI messages live in the website’s `messages/en.json` and `messages/fr.json`;
its English/French article data use matching slugs and section IDs. Keep both
languages complete when adding a page or control. Generated runtime and route
files are build outputs, not hand-maintained source.

The shared tools are pinned in the root manifest. The library retains TypeScript
5.9 and tsup; the monorepo move does not migrate its public types or test runtime.

## Commands

| Command | Behavior |
| --- | --- |
| `bun moon run solux:build` | Build ESM and declarations in `packages/solux/dist` |
| `bun moon run solux:test-unit` | Bun tests with default/server Solid resolution |
| `bun moon run solux:test-unit-browser` | The same regressions with Solid browser conditions |
| `bun moon run solux:test-package` | Build, pack, install and verify an isolated consumer |
| `bun moon run website:i18n` | Compile English/French Paraglide messages and runtime declarations |
| `bun moon run website:dev` | Build the package and start the docs dev server |
| `bun moon run website:build` | Build the package and production documentation assets |
| `bun moon run website:preview` | Serve the production documentation build |
| `bun moon run website:test-browser` | Test SSR, English/French, navigation, examples, themes and mobile behavior |
| `bun moon run website:deploy-check` | Validate Wrangler packaging without deployment |
| `bun tsc --noEmit` | Check sources and tests after building the package |
| `bun biome check . --error-on-warnings` | Check formatting, lint rules and imports |
| `bun biome check --write .` | Apply formatting/import/safe lint fixes |
| `bun knip` | Check workspace dependency and entry-point usage |
| `bun sort-package-json --check package.json 'apps/*/package.json' 'packages/*/package.json'` | Check all manifest ordering |

Run `bun playwright install chromium` inside `apps/website` before browser tests.
The task starts its own production Worker preview. Tests should own and dispose their
stores, avoid external network fixtures, and assert user-visible behavior.

Run the root README's full check sequence before proposing a change. CI runs the
same checks with pinned runtimes. Keep generated `dist`, `.moon/cache`, `.wrangler`,
and browser reports untracked. Builds/tests should leave tracked files unchanged.

## Package and compatibility checks

The packed consumer installs only the tarball and its declared dependencies in
an OS temporary directory. It checks NodeNext and Bundler TypeScript resolution
with `skipLibCheck: false` and runs Node SSR and browser-condition probes. It
requires registry access and removes its temporary directory afterward. The
consumer fixture is deliberately excluded from the repository typecheck so the
repository cannot accidentally satisfy missing published dependencies.

Keep the core package independent of website dependencies. Website examples import
`@carere/solux` through its workspace exports; do not alias them to private source.
Preserve the lifecycle regressions added for Gurafu. Browser-condition unit tests
select Solid's reactive runtime; mocked DevTools protocol tests do not validate
an installed extension. They are distinct from the docs site's Playwright tests.

Knip's Lefthook plugin is disabled because it assumes `.git` is a directory and
fails in Git worktrees. Root CLI-only Biome and hook binaries are explicit configuration exceptions.
Redux remains the extension declaration's compatible type peer. These exceptions do not suppress unused-code analysis for the library or website.

## Commits and releases

Use Conventional Commits; Lefthook runs `cog verify` on commit messages and sorts
nested manifests before applying Biome to staged source. Keep the vendored skills
unchanged and exclude them from source tooling.

Never publish packages, push release tags, or deploy the site as a side effect of
ordinary checks. See [release instructions](docs/releases.md) and
[Cloudflare instructions](docs/website-hosting.md). Website deployment and npm
publication are separate operations.
