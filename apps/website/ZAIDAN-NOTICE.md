# Zaidan sources

Copied/adapted from https://github.com/carere/zaidan at
`271ffce00aaeee0dfa32f2321c9b6e212af39c3d`.

- `src/registry/ui/{button,input,native-select,sheet,sidebar}.tsx` ← `src/registry/kobalte/ui/`.
  Sidebar retains the provider, responsive Kobalte Sheet, trigger and navigation
  primitives; unused rail/input/skeleton/tooltip/submenu APIs are omitted.
- `src/registry/hooks/use-mobile.ts` ← `src/registry/kobalte/hooks/use-mobile.ts`.
- `src/registry/components/color-mode.tsx` ← `src/registry/kobalte/components/color-mode.tsx`.
- `src/components/mode-switcher.tsx` ← `src/components/mode-switcher.tsx`.
- `src/components/docs-sidebar.tsx` and `docs-page.tsx` adapt the corresponding
  `src/components/` files to Solux pages, localized labels and routes.
- `src/lib/utils.ts` retains only upstream's `cn` utility.
- `src/registry/ui/native-select.tsx` retains the upstream select and option
  components, including the positioned chevron. Its utility import and provenance
  comment are adapted; the unused option-group API is omitted.
- `src/registry/ui/button.tsx` retains the upstream `buttonVariants` export.
  Router and document links use the same styling recipe as Zaidan's
  `examples/docs/button-render.tsx`; anchor semantics and typed routes are retained.
  Solux adds an `xl` size (48px) to that component and its Vega styles for the
  landing-page actions, retaining the shared interaction and focus states.
- `src/registry/styles/tokens.css` extracts the default light/dark zinc tokens
  and Tailwind theme from `src/styles.css`; `style-vega.css` extracts only Button,
  Input, Native Select, Sheet and Sidebar sections from `src/registry/kobalte/styles/style-vega.css`.

Imports are local. Solux adds localization, theme persistence/system tracking,
SSR-safe initialization and docs rendering. No registry/theme catalogue is copied.
Inter and Geist Mono remain the installed font packages; the site's Manrope
heading font is self-hosted separately under `src/fonts/`.

## Upstream license

MIT License

Copyright (c) 2025 Kevin Abatan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
