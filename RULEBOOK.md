# UI Color Rulebook

## Purpose
This project uses a token-first color system to keep screens consistent, accessible, and easier to scale.

## Core Distribution
- 60% base colors: neutrals and page backgrounds.
- 30% supporting colors: cards, section fills, and secondary surfaces.
- 10% accent colors: CTA, active states, key highlights.

Use this ratio as a screen-level guide, not a strict pixel rule.

## Color Roles
- `primary` and `primary-dark`: brand actions and main CTA.
- `secondary`: strong brand support color.
- `accent-cyan`, `accent-lime`, `accent-pink`, `accent-orange`: visual energy, decorative highlights, limited emphasis.
- `accent-*-soft` variants: section gradients, soft cards, subtle emphasis backgrounds.
- `text-*`: all copy and text hierarchy.
- `bg-*` and `surface-*`: page, section, and component backgrounds.
- `border-*`: stroke hierarchy and separators.
- `state-success`, `state-warning`, `state-danger`, `state-info`: status-only usage.

## Usage Rules
- Do not hardcode colors in component rules.
- Add new colors in `:root` first, then reference variables.
- Keep semantic colors role-locked, do not reuse warning/danger for decorative UI.
- In one viewport, keep 2 to 3 brand hues dominant.
- Prefer token-based tints/gradients over ad-hoc new hex values.
- Keep text contrast readable against every surface.

## Implementation Notes
- Main token source: `style.css` inside `:root`.
- Cursor design constraints: `.cursor/rules/global-design-content-rules.mdc`.
- If visual style changes, update both token definitions and this rulebook.
