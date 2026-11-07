---
name: Solux website — Signal Atlas
description: Navy instruments, ivory display type, and precise developer documentation.
colors:
  signal-blue: "#285bd5"
  reading-background: "#f5f6f8"
  reading-ink: "#1a2b43"
  surface: "#ffffff"
  muted-surface: "#e9edf4"
  muted-ink: "#52627a"
  active-surface: "#e0e9fc"
  border: "#d2dae8"
  navy-field: "#102442"
  ivory: "#f3f4e8"
  field-muted: "#bacce9"
  field-border: "#3d5476"
  pale-action: "#d6e7ff"
  field-focus: "#a9cdff"
  code-background: "#0d2442"
  code-ink: "#eef5ff"
  instrument-source: "#1b365c"
  dark-primary: "#91bdff"
  dark-primary-ink: "#0a2347"
  dark-background: "#0c1728"
  dark-ink: "#edf2fb"
  dark-surface: "#152640"
  dark-muted-surface: "#192e46"
  dark-muted-ink: "#adbed3"
  dark-border: "#344a64"
typography:
  display:
    fontFamily: '"Manrope", "Inter Variable", sans-serif'
    fontSize: "clamp(3.5rem, 5.8vw, 6rem)"
    fontWeight: 550
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  headline:
    fontFamily: '"Manrope", "Inter Variable", sans-serif'
    fontSize: "clamp(2.125rem, 3.4vw, 3.375rem)"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"Manrope", "Inter Variable", sans-serif'
    fontSize: "1.5rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  instrument-title:
    fontFamily: '"Manrope", "Inter Variable", sans-serif'
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: '"Inter Variable", sans-serif'
    fontSize: "0.96875rem"
    lineHeight: 1.9
  action:
    fontFamily: '"Inter Variable", sans-serif'
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.7
  code:
    fontFamily: '"Geist Mono Variable", monospace'
    fontSize: "0.8125rem"
    lineHeight: 1.85
  instrument-value:
    fontFamily: '"Manrope", "Inter Variable", sans-serif'
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.035em"
rounded:
  panel: "0.875rem"
  instrument: "14px"
  control: "12px"
spacing:
  compact: "8px"
  control: "12px"
  panel: "18px"
  mobile-gutter: "22px"
  section-inset: "28px"
  outer-gutter: "32px"
components:
  action-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
  action-inverse:
    backgroundColor: "{colors.pale-action}"
    textColor: "{colors.navy-field}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    height: "40px"
  action-text:
    textColor: "{colors.pale-action}"
    typography: "{typography.action}"
  search-field:
    backgroundColor: "transparent"
    textColor: "{colors.reading-ink}"
    rounded: "{rounded.control}"
    padding: "4px 32px 4px 10px"
    height: "36px"
  note:
    backgroundColor: "{colors.muted-surface}"
    textColor: "{colors.reading-ink}"
    rounded: "{rounded.panel}"
    padding: "20px 22px"
  source-panel:
    backgroundColor: "{colors.instrument-source}"
    textColor: "{colors.code-ink}"
    padding: "26px"
---

# Design System: Solux website — Signal Atlas

## Overview

**Creative North Star: "Signal Atlas"**

Signal Atlas is the selected Solux website identity. It pairs deep navy fields and ivory Manrope headings with a light, precise reading environment. Blue actions, fine rules, and rounded instruments make the relationships between source and state visible.

The system serves developer reading and inspection. Inter carries prose and interface text; Geist Mono distinguishes source, commands, and state paths. Color fields and aligned regions provide structure, while real dispatch activity supplies the authored motion.

**Key Characteristics:**

- Navy and ivory identify the instrument field in both light and dark modes.
- Manrope headings, Inter reading text, and Geist Mono source have distinct roles.
- Functional panels use rounded boundaries, tonal separation, and fine rules.
- State feedback reflects real events and respects reduced motion.

Scope is `apps/website`. Durable product constraints live in [PRODUCT.md](../../PRODUCT.md); first-surface composition lives in [the surface brief](.impeccable/surfaces/src-routes-index-tsx.md). The existing [Solux SVG](../../images/solux.svg) remains the logo and favicon. No generated rasters are part of this system.

## Colors

Signal blue marks action and active state. Cool reading neutrals keep the documentation quiet; navy and ivory give functional instruments a distinct field. Frontmatter records the reused source values. [identity.css](src/identity.css) owns the full semantic palette and mode overrides. The sidecar's eight-step tonal ramps are synthesized preview aids, not additional shipped tokens.

### Primary

- **Signal blue** supplies actions, focus, active navigation, selection, and charts on reading surfaces.
- **Pale action blue** supplies the primary action on navy, becoming white on hover. Pale field focus remains visible on the dark field.
- **Dark signal blue** supplies actions and focus in dark mode, paired with dark primary ink.

### Neutral

- **Reading background, reading ink, and white surface** separate the page, text, and functional containers.
- **Muted surface and muted ink** support notes, search, captions, and the event journal. Active navigation uses its own pale blue fill.
- **Navy field, ivory, muted field ink, and field border** stay constant across color modes.
- **Code background and code ink** support documentation source. The live instrument uses a lighter navy source region to distinguish it from the surrounding field.
- **Dark background, ink, surface, muted roles, and border** replace the reading palette in dark mode.

**The Independent Settings Rule.** Every route uses the static Atlas identity. Light/dark mode and English/French language remain independent settings; colors resolve through the semantic custom properties.

## Typography

**Display Font:** Manrope, with Inter Variable and sans-serif fallbacks.

**Body Font:** Inter Variable, with a sans-serif fallback.

