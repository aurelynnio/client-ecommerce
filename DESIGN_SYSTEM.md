# Aura Commerce Design System

> Phiên bản 2.0 — Coral Red palette · Inter font · Border-over-shadow

## 1. Hướng thiết kế

Aura Commerce là giao diện sàn thương mại điện tử quy mô lớn, chuyên nghiệp
và đáng tin cậy. Thiết kế ưu tiên:

- **Đường dẫn mua hàng rõ ràng** — mỗi trang có một nhiệm vụ chính.
- **Bề mặt tĩnh, lưới sản phẩm ổn định** — tránh noise quảng cáo.
- **Border-over-shadow** — card dùng viền trước, shadow chỉ cho element nổi.
- **Không gradient** — màu nền phẳng, tinh tế.
- **Đồng nhất** — tất cả component tuân thủ token đã định nghĩa.

## 2. Color Palette

### 2.1 Primary — Coral Red `#e2483d`

Màu chủ đạo của toàn bộ hệ thống. Dùng cho: CTA buttons, links, active states,
brand highlights, price discount, focus ring.

| Token | Giá trị | Mô tả |
| :---- | :------ | :---- |
| `--primary` | `#e2483d` | Màu thương hiệu chính |
| `--primary-hover` | `#d13d33` | Hover/active — đậm hơn |
| `--primary-light` | `#fef3f2` | Nền nhạt nhất — subtle tint |
| `--primary-bg` | `#fde8e6` | Badge, label background |
| `--primary-foreground` | `#ffffff` | Text trên primary |

```css
/* Sử dụng trong component */
background-color: var(--primary);
color: var(--primary-foreground);
```

```tsx
// Tailwind utility (qua @theme inline mapping)
<Button className="bg-primary text-primary-foreground hover:bg-primary-hover" />
<Badge className="bg-primary-bg text-primary" />
```

### 2.2 Accent — Warm Amber

Màu phụ trợ, ấm áp, bổ sung cho coral red. Dùng cho: secondary highlights,
sidebar active, hover backgrounds.

| Token | Giá trị |
| :---- | :------ |
| `--accent` | `#fff7ed` (orange-50) |
| `--accent-foreground` | `#c2410c` (orange-700) |

### 2.3 Semantic Colors

| Token | Giá trị | Mô tả |
| :---- | :------ | :---- |
| `--success` | `#10b981` | Thành công, confirmed |
| `--warning` | `#f59e0b` | Cảnh báo, pending |
| `--info` | `#3b82f6` | Thông tin |
| `--destructive` | `#dc2626` | Lỗi, xóa — khác biệt với primary |

> **Lưu ý:** `--destructive` dùng `#dc2626` (đỏ thuần) thay vì `#ef4444` để
> phân biệt rõ với coral primary `#e2483d`.

### 2.4 Neutral / Surface

| Token | Giá trị | Mô tả |
| :---- | :------ | :---- |
| `--background` | `#fafaf9` | Nền trang — warm off-white |
| `--foreground` | `#1f2937` | Text chính — dark graphite |
| `--card` | `#ffffff` | Nền card |
| `--muted` | `#f4f4f5` | Nền muted |
| `--muted-foreground` | `#71717a` | Text phụ |
| `--border` | `#e4e4e7` | Viền |
| `--input` | `#e4e4e7` | Viền input |

### 2.5 E-commerce Specialized

| Token | Giá trị | Mô tả |
| :---- | :------ | :---- |
| `--star` | `#f59e0b` | Sao đánh giá |
| `--discount` | `#e2483d` | Giá khuyến mãi |
| `--price-strikethrough` | `#9ca3af` | Giá gốc gạch ngang |
| `--link` | `#e2483d` | Link text |
| `--link-hover` | `#d13d33` | Link hover |

```tsx
// Ví dụ: hiển thị giá sản phẩm
<span className="price-discount">{formatPrice(salePrice)}</span>
<span className="price-strikethrough ml-2">{formatPrice(originalPrice)}</span>

// Ví dụ: rating stars
<Star className="fill-star text-star" />
```

### 2.6 Chart Colors

