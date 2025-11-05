# Design Document

## Overview

유전체 분석 페이지는 사용자가 유전자 데이터를 업로드하고, 질병 위험도, 약물유전체학 정보, 유전적 특성을 시각화하여 확인할 수 있는 React 기반의 웹 애플리케이션입니다. 이 페이지는 기존 HTML 프로토타입을 React 컴포넌트로 전환하고, 백엔드 API와 통합하여 실시간 데이터 처리 및 분석 기능을 제공합니다.

## Architecture

### Component Hierarchy

```
GenomicsPage (Container)
├── PageHeader
├── MessageBanner (Error/Success)
├── TabNavigation
└── TabContent
    ├── UploadSection
    │   ├── FileUploadArea
    │   └── ExistingDataList
    ├── RiskAssessmentSection
    │   ├── RiskCard (multiple)
    │   └── RiskFactorBar
    ├── PharmacogenomicsSection
    │   ├── DrugCard (multiple)
    │   └── DrugResponseBadge
    └── SNPDataSection
        └── SNPTable
```

### State Management

페이지 레벨에서 다음 상태를 관리합니다:
- `activeTab`: 현재 활성화된 탭 ('upload' | 'risks' | 'pharmacogenomics' | 'snp')
- `uploadedFile`: 업로드된 파일 정보
- `genomicData`: 유전체 데이터 배열
- `riskAssessments`: 질병 위험도 평가 데이터
- `pharmacogenomicsData`: 약물유전체학 데이터
- `snpData`: SNP 데이터 배열
- `loading`: 로딩 상태
- `error`: 에러 메시지
- `success`: 성공 메시지

### Data Flow

1. 사용자가 파일을 업로드하면 FileUploadArea 컴포넌트가 파일을 검증
2. 검증된 파일은 부모 컴포넌트로 전달되어 API 호출
3. API 응답 데이터는 상태에 저장되고 각 섹션 컴포넌트로 전달
4. 각 섹션 컴포넌트는 전달받은 데이터를 시각화

## Components and Interfaces

### 1. PageHeader Component

**Purpose**: 페이지 제목과 설명을 표시하는 헤더 컴포넌트

**Props**:
```typescript
interface PageHeaderProps {
  title: string;
  description: string;
}
```

**Styling**:
- Gradient background (purple to violet)
- White text with center alignment
- Padding: 3rem 2rem
- Border radius: 12px
- Margin bottom: 2rem

### 2. FileUploadArea Component

**Purpose**: 드래그 앤 드롭 및 파일 선택 기능을 제공하는 업로드 영역

**Props**:
```typescript
interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
  acceptedFormats: string[];
  maxFileSize: number;
}
```

**State**:
- `isDragActive`: 드래그 상태
- `selectedFile`: 선택된 파일

