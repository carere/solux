# Hosting the Solux documentation

The documentation runs on the **Cloudflare Worker `solux`** at
[solux.carere.dev](https://solux.carere.dev).
The website uses TanStack Solid Start for server-rendered documentation, Zaidan's
Solid/Kobalte components for its interface, and Paraglide for English/French.
There is no database, account identifier, or application secret in the repo.

Workers Builds is connected to `carere/solux` in the Carere account, following
Gurafu's production/preview setup. Cloudflare deploys pushes to `main` to the
custom domain; other branches receive isolated Worker Previews. GitHub Actions
validates changes and does not deploy the website.

The initial production deployment was bootstrapped from
[PR #4](https://github.com/carere/solux/pull/4) on 6 November 2026. Until that PR
merges, `main` lacks the new workspace and build helper. Keep `main` as the
production branch; the bootstrap serves the reviewed site in the meantime.

## Local build and review

Use the pinned Bun 1.4.4, Node 24.22.1, and Moon 2.6.5 toolchain from the root:

```sh
bun install --frozen-lockfile
bun moon run website:build
bun moon run website:preview
```

The website consumes `@carere/solux` via `workspace:*` and its built package
exports. Moon builds the library before checking/building the website.
The build emits client assets and the server Worker under `apps/website/dist`,
including the existing `images/solux.svg` logo. Cloudflare's Vite plugin also
emits `.wrangler/deploy/` metadata; preserve both outputs for deployment. The root package and website are private;
only `packages/solux` is published to npm.

Before deploying changes, run the root README's checks and:

```sh
bun moon run website:test-browser
bun moon run website:deploy-check
```

`deploy-check` runs Wrangler with `--dry-run` and uploads nothing. Manual
production deployment is a separate maintainer operation; merging to `main`
also deploys through Workers Builds.

## Wrangler configuration

[The site config](../apps/website/wrangler.jsonc) declares:

- Worker name `solux`.
- TanStack Solid Start server entry, with Cloudflare's Vite plugin generating
  the deployment config and client-asset binding.
- `nodejs_compat` for the SSR runtime and request-local Paraglide context.
- Custom-domain route `solux.carere.dev`.
- Disabled `workers.dev` and version-preview URLs.
- An explicit `previews` block enabling isolated branch deployments through
  `wrangler preview`.

The server renders article content and page metadata before hydration. Unknown
routes return an HTTP 404 rather than a successful SPA fallback. Interactive
examples and controls hydrate in the browser; article content is available in
HTML responses without executing JavaScript.

Paraglide follows Delimoov's `cookie` / `baseLocale` strategy: English is the
base locale and French is selected through the language control, with the
`solux_locale` cookie persisting the choice. Both languages use the same paths;
a language change preserves the current article URL. Request-scoped locale
handling keeps concurrent requests independent. Cookie-personalized HTML must
remain private and uncached at the edge; preserve the server's cache headers.
Do not replace this with shared static HTML while claiming per-request locale
selection.

Use the generated deployment metadata after building, rather than deploying
only `dist/client` as a static SPA. See the
[TanStack Solid hosting guide](https://tanstack.com/start/latest/docs/framework/solid/guide/hosting)
and [Cloudflare's Vite plugin guide](https://developers.cloudflare.com/workers/vite-plugin/).

## Workers Builds configuration

Use the Cloudflare account that owns the active `carere.dev` zone. Inspect the
existing `solux.carere.dev` hostname before attaching it; do not replace another
service's DNS record without review. A custom domain requires an owned active
zone, and existing CNAME records can conflict. See
[Cloudflare Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

In Cloudflare Workers & Pages, select `solux` and its connected Git repository.
The Cloudflare GitHub App provides repository access. The applied settings are:

| Setting | Value |
| --- | --- |
| Repository | `carere/solux` |
| Root directory | Repository root, not `apps/website` |
| Production branch | `main` |
| Build command (production and previews) | `bash scripts/build-cloudflare.sh` |
| Production deploy command | `bun --cwd apps/website wrangler deploy` |
| Branch preview deploy command | `bun --cwd apps/website wrangler preview` |
| Branch previews | Enabled for nonproduction branches |
| Build cache | Enabled |
| `BUN_VERSION` | `1.4.4` |
| `NODE_VERSION` | `24.22.1` |

Cloudflare detects `bun.lock` and installs dependencies before the build command.
The build helper makes the `main` base ref available in shallow preview clones
before running Moon. It performs no deployment. Moon's pinned local CLI and
`.prototools` are authoritative; do not substitute `latest` in the build settings.
The config has no account ID, so use the intended account's authenticated build
context. Workers Builds uses the same managed deployment token as the reference
projects. No Cloudflare token is stored in GitHub Actions or this repository.
See [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

Builds API administration requires a user API token with **Workers Builds
Configuration: Edit** and **Workers Scripts: Read** for the account. Wrangler's
OAuth login can deploy Workers but cannot configure Builds. This administrative
credential is separate from the managed build deployment token; do not save it
as an application variable or commit it. See the
[Builds API reference](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/).

Branch previews use `wrangler preview` and their own isolated URLs; they do not
replace the production domain. Production `workers.dev` and version-preview
URLs remain disabled. Cloudflare reports build results on GitHub. Deleting a
branch removes its automatically managed Preview.

Merging to `main` is a production action. Do not add a second automatic deployment
workflow in GitHub Actions. Website deployment remains independent of npm
publication, release tags, and the protected `npm` environment.

## Branch protection

The active [protected ruleset](https://github.com/carere/solux/rules/7389461)
follows Rebyu's policy, with Solux's actual check names. Its API payload is
versioned in [.github/rulesets/protected.json](../.github/rulesets/protected.json):

- Targets the default branch, with no bypass actors.
- Blocks deletion and force pushes; requires a pull request with squash merging.
- Requires resolved review threads and dismisses stale approvals. No mandatory
  approval count or code owner approval is configured, matching the references.
- Requires an up-to-date branch and the GitHub Actions checks `All checks passed`
  and `Conventional commits and PR title`.

The obsolete `static-test` / `unit-test` requirements were replaced with those
current checks. The checked-in JSON records the applied policy; editing it does
not automatically change GitHub. A maintainer can reapply it with:

```sh
gh api --method PUT repos/carere/solux/rulesets/7389461 \
  --input .github/rulesets/protected.json
```

## Authorized manual deployment

After account/domain setup and explicit authorization, authenticate Wrangler in
the intended account, build/review the site, and run from the root:

```sh
bun moon run website:deploy
# Deploy the current branch to an isolated Preview instead.
bun moon run website:deploy-preview
```

That command uploads the server Worker and assets and applies the custom-domain configuration.
It is deliberately excluded from Moon CI. A build service can invoke Wrangler
directly as shown above; this avoids accidentally treating a skipped Moon task
as a successful deployment.

Afterward, verify the returned deployment, `https://solux.carere.dev`, direct
links such as `/docs/store-lifecycle`, the existing logo, mobile navigation,
search, both languages, SSR HTML, unknown-route HTTP 404s, and examples. Check the actual account/domain state rather than inferring
it from a successful local dry-run. For rollback, use Cloudflare's deployment
history to restore a previously verified version; a fresh deploy uses the same
config and may update domain routing.

Website deployment does not publish npm. Publishing a compatible new Solux v4
version still follows [the release guide](releases.md). These docs explicitly
mark unreleased lifecycle/DevTools behavior until that version is published.