| Token | Giá trị |
| :---- | :------ |
| `--chart-1` | `#e2483d` (coral) |
| `--chart-2` | `#f59e0b` (amber) |
| `--chart-3` | `#10b981` (green) |
| `--chart-4` | `#3b82f6` (blue) |
| `--chart-5` | `#8b5cf6` (purple) |

## 3. Typography

**Font:** Inter (variable font, `InterVariable.woff2`)
**CSS Variable:** `--font-aura-sans`

### Type Scale

| Token | Size | Sử dụng |
| :---- | :--- | :------ |
| `--text-xs` | 12px | Metadata, badge |
| `--text-sm` | 13px | Secondary text, label |
| `--text-base` | 14px | Body text (mặc định) |
| `--text-md` | 15px | Card title |
| `--text-lg` | 16px | Section title |
| `--text-xl` | 18px | Page title |
| `--text-2xl` | 20px | Hero title |
| `--text-3xl` | 24px | Large heading |
| `--text-4xl` | 32px | Display |
| `--text-5xl` | 40px | Hero display |

### Font Weights

| Token | Weight | Sử dụng |
| :---- | :----- | :------ |
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Label, button text |
| `--font-semibold` | 600 | Card title, price |
| `--font-bold` | 700 | Section heading |

### Quy tắc

- Body content: 14–16px. Tiêu đề sản phẩm không dưới 14px.
- Sentence case mặc định. Uppercase chỉ cho metadata compact.
- Không dùng font-mono cho UI text (chỉ cho code/data).

## 4. Spacing

Hệ 4px base unit:

| Token | Value | Sử dụng |
| :---- | :---- | :------ |
| `--space-1` | 4px | Gap nhỏ (icon-text) |
| `--space-2` | 8px | Gap giữa elements |
| `--space-3` | 12px | Padding card nhỏ |
| `--space-4` | 16px | Padding card, gutter mobile |
| `--space-5` | 20px | — |
| `--space-6` | 24px | Gutter tablet |
| `--space-8` | 32px | Gutter desktop, section gap |
| `--space-10` | 40px | Section gap lớn |
| `--space-12` | 48px | Hero spacing |
| `--space-16` | 64px | Large section gap |

## 5. Border Radius

| Token | Value | Sử dụng |
| :---- | :---- | :------ |
| `--radius-sm` | 6px | Badge, tag, small button |
| `--radius-md` | 10px | Input, medium button |
| `--radius-lg` | 12px | Card, container |
| `--radius-xl` | 16px | Modal, large card |
| `--radius-2xl` | 20px | Sheet, hero card |
| `--radius-full` | 9999px | Pill, avatar, icon button |
| `--radius` | 8px | Base (mặc định) |

## 6. Shadows — Border-over-shadow

Triết lý: **card dùng border trước, shadow chỉ cho element nổi** (popover,
dropdown, modal, hover lift).

| Token | Mô tả |
| :---- | :---- |
| `--shadow-sm` | Subtlest — gần như không thấy |
| `--shadow-md` | Card floating nhẹ |
| `--shadow-lg` | Popover, dropdown |
| `--shadow-card` | Card mặc định (rất nhẹ) |
| `--shadow-hover` | Hover lift — có coral tint |
| `--shadow-popover` | Popover/modal floating |

```css
/* shadow-hover có coral tint để tạo brand feel */
--shadow-hover: 0 4px 12px -4px rgba(226, 72, 61, 0.12);
```

## 7. Z-Index Scale

| Token | Value | Sử dụng |
| :---- | :---- | :------ |
| `--z-base` | 0 | Default |
| `--z-dropdown` | 1000 | Dropdown menu |
| `--z-sticky` | 1020 | Sticky header, tabs |
| `--z-header` | 1030 | Main header |
| `--z-overlay` | 1040 | Backdrop |
| `--z-modal` | 1050 | Modal dialog |
| `--z-popover` | 1060 | Popover, tooltip |
| `--z-toast` | 1070 | Sonner toast |

## 8. Transitions

| Token | Duration | Sử dụng |
| :---- | :------- | :------ |
| `--transition-fast` | 150ms | Color, opacity |
| `--transition-normal` | 200ms | Background, border |
| `--transition-slow` | 300ms | Transform, layout |

