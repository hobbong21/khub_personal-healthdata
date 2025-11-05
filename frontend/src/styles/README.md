# Styling System Documentation

This directory contains the core styling system for the KnowledgeHub Health Platform.

## Files Overview

### Core System Files

#### `variables.css`
Comprehensive CSS custom properties (variables) for the entire application:
- **Colors**: Primary, semantic, medical-specific, and grayscale palettes
- **Spacing**: Consistent spacing scale from xs to 4xl
- **Typography**: Font families, sizes, weights, and line heights
- **Border Radius**: Predefined radius values for consistent rounded corners
- **Shadows**: Multiple shadow levels for depth and elevation
- **Transitions**: Standard animation durations
- **Z-Index**: Layering system for overlays and modals
- **Container Widths**: Responsive container sizes
- **Breakpoints**: Reference values for media queries
- **Health-specific**: Health score colors and chart colors
- **Dark Mode**: Alternative color scheme for dark theme
- **Accessibility**: High contrast and reduced motion support

#### `global.css`
Global styles and resets:
- **CSS Reset**: Modern CSS reset for consistent cross-browser rendering
- **Base Typography**: Heading styles, paragraph spacing, and text formatting
- **Form Elements**: Input, textarea, select, and button base styles
- **Tables**: Table styling with hover effects
- **Code Blocks**: Syntax highlighting support
- **Scrollbar**: Custom scrollbar styling
- **Selection**: Text selection colors
- **Utility Classes**: Container, screen reader only, truncate, line clamp
- **Accessibility**: Focus styles, skip links, keyboard navigation
- **Print Styles**: Optimized styles for printing
- **Responsive Typography**: Font size adjustments for mobile devices

#### `design-system.css`
Component-level design system (legacy, being phased out in favor of CSS Modules):
- Utility classes for rapid prototyping
- Component base styles
- Medical-specific component patterns

### Page-Specific Styles

- `appointment.css` - Appointment booking and management
- `auth.css` - Authentication pages
- `dashboard.css` - Dashboard layouts
- `familyHistory.css` - Family history tracking
- `health.css` - Health data pages
- `medication.css` - Medication tracking
- `profile.css` - User profile pages

## Usage

### Importing in Main Entry Point

The variables and global styles are imported in `src/index.css`:

```css
@import './styles/variables.css';
@import './styles/global.css';
```

### Using CSS Variables

All CSS variables are available globally and can be used in any CSS file:

```css
.myComponent {
  color: var(--text-primary);
  background-color: var(--bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
}
```

### CSS Modules

Components use CSS Modules for scoped styling:

```tsx
import styles from './MyComponent.module.css';

const MyComponent = () => {
  return <div className={styles.container}>Content</div>;
};
```

## Responsive Design

### Breakpoints

The system uses the following breakpoints:
- **sm**: 640px - Small devices (phones)
- **md**: 768px - Medium devices (tablets)
- **lg**: 1024px - Large devices (laptops)
- **xl**: 1280px - Extra large devices (desktops)
- **2xl**: 1536px - 2X large devices (large desktops)

### Media Query Pattern

```css
/* Mobile first approach */
.component {
  /* Base mobile styles */
}

@media (max-width: 768px) {
  .component {
    /* Tablet adjustments */
  }
}

@media (max-width: 480px) {
  .component {
    /* Small mobile adjustments */
  }
}
```

## Color System

### Primary Colors
- Used for main actions, links, and brand elements
- Gradient: `#667eea` to `#764ba2`

### Semantic Colors
- **Success**: Green (`#10b981`) - Positive actions, confirmations
- **Warning**: Yellow (`#f59e0b`) - Cautions, alerts
- **Danger**: Red (`#ef4444`) - Errors, destructive actions
- **Info**: Blue (`#3b82f6`) - Informational messages

### Medical Colors
Specialized colors for health-related data visualization:
- Red, Orange, Yellow, Green, Blue, Purple

### Health Score Colors
- **Excellent**: `#10b981` (90-100)
- **Good**: `#22c55e` (70-89)
- **Fair**: `#eab308` (50-69)
- **Poor**: `#f97316` (30-49)
- **Critical**: `#ef4444` (0-29)

## Spacing System

Consistent spacing scale based on 4px increments:
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px
- **4xl**: 96px

## Typography

### Font Families
- **Sans**: System font stack with fallbacks
- **Mono**: Monospace for code
- **Display**: Inter for headings

### Font Sizes
- **xs**: 12px
- **sm**: 14px
- **base**: 16px
- **lg**: 18px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 30px
- **4xl**: 36px
- **5xl**: 48px
- **6xl**: 60px

## Accessibility Features

### Focus Styles
All interactive elements have visible focus indicators for keyboard navigation.

### Reduced Motion
Respects user's motion preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast
Adjusts borders and colors for better visibility:
```css
@media (prefers-contrast: high) {
  :root {
    --border-light: #9ca3af;
  }
}
```

### Screen Reader Support
`.sr-only` class for screen reader only content.

## Dark Mode

Dark mode is supported through data attributes:

```html
<html data-theme="dark">
```

Variables automatically adjust for dark mode with appropriate contrast ratios.

## Best Practices

1. **Use CSS Variables**: Always use CSS variables instead of hardcoded values
2. **Mobile First**: Write mobile styles first, then add media queries for larger screens
3. **CSS Modules**: Use CSS Modules for component-specific styles
4. **Semantic Classes**: Use meaningful class names that describe purpose, not appearance
5. **Consistent Spacing**: Use the spacing scale for margins and padding
6. **Accessibility**: Always include focus states and ARIA labels
7. **Performance**: Minimize CSS specificity and avoid deep nesting

## Migration Notes

The project is transitioning from utility classes in `design-system.css` to CSS Modules for better component encapsulation. New components should use CSS Modules exclusively.
