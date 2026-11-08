---
name: "Solux website — Open Space"
description: "Near-white space, quiet Manrope headings, violet actions, and working pastel notes."
colors:
  primary: "#7655a8"
  page: "#fcfcfa"
  ink: "#2d2c32"
  white: "#ffffff"
  lavender: "#eeebf6"
  lavender-ink: "#62478a"
  muted: "#f1eff4"
  muted-ink: "#706b7a"
  border: "#e7e3eb"
  input-border: "#d4cbdc"
  sage: "#e5edda"
  sage-ink: "#46543b"
  sage-muted: "#59694c"
  butter: "#faf2d9"
  butter-ink: "#665733"
  code: "#2e273b"
  code-ink: "#f4effb"
  code-highlight: "#493b5b"
  code-muted: "#cfbedf"
  syntax-keyword: "#c4b5fd"
  syntax-string: "#a7f3d0"
  syntax-number: "#fcd34d"
  selection: "#ddd0ef"
  selection-ink: "#342345"
  dark-page: "#211e27"
  dark-ink: "#f0ecf4"
  dark-surface: "#2d2835"
  dark-primary: "#c8afea"
  dark-primary-ink: "#2c1f3c"
  dark-secondary: "#42354f"
  dark-secondary-ink: "#eadcf8"
  dark-muted: "#342d3c"
  dark-muted-ink: "#beb4c7"
  dark-accent: "#41344e"
  dark-accent-ink: "#e8d9f7"
  dark-border: "#49404f"
  dark-input-border: "#685876"
  dark-lavender: "#342b42"
  dark-sage: "#2d392c"
  dark-sage-ink: "#e1ebd5"
  dark-sage-muted: "#beceb1"
  dark-butter: "#3c3527"
  dark-butter-ink: "#eadfbe"
  dark-selection: "#73558e"
typography:
  display:
    fontFamily: "\"Manrope\", \"Inter Variable\", sans-serif"
    fontSize: "clamp(3.75rem, 5.3vw, 5.25rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "\"Manrope\", \"Inter Variable\", sans-serif"
    fontSize: "clamp(2.125rem, 3.4vw, 3.375rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontFamily: "\"Manrope\", \"Inter Variable\", sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  body:
    fontFamily: "\"Inter Variable\", sans-serif"
    fontSize: "0.96875rem"
    lineHeight: 1.9
  body-large:
    fontFamily: "\"Inter Variable\", sans-serif"
    fontSize: "1rem"
    lineHeight: 1.9
  action:
    fontFamily: "\"Inter Variable\", sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  code:
    fontFamily: "\"Geist Mono Variable\", monospace"
    fontSize: "0.8125rem"
    lineHeight: 1.85
  counter-value:
    fontFamily: "\"Manrope\", \"Inter Variable\", sans-serif"
    fontSize: "2.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.035em"
rounded:
  control: "12px"
  panel: "14px"
  close: "16px"
  search-results: "12px"
spacing:
  compact: "8px"
  control-gap: "12px"
  note: "20px"
  mobile-gutter: "24px"
  section-gap: "36px"
  reading-gutter: "clamp(32px, 4vw, 64px)"
  landing-gutter: "48px"
  hero-gap: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "36px"
  button-primary-xl:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-outline:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "36px"
  button-secondary:
    backgroundColor: "{colors.lavender}"
    textColor: "{colors.lavender-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "36px"
  button-link:
    textColor: "{colors.primary}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
  search-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "4px 32px 4px 10px"
    height: "36px"
  language-select:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "4px 32px 4px 10px"
    height: "36px"
  note:
    backgroundColor: "{colors.lavender}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "22px 24px"
  source-panel:
    backgroundColor: "{colors.code}"
    textColor: "{colors.code-ink}"
    typography: "{typography.code}"
    rounded: "{rounded.panel}"
---

# Design System: Solux website — Open Space

## Overview

**Creative North Star: "Open Space"**

Open Space gives developers room to understand state. A continuous near-white ground, dark rounded headings, and restrained violet actions frame real code and reactive values. Lavender, sage, and pale-yellow surfaces give related information a recognizable place without turning every region into a card.

The system combines generous editorial spacing with precise documentation. Manrope carries headings and the brand; Inter carries reading and controls; Geist Mono carries source. The informal, slightly rotated notes belong to the live-example composition, while article pages retain an orderly reading shell.

**Key Characteristics:**

- Near-white space and charcoal type establish the light identity; semantic plum tones carry dark mode.
- Manrope headings, Inter prose, and Geist Mono source keep their distinct roles.
- Lavender, sage, and pale-yellow fields organize functional content with restrained depth.
- Zaidan owns control states; authored motion follows real dispatch activity.