## 9. Layout

| Token | Value | Mô tả |
| :---- | :---- | :---- |
| `--container-max` | 1280px | Max width nội dung |
| `--header-height` | 64px | Chiều cao header |
| `--topbar-height` | 32px | Topbar (promotion bar) |

### Container

```tsx
<div className="aura-container">
  {/* Max-width 1280px, auto margin, padding 16px */}
</div>
```

### Responsive Breakpoints

| Breakpoint | Width | Hành vi |
| :---------- | :---- | :------ |
| Mobile | 360–390px | Header compact, action bar wrap |
| Tablet | 768px | Filter → sheet, table scroll |
| Laptop | 1024px | Giảm cột, ẩn secondary control |
| Desktop | 1280px+ | Full toolbar, grid đầy đủ |

## 10. Component Rules

### Button

- Primary: `bg-primary text-primary-foreground hover:bg-primary-hover`
- Height: `h-10` (40px) cho default, `h-9` cho compact
- Radius: `rounded-lg` (12px)
- Focus: `ring-2 ring-ring`
- Disabled: `opacity-50 cursor-not-allowed`

### Card

- Nền: `bg-card` (trắng)
- Viền: `border border-border`
- Radius: `rounded-lg` (12px)
- **Không nest card trong card** chỉ để tạo spacing — dùng `space-*` thay.
- Hover effect: dùng class `.card-hover` (border đổi sang primary + shadow-hover)

### Product Card

- Dùng class `.card-product` cho hover effect (border coral + lift)
- Tỷ lệ ảnh ổn định (aspect-ratio)
- Hierarchy: ảnh → tên (2 dòng clamp) → giá → rating/wishlist
- Một wishlist action keyboard-accessible

### Input

- Height: `h-10` (40px)
- Border: `border border-input`
- Focus: `ring-2 ring-ring`
- Error: `border-destructive`

### Badge / Tag

- Background: `bg-primary-bg` (light coral)
- Text: `text-primary`
- Radius: `rounded-sm` (6px)
- Size: `text-xs`, `px-1.5 py-0.5`

### Price Display

```tsx
{/* Giá khuyến mãi */}
<span className="price-discount text-lg">{formatPrice(salePrice)}</span>

{/* Giá gốc gạch ngang */}
<span className="price-strikethrough text-sm ml-2">{formatPrice(originalPrice)}</span>

{/* Phần trăm giảm */}
<Badge className="bg-primary-bg text-primary">-{discountPercent}%</Badge>
```

## 11. Accessibility

- Mọi interactive control có: focus visible, disabled, loading state.
- Error được label và associate với control (aria-describedby).
- Màu không mang ý nghĩa duy nhất — luôn có text/icon bổ sung.
- Menu/dialog: keyboard operable, Escape dismiss, focus restore.
- Motion: respect `prefers-reduced-motion`.

## 12. Anti-patterns (KHÔNG làm)

- **Không dùng gradient** — nền phẳng, tinh tế.
- **Không dùng shadow cho card mặc định** — chỉ border. Shadow chỉ khi float.
- **Không hardcode hex color** — luôn dùng CSS variable.
- **Không dùng dark mode variants** (`dark:`, `@custom-variant dark`).
- **Không nest card trong card** cho spacing.
- **Không dùng font ngoài Inter** cho UI text.
- **Không dùng uppercase** cho body text — chỉ metadata compact.

## 13. Token Reference File

Tất cả token được định nghĩa tại:

```
client-ecommerce/src/app/globals.css
```

Cấu trúc:
1. `@theme inline` — map CSS variable sang Tailwind v4 utility class
2. `:root` — định nghĩa giá trị token
3. `@layer base` — reset + font
4. `@layer utilities` — component utility classes

### Cách dùng token trong component

```tsx
// Tailwind utility class (qua @theme inline mapping)
<div className="bg-primary text-primary-foreground" />
<div className="border-border rounded-lg shadow-card" />
<span className="text-star" />

// CSS variable trực tiếp (cho style động)
<div style={{ backgroundColor: 'var(--primary-bg)' }} />

// Utility class có sẵn
<button className="btn-aura" />
<div className="card-product" />
<span className="price-discount" />
```
