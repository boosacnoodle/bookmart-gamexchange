# Design System

## Visual Source

No supplied image files were present in the workspace. Public DublinTown imagery of Book Mart & Game Exchange shows the real shop as a compact, densely stocked Talbot Street storefront with black-and-white tiled exterior, yellow window lettering, glass displays, purple-painted shelves, wire media racks, handwritten category labels and mixed books/games/media in close proximity.

Design should preserve that practical, browseable, lived-in character while making ecommerce tasks clear and trustworthy.

## Principles

- Real shop first: photography and stock details drive the visual identity.
- Eclectic but ordered: browsing should feel rich without becoming messy.
- Editorial commerce: rare books and ordinary games can coexist without separate visual languages.
- No theatrical nostalgia: avoid parchment, fake leather, excessive sepia or novelty gaming effects.
- Dense when useful: admin and stock screens prioritize speed, scanning and repeat workflows.
- Accessible by default: visible focus states, readable contrast, non-color-only status cues.

## Colour Tokens

```css
:root {
  --color-paper: #f7f1e6;
  --color-paper-soft: #fbf8f1;
  --color-ink: #191715;
  --color-muted: #615a52;
  --color-line: #d8cdbc;
  --color-burgundy: #7a1f2b;
  --color-burgundy-dark: #51131b;
  --color-brass: #b1812d;
  --color-ticket-yellow: #f1c84b;
  --color-shelf-lilac: #8f78a8;
  --color-shop-green: #2f6f55;
  --color-error: #b42318;
  --color-warning: #a15c07;
  --color-success: #207a4a;
  --color-info: #245b8f;
  --color-focus: #1d4ed8;
}
```

Usage:

- Paper/off-white: main public background.
- Ink/charcoal: primary text.
- Burgundy: primary CTAs, active nav and admin destructive confirmations.
- Brass/ticket yellow: small shelf labels, price labels, highlights.
- Shelf lilac: subtle local reference from real shelving; use sparingly.
- Green: success and optional shop-supported accent.

## Typography

Recommended fonts:

- Headings: `Fraunces`, `Lora`, or `Libre Baskerville`.
- UI and commerce: `Inter`, `Source Sans 3`, or system sans.
- Numeric/table data: tabular numerals enabled on UI font.

Scale:

- Display: 48/56 desktop, 36/42 mobile, serif, 600.
- H1: 40/48 desktop, 32/38 mobile, serif, 600.
- H2: 30/38 desktop, 26/34 mobile, serif, 600.
- H3: 22/30, serif or sans 650 depending context.
- Body: 16/24, sans, 400.
- Small: 14/20, sans, 400.
- Caption/meta: 12/16, sans, 500.
- Commerce controls: 14/20, sans, 650.

Letter spacing is 0.

## Spacing

Base scale:

- 4, 8, 12, 16, 24, 32, 48, 64, 96.

Layout:

- Public page max content width: 1180px.
- Product grids: responsive minmax tracks, stable image ratios.
- Admin screens: denser 8/12/16 spacing with fixed toolbar heights.
- Mobile staff intake: thumb-friendly controls, 44px minimum tap targets.

## Radius, Border, Shadow

- Radius: 4px for inputs/buttons, 6px for product cards, 8px max for repeated cards.
- Border: 1px solid `--color-line`.
- Shadow: minimal; use for menus, modals and sticky admin bars only.

## Buttons

- Primary: burgundy background, paper text, strong focus ring.
- Secondary: paper background, ink text, line border.
- Quiet: transparent with underline or icon treatment.
- Danger: error background only after confirmation.
- Icon button: square 40px public, 44px mobile intake, tooltip where meaning is not obvious.
- Disabled: not focusable when truly unavailable; explain disabled purchase states with adjacent text.

## Forms

- Labels above controls.
- Help text below controls.
- Errors near the field and summarized at the top for long forms.
- Required fields indicated in text, not color alone.
- Inputs use clear borders and high-contrast focus.
- Currency fields store integer cents and display EUR formatting.

## Product Cards

Required elements:

- Actual item image.
- Title.
- Price.
- Category/platform/creator as compact metadata.
- Condition label.
- Availability label.
- "One copy available" when quantity is one and published.
- Add/reserve action only when stock is currently purchasable.

Use stable image aspect ratios and prevent title/price wrapping from shifting adjacent grid items.

## Collection Cards

Collection cards should feel editorial:

- Cover photograph.
- Shelf title.
- Staff introduction excerpt.
- Item count and sold-policy indicator where useful.
- Curator name only when present.
- Avoid generic filter-card styling.

## Condition Labels

- New/Sealed
- Like New
- Very Good
- Good
- Acceptable
- For Parts / Untested
- Collectible - Staff Reviewed

Labels must include text and a shape/icon cue; never rely on color only.

## Inventory Status Labels

- Draft
- Needs Review
- Ready
- Published
- Reserved
- Sold
- Archived
- Rejected

Public pages only expose customer-appropriate availability, never internal review state or restricted notes.

## State Patterns

Loading:

- Skeleton rows/cards with stable dimensions.
- Staff intake camera: explicit permission/loading/error states.

Empty:

- Specific recovery action, e.g. "No matching wanted requests" with link to broaden filters.

Error:

- Plain-language cause.
- Retry where useful.
- Support/contact path for checkout failures.

Accessibility:

- Keyboard-visible focus.
- Skip link.
- Semantic landmarks.
- ARIA only where native semantics are insufficient.
- Reduced-motion support.
- Minimum AA contrast for text and controls.
