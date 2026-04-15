# DESIGN.md - UrbanPath AI

Design system inspired by **Vercel** - Black and white precision, Geist font.

## Visual Theme & Atmosphere

- **Mood**: Developer-focused, clean, minimalist, professional
- **Density**: Low-to-medium, generous whitespace
- **Philosophy**: Radical subtraction, content-first, precision engineering
- **Theme**: Dark-first with neon cyan/purple accents, futuristic tech feel

## Color Palette & Roles

### Primary Colors
| Name | Hex | Role | Usage |
|------|-----|------|-------|
| Background Dark | `#050510` | Primary bg | Main canvas |
| Background Card | `#0a0a14` | Card surfaces | Panels, cards |
| Surface | `#1a1a2e` | Elevated surfaces | Buttons, inputs |
| Border | `#334155` | Dividers | Borders, dividers |

### Accent Colors
| Name | Hex | Role | Usage |
|------|-----|------|-------|
| Cyan | `#06b6d4` | Primary accent | CTAs, highlights |
| Cyan Light | `#22d3ee` | Hover states | Glows, highlights |
| Purple | `#8b5cf6` | Secondary accent | Gradients |
| Pink | `#ec4899` | Tertiary accent | Decorative |
| Emerald | `#10b981` | Success states | Safe routes |
| Amber | `#f59e0b` | Warning | Caution indicators |
| Red | `#ef4444` | Danger | High risk, errors |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Safety High | `#22c55e` | Safe (80-100) |
| Safety Medium | `#eab308` | Moderate (40-60) |
| Safety Low | `#ef4444` | Unsafe (0-20) |
| Traffic Clear | `#22c55e` | Clear traffic |
| Traffic Heavy | `#ef4444` | Gridlock |

## Typography Rules

### Font Families
| Name | Usage | Weight |
|------|-------|--------|
| Inter | Primary body | 400, 500, 600, 700 |
| Geist / System | Code elements | 400, 500 |
| Mono | Numbers, stats | 400 |

### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 32px | 700 | 1.2 |
| H2 | 24px | 600 | 1.3 |
| H3 | 18px | 600 | 1.4 |
| Body | 14px | 400 | 1.5 |
| Small | 12px | 400 | 1.5 |
| Caption | 11px | 500 | 1.4 |

### Spacing Scale
```
4px  → 0.25rem  → tokens.xs
8px  → 0.5rem   → tokens.sm
12px → 0.75rem  → tokens.md
16px → 1rem     → tokens.lg
24px → 1.5rem   → tokens.xl
32px → 2rem     → tokens.2xl
48px → 3rem     → tokens.3xl
```

## Component Stylings

### Buttons
```css
/* Primary Button */
background: linear-gradient(135deg, #06b6d4, #8b5cf6);
border: none;
border-radius: 8px;
padding: 12px 24px;
color: white;
font-weight: 600;
box-shadow: 0 0 20px rgba(6,182,212,0.3);
transition: all 0.2s ease;

/* Hover: Glow effect */
box-shadow: 0 0 30px rgba(6,182,212,0.5);
transform: translateY(-1px);

/* Secondary Button */
background: transparent;
border: 1px solid #334155;
border-radius: 8px;
color: #e2e8f0;
```

### Cards / Panels
```css
background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(8,10,18,0.98));
border: 1px solid rgba(6,182,212,0.3);
border-radius: 16px;
box-shadow: 0 0 40px rgba(6,182,212,0.2);
backdrop-filter: blur(20px);
```

### Input Fields
```css
background: rgba(15,23,42,0.8);
border: 1px solid rgba(6,182,212,0.3);
border-radius: 8px;
padding: 12px 16px;
color: white;
transition: border-color 0.2s ease;

:focus {
  border-color: #06b6d4;
  box-shadow: 0 0 0 2px rgba(6,182,212,0.2);
}
```

### Navigation
```css
/* Active tab */
background: rgba(6,182,212,0.2);
color: #22d3ee;
border-radius: 8px;

/* Inactive */
color: #94a3b8;
background: transparent;
```

### Progress Bars
```css
background: #1e293b;
border-radius: 999px;
overflow: hidden;

/* Fill gradient */
background: linear-gradient(90deg, #22c55e, #eab308, #ef4444);
```

## Layout Principles

### Container
- Max width: 1440px
- Padding: 24px (mobile), 48px (desktop)
- Centered with auto margins

### Grid
- 12-column grid system
- Gap: 16px (mobile), 24px (desktop)
- Sidebar: 320px fixed

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop */
@media (max-width: 1024px) { }

/* Wide */
@media (max-width: 1280px) { }
```

## Depth & Elevation

### Shadow System
```css
/* Subtle */
box-shadow: 0 1px 2px rgba(0,0,0,0.3);

/* Card */
box-shadow: 0 0 40px rgba(6,182,212,0.2);

/* Button glow */
box-shadow: 0 0 20px rgba(6,182,212,0.4);

/* Modal */
box-shadow: 0 25px 50px rgba(0,0,0,0.5);
```

### Surface Hierarchy
| Level | Surface | Opacity |
|-------|---------|---------|
| Base | `#050510` | 1.0 |
| Card | `#0a0a14` | 0.98 |
| Elevated | `#1a1a2e` | 0.95 |
| Overlay | `#000000` | 0.8 |

## Do's and Don'ts

### Do
- ✅ Use generous whitespace (24px+ between sections)
- ✅ Keep text high-contrast against dark backgrounds
- ✅ Use accent colors sparingly for emphasis
- ✅ Animate subtle transitions (0.2s ease)
- ✅ Support dark mode as default

### Don't
- ❌ Use more than 3 accent colors in one view
- ❌ Overcrowd with too many elements
- ❌ Use pure white (#fff) for body text - use #e2e8f0
- ❌ Add complex gradients to backgrounds
- ❌ Use heavy borders (use 1px or none)

## Responsive Behavior

### Mobile
- Stack panels vertically
- Hide secondary controls in menus
- Touch targets: minimum 44px
- Reduce padding to 16px

### Tablet
- Two-column layout where appropriate
- Collapsible panels

### Desktop
- Full layout with sidebars
- All controls visible
- Maximum information density acceptable

## Agent Prompt Guide

### Quick Color Reference
```
Primary Background: #050510
Card Background: #0a0a14
Primary Accent: #06b6d4
Secondary Accent: #8b5cf6
Success: #22c55e
Warning: #f59e0b
Danger: #ef4444
Text Primary: #ffffff
Text Secondary: #94a3b8
Text Muted: #64748b
Border: #334155
```

### Ready-to-Use Prompts
1. "Create a control panel with cyan accent buttons and glass-morphism cards"
2. "Build a sidebar with dark panels using the Vercel-inspired design system"
3. "Add a progress bar with gradient from green to red based on value"
4. "Style the range slider with cyan-purple gradient track"