**Behavior**:
- 드래그 앤 드롭 이벤트 처리 (onDragEnter, onDragLeave, onDrop)
- 파일 형식 검증 (TXT, CSV만 허용)
- 파일 크기 검증 (최대 10MB)
- 호버 시 border color 변경 (#cbd5e0 → #3b82f6)

**Styling**:
- Border: 3px dashed #cbd5e0
- Border radius: 12px
- Padding: 3rem
- Transition: all 0.2s
- Hover state: border-color #3b82f6, background #f7fafc

### 3. RiskCard Component

**Purpose**: 개별 질병의 위험도를 표시하는 카드 컴포넌트

**Props**:
```typescript
interface RiskCardProps {
  disease: string;
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  percentile: number;
  factors: {
    genetic: number;
    lifestyle: number;
    family: number;
  };
}
```

**Styling**:
- Background: white
- Padding: 2rem
- Border radius: 12px
- Box shadow: 0 2px 8px rgba(0,0,0,0.08)
- Top border (4px) color based on risk level:
  - Low: #10b981 (green)
  - Medium: #f59e0b (yellow)
  - High: #ef4444 (red)

**Sub-components**:
- RiskFactorBar: 각 요인(유전적, 생활습관, 가족력)의 비율을 시각화

### 4. DrugCard Component

**Purpose**: 약물 반응성 정보를 표시하는 카드 컴포넌트

**Props**:
```typescript
interface DrugCardProps {
  drugName: string;
  response: 'normal' | 'increased' | 'decreased';
  description: string;
}
```

**Styling**:
- Border: 2px solid #e2e8f0
- Border radius: 8px
- Padding: 1.5rem
- Hover: border-color #3b82f6, box-shadow 0 4px 12px rgba(59, 130, 246, 0.1)

**Response Badge Colors**:
- Normal: background #d1fae5, color #059669
- Increased: background #fef3c7, color #92400e
- Decreased: background #dbeafe, color #1e40af

### 5. SNPTable Component

**Purpose**: SNP 데이터를 테이블 형식으로 표시

**Props**:
```typescript
interface SNPTableProps {
  data: SNPData[];
}

interface SNPData {
  snpId: string;
  chromosome: string;
  position: number;
  genotype: string;
  trait: string;
}
```

**Styling**:
- Table header: background #f7fafc, padding 1rem
- Table cells: padding 1rem, border-bottom 1px solid #e2e8f0
- Row hover: background #f7fafc
- Genotype: font-family 'Courier New', color #8b5cf6

### 6. TabNavigation Component

**Purpose**: 탭 전환 네비게이션

**Props**:
```typescript
interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon?: string;
  }>;
}
```

**Styling**:
- Display: flex
- Border bottom: 2px solid #e5e7eb
- Tab button padding: 12px 24px
- Active tab: color #3b82f6, border-bottom 3px solid #3b82f6
- Hover: background #f9fafb

## Data Models

### GenomicData

```typescript
interface GenomicData {
  id: string;
  userId: string;
  sourcePlatform: string;
  uploadedAt: Date;
  rawData: string;
  processedAt?: Date;
}
```

### RiskAssessment

```typescript
interface RiskAssessment {
  id: string;
  disease: string;
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  percentile: number;
  factors: {
    genetic: number;
    lifestyle: number;
    family: number;
  };
  calculatedAt: Date;
}
```

### PharmacogenomicsData

```typescript
interface PharmacogenomicsData {
  drugName: string;
  response: 'normal' | 'increased' | 'decreased';
  description: string;
  recommendation?: string;
}
```

### SNPData

```typescript
interface SNPData {
  snpId: string;
  chromosome: string;
  position: number;
  genotype: string;
  trait: string;
}
```

## Error Handling

### File Upload Errors

1. **Invalid File Format**
   - Error message: "지원되지 않는 파일 형식입니다. TXT 또는 CSV 파일을 업로드해주세요."
   - Display: Red banner at top of page
   - Duration: Until user dismisses

2. **File Size Exceeded**
   - Error message: "파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다."
   - Display: Red banner at top of page
   - Duration: Until user dismisses

3. **Upload Failed**
   - Error message: "파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요."
   - Display: Red banner at top of page
   - Duration: Until user dismisses

### API Errors

1. **Network Error**
   - Error message: "네트워크 연결을 확인해주세요."
   - Fallback: Show cached data if available

2. **Server Error**
   - Error message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
   - Retry: Automatic retry after 3 seconds (max 3 attempts)

3. **Data Not Found**
   - Display: Empty state with message "유전체 데이터를 업로드하여 분석을 시작하세요."
   - Action button: "데이터 업로드" (switches to upload tab)

### Error Display Component

```typescript
interface ErrorBannerProps {
  message: string;
  type: 'error' | 'warning' | 'info';
  onDismiss: () => void;
}
```

**Styling**:
- Error: background #fef2f2, border #fecaca, color #dc2626
- Warning: background #fffbeb, border #fef3c7, color #92400e
- Info: background #eff6ff, border #dbeafe, color #1e40af
- Padding: 1rem 1.5rem
- Border radius: 8px
- Margin bottom: 1.5rem

## Testing Strategy

### Unit Tests

1. **FileUploadArea Component**
   - Test file format validation
   - Test file size validation
   - Test drag and drop events
   - Test file selection callback

2. **RiskCard Component**
   - Test risk level color mapping
   - Test factor bar rendering
   - Test percentile display

3. **DrugCard Component**
   - Test response badge color mapping
   - Test hover effects
   - Test description rendering

4. **SNPTable Component**
   - Test data rendering
   - Test empty state
   - Test row hover effects

### Integration Tests

1. **File Upload Flow**
   - Upload valid file → verify API call → verify success message
   - Upload invalid file → verify error message
   - Upload file exceeding size limit → verify error message

2. **Tab Navigation**
   - Switch between tabs → verify correct content displayed
   - Upload file → verify automatic switch to risks tab

3. **Data Loading**
   - Load page with existing data → verify all sections populated
   - Load page without data → verify empty states

### Visual Regression Tests

1. **Component States**
   - RiskCard: low, medium, high risk states
   - DrugCard: normal, increased, decreased response states
   - FileUploadArea: default, hover, drag active states

2. **Responsive Layouts**
   - Desktop (>1024px): 4-column grid for risk cards
   - Tablet (768-1024px): 2-column grid
   - Mobile (<768px): 1-column grid

### Accessibility Tests

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter/Space to activate buttons
   - Arrow keys for tab navigation

2. **Screen Reader**
   - All images have alt text
   - Form inputs have labels
   - Error messages are announced
   - Loading states are announced

3. **Color Contrast**
   - All text meets WCAG AA standards (4.5:1 ratio)
   - Risk level indicators have sufficient contrast
   - Focus indicators are visible

## Responsive Design

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Layout Adjustments

**Mobile (<768px)**:
- Risk cards: 1 column
- Drug cards: 1 column
- SNP table: horizontal scroll
- Tab navigation: wrap to multiple rows
- Padding: 1rem

**Tablet (768-1024px)**:
- Risk cards: 2 columns
- Drug cards: 2 columns
- SNP table: full width
- Padding: 1.5rem

**Desktop (>1024px)**:
- Risk cards: auto-fit grid (minmax(300px, 1fr))
- Drug cards: auto-fill grid (minmax(250px, 1fr))
- SNP table: full width
- Max container width: 1400px
- Padding: 2rem

## Performance Considerations

### Code Splitting

- Lazy load tab content components
- Load risk visualization library only when risks tab is active
- Load chart library only when needed

### Data Optimization

- Paginate SNP data table (show 20 rows per page)
- Cache API responses for 5 minutes
- Debounce file upload validation (300ms)

### Image Optimization

- Use SVG icons instead of images
- Lazy load images below the fold
- Use CSS gradients instead of background images

## Accessibility

### ARIA Labels

- File upload area: `aria-label="유전자 데이터 파일 업로드"`
- Tab buttons: `aria-selected` attribute
- Risk cards: `role="article"` with `aria-label`
- Loading states: `aria-live="polite"`

### Keyboard Support

- Tab navigation: Arrow keys to switch tabs
- File upload: Enter/Space to open file dialog
- Cards: Focus visible with 2px outline

### Screen Reader Support

- Announce file upload success/error
- Announce tab changes
- Announce loading states
- Provide text alternatives for visual indicators

## Browser Support

- Chrome: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Edge: Latest 2 versions
- Mobile Safari: iOS 13+
- Chrome Mobile: Latest version

## Dependencies

### Required Libraries

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "recharts": "^2.5.0",
  "axios": "^1.3.0"
}
```

### Optional Libraries

- `react-dropzone`: For enhanced file upload UX
- `framer-motion`: For smooth animations
- `react-table`: For advanced table features

## API Integration

### Endpoints

1. **POST /api/genomics/upload**
   - Upload genetic data file
   - Request: multipart/form-data
   - Response: GenomicUploadResult

2. **GET /api/genomics/data**
   - Retrieve user's genomic data
   - Response: GenomicData[]

3. **GET /api/genomics/risks**
   - Get risk assessments
   - Response: RiskAssessment[]

4. **GET /api/genomics/pharmacogenomics**
   - Get drug response data
   - Response: PharmacogenomicsData[]

5. **GET /api/genomics/snp**
   - Get SNP data
   - Query params: page, limit
   - Response: { data: SNPData[], total: number }

### Error Responses

```typescript
interface APIError {
  status: number;
  message: string;
  code: string;
}
```

Common error codes:
- `INVALID_FILE_FORMAT`: 400
- `FILE_TOO_LARGE`: 413
- `UNAUTHORIZED`: 401
- `SERVER_ERROR`: 500

## Security Considerations

1. **File Upload**
   - Validate file type on client and server
   - Scan uploaded files for malware
   - Limit file size to 10MB
   - Use secure file storage (encrypted)

2. **Data Privacy**
   - Encrypt genomic data at rest
   - Use HTTPS for all API calls
   - Implement user authentication
   - Log access to sensitive data

3. **XSS Prevention**
   - Sanitize all user inputs
   - Use React's built-in XSS protection
   - Validate data from API responses

## Genomic Analysis Results Page

### Purpose

A dedicated page for displaying comprehensive genomic analysis results with detailed visualizations, recommendations, and export options.

### Route

- Path: `/genomics/results/:analysisId`
- Protected: Yes (requires authentication)
- Parent: GenomicsPage

### Components

#### 1. ResultsHeader Component

**Props**:
```typescript
interface ResultsHeaderProps {
  analysisDate: Date;
  dataSource: string;
  overallScore: number;
  keyFindings: string[];
}
```

**Layout**:
- Full-width gradient header
- Overall health score (0-100) with circular progress indicator
- Key findings as bullet points
- Analysis metadata (date, source platform)

#### 2. ResultsSummaryCards Component

**Props**:
```typescript
interface ResultsSummaryCardsProps {
  riskSummary: {
    high: number;
    medium: number;
    low: number;
  };
  pharmacogenomicsSummary: {
    normal: number;
    altered: number;
  };
  traitsSummary: {
    total: number;
    analyzed: number;
  };
}
```

**Layout**:
- Three summary cards in a row
- Each card shows category totals with icons
- Color-coded based on risk levels

#### 3. DetailedRiskSection Component

**Props**:
```typescript
interface DetailedRiskSectionProps {
  risks: RiskAssessment[];
  onRiskClick: (riskId: string) => void;
}
```

**Features**:
- Expandable accordion for each disease
- Detailed factor breakdown with charts
- Personalized recommendations
- Comparison with population average

#### 4. ActionButtons Component

**Props**:
```typescript
interface ActionButtonsProps {
  onDownloadPDF: () => void;
  onShareWithDoctor: () => void;
  onExportData: () => void;
}
```

**Buttons**:
- Download PDF Report
- Share with Healthcare Provider
- Export Raw Data (CSV)
- Print Results

### Navigation Flow

```
GenomicsPage (Main)
  ├── Upload Tab
  ├── Risks Tab
  │   └── Click Risk Card → Navigate to Results Page
  ├── Pharmacogenomics Tab
  └── Traits Tab

