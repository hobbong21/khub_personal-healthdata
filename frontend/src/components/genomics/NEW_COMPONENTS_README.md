# Genomics Components - HTML to TSX Conversion

This document describes the new genomics components created based on the HTML prototypes in `frontend/html-prototypes/genomics.html`.

## Components Implemented

### 1. FileUploadArea
**Location:** `frontend/src/components/genomics/FileUploadArea/`

A drag-and-drop file upload component for genomic data files.

**Features:**
- Drag and drop file upload
- File format validation (.txt, .csv, .tsv, .vcf)
- File size validation (configurable, default 50MB)
- Upload progress indicator
- Visual feedback for drag states
- Accessible with ARIA labels

**Usage:**
```tsx
import { FileUploadArea } from './components/genomics/FileUploadArea';

<FileUploadArea
  onFileSelect={(file) => console.log('Selected:', file)}
  onUploadComplete={(file) => console.log('Uploaded:', file)}
  onUploadError={(error) => alert(error)}
  acceptedFormats={['.txt', '.csv', '.tsv', '.vcf']}
  maxSizeMB={50}
/>
```

### 2. RiskCard
**Location:** `frontend/src/components/genomics/RiskCard/`

A card component displaying disease risk assessment with visual factor breakdown.

**Features:**
- Risk level visualization (low, medium, high)
- Color-coded risk indicators
- Factor analysis with bar charts (genetic, lifestyle, family)
- Click handler for detailed view
- Keyboard navigation support
- Hover effects

**Usage:**
```tsx
import { RiskCard } from './components/genomics/RiskCard';

<RiskCard
  disease="심혈관 질환"
  riskLevel="low"
  percentile="상위 75% (낮은 위험도)"
  factors={{
    genetic: 25,
    lifestyle: 15,
    family: 10
  }}
  onClick={() => navigate('/risk-details')}
/>
```

### 3. DrugCard
**Location:** `frontend/src/components/genomics/DrugCard/`

A card component for displaying pharmacogenomics drug response information.

**Features:**
- Drug name and response type display
- Color-coded response badges (normal, increased, decreased)
- Description text
- Hover effects
- Responsive design

**Usage:**
```tsx
import { DrugCard } from './components/genomics/DrugCard';

<DrugCard
  drugName="와파린 (Warfarin)"
  response="normal"
  description="표준 용량으로 치료 가능"
/>
```

### 4. SNPTable
**Location:** `frontend/src/components/genomics/SNPTable/`

A sortable and paginated table for displaying SNP (Single Nucleotide Polymorphism) data.

**Features:**
- Sortable columns (click headers to sort)
- Pagination with configurable items per page
- Responsive table design
- Monospace font for genotype display
- Row hover effects
- Accessible pagination controls

**Usage:**
```tsx
import { SNPTable } from './components/genomics/SNPTable';
import type { SNPData } from './components/genomics/SNPTable';

const snpData: SNPData[] = [
  {
    snpId: 'rs1801133',
    chromosome: '1',
    position: 11856378,
    genotype: 'CT',
    trait: '엽산 대사'
  },
  // ... more data
];

<SNPTable data={snpData} itemsPerPage={10} />
```

## Demo Component

A demo component is available at `frontend/src/components/genomics/GenomicsComponentsDemo.tsx` that shows all components in action with sample data.

## Integration with Existing Code

These components are designed to work alongside the existing genomics components:
- `GenomicDataUpload.tsx` - Existing upload component with API integration
- `RiskVisualizationDashboard.tsx` - Existing risk visualization with charts
- `PharmacogenomicsDisplay.tsx` - Existing pharmacogenomics display

The new components provide:
1. **Simpler, focused implementations** based on the HTML prototype design
2. **Reusable building blocks** that can be composed into larger features
3. **Modern React patterns** with TypeScript, CSS Modules, and hooks
4. **Accessibility features** with ARIA labels and keyboard navigation

## Design Principles

All components follow these principles:
- **TypeScript-first:** Full type safety with interfaces and type definitions
- **CSS Modules:** Scoped styling to avoid conflicts
- **Accessibility:** ARIA labels, keyboard navigation, semantic HTML
- **Responsive:** Mobile-friendly with media queries
- **Composable:** Small, focused components that can be combined
- **Consistent:** Following the design system from the HTML prototypes

## File Structure

```
frontend/src/components/genomics/
├── FileUploadArea/
│   ├── FileUploadArea.tsx
│   ├── FileUploadArea.types.ts
│   ├── FileUploadArea.module.css
│   └── index.ts
├── RiskCard/
│   ├── RiskCard.tsx
│   ├── RiskCard.types.ts
│   ├── RiskCard.module.css
│   └── index.ts
├── DrugCard/
│   ├── DrugCard.tsx
│   ├── DrugCard.types.ts
│   ├── DrugCard.module.css
│   └── index.ts
├── SNPTable/
│   ├── SNPTable.tsx
│   ├── SNPTable.types.ts
│   ├── SNPTable.module.css
│   └── index.ts
└── GenomicsComponentsDemo.tsx
```

## Next Steps

To integrate these components into the main application:

1. **Update GenomicsPage.tsx** to use the new components alongside existing ones
2. **Add routing** for detailed risk views when clicking RiskCard
3. **Connect to API** for real data instead of sample data
4. **Add tests** for each component using React Testing Library
5. **Enhance accessibility** with more comprehensive ARIA attributes
6. **Add animations** for smoother transitions and interactions

## Requirements Fulfilled

This implementation fulfills the following requirements from the spec:

- ✅ **1.1** - Preserves visual design from HTML prototype
- ✅ **1.4** - Implements event handlers (onClick, onUpload, etc.)
- ✅ **3.1** - Full TypeScript type definitions for all props
- ✅ **4.1** - Uses useState and useEffect hooks appropriately
- ✅ **2.4** - Components are composable and reusable
- ✅ **8.1** - ARIA labels for interactive elements
- ✅ **8.2** - Keyboard navigation support
- ✅ **8.4** - Semantic HTML elements used throughout

## Testing

To test the components:

1. Run the demo component to see all components in action
2. Check responsive behavior by resizing the browser
3. Test keyboard navigation (Tab, Enter, Space keys)
4. Verify file upload validation with different file types
5. Test table sorting and pagination functionality

## Browser Compatibility

These components are compatible with:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- **Memoization:** Consider wrapping components with React.memo for large lists
- **Virtualization:** For large SNP datasets, consider using react-window
- **Code splitting:** Components can be lazy-loaded if needed
- **CSS optimization:** CSS Modules ensure minimal CSS bundle size
