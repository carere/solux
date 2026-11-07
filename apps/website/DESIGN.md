---
name: Solux website — provisional identity comparison
description: Three implemented proposals awaiting the user's choice; no final visual identity is approved.
colors:
  workshop-primary: "#1550b9"
  workshop-background: "#f6faff"
  workshop-ink: "#112a45"
  white-surface: "#ffffff"
  workshop-muted: "#eaf1fa"
  workshop-muted-ink: "#48617d"
  workshop-border: "#c9d9eb"
  workshop-field: "#dceefe"
  workshop-field-ink: "#103a71"
  source-background: "#0d2442"
  source-ink: "#eef5ff"
  ledger-primary: "#244ea0"
  ledger-paper: "#f8f6ef"
  ledger-ink: "#222e40"
  ledger-surface: "#fffdf7"
  atlas-primary: "#285bd5"
  atlas-background: "#f5f6f8"
  atlas-ink: "#1a2b43"
  atlas-navy: "#102442"
  atlas-ivory: "#f3f4e8"
  atlas-field-muted: "#bacce9"
  atlas-action: "#d6e7ff"
  dark-primary: "#91bdff"
  dark-background: "#0d1a2b"
  dark-ink: "#e6effa"
  dark-surface: "#15283f"
  ledger-dark-primary: "#a7c4ff"
  ledger-dark-background: "#1a2028"
  ledger-dark-ink: "#eeeae0"
  atlas-dark-background: "#0c1728"
  atlas-dark-ink: "#edf2fb"
  atlas-dark-surface: "#152640"
typography:
  display-workshop:
    fontFamily: '"Onest", "Inter Variable", sans-serif'
    fontSize: "clamp(3.5rem, 5.7vw, 6rem)"
    fontWeight: 650
    lineHeight: 0.99
    letterSpacing: "-0.04em"
  display-ledger:
    fontFamily: '"Manrope", "Inter Variable", sans-serif'
    fontSize: "clamp(3rem, 4.65vw, 5.25rem)"
    fontWeight: 600
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  display-atlas:
    fontFamily: '"Manrope", "Inter Variable", sans-serif'
    fontSize: "clamp(3.5rem, 5.8vw, 6rem)"
    fontWeight: 550
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  headline:
    fontFamily: 'var(--font-heading)'
    fontSize: "clamp(2.125rem, 3.4vw, 3.375rem)"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: 'var(--font-heading)'
    fontSize: "1.5rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.035em"
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
rounded:
  workshop: "0.375rem"
  ledger: "0.125rem"
  atlas: "0.875rem"
  comparison-option: "5px"
spacing:
  compact: "8px"
  control: "12px"
  panel: "18px"
  mobile-gutter: "22px"
  section-gap: "28px"
  outer-gutter: "32px"
components:
  action-workshop:
    backgroundColor: "{colors.workshop-primary}"
    textColor: "{colors.white-surface}"
    typography: "{typography.action}"
    rounded: "{rounded.workshop}"
    padding: "10px 18px"
    height: "44px"
  action-ledger:
    backgroundColor: "{colors.ledger-primary}"
    textColor: "{colors.white-surface}"
    typography: "{typography.action}"
    rounded: "{rounded.ledger}"
    padding: "10px 18px"
    height: "44px"
  action-atlas:
    backgroundColor: "{colors.atlas-action}"
    textColor: "{colors.atlas-navy}"
    typography: "{typography.action}"
    rounded: "{rounded.atlas}"
    padding: "10px 18px"
    height: "44px"
  action-text:
    textColor: "{colors.workshop-field-ink}"
    typography: "{typography.action}"
    height: "44px"
  search-field:
    backgroundColor: "{colors.workshop-muted}"
    textColor: "{colors.workshop-ink}"
    rounded: "{rounded.workshop}"
    padding: "4px 32px 4px 10px"
    height: "38px"
  note:
    backgroundColor: "{colors.workshop-muted}"
    textColor: "{colors.workshop-ink}"
    rounded: "{rounded.workshop}"
    padding: "20px 22px"
  source-panel:
    backgroundColor: "{colors.source-background}"
    textColor: "{colors.source-ink}"
    padding: "16px 20px"
---

# Design System: Solux website — provisional identities

## Overview

**Creative North Star: "Three provisional Solux identities"**

