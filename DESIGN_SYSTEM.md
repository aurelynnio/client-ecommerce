# Aura Commerce Design System

## Direction

Aura is a calm, practical commerce interface. It favours clear purchase paths,
quiet surfaces, stable product grids and useful density over promotional noise.
One page has one dominant task; whitespace, type and dividers establish groups
before another card is introduced.

## Foundations

- **Background:** warm off-white (`bg-background`); content uses solid white
  (`bg-card`).
- **Text:** graphite (`text-foreground`) with neutral secondary text
  (`text-muted-foreground`).
- **Accent:** restrained indigo (`bg-primary`, `text-primary`). Red is reserved
  for destructive states and genuine discounts.
- **Borders/shadows:** `border-border` defines ordinary grouping. Shadows are
  only for menus, dialogs, sheets and intentionally floating controls.
- **Radius:** controls 6–8px; cards 8–12px; no oversized pill surfaces.

## Typography and spacing

- Geist Sans is the only general UI family. Body content is 14–16px; product
  titles never fall below 14px.
- Use 4px spacing increments. Page gutters: 16px mobile, 24px tablet, 32px
  desktop. The commerce content container is 1280px.
- Use sentence case. Uppercase is limited to compact, non-essential metadata.

## Layout archetypes

- **Storefront:** compact header, one page context band, content-first grid.
- **Catalog:** context → title/summary → toolbar → filter state → products.
- **Transactional:** primary work column + a restrained sticky summary.
- **Account:** navigation rail + workflow-specific content.
- **Seller/Admin:** persistent navigation, page header/action bar, then table,
  list, chart or grouped form appropriate to the task.

## Component rules

- Inputs and ordinary buttons are `h-10`, `rounded-lg`, with focus-visible
  `ring-ring`.
- Cards only wrap a discrete unit (product, order, form group, dialog); do not
  nest cards just to add spacing.
- Product cards have a stable image ratio, title, price hierarchy, optional
  discount, optional rating/shipping and one keyboard-accessible wishlist action.
- Tabs use a border indicator, not coloured slabs. Tables keep a solid surface,
  row dividers and horizontal overflow only within their own viewport.

## States, accessibility and motion

- Every interactive control has visible focus, disabled and loading states.
- Errors are labelled and associated with their controls; colour never carries
  state by itself.
- Menus and dialogs are keyboard-operable, dismissible with Escape and restore
  focus on close.
- Motion is short state feedback only. Autoplay, scale and shimmer behaviour
  must respect `prefers-reduced-motion`.

## Responsive behavior

- Desktop (1280+): full toolbar/rail composition.
- Laptop (1024): reduce columns and secondary controls before reducing type.
- Tablet (768): filters and navigation become sheets; data tables scroll inside
  their container.
- Mobile (390/360): dedicated compact header; action bars wrap deliberately;
  sticky purchase and chat composers preserve safe-area space.
