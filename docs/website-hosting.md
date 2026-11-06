# Hosting the Solux documentation

The checked-in target is a **Cloudflare Worker** at `solux.carere.dev`.
The website uses TanStack Solid Start for server-rendered documentation, Zaidan's
Solid/Kobalte components for its interface, and Paraglide for English/French.
There is no database, account identifier, or application secret in the repo.

This document prepares hosting; it does not claim a Worker, Git connection,
custom domain, or deployment already exists. No deployment is performed by CI.

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

Before connecting hosting, run the root README's checks and:

```sh
bun moon run website:test-browser
bun moon run website:deploy-check
```

`deploy-check` runs Wrangler with `--dry-run` and uploads nothing. Production
deployment is a separate operation requiring maintainer authorization.

## Wrangler configuration

[The site config](../apps/website/wrangler.jsonc) declares:

- Worker name `solux-website`.
- TanStack Solid Start server entry, with Cloudflare's Vite plugin generating
  the deployment config and client-asset binding.
- `nodejs_compat` for the SSR runtime and request-local Paraglide context.
- Custom-domain route `solux.carere.dev`.
- Disabled `workers.dev` and version-preview URLs.

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

## Connect Workers Builds when ready

Use the Cloudflare account that owns the active `carere.dev` zone. Inspect the
existing `solux.carere.dev` hostname before attaching it; do not replace another
service's DNS record without review. A custom domain requires an owned active
zone, and existing CNAME records can conflict. See
[Cloudflare Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

In Cloudflare Workers & Pages, create or select `solux-website`, authorize the
Cloudflare GitHub App for `carere/solux`, and connect Workers Builds. Configure:

| Setting | Value |
| --- | --- |
| Repository | `carere/solux` |
| Root directory | Repository root, not `apps/website` |
| Production branch | `main` |
| Build command | `bun install --frozen-lockfile && bash scripts/build-cloudflare.sh` |
| Deploy command | `bun --cwd apps/website wrangler deploy` |
| `BUN_VERSION` | `1.4.4` |
| `NODE_VERSION` | `24.22.1` |

The build helper makes the `main` base ref available in shallow preview clones
before running Moon. It performs no deployment. Moon's pinned local CLI and
`.prototools` are authoritative; do not substitute `latest` in the build settings.
The config has no account ID, so use the intended account's authenticated build
context. Select a narrowly scoped Cloudflare build token in the dashboard; no
Cloudflare token needs to be stored in GitHub Actions for this arrangement.
See [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

Keep automatic production builds disabled until the first deployment is approved.
If you later enable deployment on `main`, merging will become a production action.
If explicit approval per deployment is required, use a protected GitHub deployment
environment and a manual deployment workflow instead; do not enable both release
paths simultaneously. The repository currently provides neither automatic
production deployment nor a provisioned protected Cloudflare environment.

## Authorized manual deployment

After account/domain setup and explicit authorization, authenticate Wrangler in
the intended account, build/review the site, and run from the root:

```sh
bun moon run website:deploy
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
