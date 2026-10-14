# DocuMentor AI — Design System

This document specifies the visual language, design tokens, component architecture, and motion principles for DocuMentor AI, directly modeled on the reference style guide (`frontend/design/reference.webp`).

---

## 1. Visual Style Overview

- **App Shell & Surfaces:** The entire view sits within a large rounded cream card (`#FBF8F2`) inset on a soft ambient lilac gradient background (`#FAF5FF` to `#E9D5FF`), with blurred background ambient blobs.
- **Floating Pill Navigation:** A floating glass pill navbar with a black circular logo, centered navigation links with a sliding black pill indicator on active state (`layoutId`), and a dark pill CTA button.
- **Hero & Pill Input Upload:** A bold centered headline (*"Study smarter from your own notes"* with a lilac gradient highlight), accompanied by a wide white pill input upload zone featuring an integrated black pill button with a circular arrow indicator.
- **Dark Feature Section:** An ink-colored rounded section (`#0B0B0F`, `rounded-[36px]`) with subtle diagonal corner accents, housing a floating light chat preview card with animated typing and source citations.
- **Live Stats Row:** A 3-column stats section with thin vertical dividers, displaying live indexed document and knowledge chunk counts via count-up animations.
- **Bento Grid:** A high-contrast bento row featuring an orange accent card, a soft lilac card, and a clean white card.
- **Interactive Study Tools:** 3D flip flashcards, interactive quizzes with instant visual feedback and score rings, and structured markdown summaries.
- **Dark Rounded Footer:** An ink-black container featuring a prominent pill CTA and structured resource navigation links.

---

## 2. Design Tokens

### Color Palette

| Token | Hex / Value | Usage |
|---|---|---|
| **Ink (Black)** | `#0B0B0F` | Primary dark surfaces, dark feature section, black pill buttons |
| **Soft Ink** | `#17171C` | Secondary dark backgrounds, borders in dark mode |
| **Cream Surface** | `#FBF8F2` | Main page card surface (light mode) |
| **Lilac 50** | `#FAF5FF` | Hero radial gradient highlight, subtle card backgrounds |
| **Lilac 100** | `#F3E8FF` | Card backgrounds, pill hover states |
| **Lilac 200** | `#E9D5FF` | Ambient background glow, soft borders |
| **Lilac 300** | `#D8B4FE` | Subtle text accents, glow borders |
| **Lilac 400** | `#C084FC` | Gradient endpoints |
| **Lilac 500** | `#A855F7` | Focus rings, interactive highlights |
| **Lilac 600** | `#9333EA` | Gradient text, primary accents |
| **Orange Accent** | `#FF7A3D` | Circular next buttons, bento cards, badge highlights |
| **Deep Orange** | `#F2612A` | Orange button active states |
| **Success Green** | `#16A34A` | Ready badges, correct quiz selections |
| **Warning Amber** | `#F59E0B` | Processing status badges |
| **Danger Red** | `#EF4444` | Failed status badges, delete buttons, error alerts |

### Border Radii

- **Pill:** `9999px` (buttons, inputs, navbar, badges)
- **Card:** `28px` (document cards, bento cards, modal dialogs)
- **Big Section:** `36px` / `40px` (dark feature section, main shell container, footer)
- **Input:** `20px` (form fields, textarea containers)

### Shadows & Glows

- **Soft Card:** `0 8px 30px -12px rgba(15, 15, 30, 0.12)`
- **Lilac Glow:** `0 20px 60px -20px rgba(147, 51, 234, 0.35)`
- **Glass Effect:** `background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.8);`

### Typography

- **Font Family:** `Plus Jakarta Sans`, system-ui, sans-serif
- **Headings:** Weight 700 / 800 with `-0.03em` letter tracking
- **Hero Headline:** `clamp(2.5rem, 6vw, 4.5rem)` (56–72px), line-height `1.05`

---

## 3. Motion & Animation Principles

- **Easing:** Cubic bezier `[0.22, 1, 0.36, 1]` (smooth decelerating ease-out)
- **Durations:** `0.4s` to `0.7s` for entrances; `0.15s` for micro-interactions
- **Stagger:** `0.08s` delay between child elements in grids and lists
- **Hover Transitions:** `translateY(-4px)` with soft glow expansion
- **Tap Feedback:** `scale(0.97)`
- **Scroll Reveal:** `whileInView` with `viewport: { once: true, margin: "-50px" }`
- **Accessibility:** Strictly respect `prefers-reduced-motion` via `<MotionConfig reducedMotion="user">`, disabling parallax, continuous loops, and complex 3D transitions.

---

## 4. Component Inventory

1. **Button:** Black pill button ending with a white circle containing ArrowRight (nudges on hover), secondary white pill, accent orange pill, ghost, and danger.
2. **IconButton:** Round 40–44px icon buttons (orange / white / dark) with accessible labels.
3. **Card:** Variants `white`, `lilac`, `dark`, and `orange` with 28px border radius.
4. **Badge:** Status indicators for `ready` (green), `processing` (amber pulsing), and `failed` (red).
5. **Skeleton:** Shimmer pulse placeholders during loading states.
6. **Loader:** Modern spinner with contextual loading copy.
7. **EmptyState:** Animated floating icon, title, description, and action button.
8. **SectionHeading:** Small lilac eyebrow chip + bold display heading + optional subtitle.
9. **Reveal:** Reusable fade-up entrance wrapper using Framer Motion.
10. **CountUp:** Smooth counter animation for metrics and statistics.
11. **ConfirmDialog:** Accessible modal with backdrop blur, keyboard trapping, and Escape listener.
12. **PageTransition:** Seamless cross-route fade and rise transitions.
