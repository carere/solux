# Solux documentation website

Private `@solux/website` workspace: TanStack Solid Start file routes, Solid SSR
and hydration, and a Cloudflare Worker built by the Cloudflare Vite plugin.
The unchanged counter and chart examples import public `@carere/solux` exports;
their source panels import those same files as raw text. The compact S mark in
`images/solux.svg` serves as both logo and favicon.

From the repository root, after `bun install`:

```sh
bun moon run website:dev
bun moon run website:typecheck
bun moon run website:build
bun moon run website:test-browser
bun moon run website:preview
```

Development uses `127.0.0.1:5173`. Production preview and Playwright use
`127.0.0.1:4173`, running the built Worker rather than an HTML fallback.
Playwright owns its preview process (`reuseExistingServer: false`); leave that
port free. Chromium must be installed before browser tests. Vite development
and preview run under Node via `bun vite`: forcing Bun as Vite's runtime caused
recursive preview requests with the Cloudflare plugin on this machine. The
production build can use Bun's runtime.

## Website identity

Open Space follows the user's Morrow reference: generous white space, Manrope
headings, violet actions, and a working state example arranged as pastel notes.
The homepage has a full-width opening; documentation articles retain the
sidebar and table of contents. The same identity applies to all routes without
comparison controls. Light/dark mode and English/French localization remain
independent.

The live counter dispatches public events and derives values through Solid.
Each dispatch renews the activity cue; reduced motion preserves the update
without animation. The source panel links to the full running example.

Display fonts are self-hosted with their licenses in `src/fonts/`. The Solux
logo is a simple, authored two-stroke S; no generated bitmap assets are used.

Tailwind discovers classes only in `src`, matching the build's source inputs.
Design-document and sidecar snippets therefore cannot change generated CSS or
produce different stylesheet filenames between the client and server builds.

## Localization and routes

Paraglide **2.25.2** generates messages, runtime, server middleware, and TypeScript
declarations into ignored `src/paraglide/`. `i18n.config.mjs` shares the Vite and
CLI options. `website:i18n` runs before Moon's website typecheck; Vite compiles
messages before fresh dev/build. Run the website build before root unused-code checking, as CI does; it also
compiles these generated imports. Generated `src/routeTree.gen.ts` is checked in so a clean
checkout can typecheck before the first Vite invocation.

The configuration follows Delimoov's `project.inlang/settings.json` and
`apps/console/vite.config.ts` at `e8843093262dc24a9c068258e18aab9585723dcb`:
base English, locales `en`/`fr`, and `cookie` then `baseLocale` strategies.
The cookie is `solux_locale`; URL paths remain `/` and `/docs/:slug`. Selecting
English or Français persists the cookie and reloads the exact URL, preserving
query and hash. `src/content.ts` selects English or French page data without a
runtime import cycle. Search uses the selected language's names and full text.
All shell controls, demo controls/status, copy feedback and accessible names use
generated Paraglide messages, rather than a hand-maintained runtime dictionary.

The custom Worker entry `src/server.ts` wraps Start's default server handler in
Paraglide middleware with AsyncLocalStorage enabled. Each request has its own
locale. SSR emits localized article content and `html[lang]`; responses include
`Content-Language`, `Cache-Control: private, no-store`, and `Vary: Cookie`.
Unknown docs and unknown paths return HTTP **404** with localized recovery UI.
There is no SPA fallback or static prerender of cookie-personalized HTML.

## Components and verification

Actual Zaidan registry Button, Input, NativeSelect, Sidebar and Kobalte Sheet components are
copied/adapted and imported by the UI. The responsive sidebar traps focus on
mobile, dismisses with Escape, and restores focus to its trigger. Zaidan's
mode switcher supports its D shortcut, system preference tracking and explicit
cookie/localStorage persistence; the monitor button restores system mode.
Action links use Zaidan's exported button variants while keeping typed router
links and anchor semantics. NativeSelect owns its chevron, reserved end padding,
and native selection behavior; control sizing and interaction states come from
the registry. Open Space themes them through semantic color tokens. The shared
Button adds an `xl` size for the main homepage actions.
Only the needed Vega CSS and default zinc tokens are retained. Inter and Geist
Mono are self-hosted. See [ZAIDAN-NOTICE.md](ZAIDAN-NOTICE.md) for the exact
upstream commit, source inventory, adaptations and preserved MIT license.

Website dependencies are pinned, including the requested Start 1.169.4,
Router 1.170.43, Cloudflare Vite plugin 1.67.0, Tailwind 4.3.4, and existing
Vite 8.3.6 / plugin-solid 2.11.15 / Playwright 1.63.0 / Wrangler 4.158.0.
Kobalte 0.13.12 is pinned to the upstream source reference. Both 0.13.12 and
0.13.14 publish invalid `typeof` aliases for type-only button/dialog exports;
the website therefore skips third-party declaration checking while retaining
strict source checking. The library's TypeScript and packed-consumer declaration
checks are unchanged. Website typechecking covers application source and tests;
build plugins are validated by Vite instead of importing their unrelated
Webpack/Bun/Worker ambient declarations into the application typecheck.

Playwright covers both viewports: counter events and derivations, independent
stores, disposal/late dispatch/recreation, cleanup through client navigation,
history/titles/deep links, HTTP 404, keyboard search, copy, theme persistence,
mobile sheet focus, French hydration, locale persistence, concurrent request
isolation, and EN/FR SSR for every page with JavaScript disabled. Clipboard
permissions are tested in desktop Chromium; the mobile clipboard test is skipped.
The lifecycle guarantees remain explicitly labeled unreleased relative to
published 4.0.1. Store owners dispose explicitly; these examples do not claim
automatic epic cancellation or effects replay.

## Cloudflare output

`wrangler.jsonc` points at the custom Start server entry with `nodejs_compat`.
The plugin generates `dist/client`, `dist/server/index.js`,
`dist/server/wrangler.json`, and `.wrangler/deploy/config.json`. Moon declares
both `dist` and `.wrangler/deploy` as build outputs. Wrangler uses the generated
deploy metadata, including assets and Worker entry. There are no account IDs or
secrets in this package and builds/tests do not deploy.

```sh
# Local output/configuration validation; does not publish.
bun moon run website:deploy-check
# Authorized operator action only.
bun moon run website:deploy
```
