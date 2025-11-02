# 🚀 K-hub CI/CD 파이프라인 가이드

## 📋 개요

K-hub 개인 건강 플랫폼을 위한 완전한 CI/CD 파이프라인이 구축되었습니다. 다양한 플랫폼을 지원하며, 코드 품질부터 프로덕션 배포까지 전체 개발 라이프사이클을 자동화합니다.

## 🛠️ 지원 플랫폼

### 1. **GitHub Actions** (`.github/workflows/`)
- `ci.yml` - 지속적 통합 파이프라인
- `cd.yml` - 지속적 배포 파이프라인

### 2. **GitLab CI/CD** (`.gitlab-ci.yml`)
- 통합된 CI/CD 파이프라인
- GitLab Container Registry 지원

### 3. **Jenkins** (`Jenkinsfile`)
- Declarative Pipeline 문법
- 다양한 플러그인 지원

### 4. **Azure DevOps** (`azure-pipelines.yml`)
- Azure Container Registry 통합
- Azure Kubernetes Service 배포

## 🔄 파이프라인 단계

### **1단계: 코드 품질 검사**
```yaml
- 린트 검사 (ESLint, Prettier)
- 코드 포맷팅 검증
- 보안 취약점 스캔 (npm audit, Trivy)
- 시크릿 스캔 (TruffleHog)
```

### **2단계: 테스트**
```yaml
- 단위 테스트 (Jest)
- 통합 테스트 (API 테스트)
- 컴포넌트 테스트 (React Testing Library)
- E2E 테스트 (Playwright)
- 코드 커버리지 측정
```

### **3단계: 빌드**
```yaml
- Docker 이미지 빌드
- 멀티 아키텍처 지원 (AMD64, ARM64)
- 이미지 레지스트리 푸시
- 빌드 아티팩트 저장
```

### **4단계: 보안 스캔**
```yaml
- 컨테이너 이미지 취약점 스캔
- SARIF 보고서 생성
- 보안 정책 준수 확인
```

### **5단계: 스테이징 배포**
```yaml
- Kubernetes 클러스터 배포
- Helm 차트 사용
- 헬스체크 및 스모크 테스트
- 성능 테스트 (K6)
```

### **6단계: 프로덕션 배포**
```yaml
- 수동 승인 프로세스
- 데이터베이스 백업
- Blue-Green 배포 전략
- 롤백 메커니즘
```

### **7단계: 모니터링**
```yaml
- 배포 후 메트릭 모니터링
- 에러율 확인
- 자동 롤백 (실패 시)
- 알림 발송
```

## 🔧 설정 방법

### GitHub Actions 설정

1. **Repository Secrets 설정**
```bash
# Docker Registry
DOCKER_REGISTRY_USERNAME
DOCKER_REGISTRY_PASSWORD

# AWS (EKS 배포용)
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION

# Kubernetes
KUBECONFIG_STAGING
KUBECONFIG_PRODUCTION

# 알림
SLACK_WEBHOOK_URL

# 모니터링
PROMETHEUS_URL
```

2. **환경 설정**
```yaml
# .github/environments/staging.yml
name: staging
url: https://staging.khub.example.com
protection_rules:
  - type: required_reviewers
    required_reviewers: 1

# .github/environments/production.yml
name: production
url: https://khub.example.com
protection_rules:
  - type: required_reviewers
    required_reviewers: 2
  - type: wait_timer
    wait_timer: 5
```

### GitLab CI/CD 설정

1. **Variables 설정** (Settings > CI/CD > Variables)
```bash
# Container Registry
CI_REGISTRY_USER
CI_REGISTRY_PASSWORD

# Kubernetes
KUBE_CONTEXT_STAGING
KUBE_CONTEXT_PRODUCTION

# 외부 서비스
SLACK_WEBHOOK_URL
PROMETHEUS_URL
```

2. **Runners 설정**
```yaml
# .gitlab-ci.yml에서 사용할 Runner 태그
tags:
  - docker
  - kubernetes
```

### Jenkins 설정

