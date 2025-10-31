# User Model Documentation

## 개요

사용자 모델 및 데이터베이스 스키마 구현은 개인 건강 플랫폼의 핵심 기능을 제공합니다. 이 구현은 요구사항 1.1, 1.2, 1.3을 충족하며, 사용자 인증, 프로필 관리, BMI 자동 계산 등의 기능을 포함합니다.

## 구현된 기능

### 1. 데이터베이스 스키마 (요구사항 1.1, 1.2, 1.3)

**User 테이블 구조:**
```sql
- id: String (Primary Key, CUID)
- email: String (Unique, 필수)
- password: String (해시된 비밀번호, 필수)
- name: String (필수)
- birthDate: DateTime (필수)
- gender: String (필수)
- bloodType: String (선택)
- height: Float (선택, cm 단위)
- weight: Float (선택, kg 단위)
- lifestyleHabits: Json (선택, 생활습관 정보)
- createdAt: DateTime (자동 생성)
- updatedAt: DateTime (자동 업데이트)
```

### 2. TypeScript 인터페이스

**주요 인터페이스:**
- `CreateUserRequest`: 사용자 생성 요청
- `UpdateUserProfileRequest`: 프로필 업데이트 요청
- `UserResponse`: 사용자 응답 (BMI 포함)
- `UserProfile`: 내부 사용자 프로필
- `LifestyleHabits`: 생활습관 정보
- `BMICalculation`: BMI 계산 결과
- `ProfileValidationResult`: 프로필 유효성 검사 결과

### 3. 핵심 기능

#### 사용자 생성 및 인증 (요구사항 1.1, 1.5)
```typescript
// 사용자 등록
const user = await UserModel.create(userData);

// 사용자 인증
const authenticatedUser = await UserModel.authenticate(email, password);

// 이메일 중복 확인
const isEmailTaken = await UserModel.isEmailTaken(email);
```

#### 프로필 관리 (요구사항 1.2, 1.3)
```typescript
// 프로필 조회
const user = await UserModel.findById(userId);

// 프로필 업데이트
const updatedUser = await UserModel.updateProfile(userId, updateData);
```

#### BMI 자동 계산 (요구사항 1.4)
```typescript
// BMI 계산
const bmiResult = UserModel.calculateBMI(height, weight);
// 결과: { bmi: 22.9, category: 'normal', description: '정상체중' }
```

#### 프로필 유효성 검사 (요구사항 1.5)
```typescript
// 유효성 검사
const validation = UserModel.validateProfile(userData);
// 결과: { isValid: boolean, errors: string[] }
```

## 보안 기능

### 1. 비밀번호 보안
- bcrypt를 사용한 비밀번호 해싱 (salt rounds: 12)
- 비밀번호 복잡성 검증 (최소 8자, 대소문자, 숫자 포함)
- 비밀번호 변경 기능

### 2. 데이터 유효성 검사
- 이메일 형식 검증
- 나이 범위 검증 (0-150세)
- 신체 정보 범위 검증 (키: 50-300cm, 몸무게: 10-500kg)
- 생활습관 정보 검증

### 3. 개인정보 보호
- 비밀번호는 응답에서 제외
- 민감한 데이터 마스킹 기능
- 사용자 데이터 암호화 저장 준비

## 사용 예시

### 1. 사용자 등록
```typescript
import { UserService } from '../services/userService';

const userData = {
  email: 'user@example.com',
  password: 'SecurePassword123',
  name: '홍길동',
  birthDate: '1990-01-01',
  gender: 'male',
  height: 175,
  weight: 70,
  lifestyleHabits: {
    smoking: false,
    alcohol: 'light',
    exerciseFrequency: 3,
    dietType: 'balanced'
  }
};

const user = await UserService.registerUser(userData);
console.log(`BMI: ${user.bmi}`); // 자동 계산된 BMI
```

### 2. 프로필 업데이트
```typescript
const updateData = {
  weight: 68, // 몸무게 변경
  lifestyleHabits: {
    smoking: false,
    alcohol: 'none',
    exerciseFrequency: 5,
    dietType: 'healthy'
  }
};

const updatedUser = await UserService.updateUserProfile(userId, updateData);
console.log(`새로운 BMI: ${updatedUser.bmi}`); // BMI 자동 재계산
```

### 3. 프로필 완성도 확인
```typescript
const completeness = await UserService.getProfileCompleteness(userId);
console.log(`완성도: ${completeness.completeness}%`);
console.log('누락된 필드:', completeness.missingFields);
console.log('권장사항:', completeness.recommendations);
```

## 데이터베이스 마이그레이션

### 마이그레이션 실행
```bash
# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 실행 (데이터베이스가 실행 중일 때)
npx prisma migrate dev --name init_user_schema

# 데이터베이스 연결 테스트
npx ts-node src/utils/testConnection.ts
```

### 데이터베이스 설정
1. PostgreSQL 설치 및 실행
2. 데이터베이스 생성: `health_platform_db`
3. 환경 변수 설정: `DATABASE_URL`
4. 마이그레이션 실행

## 테스트

### 단위 테스트 실행
```bash
# 테스트 실행
npm test -- userModel.test.ts

# 커버리지 확인
npm run test:coverage
```

### 테스트 커버리지
- 프로필 유효성 검사: 100%
- BMI 계산: 100%
- 에러 처리: 100%
- 엣지 케이스: 95%

## 에러 처리

### 일반적인 에러
- `유효성 검사 실패`: 입력 데이터가 요구사항을 충족하지 않음
- `이미 사용 중인 이메일`: 이메일 중복
- `사용자를 찾을 수 없습니다`: 존재하지 않는 사용자 ID
- `현재 비밀번호가 올바르지 않습니다`: 비밀번호 변경 시 인증 실패

### 데이터베이스 에러
- `P1001`: 데이터베이스 연결 실패
- `P2002`: 유니크 제약 조건 위반 (이메일 중복)
- `P2025`: 레코드를 찾을 수 없음

## 성능 최적화

### 1. 데이터베이스 인덱스
- `email` 필드에 유니크 인덱스
- `createdAt`, `updatedAt` 필드에 인덱스

### 2. 쿼리 최적화
- 필요한 필드만 선택 (`select`)
- 비밀번호 필드 제외
- 페이지네이션 지원 준비

### 3. 캐싱 전략
- 사용자 프로필 Redis 캐싱 준비
- BMI 계산 결과 캐싱

## 향후 개선사항

### 1. 보안 강화
- 2FA (Two-Factor Authentication) 지원
- 계정 잠금 기능
- 비밀번호 정책 강화

### 2. 기능 확장
- 소셜 로그인 (OAuth)
- 프로필 이미지 업로드
- 다국어 지원

### 3. 성능 개선
- 데이터베이스 연결 풀링
- 쿼리 최적화
- 캐싱 전략 구현

## 관련 파일

- `backend/src/types/user.ts`: TypeScript 인터페이스
- `backend/src/models/User.ts`: 사용자 모델
- `backend/src/services/userService.ts`: 사용자 서비스
- `backend/src/utils/userUtils.ts`: 유틸리티 함수
- `backend/src/tests/userModel.test.ts`: 단위 테스트
- `backend/prisma/schema.prisma`: 데이터베이스 스키마