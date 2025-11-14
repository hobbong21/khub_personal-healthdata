import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/K-hub/);
    
    // 로고 확인
    await expect(page.locator('.logo')).toBeVisible();
    
    // 메인 헤딩 확인
    await expect(page.locator('h1')).toContainText('개인 건강 관리의');
    
    // CTA 버튼 확인
    await expect(page.locator('text=무료로 시작하기')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    
    // 시작하기 버튼 클릭
    await page.click('text=시작하기');
    
    // 회원가입 페이지로 이동 확인
    await expect(page).toHaveURL(/signup/);
    await expect(page.locator('h1')).toContainText('회원가입');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // 로그인 버튼 클릭
    await page.click('text=로그인');
    
    // 로그인 페이지로 이동 확인
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('h1')).toContainText('로그인');
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // 네비게이션 메뉴 항목들 확인
    await expect(page.locator('text=솔루션')).toBeVisible();
    await expect(page.locator('text=기능')).toBeVisible();
    await expect(page.locator('text=회사소개')).toBeVisible();
    await expect(page.locator('text=문의하기')).toBeVisible();
  });

  test('should navigate to features page', async ({ page }) => {
    await page.goto('/');
    
    // 기능 메뉴 클릭
    await page.click('text=기능');
    
    // 기능 페이지로 이동 확인
    await expect(page).toHaveURL(/features/);
    await expect(page.locator('h1')).toContainText('포괄적인 건강 관리');
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/');
    
    // 회사소개 메뉴 클릭
    await page.click('text=회사소개');
    
    // 회사소개 페이지로 이동 확인
    await expect(page).toHaveURL(/about/);
    await expect(page.locator('h1')).toContainText('건강한 미래를 만드는');
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/');
    
    // 문의하기 메뉴 클릭
    await page.click('text=문의하기');
    
    // 문의하기 페이지로 이동 확인
    await expect(page).toHaveURL(/contact/);
    await expect(page.locator('h1')).toContainText('언제든지 문의하세요');
  });

  test('should display solution cards', async ({ page }) => {
    await page.goto('/');
    
    // 솔루션 섹션으로 스크롤
    await page.locator('#solutions').scrollIntoViewIfNeeded();
    
    // 솔루션 카드들 확인
    await expect(page.locator('text=개인 사용자')).toBeVisible();
    await expect(page.locator('text=의료기관')).toBeVisible();
    await expect(page.locator('text=기업')).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');
    
    // 기능 섹션으로 스크롤
    await page.locator('#features').scrollIntoViewIfNeeded();
    
    // 기능 카드들 확인
    await expect(page.locator('text=AI 건강 분석')).toBeVisible();
    await expect(page.locator('text=유전체 분석')).toBeVisible();
    await expect(page.locator('text=스마트 복약 관리')).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 모바일에서도 주요 요소들이 보이는지 확인
    await expect(page.locator('.logo')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=무료로 시작하기')).toBeVisible();
  });
});