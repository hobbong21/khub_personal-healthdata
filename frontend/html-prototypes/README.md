# 🎨 HTML 프로토타입 가이드

## 📋 개요

이 디렉토리는 TSX 컴포넌트 개발 전에 디자인을 빠르게 프로토타이핑하고 테스트하기 위한 순수 HTML 파일들을 포함합니다.

## 🎯 목적

1. **빠른 디자인 검증**: 브라우저에서 바로 열어 디자인 확인
2. **직관적인 수정**: HTML/CSS만으로 레이아웃 조정
3. **TSX 변환 용이**: 완성된 HTML을 React 컴포넌트로 쉽게 변환
4. **협업 효율**: 디자이너와 개발자 간 소통 도구

## 📁 파일 구조

```
html-prototypes/
├── README.md                    # 이 파일
├── common-nav.html              # 공통 네비게이션 바 템플릿
├── common-footer.html           # 공통 푸터 템플릿
├── index.html                   # 랜딩 페이지
├── login.html                   # 로그인 페이지
├── guide.html                   # 가이드 페이지
├── contact.html                 # 문의하기 페이지
├── dashboard.html               # 대시보드 페이지 ✅
├── health-data-input.html       # 건강 데이터 입력
├── medical-records.html         # 진료 기록
├── medications.html             # 복약 관리
├── genomics.html               # 유전체 분석
├── genomics-results.html       # 유전체 분석 결과
├── ai-insights.html            # AI 인사이트 ✅
└── appointments.html           # 진료 예약 ✅
```

## 🎨 디자인 시스템

### 색상 팔레트
```css
--primary: #667eea;           /* 메인 브랜드 컬러 */
--primary-dark: #764ba2;      /* 그라데이션용 */
--secondary: #06B6D4;         /* 보조 컬러 */
--success: #10B981;           /* 성공/긍정 */
--warning: #F59E0B;           /* 경고 */
--danger: #EF4444;            /* 위험/오류 */
--dark: #1a202c;              /* 텍스트 */
--gray: #718096;              /* 보조 텍스트 */
--light-gray: #f5f7fa;        /* 배경 */
```

### 공통 컴포넌트

#### 네비게이션 바
- 고정 높이: 70px
- 배경: 흰색 + 그림자
- 로고 + 메뉴 + 액션 버튼
- 언어 토글 버튼 (한글/영어)
- 반응형: 모바일에서 햄버거 메뉴

#### 푸터
- 배경: #1a202c (다크)
- 4개 섹션: 회사소개, 서비스, 회사, 법적고지
- 저작권 정보
- 반응형: 모바일에서 1열

### 카드 스타일
```css
background: white;
padding: 1.5rem-2rem;
border-radius: 12px;
box-shadow: 0 2px 8px rgba(0,0,0,0.08);
transition: transform 0.2s;
```

