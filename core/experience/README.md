# Luvia Experience Core

## Purpose

Experience Core is Luvia's shared visual, layout and interaction architecture.

It exists to make global product evolution safer and more consistent after domain boundaries are stable.

## It owns

- design tokens
- semantic colors
- typography
- spacing
- radius and elevation
- theme infrastructure
- Trip-accent presentation rules
- responsive layout primitives
- shared UI components
- common interaction patterns
- loading / empty / error / offline states
- motion
- accessibility
- icons
- experience diagnostics

## It does not own

- Trip truth
- Places truth
- Booking truth
- Media truth
- Identity truth
- Social truth
- Intelligence truth

## Target structure

The target structure will grow only when real implementation requires it.

Planned areas:

- `tokens/`
- `theme/`
- `layout/`
- `components/`
- `patterns/`
- `states/`
- `motion/`
- `accessibility/`
- `icons/`
- `diagnostics/`

Do not create empty implementation files merely to make the tree look complete.

## Domain composition

Shared Experience primitives belong here.

Domain-specific composition remains with its product or domain owner.

Example:

Experience Core may own a shared Sheet primitive.

Booking owns the booking-specific content and behavior rendered inside that Sheet.

## Long-term roadmap

1. Experience Core / Design System Foundation — active through browserless `experience.v1`
2. shared primitives and token adoption
3. product-pattern consolidation
4. Global Experience Recomposition
5. continued domain-specific product evolution on the shared system

## Active contract foundation

- `experience-contract-core.js` is the platform-neutral semantic source for tokens, component roles, states, motion, accessibility and native mappings.
- `app/adapters/experience-web-adapter.js` is the Web-only CSS custom-property projection.
- `core/design/design-system-contract.js` remains a compatibility facade while legacy consumers migrate.
- `core/experience/experience-foundation.css` contains additive Web primitives. Existing feature CSS is adopted incrementally after measured classification; it is not bulk-moved.
- `assets/brand/luvia-living-compass/` contains the runtime vector subset of the official Living Compass. Face and hub remain fixed; only the two-ended needle is rotatable.
- `deriveActiveTripPalette()` consumes an explicit accent projection and derives contrast-safe action, soft and complementary values without reading Trip state.
- `createCompassTheme()` exposes the neutral four-direction Corporate palette or a controlled two-family active-Trip palette with stable geometry and direction semantics.
- Compass shared-element, node-reveal, needle-seek, ambient-invitation and brand-intro motion plus semantic haptic intents map to Web, SwiftUI and Compose. Reduced motion always resolves to an instant, hierarchy-preserving state change.
