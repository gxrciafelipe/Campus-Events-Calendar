# DESIGN.md

Binding for every UI task. If a task and this file disagree, this file wins; raise the conflict instead of improvising. The calendar is the product: on the main screen nothing competes with it.

## Palette

Blue is the brand and action color. Yellow is the **one accent** and means exactly one thing: "you are going". Nothing else is yellow. Tokens are CSS variables; components never contain raw hex values.

| Token           | Light     | Dark      | Use                                                  |
| --------------- | --------- | --------- | ---------------------------------------------------- |
| `--bg`          | `#FFFFFF` | `#0E1218` | Page                                                 |
| `--bg-subtle`   | `#F3F5F8` | `#171C24` | Dialog on dark, selected day, skeletons              |
| `--text`        | `#141A22` | `#E9EDF3` | Body, titles                                         |
| `--text-muted`  | `#566072` | `#9BA5B6` | Secondary text, days outside the month               |
| `--line`        | `#D5DAE3` | `#2C3440` | Hairlines between grid days only                     |
| `--line-strong` | `#7C8696` | `#6F7A8C` | Input borders (3:1 minimum)                          |
| `--primary`     | `#0E4C90` | `#8DB9F4` | Primary button fill, links, focus ring, today marker |
| `--on-primary`  | `#FFFFFF` | `#0E1218` | Text on `--primary`                                  |
| `--accent`      | `#FFD200` | `#FFD200` | Going state only                                     |
| `--on-accent`   | `#141A22` | `#141A22` | Text and icon on `--accent`                          |
| `--accent-edge` | `#947900` | `#FFD200` | 1px edge of accent fills on light backgrounds        |
| `--danger`      | `#B3261E` | `#FF9C94` | Errors, destructive confirm                          |

Checked contrast (WCAG AA): text 17.5:1 light / 16.0:1 dark; muted 6.3 / 7.6; primary on bg 8.6 / 9.3; on-accent on accent 12.1. Yellow on white is 1.45:1, so yellow is never text, never an icon and never a border on a light background. Dark mode follows `prefers-color-scheme`; every screen is checked in both.

## Organization label colors

Organizations are data, so their color is a key chosen by the admin from this fixed set, never a free hex. Blue and yellow are reserved and not offered. The label text ("RA event") is always shown; color alone never identifies an organization.

| Key       | Light     | Dark      |     | Key               | Light     | Dark      |
| --------- | --------- | --------- | --- | ----------------- | --------- | --------- |
| `teal`    | `#0B6B6B` | `#5FD0C8` |     | `orange`          | `#964800` | `#FFB067` |
| `green`   | `#2C6A1E` | `#8FD47A` |     | `olive`           | `#5A5F00` | `#C9CF6A` |
| `purple`  | `#6B3FA0` | `#C3A6F2` |     | `brown`           | `#7A4A21` | `#E0B48C` |
| `magenta` | `#A3246F` | `#F29AC8` |     | `slate` (default) | `#4A5568` | `#B4BECD` |

All are at least 5.7:1 on `--bg` and `--bg-subtle` in their mode. Used as label text color and as the 6px dot on calendar chips. No tinted pill backgrounds.

## Type

- One family: Inter (variable, self-hosted, `font-display: swap`). Weights 400, 500, 600 only. No italics.
- Scale (px / line-height): 12/16 caption · 14/20 secondary · 16/24 body · 20/28 section title · 24/32 page and dialog title · 30/36 month name on ≥768px.
- `font-variant-numeric: tabular-nums` on every time, date and count.
- `text-wrap: balance` on titles and headings; `text-wrap: pretty` on descriptions. Event titles clamp to 2 lines in lists, 1 line in month chips, never clamp in the dialog.
- Monospace (`ui-monospace` stack) only for code-like data (IDs, codes).
- Weight 600 is for titles and the primary button label. No bold words inside sentences.

## Spacing, radius, elevation

