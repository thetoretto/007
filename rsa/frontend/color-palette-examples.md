# Enhanced Color Palette Design System

## Color Hierarchy (Updated)
- **#FEE46B** - Yellow (PRIMARY brand color)
- **#DF0827** - Red (ACCENT for highlights and warnings)
- **#94A9BC** - Blue-gray (SECONDARY elements)
- **#E6DBEB** - Light purple (SUBTLE accents)
- **#F8F3EF** - Light cream (LIGHT theme backgrounds)
- **#171C22** - Dark charcoal (DARK theme backgrounds)

## Tailwind CSS Classes

### Primary Colors (Yellow - Main Brand)
```html
<!-- Backgrounds -->
<div class="bg-primary-700">Main yellow background</div>
<div class="bg-primary-400">Darker yellow background</div>
<div class="bg-primary-100">Light yellow background</div>

<!-- Text -->
<p class="text-primary-700">Yellow brand text</p>
<p class="text-primary-brand">Primary brand text</p>

<!-- Borders -->
<div class="border border-primary-700">Yellow border</div>
<div class="border-primary-brand">Primary brand border</div>
```

### Accent Colors (Red - Highlights & Warnings)
```html
<!-- Backgrounds -->
<div class="bg-accent-red">Red accent background</div>
<div class="bg-accent-highlight">Highlight background</div>

<!-- Text -->
<p class="text-accent-red">Red accent text</p>
<p class="text-accent-highlight">Highlight text</p>

<!-- Borders -->
<div class="border border-accent-red">Red accent border</div>
```

### Secondary Colors (Blue-Gray)
```html
<!-- Backgrounds -->
<div class="bg-secondary-400">Blue-gray background</div>
<div class="bg-secondary-muted">Muted secondary background</div>

<!-- Text -->
<p class="text-secondary-400">Blue-gray text</p>
<p class="text-secondary-muted">Muted secondary text</p>
```

### Subtle Accents (Purple)
```html
<!-- Purple accent -->
<div class="bg-purple-light">Light purple background</div>
<div class="bg-purple-subtle">Subtle purple background</div>
<p class="text-purple-subtle">Subtle purple text</p>
```

### Background Colors
```html
<!-- Light theme -->
<body class="bg-background-light">Light cream background</body>
<div class="bg-background-lightAlt">White background</div>

<!-- Dark theme -->
<body class="dark:bg-background-dark">Dark charcoal background</body>
<div class="dark:bg-background-darkAlt">Lighter dark background</div>
```

## CSS Custom Properties

### Using CSS Variables
```css
.custom-element {
  background-color: var(--primary-700); /* Red */
  color: var(--surface-light); /* White */
  border: 1px solid var(--border-light); /* Light border */
}

.dark .custom-element {
  background-color: var(--primary-700); /* Same red */
  color: var(--surface-light); /* White */
  border: 1px solid var(--border-dark); /* Dark border */
}
```

### Gradients
```css
.hero-section {
  background: var(--hero-light-gradient); /* Red to yellow */
}

.dark .hero-section {
  background: var(--hero-dark-gradient); /* Dark charcoal gradient */
}
```

## Enhanced Component Examples

### Buttons
```html
<!-- Primary button (yellow - main brand) -->
<button class="btn btn-primary btn-md">Primary Action</button>

<!-- Secondary button (blue-gray) -->
<button class="btn btn-secondary btn-md">Secondary Action</button>

<!-- Accent button (red - highlights/warnings) -->
<button class="btn btn-accent btn-md">Warning Action</button>

<!-- Warning button (same as accent) -->
<button class="btn btn-warning btn-md">Alert Action</button>

<!-- Button sizes -->
<button class="btn btn-primary btn-xs">Extra Small</button>
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-md">Medium</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-xl">Extra Large</button>

<!-- Button shapes -->
<button class="btn btn-primary btn-pill">Pill Button</button>
<button class="btn btn-primary btn-circle btn-md">○</button>
<button class="btn btn-primary btn-square btn-md">□</button>
```