**Label/Mono Font:** Geist Mono Variable, with a monospace fallback, for code, commands, and instrument labels. Other interface labels use Inter.

Manrope is self-hosted in [src/fonts](src/fonts) with its OFL notice. Inter and Geist Mono use the existing local font packages. Display type is spacious and moderately weighted; reading text is smaller, generously led, and bounded in measure.

### Hierarchy

- **Display:** the frontmatter ramp applies above mobile width. Mobile uses `clamp(2.875rem, 11vw, 4.5rem)` and line height (1.04), retaining weight (550).
- **Headline:** article titles use the headline role.
- **Title:** article sections use the title role; introduction sections use line height (1.4).
- **Instrument title:** functional workbench headings use the smaller instrument-title role. Supporting paragraphs use (0.875rem), weight (400), and line height (1.65).
- **Body:** article prose uses the body role within a maximum measure of (74ch).
- **Action:** introductory primary and text links use the action role. Sidebar items use (0.8125rem), with active weight (650).
- **Code:** documentation code uses the code role. Instrument source uses line height (1.9) and becomes (0.75rem) on mobile.
- **Instrument value:** paired state and derived outputs use the instrument-value role with tabular numerals.

**The Reading Face Rule.** Use Manrope for headings and the brand, Inter for reading and controls, and Geist Mono for source. Keep code selectable and horizontally scrollable when its content needs it.

## Layout

The documentation shell has a maximum width of (1720px), a sticky navigation column, a flexible reading column capped at (920px), and a table of contents that disappears below (1280px). Article content is capped at (74ch). Reading-column gutters use `clamp(28px, 3.6vw, 64px)` and become (22px) on mobile.

The site header sticks at the top with a height token of (72px), changing to (116px) at widths up to (767px). Sticky sidebars, the table of contents, heading scroll margins, and root scroll padding resolve from this height.

Connected instruments use aligned event stages and paired source/state regions. On mobile, the stages become readable label/code rows with an (86px) label column; the live state precedes source visually. Source/state panels and reading sections become a single column. Independent chart demonstrations stack below (1001px). Preserve the working content and reading order when adapting these patterns; the surface brief owns the homepage arrangement.

## Elevation & Depth

Tonal fields and thin rules provide most depth. Functional panels sit flat at rest. Search results are the notable floating surface, with shadow `0 14px 32px #06152c26`; existing input and overlay primitives retain their small framework shadows.

**The Structural Depth Rule.** Distinguish source, state, reading, and floating regions with their implemented surface, border, and field roles. Use floating elevation for popovers and overlays.

Each real dispatch starts a (480ms) event-flow background pulse from an (18%) mix of field ink to transparent, eased with `cubic-bezier(0.16, 1, 0.3, 1)`. A new dispatch cancels the prior pulse. Reduced motion skips it; cleanup cancels it. Active step emphasis remains tied to the latest event. Existing registry transitions also follow the global reduced-motion duration override.

## Shapes

General panels use the shared rounded token. Zaidan derives control corners from the semantic radius scale; the paired instrument keeps an explicit outer radius of (14px) and clips its source/state regions at that boundary. Fine rules separate real content regions; small circular markers indicate a live example.

## Components

### Buttons

Use the pinned Zaidan Button and its exported `buttonVariants` recipe for actions and action links. The introduction uses the large size (40px); standard counter controls use the default size (36px), and icon actions use registry icon sizes. The navy field supplies inverse semantic colors. Zaidan owns padding, icon sizing, borders, hover, disabled states, and focus rings. Keep typed router links and native anchor semantics when applying its link recipe; document text retains its surrounding typography and wrapping.

### Cards / Containers

Notes use a muted fill, no border, and the documented note padding. Demonstrations use a surface fill, thin border, and shared corners. The connected source/state instrument clips a navy source region beside a reading-surface state region. Source captions remain subordinate to code. On mobile its source padding becomes (20px 18px).

### Inputs / Fields

Search uses Zaidan Input with its default height (36px); a keyboard hint reserves space on the right. Language selection uses the pinned Zaidan NativeSelect and NativeSelectOption, including the upstream chevron and end padding. Preserve native keyboard and server-rendered selection behavior. Focus and control states come from the registry and semantic tokens. Search results float below the field and scroll within a maximum height of (65dvh).

### Navigation

The original SVG and Manrope wordmark anchor the sticky header. Active sidebar items use primary ink, accent fill, and heavier weight; hover uses the accent roles. Mobile navigation retains the existing focus-managed sheet. Introductory navigation rows use ivory headings, muted descriptions, pale blue arrows, and pale blue underlined hover text.

### Live source and state

The signature instrument connects a real event, synchronous handler, and reactive state. Source is selectable, outputs use tabular values, and the journal displays recent dispatched events. Reset changes the diagram to `counter/reset` and `value = 0`; increment and decrement retain the payload-addition handler. Sidecar samples illustrate styling without implementing a store.

## Do's and Don'ts

### Do:

- **Do** carry Signal Atlas across the homepage and documentation.
- **Do** use Zaidan primitives and their documented composition patterns for controls and links; theme semantic tokens instead of recreating control chrome.
- **Do** resolve reading-surface colors and corners through the semantic tokens.
- **Do** preserve visible focus, reduced-motion behavior, and English/French parity.
- **Do** connect visual activity to real events and keep source inspectable.

### Don't:

- **Don't** change the identity when changing language or light/dark mode.
- **Don't** replace the existing Solux logo or SVG favicon.
- **Don't** use the display face for reading prose or code.
- **Don't** promote a first-surface composition into a requirement for every documentation page.
