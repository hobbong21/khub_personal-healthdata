# Implementation Plan

- [x] 1. 프로젝트 설정 및 의존성 설치


  - React TypeScript 프로젝트 구조 확인
  - 필요한 npm 패키지 설치 (react-router-dom, chart.js, react-chartjs-2, axios)
  - TypeScript 설정 파일 구성
  - CSS Modules 설정 확인
  - _Requirements: 1.1, 1.2, 3.4_

- [x] 2. 공통 컴포넌트 구현




- [x] 2.1 Navigation 컴포넌트 생성


  - Navigation.tsx 파일 생성
  - Navigation.module.css 스타일 작성
  - Navigation.types.ts 타입 정의
  - React Router Link 컴포넌트 사용
  - 모바일 메뉴 토글 기능 구현
  - _Requirements: 2.1, 3.1, 6.3, 8.1_

- [x] 2.2 Footer 컴포넌트 생성



  - Footer.tsx 파일 생성
  - Footer.module.css 스타일 작성
  - 반응형 그리드 레이아웃 구현
  - 소셜 미디어 링크 추가
  - _Requirements: 2.2, 3.1, 8.4_

- [x] 2.3 공통 UI 컴포넌트 생성


  - Button 컴포넌트 (variant, size props)
  - Card 컴포넌트 (재사용 가능한 카드 레이아웃)
  - LoadingSpinner 컴포넌트
  - _Requirements: 2.3, 3.1_

- [x] 3. Dashboard 페이지 컴포넌트 구현





- [x] 3.1 HealthScoreCard 컴포넌트


  - 원형 건강 점수 표시 컴포넌트 생성
  - SVG 또는 CSS로 원형 프로그레스 구현
  - 점수 props 타입 정의
  - _Requirements: 1.1, 3.1, 3.2_

- [x] 3.2 StatCard 컴포넌트


  - 바이탈 사인 통계 카드 컴포넌트 생성
  - 아이콘, 값, 라벨, 변화 표시
  - 색상 variant props 추가
  - _Requirements: 1.1, 2.3, 3.1_

- [x] 3.3 HealthTrendChart 컴포넌트


  - react-chartjs-2 라이브러리 사용
  - Chart.js 설정 및 등록
  - 주간/월간/연간 탭 전환 기능
  - 차트 데이터 props 타입 정의
  - 반응형 차트 크기 조정
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3.4 ActivityList 컴포넌트


  - 최근 활동 목록 컴포넌트 생성
  - 활동 아이템 렌더링
  - 시간 포맷팅 유틸리티 사용
  - _Requirements: 1.1, 3.1_

- [x] 3.5 Dashboard 페이지 통합


  - Dashboard.tsx 메인 페이지 생성
  - 모든 하위 컴포넌트 조합
  - useHealthData 커스텀 훅 사용
  - 로딩 및 에러 상태 처리
  - _Requirements: 2.4, 4.1, 4.2, 7.3, 7.4_

- [x] 4. Genomics 페이지 컴포넌트 구현





- [x] 4.1 FileUploadArea 컴포넌트


  - 드래그 앤 드롭 파일 업로드 구현
  - 파일 형식 검증
  - 업로드 진행 상태 표시
  - _Requirements: 1.1, 3.1, 4.1_

- [x] 4.2 RiskCard 컴포넌트


  - 질병 위험도 카드 컴포넌트 생성
  - 위험도 레벨별 색상 구분
  - 요인 분석 바 차트 포함
  - 클릭 이벤트 핸들러 추가
  - _Requirements: 1.1, 1.4, 3.1_

- [x] 4.3 DrugCard 컴포넌트


  - 약물 반응 카드 컴포넌트 생성
  - 반응 유형별 배지 스타일
  - 호버 효과 구현
  - _Requirements: 1.1, 3.1_

- [x] 4.4 SNPTable 컴포넌트


  - SNP 데이터 테이블 컴포넌트 생성
  - 테이블 정렬 기능 추가
  - 페이지네이션 구현
  - _Requirements: 1.1, 3.1_

- [x] 4.5 GenomicsPage 통합


  - GenomicsPage.tsx 메인 페이지 생성
  - 탭 네비게이션 구현
  - 모든 하위 컴포넌트 조합
  - _Requirements: 2.4, 4.1, 4.2_

- [x] 5. GenomicsResults 페이지 구현





- [x] 5.1 ResultsHeader 컴포넌트


  - 결과 헤더 컴포넌트 생성
  - 건강 점수 원형 표시
  - 분석 메타데이터 표시
  - _Requirements: 1.1, 3.1_

- [x] 5.2 DetailedRiskSection 컴포넌트


  - 아코디언 형식 상세 분석 컴포넌트
  - 요인 분석 차트 포함
  - 권장사항 표시
  - _Requirements: 1.1, 3.1, 4.1_

- [x] 5.3 ActionButtons 컴포넌트


  - PDF 다운로드 버튼
  - 공유 버튼
  - 데이터 내보내기 버튼
  - _Requirements: 1.4, 3.1_

- [x] 5.4 GenomicsResultsPage 통합


  - GenomicsResultsPage.tsx 생성
  - 모든 하위 컴포넌트 조합
  - URL 파라미터로 분석 ID 받기
  - _Requirements: 2.4, 4.1, 6.2_

- [x] 6. API 서비스 레이어 구현