This records three built proposals for comparison: **Blue Workshop**, **Event Ledger**, and **Signal Atlas**, selected by `?design=workshop`, `?design=ledger`, and `?design=atlas`. Their names describe the current implementation; none is a user-approved final identity. Blue Workshop is the fallback when the URL has no valid design value. The user will choose a proposal and iterate after comparing the builds.

The shared visual foundation supports precise developer documentation: readable prose, inspectable source, visible state, and direct controls. Blue Workshop combines an open sky-blue field with cobalt and Onest. Event Ledger combines warm paper, blue annotation, Manrope, compact corners, and ruled boundaries. Signal Atlas combines a navy field, ivory type, Manrope, connected event steps, and more rounded instruments.

**Key Characteristics:**

- Three provisional identities share one working application and semantic token layer.
- Display type supplies identity; Inter carries reading and interface text; Geist Mono carries source.
- Color fields, rules, and paired source/state regions provide structure with little elevation.
- The existing Solux SVG remains the logo and favicon; this comparison introduces no generated rasters.

Scope is `apps/website`. Durable product constraints live in [PRODUCT.md](../../PRODUCT.md); homepage strategy and direction contracts live in [the surface brief](.impeccable/surfaces/src-routes-index-tsx.md). This document records reusable implemented rules rather than repeating that composition.

## Colors

All three proposals use blue for action and active state. Their material character comes from different neutral fields and type contrast. The frontmatter is a curated set of exact source values; [identity.css](src/identity.css) owns the complete semantic palette, including borders, input, selection, sidebar, and all mode overrides. The sidecar's eight-step tonal ramps are synthesized preview aids, not additional shipped tokens.

### Primary

- **Workshop cobalt** supplies actions, focus, active navigation, and live-state accents.
- **Ledger annotation blue** supplies the same roles against warm paper.
- **Atlas signal blue** supplies documentation actions; the navy introduction uses a pale blue primary action for contrast.
- **Dark signal blue** supplies Workshop and Atlas actions in dark mode; Ledger uses its own softer dark primary.

### Neutral

- **Workshop paper, ink, and sky field** distinguish the reading shell from the introduction. White is the resting surface for instruments and popovers.
- **Ledger paper, ink, and warm surface** keep the shell and introduction in the same paper family.
- **Atlas paper and ink** support reading; navy, ivory, and muted blue define its introduction in both light and dark modes.
- **Source background and source ink** provide shared dark code panels. Ledger's introduction instead uses its muted semantic surface with foreground text; Atlas's source half uses its own navy tint.
- Dark modes use their own background, ink, and surface values. They are implemented alternatives, not automatic inversions of the light palette.

**The Independent Controls Rule.** `html[data-design="workshop"|"ledger"|"atlas"]` selects identity; `.dark` independently selects color mode. Preserve both controls and resolve colors through the semantic custom properties.

## Typography

**Display Font:** Onest for Blue Workshop; Manrope for Event Ledger and Signal Atlas; Inter Variable is the fallback.

**Body Font:** Inter Variable, with a sans-serif fallback.

**Label/Mono Font:** Geist Mono Variable, with a monospace fallback, for source, commands, and instrument labels. Interface labels otherwise use Inter.

Onest and Manrope are self-hosted in [src/fonts](src/fonts), with their OFL notices. Inter and Geist Mono use the existing local font packages. The display pairing changes the identity without changing the reading face.

### Hierarchy

- **Display:** the three frontmatter display roles record the wide-screen headline ramps. At widths up to (1439px), the shared ramp becomes `clamp(3.5rem, 5.1vw, 5rem)`; the tablet band uses (4.5rem); mobile uses `clamp(2.875rem, 11vw, 4.5rem)` with line height (1.04). Variant weights remain distinct.
- **Headline:** article titles use the headline role; Atlas reduces their weight to (550).
- **Title:** section headings use the title role; Ledger uses (1.375rem) and weight (700).
- **Body:** article prose uses the body role within a maximum reading measure of (74ch). Introductory descriptions have their own larger, narrower measure.
- **Action:** primary and text actions share the action role. Sidebar items use (0.8125rem), with active weight (650).
- **Code:** documentation code uses the code role. The introductory source excerpt is (0.75rem) by default; Ledger and Atlas use (0.8125rem) on larger screens. Code remains horizontally scrollable when needed.

**The Reading Face Rule.** Keep display identity in headings and the brand; use Inter for prose and Geist Mono for source. Real state outputs use tabular numerals.

## Layout