- Spacing scale: 4, 8, 12, 16, 24, 32, 48. Nothing in between.
- Related things sit 4–8 apart, groups 16–24 apart, sections 32–48 apart. Grouping is done with space. Borders appear only as hairlines between month-grid days and around inputs. No cards-inside-cards.
- Radius: 6 (controls, chips), 12 (inputs' containers, menus), 16 (dialog; top corners only on the mobile sheet), full (today marker, dots). Nested radius = outer radius − padding, minimum 2. A flyer is full-bleed at the top of the dialog and takes the dialog's corners.
- One shadow in the whole app, on the dialog. No gradients.

## Icons

Lucide only. Stroke 1.75. Sizes 16 (inline with 14px text), 20 (default), 24 (navigation). Icons next to text are aligned optically: nudge by 1px where the pixel-centered position looks low. Never an emoji as an icon. An icon-only button has an accessible name and a 44px hit area.

## Components and states

Every component implements all listed states. Every async view has **loading** (skeleton shaped like the content), **empty** (one specific sentence, optional single action) and **error** (what failed, a Retry button).

| Component                          | States and rules                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button (primary, secondary, quiet) | default, hover, active, focus-visible (2px `--primary` ring, 2px offset), disabled, loading (label stays, spinner replaces icon). One primary button per screen.                                                                                                                                                                         |
| Going button                       | not going: primary fill, label "I'm going" · going: `--accent` fill with `--accent-edge`, check icon, label "Going" · pending: optimistic, no spinner · error: reverts, inline message "Couldn't save. Try again." · signed out: label "Sign in to mark going" · ended or cancelled: disabled. The most prominent element in the dialog. |
| Attendee count                     | "12 going", tabular numerals, hidden at 0 until the first RSVP ("Be the first to go").                                                                                                                                                                                                                                                   |
| Month grid                         | 7 columns, Sunday first. Day cell: default, today (number in a `--primary` filled circle), selected, outside month (muted), has-more ("+3").                                                                                                                                                                                             |
| Event chip (≥768px)                | org dot, start time, title on one line. States: default, hover, focus, going (small `--accent` square at the right edge, dark-on-accent check), cancelled (struck title, muted), past (muted).                                                                                                                                           |
| Day dots (<768px)                  | up to 3 org dots per day, then "+n". Tapping a day selects it and lists its events under the grid.                                                                                                                                                                                                                                       |
| Event row (agenda)                 | time range, title, org label, place; going marker at right. Same states as chip.                                                                                                                                                                                                                                                         |
| View switcher                      | Month / Week / Day segmented control, plus previous, next and Today. Current view has `aria-pressed`.                                                                                                                                                                                                                                    |
| Event dialog                       | loading skeleton, loaded, not found, error. Order: flyer, title, org label, Going button with count, date and time, place, hosts, category, description, add-to-calendar actions. Closes on Esc, backdrop and Back.                                                                                                                      |
| Field                              | default, focus, filled, error (message under the field, linked with `aria-describedby`), disabled. Label always visible; no placeholder-as-label.                                                                                                                                                                                        |
| Notice                             | Independence notice on first visit: plain text, one "Got it" button, no icon.                                                                                                                                                                                                                                                            |
| Toast                              | Only for failures outside the current view. Success is shown by the UI changing, not by a toast.                                                                                                                                                                                                                                         |

## Mobile-first rules

- Design at 360px first, then enhance at 768px and 1024px. No horizontal scrolling at 320px.
- Under 768px the month grid shows dots and the selected day's agenda below it; the dialog is a bottom sheet with the Going button pinned to its bottom edge.
- Touch targets at least 44×44px. Nothing depends on hover.
- Respect safe-area insets. Body text never below 16px in inputs (prevents iOS zoom).
- Main screen content order: view switcher and month name, then the calendar. No hero, no banner, no stats above it.

## Motion

Only three things animate: the going toggle (120ms), the dialog opening and closing (180ms fade with an 8px rise; slide on the mobile sheet) and a count change (120ms crossfade). Ease-out, never bouncy. With `prefers-reduced-motion: reduce`, all three become instant.

## Accessibility

- WCAG 2.2 AA. Contrast as tabled above; never introduce a color pair that is not in this file.
- Full keyboard path: arrow keys move between days, Enter opens a day or event, Esc closes, focus returns to the trigger.
- The month grid is a `grid` with labelled days ("Tuesday, November 17, 3 events"). The dialog is a labelled modal dialog. Count changes are announced politely.
- State is never color-only: going has a check and a label, cancelled has a strike and the word "Cancelled", today has `aria-current="date"`.
- Flyers get alt text from the event title ("Flyer for …"); all flyer information must also exist as text fields.

## Anti-slop rules (check before finishing any UI task)

1. No filler badges, decorative gradients, emojis-as-icons or random embellishments.
2. No redundant labels (don't label what's already obvious from context).
3. Mono font only for code-like data; no random italics or bold words.
4. One accent color. The primary action (e.g. "I'm going") is the most prominent element on its screen.
5. One icon set, one stroke weight, one size scale.
6. Group related things with spacing, not borders or boxes.
7. Nested radii: inner radius = outer radius − padding.
8. Text contrast meets WCAG AA. Check light and dark mode.
9. Event titles and headings wrap cleanly (`text-wrap: balance`), no orphans.
10. Use tabular numerals for times, dates and attendee counts.
11. Microcopy is specific ("12 going", not "Attendance info"), no filler.
12. Every async view has a loading (skeleton), empty and error state.
13. Animate only useful feedback (going toggle, popup open, count change), short and subtle. Respect `prefers-reduced-motion`.
14. Make the calendar the visual focus of the main screen.
15. Align by eye where optical balance differs from pixel alignment (icons next to text, etc.).

Also: no university logo, wordmark, seal or photos anywhere, and the independence notice stays in the footer of every page.