Scope is `apps/website`. Durable product constraints live in [PRODUCT.md](../../PRODUCT.md); homepage composition belongs to [the surface brief](.impeccable/surfaces/src-routes-index-tsx.md). The compact two-stroke [Solux S](../../images/solux.svg) is the logo and SVG favicon. The shipped scene uses native geometry, source, and controls; it has no shipping raster assets.

## Colors

Violet supplies deliberate action against near-white space. Pastel fields organize supporting information. The frontmatter records source values; [identity.css](src/identity.css) owns semantic assignments and dark overrides. The sidecar's eight-step tonal ramps are preview aids, not additional shipped tokens.

### Primary

- **Violet action** supplies primary controls, links, focus, active charts, and the authored dispatch pulse. White supplies primary-control text in light mode.
- **Soft violet action** supplies dark-mode controls and focus, paired with dark-primary ink. The logo retains its two authored violet strokes in both themes.

### Secondary

- **Lavender and lavender ink** serve secondary controls, active navigation, notes, and the example's ground. The ordinary muted surface is quieter than this lavender field.
- **Sage, sage ink, and sage muted** distinguish the event/handler/reactive-read note and its labels.
- **Butter and butter ink** distinguish the inspectable handler excerpt and its related concept surface.
- Dark mode supplies separate lavender, secondary, accent, sage, and butter roles rather than keeping light pastel fields on a dark page.

### Neutral

- **Page, ink, and white** establish the page, primary text, and counter/card/popover surfaces. **Muted ink** supports descriptions and auxiliary content; **border** and **input border** separate reading regions and controls.
- **Code, code ink, code highlight, and code muted** establish documentation source panels. Keyword, string, and number colors retain their source-defined syntax roles. These source-panel values remain stable across themes.
- **Dark page, dark ink, dark surface, muted roles, and control borders** form the plum-charcoal reading environment. Selection uses its own paired foreground and background in each theme.

**The Semantic Color Rule.** Resolve light and dark surfaces through the implemented semantic properties. Theme and language are independent settings; neither selects another visual identity.

## Typography

**Display Font:** Manrope, with Inter Variable and sans-serif fallbacks.

**Body Font:** Inter Variable, with a sans-serif fallback.

**Label/Mono Font:** Geist Mono Variable, with a monospace fallback, for source, commands, and state paths. Other interface text uses Inter.

The display face is rounded, quiet, and moderately weighted. Prose is smaller and generously led. Manrope is self-hosted under [src/fonts](src/fonts) with its OFL notice; Inter and Geist Mono use local font packages.

### Hierarchy

- **Display:** the frontmatter ramp applies to the desktop introduction. Mobile uses `clamp(2.875rem, 12vw, 3.75rem)`, retaining weight (500) and line height (1.08).
- **Headline:** article titles use the headline ramp. Introduction section headings use responsive, weight-(500) variants; their composition is surface-specific.
- **Title:** article section headings use the title role. Smaller concept titles use (1.125rem), weight (600), and line height (1.5).
- **Body:** article prose uses the body role, bounded to (74ch). Introductory description uses body-large, becoming (0.9375rem) on mobile.
- **Action:** registry controls use the action role. The brand has its own weight (750) and size (1.875rem), becoming (1.5rem) on mobile.
- **Code:** documentation panels use the code role. Their source is horizontally scrollable. The small desktop handler-note excerpt is a surface-specific density choice; mobile increases it to (0.75rem).
- **Counter value:** the live homepage example uses the counter-value role with tabular numerals. Standard article counter outputs retain their own smaller scale.

**The Reading Face Rule.** Use Manrope for headings and the brand, Inter for prose and controls, and Geist Mono for source. Preserve selectable, keyboard-scrollable code.

## Layout

Open space comes from bounded content and deliberate gaps. The shared shell caps at (1600px), the homepage content at (1344px), and ordinary article reading columns at (940px) with article measure capped at (74ch). Desktop article gutters use the reading-gutter token; mobile uses the mobile-gutter token. The homepage opening has its own paired grid and generous hero gap, with (48px) desktop gutters.

The sticky header height is (88px) on desktop and (116px) at widths up to (767px). Sidebar height, table-of-contents position, scroll padding, and heading scroll margins resolve from that height. Desktop home hides the permanent sidebar and its spacer; normal article routes retain navigation. The table of contents disappears below (1280px); auxiliary header navigation disappears at (1130px).

Between (768px) and (1000px), the opening and introduction sections stack. At mobile widths the event note, working counter, and source note become a readable grid, with the counter before source visually; source and all controls remain available. Event-note rows use an (88px) label column. The three concept paths and introduction reading sections become single columns. The mobile sidebar is a Zaidan Sheet with width `min(85vw, 20rem)`. Independent chart examples stack below (1001px).