The shared documentation shell has a maximum width of (1720px), a sticky navigation column, a flexible reading column capped at (920px), and a table of contents that disappears below (1280px). Reading content remains capped at (74ch). Reading-column gutters use `clamp(28px, 3.6vw, 64px)` and become (22px) on mobile.

The comparison bar and site header stack. Their desktop heights are (72px) each; the comparison bar becomes (80px) in the (768–1130px) band. At mobile widths up to (767px), they become (86px) and (116px). Their summed custom property controls sticky positions and scroll offsets.

Reusable variant signatures are Workshop's asymmetric open grouping, Ledger's ruled rows and paired regions, and Atlas's centered grouping with a wide connected instrument. The first-surface arrangement belongs to the surface brief. At mobile widths, source/state panels become a single column, controls retain usable targets, and prose keeps its reading order. Dense demonstrations collapse their paired chart scopes below (1001px).

## Elevation & Depth

Color fields and thin rules provide most depth. Code and state regions sit beside or above each other without decorative lifts. Search results are the notable floating surface, with shadow `0 14px 32px #06152c26`; the existing input and overlay components retain their small framework shadows. A global prohibition on shadows would misdescribe this build.

**The Structural Depth Rule.** Use the existing surface, border, and field roles to distinguish regions; reserve floating elevation for the implemented popover and overlay roles.

The title arrives once over (600ms), using `cubic-bezier(0.16, 1, 0.3, 1)` and a small translation/blur. Comparison hover transitions take (150ms). Each real dispatch starts a (480ms) event-flow background pulse from an (18%) mix of field ink to transparent, using the same easing; a new dispatch cancels the previous pulse. The pulse is skipped for reduced motion and canceled on cleanup. Other animation and transition durations use the existing reduced-motion override. Active step emphasis remains tied to the latest event.

## Shapes

Each identity's radius is reused across controls, notes, demonstrations, and code panels: gently compact Workshop, nearly square Ledger, and rounded Atlas. The comparison options deliberately keep their shared (5px) corners so switching remains consistent. Source/state groups clip at their outer boundary. Thin horizontal and vertical rules separate real content regions; the Ledger proposal uses them most prominently.

## Components

### Buttons

Primary actions are filled, compact, and readable. Introductory primary and text actions have a minimum height of (44px); the primary uses the documented padding and identity radius. The primary hover uses foreground ink with background-colored text. Atlas's introductory primary is pale blue on navy and becomes white on hover. Text actions inherit their surrounding foreground and underline on hover. The default registry button supplies disabled opacity, focus rings, and a small pressed translation. Counter controls grow to a minimum height of (44px) on mobile.

### Cards / Containers

Notes use a muted tonal fill, no border, and the documented note padding. Demonstrations use a surface fill, a thin border, and identity corners. Source panels use the source palette; their controls and captions remain visually subordinate to code. Do not infer an all-purpose marketing-card grid from these functional containers.

### Inputs / Fields

Search uses a muted fill, a thin semantic border, identity corners, and a minimum height of (38px), increasing to (40px) on mobile. The keyboard hint sits at the right inside the field area. Focus uses the ring token. Search results float below the field, with the popover colors, documented shadow, and a scrollable maximum height of (65dvh).

### Navigation

The existing SVG and wordmark anchor the sticky header. Active sidebar items use primary text, accent fill, and heavier weight; hover uses the accent roles. Mobile navigation uses the existing focus-managed sheet. The comparison options are temporary links with named identity swatches and an explicit current-page state; they retain the selected route and hash.

### Live source and state

The signature instrument connects a real event, synchronous handler, and reactive state. Source uses selectable code; output uses large tabular values; the event journal displays recent dispatched events. Reset changes the diagram to `counter/reset` and `value = 0`; increment and decrement retain the payload-addition handler. Use actual state and events for visual feedback. A static sidecar example illustrates styling only and does not implement a store.

## Do's and Don'ts

### Do:

- **Do** retain the three proposal names and provisional status until the user chooses an identity.
- **Do** use the active identity's semantic colors and radius across reading pages and controls.
- **Do** preserve visible keyboard focus, reduced-motion behavior, and English/French control parity.
- **Do** keep source inspectable and state feedback tied to the working example.

### Don't:

- **Don't** treat Blue Workshop's fallback URL behavior as user approval.
- **Don't** combine identity selection with the independent light/dark control.
- **Don't** replace the existing Solux logo or SVG favicon.
- **Don't** promote a first-surface composition or this provisional comparison bar into an approved global identity.
