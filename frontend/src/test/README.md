# Test Setup

이 디렉토리는 테스트 설정 및 모킹 관련 파일을 포함합니다.

## 구조

```
test/
├── setup.ts          # Vitest 테스트 설정
├── mocks/
│   ├── handlers.ts   # MSW API 핸들러
│   ├── server.ts     # MSW 서버 (Node.js 환경)
│   └── browser.ts    # MSW 워커 (브라우저 환경)
└── README.md
```

## MSW (Mock Service Worker)

MSW를 사용하여 API 요청을 모킹합니다. 이를 통해 실제 백엔드 없이도 프론트엔드 테스트를 수행할 수 있습니다.

### 테스트에서 사용

테스트는 자동으로 MSW 서버를 시작합니다 (`setup.ts` 참조).

### 개발 환경에서 사용 (선택사항)

개발 중에 MSW를 사용하려면 `main.tsx`에 다음을 추가하세요:

```typescript
if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW === 'true') {
  import('./test/mocks/browser').then(({ worker }) => {
    worker.start();
  });
}
```

그리고 `.env.development`에 추가:

```
VITE_USE_MSW=true
```

## 테스트 실행

```bash
# 단일 실행
npm test

# Watch 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

## 새로운 API 엔드포인트 모킹

`mocks/handlers.ts`에 새로운 핸들러를 추가하세요:

```typescript
http.get(`${API_BASE_URL}/your-endpoint`, () => {
  return HttpResponse.json({ data: 'your data' });
}),
```