GenomicsResultsPage
  ├── Results Header
  ├── Summary Cards
  ├── Detailed Risk Section
  ├── Pharmacogenomics Details
  ├── Traits Details
  └── Action Buttons
```

### Data Models

#### AnalysisResult

```typescript
interface AnalysisResult {
  id: string;
  userId: string;
  analysisDate: Date;
  dataSource: string;
  overallScore: number;
  keyFindings: string[];
  riskAssessments: RiskAssessment[];
  pharmacogenomics: PharmacogenomicsData[];
  traits: TraitData[];
  recommendations: Recommendation[];
}

interface Recommendation {
  category: 'lifestyle' | 'screening' | 'medication' | 'diet';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
}
```

### PDF Export

**Content Structure**:
1. Cover page with user info and analysis date
2. Executive summary with overall score
3. Disease risk assessments (one page per disease)
4. Pharmacogenomics summary
5. Traits analysis
6. Recommendations
7. Disclaimer and methodology

**Implementation**:
- Use `react-pdf` or `jsPDF` library
- Generate on client-side for privacy
- Include charts and visualizations
- Professional medical report styling

### Sharing with Healthcare Providers

**Features**:
1. Generate secure, time-limited share link
2. Optional password protection
3. Expiration date selection (7, 30, 90 days)
4. Email invitation to healthcare provider
5. View-only access (no editing)
6. Audit log of who accessed the data

**Implementation**:
```typescript
interface ShareOptions {
  recipientEmail: string;
  expirationDays: number;
  requirePassword: boolean;
  password?: string;
  includeRawData: boolean;
}
```

## Future Enhancements

1. **Advanced Visualizations**
   - Interactive chromosome viewer
   - 3D protein structure visualization
   - Ancestry composition chart

2. **Comparison Features**
   - Compare risk scores over time
   - Compare with population averages
   - Family member comparison (with consent)

3. **AI-Powered Insights**
   - Personalized health recommendations
   - Drug interaction warnings
   - Lifestyle modification suggestions

4. **Integration Features**
   - Direct integration with EHR systems
   - Telemedicine consultation booking
   - Genetic counselor chat support
