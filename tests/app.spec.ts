import { test, expect } from '@playwright/test';

test.describe('송가네 미션 앱 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // localStorage 초기화
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('01. 가족 선택 화면이 로드된다', async ({ page }) => {
    await page.goto('/select');

    // 제목 확인
    await expect(page.getByText('송가네 미션 앱')).toBeVisible();
    await expect(page.getByText('누구세요?')).toBeVisible();

    // 가족 구성원 4명 표시
    await expect(page.getByText('송현준')).toBeVisible();
    await expect(page.getByText('송민주')).toBeVisible();
    await expect(page.getByText('아빠')).toBeVisible();
    await expect(page.getByText('엄마')).toBeVisible();
  });

  test('02. 자녀(송현준) 선택 시 자녀 홈으로 이동한다', async ({ page }) => {
    await page.goto('/select');

    // 송현준 선택
    await page.getByText('송현준').click();

    // 자녀 홈 화면 확인
    await expect(page).toHaveURL('/child');
    await expect(page.getByText('오늘의 미션')).toBeVisible();
    await expect(page.getByText('제출하러 가기')).toBeVisible();
  });

  test('03. 자녀 홈에서 스트릭 카드가 표시된다', async ({ page }) => {
    await page.goto('/select');
    await page.getByText('송현준').click();

    // 스트릭 카드 확인
    await expect(page.getByText('연속 제출')).toBeVisible();
    await expect(page.getByText('내 기록 보기')).toBeVisible();
  });

  test('04. 부모(아빠) 선택 시 대시보드로 이동한다', async ({ page }) => {
    await page.goto('/select');

    // 아빠 선택
    await page.getByText('아빠').click();

    // 부모 대시보드 확인
    await expect(page).toHaveURL('/parent');
    await expect(page.getByText('오늘 제출 현황')).toBeVisible();
    await expect(page.getByText('자녀별 현황')).toBeVisible();
  });

  test('05. 부모 대시보드에서 제출물 확인 페이지로 이동한다', async ({ page }) => {
    await page.goto('/select');
    await page.getByText('아빠').click();

    // 제출물 확인 버튼 클릭
    await page.getByText('제출물 확인하기').click();

    await expect(page).toHaveURL('/parent/review');
  });

  test('06. 부모 대시보드에서 미션 관리 페이지로 이동한다', async ({ page }) => {
    await page.goto('/select');
    await page.getByText('아빠').click();

    // 미션 관리 버튼 클릭
    await page.getByText('미션 관리').click();

    await expect(page).toHaveURL('/parent/assignments');
    await expect(page.getByText('미션 관리')).toBeVisible();
  });

  test('07. 자녀 홈에서 카메라 페이지로 이동한다', async ({ page }) => {
    await page.goto('/select');
    await page.getByText('송현준').click();

    // 제출하러 가기 버튼 클릭
    await page.getByText('제출하러 가기').click();

    await expect(page).toHaveURL('/child/camera');
    await expect(page.getByText('사진 촬영')).toBeVisible();
  });

  test('08. 자녀 홈에서 달력 페이지로 이동한다', async ({ page }) => {
    await page.goto('/select');
    await page.getByText('송현준').click();

    // 달력 버튼 클릭
    await page.getByText('내 기록 보기').click();

    await expect(page).toHaveURL('/child/calendar');
  });

  test('09. 사용자 전환이 동작한다', async ({ page }) => {
    await page.goto('/select');
    await page.getByText('송현준').click();

    // 다른 사람으로 전환
    await page.getByText('다른 사람으로 전환').click();

    await expect(page).toHaveURL('/select');
  });

  test('10. 미션 등록 모달이 열린다', async ({ page }) => {
    await page.goto('/select');
    await page.getByText('아빠').click();
    await page.getByText('미션 관리').click();

    // 페이지 로드 대기
    await page.waitForTimeout(1000);

    // 미션 등록/수정 버튼 클릭 (미션이 없으면 등록, 있으면 수정)
    const registerBtn = page.getByRole('button', { name: '새 미션 추가' });
    const editBtn = page.getByRole('button', { name: '수정' });

    if (await registerBtn.isVisible()) {
      await registerBtn.click();
    } else if (await editBtn.isVisible()) {
      await editBtn.click();
    }

    // 모달이 열릴 때까지 대기
    await page.waitForTimeout(500);

    // 모달 확인 - 미션 제목 입력 필드
    await expect(page.getByText('미션 제목')).toBeVisible();
  });
});
