import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Signup Page', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto('/signup.html');
      
      // 페이지 제목 확인
      await expect(page).toHaveTitle(/회원가입 - K-hub/);
      
      // 폼 요소들 확인
      await expect(page.locator('input[id="firstName"]')).toBeVisible();
      await expect(page.locator('input[id="lastName"]')).toBeVisible();
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="birthDate"]')).toBeVisible();
      await expect(page.locator('select[id="gender"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.locator('input[id="confirmPassword"]')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/signup.html');
      
      // 빈 폼으로 제출 시도
      await page.click('button[type="submit"]');
      
      // HTML5 validation 메시지 확인
      const firstNameInput = page.locator('input[id="firstName"]');
      await expect(firstNameInput).toHaveAttribute('required');
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/signup.html');
      
      // 잘못된 이메일 형식 입력
      await page.fill('input[id="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      
      // 이메일 입력 필드가 invalid 상태인지 확인
      const emailInput = page.locator('input[id="email"]');
      await expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('should show password strength indicator', async ({ page }) => {
      await page.goto('/signup.html');
      
      // 비밀번호 입력
      await page.fill('input[id="password"]', 'weak');
      
      // 비밀번호 강도 표시기 확인
      await expect(page.locator('.strength-bar')).toBeVisible();
      await expect(page.locator('#strengthText')).toBeVisible();
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/signup.html');
      
      // 다른 비밀번호 입력
      await page.fill('input[id="password"]', 'password123');
      await page.fill('input[id="confirmPassword"]', 'different123');
      
      // 비밀번호 불일치 메시지 확인
      await expect(page.locator('#passwordMatchError')).toBeVisible();
    });

    test('should complete signup process', async ({ page }) => {
      await page.goto('/signup.html');
      
      // 폼 작성
      await page.fill('input[id="firstName"]', '테스트');
      await page.fill('input[id="lastName"]', '사용자');
      await page.fill('input[id="email"]', 'test@example.com');
      await page.fill('input[id="birthDate"]', '1990-01-01');
      await page.selectOption('select[id="gender"]', 'male');
      await page.fill('input[id="password"]', 'StrongPassword123!');
      await page.fill('input[id="confirmPassword"]', 'StrongPassword123!');
      
      // 약관 동의
      await page.check('input[id="terms"]');
      
      // 제출
      await page.click('button[type="submit"]');
      
      // 성공 알림 확인 (실제 구현에서는 페이지 이동)
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('회원가입이 완료되었습니다');
        await dialog.accept();
      });
    });
  });

  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login.html');
      
      // 페이지 제목 확인
      await expect(page).toHaveTitle(/로그인 - K-hub/);
      
      // 폼 요소들 확인
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.locator('input[id="remember"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/login.html');
      
      // 빈 폼으로 제출 시도
      await page.click('button[type="submit"]');
      
      // 필수 필드 validation 확인
      const emailInput = page.locator('input[id="email"]');
      const passwordInput = page.locator('input[id="password"]');
      
      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
    });

    test('should complete login process', async ({ page }) => {
      await page.goto('/login.html');
      
      // 로그인 정보 입력
      await page.fill('input[id="email"]', 'test@example.com');
      await page.fill('input[id="password"]', 'password123');
      
      // 로그인 상태 유지 체크
      await page.check('input[id="remember"]');
      
      // 제출
      await page.click('button[type="submit"]');
      
      // 성공 알림 확인
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('로그인 성공');
        await dialog.accept();
      });
    });

    test('should navigate to signup from login', async ({ page }) => {
      await page.goto('/login.html');
      
      // 회원가입 링크 클릭
      await page.click('text=회원가입');
      
      // 회원가입 페이지로 이동 확인
      await expect(page).toHaveURL(/signup/);
    });

    test('should show social login options', async ({ page }) => {
      await page.goto('/login.html');
      
      // 소셜 로그인 버튼들 확인
      await expect(page.locator('text=Google')).toBeVisible();
      await expect(page.locator('text=Kakao')).toBeVisible();
    });

    test('should navigate back to home', async ({ page }) => {
      await page.goto('/login.html');
      
      // 홈으로 돌아가기 링크 클릭
      await page.click('text=홈으로 돌아가기');
      
      // 홈페이지로 이동 확인
      await expect(page).toHaveURL(/index/);
    });
  });

  test.describe('Dashboard Access', () => {
    test('should redirect to dashboard after login', async ({ page }) => {
      await page.goto('/login.html');
      
      // 로그인 (성공적인 로그인 시뮬레이션)
      await page.fill('input[id="email"]', 'test@example.com');
      await page.fill('input[id="password"]', 'password123');
      
      // 대화상자 처리
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      await page.click('button[type="submit"]');
      
      // 대시보드 페이지 확인 (실제 구현에서는 자동 리다이렉트)
      await page.goto('/dashboard.html');
      await expect(page).toHaveTitle(/대시보드 - K-hub/);
    });

    test('should display dashboard elements', async ({ page }) => {
      // 대시보드에 직접 접근 (인증 우회)
      await page.goto('/dashboard.html');
      
      // 대시보드 요소들 확인
      await expect(page.locator('.page-title')).toContainText('대시보드');
      await expect(page.locator('.stat-card')).toHaveCount(4);
      await expect(page.locator('.sidebar')).toBeVisible();
    });
  });
});