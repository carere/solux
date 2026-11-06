# Hosting the Solux documentation

The checked-in target is **Cloudflare Workers Static Assets** at
`solux.carere.dev`. The site is a static Vite + Solid application: there is no
server process, database, account identifier, or application secret in the repo.
This follows Rebyu's smaller static deployment model while retaining Solux's
actual Solid runtime for executable examples.

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
`apps/website/dist` is the complete deployable output, including the existing
`images/solux.svg` logo bundled by Vite. The root package and website are private;
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
- Static assets from `./dist`, relative to the website config.
- Custom-domain route `solux.carere.dev`.
- SPA fallback for direct documentation links.
- Disabled `workers.dev` and version-preview URLs.

The website has client-side history routes and a visible not-found page. With
Cloudflare's SPA fallback, unknown navigation URLs receive the app shell with an
HTTP 200 and then show that page; it is not a server-generated HTTP 404. Article
content, search and examples require JavaScript. This initial site does not add
prerendering/SSR or a content-management service. If crawlable per-page HTML
becomes required, add prerendering with route/metadata regressions rather than
claiming the SPA provides it.

Cloudflare documents this behavior in its
[SPA routing guide](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
and [Wrangler configuration reference](https://developers.cloudflare.com/workers/wrangler/configuration/).

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

That command uploads the assets and applies the custom-domain configuration.
It is deliberately excluded from Moon CI. A build service can invoke Wrangler
directly as shown above; this avoids accidentally treating a skipped Moon task
as a successful deployment.

Afterward, verify the returned deployment, `https://solux.carere.dev`, direct
links such as `/docs/store-lifecycle`, the existing logo, mobile navigation,
search, and examples. Check the actual account/domain state rather than inferring
it from a successful local dry-run. For rollback, use Cloudflare's deployment
history to restore a previously verified version; a fresh deploy uses the same
config and may update domain routing.

Website deployment does not publish npm. Publishing a compatible new Solux v4
version still follows [the release guide](releases.md). These docs explicitly
mark unreleased lifecycle/DevTools behavior until that version is published.
