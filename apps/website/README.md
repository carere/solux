# Solux documentation website

Private workspace package `@solux/website`: static SolidJS + Vite documentation,
with real examples importing the public `@carere/solux` workspace package. The
original `images/solux.svg` is imported directly, including the favicon. There
are no external fonts, search services, generated branding, or runtime servers.

From the repository root, after the root-owned Bun dependency installation:

```sh
bun moon run website:dev
bun moon run website:typecheck
bun moon run website:build
bun moon run website:test-browser
bun moon run website:preview
```

Development and production builds depend on `solux:build`. Browser tests depend
on the production website build and start their own Vite preview at
`127.0.0.1:4173` with `reuseExistingServer: false`. Keep that port free. Each test
gets a fresh browser context. Chromium must already be installed in the test
environment; provisioning it is a separate setup step (`bun playwright install
chromium` from this directory), not part of the test task.

`src/docs.ts` contains the searchable document data; each page has a distinct
`/docs/:slug` URL, document title, anchor links, and history navigation. Unknown
routes render an accessible recovery page. The client-only app needs an HTML
fallback on deep requests. Wrangler config supplies Cloudflare's
`single-page-application` asset handling; the unknown-page UI is therefore
served with the fallback HTML's HTTP 200, not a server-generated 404.

`src/examples/counter.ts` and `src/examples/chart.ts` are executed by the live
examples and imported as raw text for their copyable source panels. Both use
public package exports. Scope owners explicitly dispose stores on unmount;
recreation builds fresh nested state. These demos include unreleased disposal
behavior, clearly distinguished in the docs from published 4.0.1. They make no
promise of automatic epic cancellation or effects replay.

The layout uses system typography, warm neutral surfaces, restrained green
selection states, and high-contrast code panels. Theme choice defaults to the
system and persists explicit choices when storage is available. Search works
locally across prose, API tables, and examples; `/` or Ctrl/Cmd+K focuses it,
arrow keys select results, and Escape dismisses results or closes mobile
navigation. Mobile navigation is an in-flow disclosure, with no focus trap.

## Manual Cloudflare deployment

`wrangler.jsonc` serves `dist` as static assets on the custom domain
`solux.carere.dev`. No account IDs or credentials are checked in. An authorized
operator must provision the domain and authenticate Wrangler in their own
Cloudflare account. There is no automatic deployment on builds or tests.

```sh
# Local output/configuration validation; does not publish.
bun moon run website:deploy-check
# Explicit operator action only; publishes to Cloudflare.
bun moon run website:deploy
```

Both deployment tasks are excluded from automatic CI execution. The website
owns no root lockfile or shared tooling configuration. Use root TypeScript
5.9.3; website dependencies are pinned in this package manifest and installed
through the root workspace.
