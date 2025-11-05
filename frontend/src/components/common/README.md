# Common UI Components

This directory contains reusable UI components that follow the design system.

## Components

### Button

A flexible button component with multiple variants and sizes.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' (default: 'primary')
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `fullWidth`: boolean (default: false)
- `loading`: boolean (default: false)
- `icon`: React.ReactNode
- All standard button HTML attributes

**Usage:**
```tsx
import { Button } from '@/components/common';

// Basic usage
<Button>Click me</Button>

// With variant and size
<Button variant="primary" size="large">
  Submit
</Button>

// With icon
<Button icon={<span>🚀</span>}>
  Launch
</Button>

// Loading state
<Button loading>
  Processing...
</Button>

// Full width
<Button fullWidth>
  Full Width Button
</Button>
```

### Card

A container component for grouping related content.

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined' (default: 'default')
- `padding`: 'none' | 'small' | 'medium' | 'large' (default: 'medium')
- `hoverable`: boolean (default: false)
- All standard div HTML attributes

**Sub-components:**
- `CardHeader`: Header section
- `CardTitle`: Title heading
- `CardContent`: Main content area
- `CardFooter`: Footer section

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/common';

<Card variant="elevated" hoverable>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>This is the card content.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### LoadingSpinner

A loading indicator component.

**Props:**
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `variant`: 'primary' | 'secondary' | 'white' (default: 'primary')
- `fullScreen`: boolean (default: false)
- `text`: string (default: '로딩 중...')

**Usage:**
```tsx
import { LoadingSpinner } from '@/components/common';

// Basic usage
<LoadingSpinner />

// Custom size and text
<LoadingSpinner size="large" text="데이터를 불러오는 중..." />

// Full screen overlay
<LoadingSpinner fullScreen />

// Different variant
<LoadingSpinner variant="secondary" />
```

## Design Principles

1. **Consistency**: All components follow the same design patterns and naming conventions
2. **Accessibility**: Components include proper ARIA labels and keyboard navigation
3. **Responsiveness**: Components adapt to different screen sizes
4. **Type Safety**: Full TypeScript support with proper type definitions
5. **Modularity**: CSS Modules for scoped styling

## File Structure

Each component follows this structure:
```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.module.css   # Scoped styles
├── ComponentName.types.ts     # TypeScript types
└── index.ts                   # Exports
```
