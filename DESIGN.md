---
name: AFOCE Finance Suite
description: >
  Premium accounting platform for Nepali businesses. A warm, paper-like light
  mode anchored by deep navy and amber accents — conveying institutional trust
  while remaining approachable for daily financial work.

colors:
  # --- Surface hierarchy ---
  background: "#f4ede1"
  background-elevated: "#fbf7ef"
  panel: "#fffdf8"
  panel-strong: "#5c6676"
  panel-deep: "#0b1426"

  # --- Borders ---
  border: "rgba(16, 28, 49, 0.14)"
  border-strong: "rgba(16, 28, 49, 0.26)"

  # --- Text ---
  ink: "#0f2037"
  ink-soft: "#33465f"

  # --- Brand ---
  brand: "#2248a7"
  brand-dark: "#1b3985"
  brand-2: "#1d7f6b"

  # --- Semantic ---
  accent: "#af7a27"
  danger: "#b14d41"
  success: "#19725d"

  # --- Dark sidebar / "Quick Add" button ---
  surface-dark-from: "rgba(17, 31, 54, 0.98)"
  surface-dark-to: "rgba(10, 19, 34, 0.99)"

typography:
  display:
    fontFamily: "Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif"
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 56px
    letterSpacing: -0.02em

  headline-lg:
    fontFamily: "Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif"
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
    letterSpacing: -0.01em

  headline-md:
    fontFamily: "Avenir Next, Segoe UI, Helvetica Neue, sans-serif"
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 28px

  body-lg:
    fontFamily: "Avenir Next, Segoe UI, Helvetica Neue, sans-serif"
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px

  body-md:
    fontFamily: "Avenir Next, Segoe UI, Helvetica Neue, sans-serif"
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px

  body-sm:
    fontFamily: "Avenir Next, Segoe UI, Helvetica Neue, sans-serif"
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px
k
  label-lg:
    fontFamily: "Avenir Next, Segoe UI, Helvetica Neue, sans-serif"
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px

  label-sm:
    fontFamily: "Avenir Next, Segoe UI, Helvetica Neue, sans-serif"
    fontSize: 10px
    fontWeight: "700"
    lineHeight: 14px
    letterSpacing: 0.2em
    textTransform: uppercase

  eyebrow:
    fontFamily: "Avenir Next, Segoe UI, Helvetica Neue, sans-serif"
    fontSize: 11.5px
    fontWeight: "700"
    lineHeight: 16px
    letterSpacing: 0.3em
    textTransform: uppercase

  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 20px

rounded:
  sm: 0.5rem
  DEFAULT: 0.75rem
  md: 0.75rem
  lg: 1rem
  xl: 0.75rem
  2xl: 1rem
  full: 9999px

spacing:
  unit: 8px
  sidebar-width: 256px
  sidebar-collapsed: 72px
  header-height: 64px
  card-padding: 20px
  panel-padding: 24px
  section-gap: 20px
  nav-item-padding: "10px 12px"
  grid-gap: 20px

elevation:
  card:
    boxShadow: "0 26px 64px rgba(11, 23, 40, 0.10)"
    backdropFilter: blur(8px)
  panel:
    boxShadow: "0 22px 52px rgba(14, 25, 41, 0.09)"
    backdropFilter: blur(8px)
  dropdown:
    boxShadow: "0 8px 24px rgba(14, 25, 41, 0.12)"
  sidebar-dark:
    boxShadow: "0 24px 52px rgba(6, 12, 22, 0.40)"

motion:
  duration-fast: 150ms
  duration-default: 200ms
  duration-slow: 300ms
  duration-entrance: 700ms
  easing-default: ease
  easing-entrance: cubic-bezier(0.2, 0.8, 0.2, 1)
  animation-rise: "rise 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both"
  animation-fade: "fade 700ms ease both"