### Enhanced Cards
```html
<!-- Basic card -->
<div class="card">
  <div class="p-6">
    <h3 class="text-text-light-primary dark:text-text-dark-primary">Card Title</h3>
    <p class="text-text-light-secondary dark:text-text-dark-secondary">Card content</p>
  </div>
</div>

<!-- Interactive card -->
<div class="card card-interactive">
  <div class="p-6">
    <h3>Interactive Card</h3>
    <p>Hover for effects</p>
  </div>
</div>

<!-- Card variants -->
<div class="card card-primary">Primary themed card</div>
<div class="card card-accent">Accent themed card</div>
<div class="card card-secondary">Secondary themed card</div>
<div class="card card-purple">Purple themed card</div>

<!-- Glass card -->
<div class="card card-glass">
  <div class="p-6">
    <h3>Glass Effect Card</h3>
    <p>With backdrop blur</p>
  </div>
</div>

<!-- Hover border card -->
<div class="card card-hover-border">
  <div class="p-6">
    <h3>Hover Border Card</h3>
    <p>Border changes on hover</p>
  </div>
</div>
```

### Enhanced Alerts & Gradients
```html
<!-- Error alert (red) -->
<div class="alert alert-error">Error message</div>

<!-- Warning alert (red - for highlights and warnings) -->
<div class="alert alert-warning">Warning message</div>

<!-- Info alert (blue-gray) -->
<div class="alert alert-info">Info message</div>

<!-- Success alert -->
<div class="alert alert-success">Success message</div>
```

### Gradient Utilities
```html
<!-- Primary gradient (yellow) -->
<div class="primary-gradient p-8 text-center">Primary Brand Gradient</div>

<!-- Accent gradient (red) -->
<div class="accent-gradient p-8 text-center text-white">Accent Highlight Gradient</div>

<!-- Hero gradient -->
<div class="hero-gradient p-12 text-center">Hero Section Gradient</div>

<!-- Subtle background gradient -->
<div class="subtle-bg-gradient p-8">Subtle Background</div>

<!-- Text gradients -->
<h1 class="text-gradient-primary text-4xl font-bold">Primary Gradient Text</h1>
<h2 class="text-gradient-accent text-3xl font-bold">Accent Gradient Text</h2>
```

### Enhanced Animations
```html
<!-- Primary pulse animation -->
<div class="animate-pulse-slow bg-primary-700 p-4">Pulsing Primary</div>

<!-- Warning pulse animation -->
<div class="animate-pulse-warning bg-accent-red p-4">Pulsing Warning</div>

<!-- Fade in animations -->
<div class="animate-fade-in">Fade In</div>
<div class="animate-slide-up">Slide Up</div>
<div class="animate-slide-right">Slide Right</div>
```

## Theme Implementation

The color palette automatically adapts between light and dark themes:

- **Light theme**: Cream background (#f8f3ef) with white cards
- **Dark theme**: Charcoal background (#171c22) with dark gray cards
- **Consistent accents**: Red, yellow, and blue-gray work in both themes
- **Proper contrast**: All text maintains readability standards

## Enhanced Shadow System
```html
<!-- Yellow shadows (primary) -->
<div class="shadow-yellow p-4">Yellow Shadow</div>
<div class="shadow-yellow-lg p-4">Large Yellow Shadow</div>
<div class="shadow-yellow-glow p-4">Yellow Glow Effect</div>

<!-- Red shadows (accent) -->
<div class="shadow-red p-4">Red Shadow</div>
<div class="shadow-red-lg p-4">Large Red Shadow</div>
<div class="shadow-red-glow p-4">Red Glow Effect</div>

<!-- Enhanced card shadows -->
<div class="shadow-card-hover p-4">Card Hover Shadow</div>
<div class="shadow-float p-4">Floating Element</div>
<div class="shadow-glass p-4">Glass Effect Shadow</div>
```

## Migration Notes

### Color Hierarchy Changes:
- **PRIMARY**: Now yellow (#FEE46B) - main brand color
- **ACCENT**: Now red (#DF0827) - for highlights and warnings
- **SECONDARY**: Blue-gray (#94A9BC) - unchanged
- **BACKGROUNDS**: Cream/charcoal - unchanged

### Class Updates:
- `primary-*` classes now use yellow (main brand)
- `accent-*` classes now use red (highlights/warnings)
- `secondary-*` classes use blue-gray (unchanged)
- New utility classes: `text-primary-brand`, `bg-accent-highlight`, etc.
- Enhanced button variants: `btn-warning` added
- Enhanced card variants: `card-primary`, `card-accent`, `card-glass`
- New gradient utilities: `primary-gradient`, `accent-gradient`
- Enhanced shadow system with color-specific shadows