1. **필수 플러그인**
```bash
- Docker Pipeline
- Kubernetes CLI
- Slack Notification
- Blue Ocean
- Pipeline: Stage View
```

2. **Credentials 설정**
```bash
# Jenkins > Manage Jenkins > Credentials
- docker-registry-credentials (Username/Password)
- kubeconfig (Secret file)
- slack-webhook-url (Secret text)
```

3. **Pipeline 생성**
```bash
# New Item > Pipeline
# Pipeline script from SCM
# Repository URL: your-repo-url
# Script Path: Jenkinsfile
```

### Azure DevOps 설정

1. **Service Connections**
```bash
# Project Settings > Service connections
- Azure Container Registry
- Kubernetes Service Connection
- Azure Resource Manager
```

2. **Variable Groups**
```bash
# Pipelines > Library > Variable groups
- khub-variables
  - containerRegistry
  - imageRepository
  - kubernetesServiceConnection
```

## 📊 테스트 전략

### 단위 테스트
```typescript
// Jest 설정
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### E2E 테스트
```typescript
// Playwright 설정
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
```

### 성능 테스트
```javascript
// K6 설정
export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};
```

## 🚀 배포 전략

### Blue-Green 배포
```yaml
# Helm values for blue-green deployment
deployment:
  strategy: blue-green
  blueGreen:
    activeService: khub-active
    previewService: khub-preview
    autoPromotionEnabled: false
    scaleDownDelaySeconds: 30
```

### 카나리 배포
```yaml
# Argo Rollouts 설정
spec:
  strategy:
    canary:
      steps:
      - setWeight: 20
      - pause: {duration: 10m}
      - setWeight: 40
      - pause: {duration: 10m}
      - setWeight: 60
      - pause: {duration: 10m}
      - setWeight: 80
      - pause: {duration: 10m}
```

## 📈 모니터링 및 알림

### Prometheus 메트릭
```yaml
# 모니터링할 주요 메트릭
- http_requests_total
- http_request_duration_seconds
- container_cpu_usage_seconds_total
- container_memory_usage_bytes
```

### Slack 알림
```bash
# 성공 알림
✅ K-hub deployment successful!
Version: v1.2.3
Environment: Production
URL: https://khub.example.com

# 실패 알림
❌ K-hub deployment failed!
Pipeline: #123
Branch: main
Logs: [링크]
```

## 🔒 보안 고려사항

### 시크릿 관리
```yaml
# 환경별 시크릿 분리
staging:
  - DATABASE_URL
  - JWT_SECRET
  - API_KEYS

production:
  - DATABASE_URL (다른 값)
  - JWT_SECRET (다른 값)
  - API_KEYS (다른 값)
```

### 이미지 스캔
```yaml
# Trivy 보안 스캔
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.IMAGE_NAME }}
    format: 'sarif'
    output: 'trivy-results.sarif'
```

## 🛠️ 트러블슈팅

### 일반적인 문제들

1. **테스트 실패**
```bash
# 로그 확인
kubectl logs -f deployment/khub-backend -n staging

# 테스트 재실행
npm run test -- --verbose
```

2. **배포 실패**
```bash
# Helm 상태 확인
helm status khub-production -n production

# 롤백
helm rollback khub-production -n production
```

3. **이미지 빌드 실패**
```bash
# Docker 빌드 로그 확인
docker build --no-cache -t khub-backend ./backend

# 캐시 정리
docker system prune -f
```

## 📚 추가 리소스

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [GitLab CI/CD 문서](https://docs.gitlab.com/ee/ci/)
- [Jenkins 파이프라인 문서](https://www.jenkins.io/doc/book/pipeline/)
- [Azure DevOps 문서](https://docs.microsoft.com/en-us/azure/devops/)
- [Kubernetes 배포 가이드](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Helm 차트 가이드](https://helm.sh/docs/chart_template_guide/)

---

**참고**: 이 CI/CD 파이프라인은 K-hub 개인 건강 플랫폼의 안정적이고 자동화된 배포를 위해 설계되었습니다. 프로덕션 환경에서는 조직의 보안 정책과 요구사항에 맞게 추가 설정이 필요할 수 있습니다.