### 버튼 스타일
- Primary: 그라데이션 (#667eea → #764ba2)
- Outline: 투명 배경 + 테두리
- Hover: translateY(-2px) + 그림자

## 🚀 사용 방법

### 1. HTML 파일 열기

```bash
# 브라우저에서 직접 열기
open dashboard.html

# 또는 Live Server 사용 (VS Code)
# 파일 우클릭 > "Open with Live Server"
```

### 2. 디자인 수정

HTML 파일의 `<style>` 태그 내에서 CSS를 직접 수정:

```html
<style>
    .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        /* 여기서 스타일 수정 */
    }
</style>
```

### 3. TSX로 변환

완성된 HTML을 React 컴포넌트로 변환:

#### 변환 전 (HTML)
```html
<div class="stat-card">
    <div class="stat-value">120/80</div>
    <div class="stat-label">혈압</div>
</div>
```

#### 변환 후 (TSX)
```tsx
<div className="stat-card">
    <div className="stat-value">{bloodPressure}</div>
    <div className="stat-label">혈압</div>
</div>
```

## 📄 페이지별 설명

### 1. dashboard.html
**대시보드 메인 페이지**

- 건강 점수 표시
- 주요 바이탈 사인 카드
- 빠른 액션 버튼
- 건강 트렌드 차트
- 최근 활동 타임라인

**주요 컴포넌트:**
- `.health-score-card` - 건강 점수 링
- `.stat-card` - 바이탈 사인 카드
- `.action-button` - 빠른 액션 버튼
- `.chart-card` - 차트 영역
- `.activity-card` - 활동 목록

### 2. health-data-input.html
**건강 데이터 입력 폼**

- 탭 기반 인터페이스 (바이탈 사인, 건강 일지, 운동)
- 입력 폼 및 유효성 검사
- 5점 척도 선택 UI
- 최근 기록 표시

**주요 컴포넌트:**
- `.tabs` - 탭 네비게이션
- `.form-card` - 폼 카드
- `.scale-input` - 척도 선택 UI
- `.recent-records` - 최근 기록

### 3. medical-records.html
**진료 기록 타임라인**

- 타임라인 레이아웃
- 필터 및 검색
- 진료 기록 카드
- 첨부파일 관리

**주요 컴포넌트:**
- `.timeline` - 타임라인 컨테이너
- `.timeline-item` - 개별 기록
- `.filters` - 필터 영역
- `.record-actions` - 액션 버튼

### 4. medications.html
**복약 관리 시스템**

- 오늘의 복약 일정
- 체크리스트 인터페이스
- 약물 상세 정보
- 상호작용 경고

**주요 컴포넌트:**
- `.today-schedule` - 일정 카드
- `.med-card` - 약물 카드
- `.med-checkbox` - 체크박스
- `.warning-box` - 경고 박스

### 5. genomics.html
**유전체 분석 메인 페이지**

- 유전자 데이터 파일 업로드
- 질병 위험도 평가 카드
- 약물유전체학 정보
- SNP 데이터 테이블
- 상세 결과 페이지 링크

**주요 컴포넌트:**
- `.upload-area` - 파일 업로드 영역
- `.risk-card` - 위험도 카드 (클릭 가능)
- `.drug-card` - 약물 반응 카드
- `.snp-table` - SNP 데이터 테이블

**인터랙션:**
- 위험도 카드 클릭 시 `genomics-results.html`로 이동
- 헤더의 "상세 분석 결과 보기" 버튼

### 6. genomics-results.html ⭐ NEW
**유전체 분석 상세 결과 페이지**

- 전체 건강 점수 표시
- 주요 발견사항 요약
- 카테고리별 요약 카드 (위험도/약물/특성)
- 아코디언 형식의 상세 분석
- 맞춤형 건강 권장사항
- PDF 다운로드 및 공유 기능

**주요 컴포넌트:**
- `.results-header` - 결과 헤더 (건강 점수 포함)
- `.key-findings` - 주요 발견사항
- `.summary-cards` - 요약 카드 그리드
- `.accordion` - 상세 정보 아코디언
- `.risk-score-display` - 위험도 점수 표시
- `.factor-breakdown` - 요인 분석 바 차트
- `.recommendations` - 권장사항 박스
- `.action-buttons` - 액션 버튼 (PDF, 공유, 내보내기)

**인터랙션:**
- 아코디언 클릭으로 상세 정보 확장/축소
- PDF 다운로드 버튼
- 의료진 공유 버튼 (이메일, 만료 기간, 비밀번호 설정)
- 데이터 내보내기 (CSV/JSON/Excel)
- 인쇄 기능

## 🎨 디자인 시스템

### 색상 팔레트

```css
/* Primary Colors */
--primary-blue: #3b82f6;
--primary-indigo: #667eea;
--primary-purple: #764ba2;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--danger: #ef4444;
--info: #06b6d4;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;
```

### 타이포그래피

```css
/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 간격 (Spacing)

```css
/* Padding/Margin */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

### 둥근 모서리 (Border Radius)

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;
```

### 그림자 (Shadows)

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 2px 8px rgba(0,0,0,0.08);
--shadow-lg: 0 4px 12px rgba(0,0,0,0.12);
```

## 🔄 TSX 변환 체크리스트

HTML을 TSX로 변환할 때 확인할 사항:

- [ ] `class` → `className` 변경
- [ ] 인라인 스타일을 객체로 변환
- [ ] 이벤트 핸들러를 camelCase로 변경 (`onclick` → `onClick`)
- [ ] 자체 닫는 태그 수정 (`<img>` → `<img />`)
- [ ] 하드코딩된 데이터를 props/state로 변경
- [ ] CSS를 별도 파일로 분리
- [ ] 반복되는 요소를 `.map()` 으로 변환
- [ ] 조건부 렌더링 추가
- [ ] TypeScript 타입 정의

## 📝 변환 예시

### HTML 원본
```html
<div class="stat-card">
    <div class="stat-icon blue">❤️</div>
    <div class="stat-value">120/80</div>
    <div class="stat-label">혈압 (mmHg)</div>
    <div class="stat-change positive">↑ 정상 범위</div>
</div>
```

### TSX 변환
```tsx
interface StatCardProps {
    icon: string;
    value: string;
    label: string;
    change: {
        text: string;
        type: 'positive' | 'negative';
    };
    color: 'blue' | 'green' | 'red' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ 
    icon, value, label, change, color 
}) => {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div className={`stat-change ${change.type}`}>
                {change.text}
            </div>
        </div>
    );
};

// 사용 예시
<StatCard
    icon="❤️"
    value="120/80"
    label="혈압 (mmHg)"
    change={{ text: "↑ 정상 범위", type: "positive" }}
    color="blue"
/>
```

## 🛠️ 개발 팁

### 1. 빠른 프로토타이핑
- 먼저 HTML로 레이아웃 완성
- 스타일 조정 및 인터랙션 테스트
- 만족스러우면 TSX로 변환

### 2. 컴포넌트 분리
- 재사용 가능한 부분 식별
- 각 컴포넌트를 별도 파일로 분리
- Props 인터페이스 정의

### 3. 반응형 디자인
- 모바일 우선 접근
- 미디어 쿼리 활용
- 플렉스박스/그리드 사용

### 4. 접근성
- 시맨틱 HTML 사용
- ARIA 속성 추가
- 키보드 네비게이션 지원

## 📚 참고 자료

- [React 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [CSS Tricks](https://css-tricks.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 🎯 다음 단계

1. **추가 페이지 프로토타입 생성**
   - genomics.html (유전체 분석)
   - ai-insights.html (AI 인사이트)
   - appointments.html (병원 예약)
   - family-history.html (가족력)

2. **인터랙션 개선**
   - 애니메이션 추가
   - 호버 효과 개선
   - 로딩 상태 표시

3. **TSX 변환 시작**
   - 완성된 HTML부터 순차적으로 변환
   - 컴포넌트 라이브러리 구축
   - Storybook 통합

## 💡 문의 및 제안

HTML 프로토타입 관련 문의사항이나 개선 제안이 있으시면 팀에 공유해주세요!

---

**마지막 업데이트**: 2025-11-05  
**작성자**: 개발팀
