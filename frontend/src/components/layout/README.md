# Layout Component

## Overview

The Layout component provides a consistent structure for all protected pages in the application. It includes the Navigation bar at the top, the main content area, and the Footer at the bottom.

## Structure

```
┌─────────────────────────────────┐
│         Navigation              │
├─────────────────────────────────┤
│                                 │
│         Main Content            │
│         (children)              │
│                                 │
├─────────────────────────────────┤
│          Footer                 │
└─────────────────────────────────┘
```

## Usage

The Layout component is automatically applied to all protected routes through the `ProtectedRoute` component:

```tsx
// In ProtectedRoute.tsx
return <Layout>{children}</Layout>;
```

This means any route wrapped with `<ProtectedRoute>` will automatically have the Navigation and Footer.

## Components Included

### Navigation
- Sticky header that stays at the top when scrolling
- Contains main navigation links
- Mobile-responsive menu

### Footer
- Contains company information
- Quick links to main pages
- Contact information
- Social media links
- Legal links (Terms, Privacy Policy, etc.)

## Styling

The Layout uses flexbox to ensure:
- The footer stays at the bottom of the page
- The main content area expands to fill available space
- Proper responsive behavior on all screen sizes

## Files

- `Layout.tsx` - Main component
- `Layout.css` - Styling for the layout structure