components:
  # --- Layout ---
  sidebar:
    width: 256px
    collapsedWidth: 72px
    backgroundColor: "{colors.panel}"
    borderRight: "1px solid {colors.border}"
    transition: "width 300ms ease"

  sidebar-nav-item:
    borderRadius: "{rounded.xl}"
    padding: "10px 12px"
    fontSize: 14px
    fontWeight: "500"
    gap: 12px

  sidebar-nav-item-active:
    backgroundColor: "{colors.panel-strong}"
    textColor: "#ffffff"

  sidebar-nav-item-hover:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"

  sidebar-section-label:
    fontSize: 10px
    fontWeight: "700"
    letterSpacing: 0.2em
    textTransform: uppercase
    textColor: "{colors.ink-soft}"
    paddingLeft: 12px

  header:
    height: 64px
    backgroundColor: "{colors.panel}"
    borderBottom: "1px solid {colors.border}"
    paddingX: 24px

  # --- Cards ---
  stat-card:
    backgroundColor: "#ffffff"
    borderRadius: "{rounded.2xl}"
    border: "1px solid {colors.border}"
    padding: "{spacing.card-padding}"
    transition: "box-shadow 200ms ease"
    hoverBoxShadow: "0 4px 12px rgba(14, 25, 41, 0.10)"

  metric-card:
    backgroundColor: "rgba(255, 253, 248, 0.98)"
    borderRadius: "{rounded.2xl}"
    border: "1px solid {colors.border}"
    padding: "{spacing.card-padding}"
    backdropFilter: blur(8px)

  surface-card:
    backgroundColor: "rgba(255, 252, 245, 0.96)"
    border: "1px solid {colors.border}"
    boxShadow: "{elevation.card.boxShadow}"
    backdropFilter: "{elevation.card.backdropFilter}"

  # --- Buttons ---
  button-primary:
    backgroundColor: "{colors.panel-deep}"
    textColor: "#ffffff"
    borderRadius: "{rounded.xl}"
    padding: "10px 16px"
    fontSize: 14px
    fontWeight: "600"
    hoverBackgroundColor: "#1a3a8f"
    transition: "background-color 150ms ease"

  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    border: "1px solid {colors.border}"
    borderRadius: "{rounded.xl}"
    padding: "8px 16px"
    fontSize: 14px
    fontWeight: "500"
    hoverBackgroundColor: "{colors.background-elevated}"
    transition: "background-color 150ms ease"

  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.ink-soft}"
    border: "1px solid {colors.border}"
    borderRadius: "{rounded.lg}"
    padding: "8px"
    hoverBackgroundColor: "{colors.background}"
    hoverTextColor: "{colors.ink}"
    transition: "background-color 150ms ease"

  button-icon:
    width: 40px
    height: 40px
    borderRadius: "{rounded.xl}"
    backgroundColor: "#ffffff"
    border: "1px solid {colors.border}"
    textColor: "{colors.ink-soft}"
    hoverBackgroundColor: "{colors.background-elevated}"
    hoverTextColor: "{colors.ink}"

  # --- Form controls ---
  input:
    backgroundColor: "#ffffff"
    border: "1px solid {colors.border}"
    borderRadius: "{rounded.xl}"
    padding: "8px 12px"
    fontSize: 14px
    textColor: "{colors.ink}"
    placeholderColor: "{colors.ink-soft}"
    focusBorderColor: "{colors.brand}"
    outline: none

  select:
    backgroundColor: "#ffffff"
    border: "1px solid {colors.border}"
    borderRadius: "{rounded.xl}"
    padding: "8px 12px"
    fontSize: 14px
    textColor: "{colors.ink}"
    focusBorderColor: "{colors.brand}"
    outline: none

  # --- Data display ---
  trend-badge-up:
    backgroundColor: "rgba(29, 127, 107, 0.10)"
    textColor: "{colors.brand-2}"
    borderRadius: "{rounded.full}"
    padding: "2px 8px"
    fontSize: 12px
    fontWeight: "500"

  trend-badge-down:
    backgroundColor: "rgba(177, 77, 65, 0.10)"
    textColor: "{colors.danger}"
    borderRadius: "{rounded.full}"
    padding: "2px 8px"
    fontSize: 12px
    fontWeight: "500"

  trend-badge-warning:
    backgroundColor: "rgba(175, 122, 39, 0.10)"
    textColor: "{colors.accent}"
    borderRadius: "{rounded.full}"
    padding: "2px 8px"
    fontSize: 12px
    fontWeight: "500"

  avatar:
    width: 36px
    height: 36px
    borderRadius: "{rounded.xl}"
    backgroundColor: "{colors.brand}"
    textColor: "#ffffff"
    fontSize: 12px
    fontWeight: "700"

  icon-container:
    width: 40px
    height: 40px
    borderRadius: "{rounded.xl}"

  dropdown:
    backgroundColor: "#ffffff"
    border: "1px solid {colors.border}"
    borderRadius: "{rounded.xl}"
    boxShadow: "{elevation.dropdown.boxShadow}"
    paddingY: 8px

  dropdown-item:
    padding: "8px 16px"
    fontSize: 14px
    textColor: "{colors.ink-soft}"
    hoverBackgroundColor: "{colors.background}"
    hoverTextColor: "{colors.ink}"
    transition: "background-color 150ms ease"

  skeleton:
    backgroundColor: "{colors.border}"
    borderRadius: "{rounded.lg}"
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"

  data-chip:
    backgroundColor: "rgba(255, 255, 255, 0.06)"
    border: "1px solid rgba(255, 255, 255, 0.12)"
    borderRadius: "{rounded.full}"
    padding: "7px 13px"
    fontSize: 12.5px
    textColor: "rgba(255, 255, 255, 0.82)"

  notification-dot:
    width: 8px
    height: 8px
    borderRadius: "{rounded.full}"
    backgroundColor: "{colors.danger}"

  hairline:
    height: 1px
    background: "linear-gradient(90deg, transparent, rgba(16, 33, 59, 0.14), transparent)"

  eyebrow:
    textColor: "{colors.brand}"
    fontSize: 11.5px
    fontWeight: "700"
    letterSpacing: 0.3em
    textTransform: uppercase
    gap: 12px

  progress-bar-track:
    height: 6px
    borderRadius: "{rounded.full}"
    backgroundColor: "rgba(16, 28, 49, 0.08)"

  progress-bar-fill:
    height: 6px
    borderRadius: "{rounded.full}"
    backgroundColor: "{colors.brand}"