- [x] 6.1 API 클라이언트 설정


  - axios 인스턴스 생성
  - 인터셉터 설정 (인증 토큰, 에러 처리)
  - 환경 변수로 API URL 설정
  - _Requirements: 7.1, 7.2, 7.5_

- [x] 6.2 healthDataApi 서비스


  - getHealthData 함수 구현
  - getActivities 함수 구현
  - updateVitalSigns 함수 구현
  - _Requirements: 7.1, 7.2, 3.3_

- [x] 6.3 genomicsApi 서비스


  - uploadGenomicData 함수 구현
  - getRiskAssessments 함수 구현
  - getPharmacogenomics 함수 구현
  - _Requirements: 7.1, 7.2, 3.3_

- [x] 7. 커스텀 훅 구현





- [x] 7.1 useHealthData 훅


  - 건강 데이터 fetch 로직
  - 로딩 및 에러 상태 관리
  - 차트 데이터 변환
  - _Requirements: 4.1, 4.2, 4.3, 4.5_


- [x] 7.2 useChartData 훅

  - 차트 데이터 포맷팅
  - 기간별 데이터 필터링
  - 메모이제이션 적용
  - _Requirements: 4.1, 4.4, 9.4_



- [x] 7.3 useAuth 훅





  - 인증 상태 관리
  - 로그인/로그아웃 함수
  - 토큰 저장 및 검증
  - _Requirements: 4.1, 4.2_

- [x] 8. 라우팅 설정






- [x] 8.1 App.tsx 라우트 정의

  - React Router 설정
  - 모든 페이지 라우트 추가
  - 404 페이지 추가
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 8.2 ProtectedRoute 컴포넌트


  - 인증 확인 로직
  - 미인증 시 로그인 페이지로 리다이렉트
  - _Requirements: 6.4_

- [x] 8.3 레이아웃 컴포넌트


  - Layout.tsx 생성
  - Navigation과 Footer 포함
  - children props로 페이지 컨텐츠 렌더링
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 9. 타입 정의 파일 작성






- [x] 9.1 health.types.ts

  - HealthData 인터페이스
  - StatCardData 인터페이스
  - Activity 인터페이스
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 9.2 genomics.types.ts


  - GenomicData 인터페이스
  - RiskAssessment 인터페이스
  - PharmacogenomicsData 인터페이스
  - _Requirements: 3.1, 3.2, 3.3_


- [x] 9.3 common.types.ts

  - 공통 타입 정의
  - API 응답 타입
  - 에러 타입
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 10. 스타일링 시스템 구축






- [x] 10.1 CSS 변수 정의

  - variables.css 파일 생성
  - 색상, 간격, 그림자 등 변수 정의
  - _Requirements: 1.2_

- [x] 10.2 글로벌 스타일


  - global.css 파일 생성
  - 리셋 스타일
  - 기본 타이포그래피
  - _Requirements: 1.2_

- [x] 10.3 컴포넌트별 CSS Modules


  - 각 컴포넌트의 .module.css 파일 작성
  - 반응형 미디어 쿼리 추가
  - _Requirements: 1.2, 1.5_

- [x] 11. 성능 최적화






- [x] 11.1 코드 스플리팅

  - React.lazy로 페이지 컴포넌트 지연 로딩
  - Suspense로 로딩 폴백 추가
  - _Requirements: 9.1_


- [x] 11.2 메모이제이션

  - React.memo로 컴포넌트 메모이제이션
  - useCallback으로 이벤트 핸들러 최적화
  - useMemo로 계산 비용 높은 값 캐싱
  - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [x] 12. 접근성 개선





- [x] 12.1 ARIA 속성 추가


  - 모든 인터랙티브 요소에 aria-label 추가
  - 폼 요소에 aria-describedby 추가
  - _Requirements: 8.1, 8.4_

- [x] 12.2 키보드 네비게이션


  - Tab 키로 모든 요소 접근 가능하도록 구현
  - Enter/Space 키로 버튼 활성화
  - _Requirements: 8.2_


- [x] 12.3 시맨틱 HTML

  - 적절한 HTML5 시맨틱 태그 사용
  - 이미지에 alt 텍스트 추가
  - _Requirements: 8.3, 8.4, 8.5_

- [x] 13. 테스트 작성



- [x] 13.1 컴포넌트 단위 테스트


  - React Testing Library 사용
  - Navigation 컴포넌트 테스트
  - Dashboard 컴포넌트 테스트
  - _Requirements: 10.1, 10.3_


- [x] 13.2 커스텀 훅 테스트

  - @testing-library/react-hooks 사용
  - useHealthData 훅 테스트
  - useAuth 훅 테스트
  - _Requirements: 10.1, 10.4_



- [x] 13.3 API 모킹
  - MSW (Mock Service Worker) 설정
  - API 엔드포인트 모킹
  - _Requirements: 10.5_


- [x] 13.4 테스트 커버리지


  - 80% 이상 코드 커버리지 달성
  - 커버리지 리포트 생성
  - _Requirements: 10.2_

- [x] 14. 환경 설정 및 배포 준비





- [x] 14.1 환경 변수 설정


  - .env 파일 생성
  - API URL, 환경 변수 정의
  - _Requirements: 7.5_

- [x] 14.2 빌드 최적화


  - 프로덕션 빌드 설정
  - 번들 크기 분석
  - _Requirements: 9.1_

- [x] 14.3 문서화


  - README.md 업데이트
  - 컴포넌트 사용 예시 작성
  - API 문서 작성
  - _Requirements: 2.3_