## Elevation & Depth

Tonal fields provide most structure. Standard notes are flat and borderless; documentation demonstrations and source regions retain purposeful dividers. The white working counter has a soft ambient lift over the lavender ground. Floating search results are another deliberately elevated surface. Zaidan outline buttons, inputs, selects, and overlays retain their primitive elevation.

### Shadow Vocabulary

- **Counter lift** (`0 14px 36px #382d4d12`) separates the usable counter from the surrounding example notes.
- **Search float** (`0 14px 38px #30233e1a`) separates results from the underlying document.
- **Primitive small shadow** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`) belongs to Zaidan outline controls, inputs, and native selects.

**The Functional Depth Rule.** Use tonal separation for ordinary content and soft elevation for floating results or the working counter. Keep depth subordinate to reading and interaction.

The authored motion is a (480ms) event-note background pulse from an (18%) violet/transparent mix to transparent, with easing `cubic-bezier(0.16, 1, 0.3, 1)`. Every real dispatch updates the event text and restarts the pulse after cancelling the previous animation; component cleanup cancels it. Reduced motion skips the pulse while retaining the state, derived value, and journal updates. The global reduced-motion rule reduces other animation and transition durations to (0.01ms). Registry state transitions use their existing timing.

## Shapes

Soft corners connect documentation and the example without making every region pill-shaped. The shared radius is (0.875rem); Zaidan derives its standard control radius by subtracting (2px), producing the control token. Notes, demonstrations, and documentation source panels use the panel token; search results use their own radius and the closing invitation uses the close token. The counter's small live marker is circular.

The compact S uses two round-ended native SVG strokes. The example's lavender ellipse and slightly rotated sage/source notes are native layout geometry, not paper textures or bitmap illustration. Their transforms are specific to the live-example stage.

## Components

### Buttons

Quiet, clearly interactive controls use the pinned Zaidan Button or exported `buttonVariants` recipe. Default/outline/secondary/ghost/link variants preserve the registry's hover, focus-visible, active, disabled, and invalid treatments. Primary hover uses (80%) primary color; outline and ghost use semantic muted fills; secondary hover mixes in (5%) foreground. Focus uses the semantic ring at (50%) with a (3px) ring and ring-colored border. Ordinary pressable buttons translate by (1px) on active unless they expose a popup.

Default controls are (36px) high, small controls (32px), and large controls (40px). The local `xl` extension gives landing actions height (48px), horizontal padding (20px), and gap (12px), retaining the same primitive states. Icon sizes remain registry-owned. The keyboard skip anchor uses outline/large with positioning-only reveal styling.

### Cards / Containers

Documentation notes use lavender, no border, panel corners, and the note padding in frontmatter. Demonstrations use semantic surface, a thin border, and panel corners; their headings, values, actions, and journal remain separate real regions. The working counter's exception is borderless with counter lift. Event notes use sage; handler notes use butter. Source panels use the stable plum code palette and clip their caption/source boundary at the outer radius.

### Inputs / Fields

Search uses Zaidan Input at height (36px), reserving right padding for the keyboard hint. It uses a semantic input border, transparent light fill, and the registry focus ring; dark controls use the input tone at (30%). Search becomes (1rem) on mobile. Floating results scroll within a maximum height of (65dvh).

Language uses Zaidan NativeSelect and NativeSelectOption with its SVG chevron, end padding, and native selection semantics. Keep the selected locale present in server-rendered HTML. Disabled, focus, and invalid treatments stay with the primitive.

### Navigation

Header links and search-result links use ghost button recipes. Sidebar items use Zaidan SidebarMenuButton; active rows use the semantic accent fill and weight (650). Article, related-content, source, and pagination links use the link recipe while preserving surrounding document typography, wrapping, and selectable text. Keep typed router links for routes and native anchors for hashes or external destinations. SVG arrows come from the existing Lucide set.

The mobile menu uses the existing Sheet and focus management. Theme and language remain separately operable. The homepage's open header and the article sidebar are route-specific arrangements of the same identity.

## Do's and Don'ts

### Do:

- **Do** carry Open Space across the homepage and documentation using the semantic palette.
- **Do** use Zaidan components and exported recipes for all controls and links, preserving native anchors and typed router links.
- **Do** preserve visible focus, keyboard access, English/French parity, and reduced-motion behavior.
- **Do** keep source inspectable and connect authored activity to real state updates.

### Don't:

- **Don't** reuse the superseded navy-and-ivory Signal Atlas identity.
- **Don't** use Manrope for reading prose or code.
- **Don't** turn the homepage's rotated-note composition into a requirement for every article.
- **Don't** replace readable source or working controls with a decorative image.
