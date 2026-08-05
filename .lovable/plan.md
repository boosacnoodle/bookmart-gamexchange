# Storefront, redrawn in pixel art

You like the pixel-art shopfront more than the painterly dusk photo-illustration. Good instinct — it is more distinctive, more "us", and it ages better than a soft painterly render. Here is how it works without throwing away the approved direction.

## The rule that keeps it coherent

Pixel art for the **outside and all signage**. Painterly for the **inside of the rooms**.

That reads as a deliberate idea rather than a mixed bag: the street is a memory, drawn in the language of the games we sell; step inside and the shop becomes warm, physical and real. The pixel language carries through inward via signs, neon, platform marks and the CRT.

## What changes on the homepage

- **New storefront artwork** in the pixel style of your reference: brick facade, awning lamps over the big painted sign, wet cobbles reflecting lamplight, open double doors with the interior glowing through, side windows full of stock, a green invader and RETRO GAMES neon on the right, OPEN neon on the left, street lamp and A-board on the left, the street plate on the right.
- **The sign is the artwork, not HTML text.** "BOOKMART & GAMEXCHANGE" lives in the illustration in pixel lettering. The current live-text headline over the top gets removed, so we stop having two competing signs.
- **The doormat says COME ON IN** and is the primary entry action — a hotspot on the mat rather than a bordered button floating over the art.
- **No EST. date** until you confirm the real one. The reference shows 1989; if that is right, it goes on the small brass plate under the sign.
- **The A-board** carries the buy/sell/trade line in hand-chalked pixel type, and is the Trade Counter entry point from the street.
- **Search sits on the threshold**, in a dark rail across the bottom with the trade prompt and opening hours beside it — close to your reference, but only three items, not badges.

## What stays

- Lighting as the interface. Cursor position warms the side of the building you drift toward. Hovering the doorway raises the interior glow and dims the street; hovering the RETRO GAMES window pushes that corner red; hovering the OPEN window pushes it warm.
- Ambient life kept low: OPEN neon breathes, the invader has a slow two-frame idle, the interior lamps flicker faintly, rain glints on the cobbles. Nothing loops fast, nothing distracts.
- One lateral pan into the rooms. Four rooms plus the Trade Counter, unchanged.
- Pixel art must look hand-placed: crisp integer-scaled pixels, no blur, no smoothing, limited palette pulled from the light sources.

## The one risk, and the fix

A single flat illustration can feel like a poster instead of a doorway. The fix is that every interactive thing is a **place in the picture** — the mat, the two windows, the A-board, the doors — not a control drawn on top of it. Only the top bar and the threshold rail are UI, and both are treated as dark shop fittings.

## Mobile

A taller crop of the same facade: sign, doors and mat, street lamp trimmed away. Mat is the entry hotspot, search rail pinned under it, the shop bar stays small and pinned at the top like an awning.

## Technical notes

- Generate a new pixel-art storefront asset at wide and portrait crops, replacing `storefront-dusk.jpg` / `storefront-dusk-portrait.jpg`. Render with `image-rendering: pixelated` and integer scaling so pixels stay hard.
- Interactive regions as absolutely positioned percentage-based hotspots over the image, each driving a CSS custom property that the lighting overlays read — same technique already used for cursor warmth, no new dependency.
- Animated elements (OPEN neon, invader idle, lamp flicker) as small separate transparent PNG overlays layered on the base plate so the base can stay a single optimised image.
- All added colours go in `src/styles.css` as tokens; no hardcoded hex in components. Respect `prefers-reduced-motion` by holding every ambient loop still.

## Open question

Only one thing blocks a faithful sign: is **EST. 1989** correct? If not, tell me the year or I leave the plate off.
