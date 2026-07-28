# Aura finalization

## Goal

Complete the remaining Aura redesign cleanup without changing client API, state, routes, or commerce workflows.

## Tasks

- [ ] Normalize seller categories, shipping, reviews, statistics, settings, and registration surfaces; preserve each existing form and mutation.
- [ ] Normalize remaining seller order detail states and product management modals.
- [ ] Refactor storefront legacy components: vouchers, notifications, profile/order, pagination, product specs/forms, sitemap, and chat controls.
- [ ] Remove residual hardcoded Aura-legacy colors/radii and generic `transition-all` from touched components.
- [ ] Audit icon-only controls and focus states in the changed files.
- [ ] Run lint, TypeScript, production build, and final legacy-style scan.

## Done when

- [ ] No remaining legacy style marker in the actively redesigned seller/storefront families.
- [ ] Existing routes and API flows still compile and run through the existing hooks.