backgrounds:
  page:
    value: >
      radial-gradient(circle at top left, rgba(200, 157, 83, 0.12), transparent 28%),
      radial-gradient(circle at bottom right, rgba(21, 48, 125, 0.12), transparent 26%),
      linear-gradient(180deg, #fbf7ef 0%, #f4ede2 100%)
    description: Warm parchment gradient with corner color washes

  dashboard-shell:
    value: >
      radial-gradient(circle at top left, rgba(29, 127, 107, 0.10), transparent 30%),
      radial-gradient(circle at bottom right, rgba(175, 122, 39, 0.11), transparent 30%),
      linear-gradient(180deg, #f7f0e5 0%, #f0e6d8 100%)
    description: Dashboard-specific variant with teal/amber corner washes

  sidebar-dark:
    value: >
      radial-gradient(circle at top left, rgba(175, 122, 39, 0.16), transparent 30%),
      linear-gradient(180deg, rgba(17, 31, 54, 0.98), rgba(10, 19, 34, 0.99))
    description: Dark panel for the sidebar's dark variant (icon rail)

  page-grid-overlay:
    value: >
      linear-gradient(rgba(20, 34, 56, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(20, 34, 56, 0.03) 1px, transparent 1px)
    backgroundSize: 72px 72px
    opacity: 0.45
    maskImage: "radial-gradient(circle at center, black 50%, transparent 100%)"
    description: Subtle grid mesh that gives the page a structured, document-like texture

  selection:
    backgroundColor: "#2248a7"
    textColor: "#ffffff"

scrollbar:
  width: 10px
  thumbBorderRadius: 999px
  thumbBackground: "rgba(16, 33, 59, 0.18)"
  thumbBorder: "2px solid transparent"

---

## Brand & Personality

AFOCE is a production accounting suite for Nepali businesses. The visual language deliberately channels **paper, ink, and institutional trust** — the feel of a well-kept ledger translated into software. Every surface is warm (cream, off-white, parchment), every accent is purposeful (navy for action, amber for money, teal for growth), and the overall impression is _precise but never cold_.

The product serves finance admins and managers who spend full days inside the dashboard. Design decisions favor **low visual fatigue**: high contrast text on warm neutrals, minimal decorative animation, and clear information hierarchy over flashy embellishment.

## Color Strategy

The palette has three distinct layers:

**1. The Parchment Foundation**  
Background tones range from `#f4ede1` (page base) to `#fffdf8` (panel/card surface). These are never pure white — the warmth signals that this is a professional tool, not a consumer app. Corner radial gradients (amber top-left, navy bottom-right) provide subtle life without distracting from data.

**2. Ink Hierarchy**  
All text uses two values only: `--ink` (`#0f2037`, near-black navy) for primary content and `--ink-soft` (`#33465f`, muted slate) for secondary labels, captions, and placeholders. This two-step system keeps typographic hierarchy clear without introducing grey ramps.

**3. Semantic Accents**  
- **Brand blue** (`#2248a7`) — interactive links, active states, selection highlight, CTA buttons
- **Brand teal** (`#1d7f6b`) — positive trends, success states, "up" indicators
- **Accent amber** (`#af7a27`) — financial warnings, near-due alerts, gold-toned highlights (connects to the Nepali rupee color)
- **Danger red** (`#b14d41`) — errors, overdue items, "down" trend indicators
- **Panel deep** (`#5c6676`) — active sidebar items (slate-navy fills, white text) — softer than brand blue, less aggressive for persistent UI

## Typography

Two font families create a deliberate contrast:

**Display / Headings (Iowan Old Style / Palatino)**  
Used for hero headings on marketing/auth pages only. The serif typeface projects credibility and authority — appropriate for a financial product where trust is paramount. Never used inside the dashboard application shell.

**UI / Data (Avenir Next / Segoe UI)**  
All functional UI — navigation, forms, tables, labels, body copy — uses the sans-serif stack. Avenir Next's geometric clarity handles dense financial data without fatigue. Font weights follow a strict system: `400` for body, `500` for interactive elements, `600` for headings and emphasis, `700` for badge labels and eyebrows.

**Eyebrow labels** are a signature pattern: `10–12px`, `700` weight, `0.2–0.3em` letter-spacing, all-caps. Used for navigation section headers, metric group labels, and section dividers.

## Layout & Spacing

The 8px grid governs all spacing. Key dimensions:

| Element | Value |
|---|---|
| Sidebar width | 256px (expanded), 72px (collapsed) |
| Header height | 64px |
| Card padding | 20px |
| Grid gap | 20px |
| Nav item padding | 10px 12px |

The sidebar is collapsible with a smooth 300ms width transition. In collapsed state, labels are hidden and icons are center-aligned. The main content area uses CSS variable `--sidebar-collapsed` to smoothly shift `padding-left` without JavaScript reflows.

The dashboard shell uses a CSS grid. Stat cards sit in a responsive 4-column row on desktop. Below the stats, a mixed-width layout places full-width charts alongside narrower widget panels.

## Surfaces & Depth

There are three distinct surface treatments:

**Light panel** (most surfaces): `rgba(255, 253, 247, 0.96)` with `backdrop-filter: blur(8px)` and `border: 1px solid rgba(16, 28, 49, 0.14)`. The near-full opacity keeps content legible. The blur is subtle — it adds depth without the heavy glassmorphism effect that would tire the eye on a full workday product.

**Pure white** (cards, inputs, dropdowns): Solid white `#ffffff`. Used for interactive containers that need to stand clearly above the parchment background. No blur needed since they're always on a warm surface.

**Dark panel** (sidebar dark variant, Quick Add button): Near-black deep navy gradient with amber corner glow. Used sparingly to provide strong contrast anchors. This same treatment is used for the primary CTA button (`#111f36` → `#1a3a8f` on hover).

Shadows use a very long, soft spread to mimic natural light falling on paper (`0 26px 64px rgba(11, 23, 40, 0.10)`) — no sharp drop shadows anywhere.

## Shape Language

`border-radius` is consistent and opinionated:

- **Buttons, inputs, nav items, icon containers**: `rounded-xl` (Tailwind) = `0.75rem` / 12px
- **Stat cards, metric cards, VATWidget**: `rounded-2xl` = `1rem` / 16px
- **Badges, pills, tags, notification dots**: `rounded-full` = 9999px
- **Small utility buttons (collapse toggle)**: `rounded-lg` = 8px

There are no sharp 0-radius corners or extreme `rounded-3xl` cards anywhere. The shape language reads as "confident and modern" without being playful.

## Motion & Animation

Motion is restrained. Only two named animations exist:

**`animated-rise`**: `translateY(18px) → 0, opacity 0→1`, 700ms, `cubic-bezier(0.2, 0.8, 0.2, 1)`. Used for page-level content entering the viewport. The overshoot easing creates an organic settle.

**`animated-fade`**: `opacity 0→1`, 700ms, `ease`. Used for overlays and subtle reveals.

All interactive elements use CSS `transition` (not JS animation): `150–300ms ease`. Hover states change `background-color` or `color` only — no scaling, no transforms on hover for interactive elements.

## Components Deep-Dive

### Stat Cards
The workhorse component of the dashboard. White background, `rounded-2xl`, 1px border, `20px` padding. A colored icon container (40×40, `rounded-xl`, 10% opacity tinted background) sits top-left. A trend badge (color-coded pill with ↑/↓/⚠ symbol) sits top-right. The large metric value (`text-2xl font-semibold`) anchors below with a small label below it.

### Sidebar Navigation
Two groups — "Main" (operational modules) and "Management" (admin modules) — separated by eyebrow labels. Active item: `--panel-strong` background (`#5c6676`), white text. Hover: white background, `--ink` text. Icons are 20×20 Lucide strokes. Nav items are `rounded-xl`, 12px gap between icon and label.

The sidebar footer contains a 2-column grid of utility buttons (Notifications, Help) and a user profile row with avatar, name, role, and a collapse toggle.

### Header
Sticky, `z-30`, 64px tall. Left side: page title (`text-lg font-semibold`) + Bikram Sambat fiscal year badge (teal pill). Right side: search button (expands to a 320px input overlay), bell icon (with danger-colored unread badge), Export button, Quick Add CTA (dark navy, primary), and avatar (circular, brand-colored initials fallback).

Dropdowns from the header are `rounded-xl`, white, shadowed, with `max-h-80 overflow-y-auto` for notification lists.

### Forms & Inputs
All inputs and selects: white background, `rounded-xl`, `1px solid --border`, focus ring swaps border to `--brand`. Label text: `12px font-medium --ink-soft`. No floating labels — all labels are static above the input.

### Skeleton Loading
`animate-pulse` on `rounded-lg` divs using `--border` color as the shimmer background. Inline with content layout, never full-page spinners.

### Eyebrow Component
A brand pattern used on marketing/auth pages: `color: --brand`, `10px tracking-[0.3em] uppercase font-bold`. Preceded by a 2.5rem horizontal line `linear-gradient(90deg, rgba(21,48,125,0.85), rgba(200,157,83,0.7))` — the blue-to-gold gradient represents the brand-to-accent color story.

## Bikram Sambat Awareness

The product is date-aware for Nepal's Bikram Sambat calendar system. Fiscal year indicators appear throughout: the header badge shows the current BS year, date displays in notifications use `adToBsDateWithDay()` formatting, and the VAT widget references the current BS month. Design conventions:

- BS dates render in the same typographic style as AD dates (no special font treatment)
- Fiscal year badges use the teal (`--brand-2`) color family to visually distinguish them from operational status badges (danger red)
- "FY 2081/82" format is used — compact two-digit year suffix

## Accessibility

- All interactive elements use `transition` for reduced-motion environments (transitions are CSS-only, not mandatory for content)
- Color is never the sole indicator of status: trend badges include ↑ ↓ ⚠ symbols alongside color
- Icon-only buttons always have a `title` attribute for tooltip/screenreader access
- Selection highlight uses `--brand` blue with white text (contrast ≥ 4.5:1)
- The sidebar collapsed state preserves all navigation via `title` tooltips on icon-only links
