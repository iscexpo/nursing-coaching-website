# ISC Expo Design Reference Guide

## 2026 Modern Design Principles Applied

### 1. Glassmorphism
**What it is:** Semi-transparent frosted glass effect with backdrop blur
**Usage:**
- Hero floating cards
- Feature cards in "Why Us" section
- Course cards
- Counter backgrounds
- Footer newsletter input

**CSS Pattern:**
```css
bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10
```

### 2. Soft Shadows
**Subtle depth without harshness**
- Hover shadows: `shadow-xl hover:shadow-2xl`
- Colored shadows: `hover:shadow-blue-500/10`
- Avoid pure black shadows (too harsh)

**CSS Pattern:**
```css
shadow-lg hover:shadow-2xl hover:shadow-blue-500/30
```

### 3. Rounded Corners
**24px Primary Radius:**
- Main cards: `rounded-2xl` (16px)
- Large sections: `rounded-2xl` (16px)
- Small elements: `rounded-xl` (12px)
- Inputs/buttons: `rounded-lg` (8px)

### 4. Smooth Animations
**Duration Guidelines:**
- Hover effects: 200-300ms (instant feedback)
- Section animations: 600-700ms (smooth entrance)
- Scroll reveals: 400-600ms (not too slow)

**Easing:**
- Interactive: `ease-in-out`
- Entrance: `ease-out`
- Exits: `ease-in`

## Color Usage

### Primary Brand (Blue)
- `#2563EB` (Blue-600) - CTA buttons, primary actions
- `#1D4ED8` (Blue-700) - Hover state
- `#1E40AF` (Blue-800) - Active/pressed state

### Glassmorphism Overlays
- Light: `rgba(255, 255, 255, 0.4)` (40% opacity)
- Border: `rgba(255, 255, 255, 0.2)` (20% opacity)
- Dark mode: Slate-900/40

### Accent Colors
- Green: Success, growth
- Purple: Premium features
- Amber: Warnings, special offers
- Red: Discounts, alerts

## Component Architecture

### Card Components
```tsx
// Glassmorphic card template
<div className="rounded-2xl border border-white/20 dark:border-white/10 
                 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl
                 transition-all duration-300 
                 hover:border-white/40 dark:hover:border-white/20
                 hover:bg-white/60 dark:hover:bg-slate-900/60
                 hover:shadow-xl hover:shadow-blue-500/10">
  {/* Content */}
</div>
```

### Button Styles
```tsx
// Primary CTA
className="bg-blue-600 hover:bg-blue-700 text-white font-semibold 
           rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/30"

// Secondary
className="border-2 border-blue-200 dark:border-blue-800 
           text-blue-600 dark:text-blue-400
           hover:bg-blue-50/40 dark:hover:bg-blue-950/40"
```

## Animation Patterns

### Float Animation (6s)
Perfect for cards that should feel light and floating
```css
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(1deg); }
}
```

### Blob Animation (7s)
Organic, natural motion for background elements
```css
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}
```

### Staggered Animations
```tsx
// In JSX
delay={i * 80} // Each item delays 80ms more
style={{ transitionDelay: `${delay}ms` }}
```

## Responsive Design Strategy

### Mobile-First Approach
1. **Base styles** for mobile (< 640px)
2. **sm:** tablets (640px+)
3. **md:** small laptops (768px+)
4. **lg:** desktops (1024px+)

### Grid System
```tsx
// 1 col → 2 cols → 3 cols
className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

// Gaps increase with screen size
className="gap-4 sm:gap-6 lg:gap-8"
```

## Dark Mode Implementation

### Color Inversion Strategy
- Light: `#fafafa` background, `#171717` text
- Dark: `#0f0f0f` background, `#fafafa` text

### Glass Effects in Dark
- More opaque: `bg-slate-900/50` instead of white/40
- Lighter borders: `border-white/10` instead of white/30
- Better contrast for readability

```tsx
className="bg-white/40 dark:bg-slate-900/40"
```

## Spacing Standards

### Consistent Spacing Scale
- xs: 2px
- sm: 4px  
- md: 8px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px
- 4xl: 64px

### Section Padding
- Mobile: `px-4 py-12`
- Tablet: `md:px-6 md:py-16`
- Desktop: `lg:px-8 lg:py-20`

## Typography Hierarchy

### Font Sizes
- H1: `text-5xl md:text-6xl lg:text-7xl` (Hero)
- H2: `text-3xl md:text-4xl` (Section titles)
- H3: `text-lg font-bold` (Card titles)
- Body: `text-base` or `text-sm`
- Meta: `text-xs` (captions, badges)

### Font Weights
- Regular: 400
- Medium: 500 (nav items)
- Semibold: 600 (headings)
- Bold: 700 (highlights)
- Black: 900 (hero title)

## Accessibility Checklist

✓ Semantic HTML (`<section>`, `<article>`, `<nav>`)
✓ Proper heading hierarchy (H1 → H2 → H3)
✓ Color contrast ≥ 4.5:1 for text
✓ Focus states on interactive elements
✓ Keyboard navigation support
✓ ARIA labels where needed
✓ Reduced motion support (`prefers-reduced-motion`)
✓ Alt text on all images
✓ Form labels associated with inputs

## Performance Considerations

### Animation Performance
- Use CSS animations (GPU-accelerated) over JavaScript
- Transform and opacity are cheapest to animate
- Avoid animating layout properties (width, height)
- Use `will-change` sparingly on heavy animations

### Asset Loading
- Lazy load images with `<Image>` component
- Optimize SVG icons (no large inline SVGs)
- Use WebP format where supported
- Minify CSS/JS

## Browser Compatibility

### Tested On
- Chrome/Chromium: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support (15.1+)
- Edge: ✓ Full support
- Mobile Safari: ✓ Full support

### Fallbacks
- Backdrop blur: Falls back to border + opacity
- Gradients: Solid color fallback
- Transforms: Opacity fallback

## Future Enhancement Ideas

### Short Term
- Scroll-triggered animations
- Parallax effects
- More micro-interactions
- Enhanced testimonials section redesign

### Long Term
- 3D card transforms
- Advanced scroll animations
- AI-powered personalization
- Real-time animation effects
