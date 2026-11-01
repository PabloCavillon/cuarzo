---
name: Synthetic Moss
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bdcabe'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#889489'
  outline-variant: '#3e4a40'
  surface-tint: '#73db9a'
  primary: '#dbffe2'
  on-primary: '#00391d'
  primary-container: '#86efac'
  on-primary-container: '#006d3e'
  inverse-primary: '#006d3e'
  secondary: '#8bd79b'
  on-secondary: '#003918'
  secondary-container: '#005829'
  on-secondary-container: '#81cc90'
  tertiary: '#d8ffed'
  on-tertiary: '#003829'
  tertiary-container: '#a7e7cd'
  on-tertiary-container: '#2b6955'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#8ff8b4'
  primary-fixed-dim: '#73db9a'
  on-primary-fixed: '#00210f'
  on-primary-fixed-variant: '#00522d'
  secondary-fixed: '#a6f4b5'
  secondary-fixed-dim: '#8bd79b'
  on-secondary-fixed: '#00210b'
  on-secondary-fixed-variant: '#005226'
  tertiary-fixed: '#b0f0d6'
  tertiary-fixed-dim: '#95d3ba'
  on-tertiary-fixed: '#002117'
  on-tertiary-fixed-variant: '#0b513d'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-desktop: 40px
  container-padding-mobile: 20px
  gutter: 24px
  section-gap: 80px
---

## Brand & Style

The design system embodies the persona of a **Creative Multimedia Designer**: a blend of organic intuition and technical precision. The aesthetic is "Techno-Organic," merging the soft, natural energy of Moss Green with the sharp, disciplined structures of modern software engineering. It targets a high-end creative audience that values both expressive flair and functional reliability.

The design style is a hybrid of **Minimalism** and **Glassmorphism**, set against a deep, industrial dark mode. It utilizes heavy whitespace (or "darkspace") to let portfolio-grade content breathe, while using Moss Green as a high-visibility signal for intent and action. The emotional response is one of sophisticated focus—calm yet energized.

## Colors

The palette is anchored in a multi-tonal Moss Green spectrum, optimized for a dark environment.

- **Primary (Moss Green):** A vibrant, desaturated neon (#86EFAC) used for interactive elements, highlights, and primary brand signals. It should feel electric against the dark background.
- **Secondary (Deep Forest):** A grounding shade (#166534) for hover states and secondary containers.
- **Neutral (Slate Carbon):** The foundation of the UI (#0F172A). It provides more depth than pure black, allowing for subtle shadow work and layering.
- **Accents:** Use high-transparency versions of the primary color (8-12% opacity) for subtle surface tinting to maintain a cohesive "mossy" atmosphere.

## Typography

This design system uses a dual-font strategy to balance character with utility. 

**Sora** is the voice of the brand, used for headlines and display text. Its geometric quirks and wide stance reflect the "Creative" aspect of the persona. **Inter** handles the "Technical" heavy lifting, providing maximum legibility for body copy, data, and UI labels. 

Large display titles should use tighter letter-spacing to appear more impactful and "designed." Labels and captions use uppercase Inter with slight tracking to provide a professional, architectural feel.

## Layout & Spacing

The layout follows a **Fluid Grid** philosophy with generous internal margins. 

- **Desktop:** 12-column grid with 24px gutters. Content is centered with a max-width of 1440px to ensure readability.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters.

Spacing follows an 8px linear scale. However, section headers and major components should utilize "Super-spacing" (64px, 80px, or 120px) to evoke a high-end, editorial gallery feel. Use negative space aggressively to separate the "Technical" sidebar tools from the "Creative" canvas area.

## Elevation & Depth

Elevation is communicated through **Tonal Layering** and **Glassmorphism**, rather than traditional shadows.

- **Level 0 (Base):** Slate Carbon (#0F172A).
- **Level 1 (Cards/Sidebar):** A slightly lighter tint (#1E293B) with a 1px stroke of 10% Moss Green.
- **Level 2 (Modals/Popovers):** Semi-transparent background (70% opacity) with a 20px Backdrop Blur (Glassmorphism). This creates a sense of physical layering without cluttering the UI with heavy shadows.
- **Interactive Depth:** When an element is active, it should glow subtly using an outer glow (0px 0px 12px) in the primary Moss Green at 30% opacity.

## Shapes

The shape language is "Organic-Technical." 

Standard components use **Rounded (0.5rem)** corners to feel approachable. However, for large containers or media carousels, use **Rounded-XL (1.5rem)** to emphasize the organic, "Mossy" personality. 

Interactive elements like buttons should maintain the 0.5rem standard to stay grounded in software UI conventions, while decorative elements can utilize "Squircle" shapes or asymmetrical radii to push the creative boundary.

## Components

- **Primary Buttons:** High-contrast Moss Green (#86EFAC) background with dark text (#0F172A). Use a bold weight for the label.
- **Ghost Buttons:** 1px Moss Green border with no fill. On hover, apply a 10% Moss Green background tint.
- **Input Fields:** Dark base (#1E293B) with a subtle 1px border. On focus, the border transitions to Moss Green with a soft outer glow.
- **Chips/Tags:** Small, pill-shaped elements using the Tertiary Green (#064E3B) background and Primary Green text for a high-contrast, technical look.
- **Cards:** Glassmorphic containers with a 1px top-left highlight to simulate a physical light source.
- **Progress Bars/Indicators:** Use a gradient from Secondary Green to Primary Green to indicate "growth" or completion, reinforcing the organic brand narrative.