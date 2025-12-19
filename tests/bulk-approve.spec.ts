import { test, expect } from '@playwright/test';

test('일괄 승인 버튼 확인', async ({ page }) => {
  // 배포된 사이트로 이동
  await page.goto('https://homework-7eefc.web.app/select');
  await page.waitForTimeout(1000);

  // 아빠 선택
  await page.getByText('아빠').click();
  await page.waitForURL('**/parent/**');
  await page.waitForTimeout(1000);

  // 제출물 확인 페이지로 이동
  await page.getByText('제출물 확인하기').click();
  await page.waitForURL('**/parent/review**');
  await page.waitForTimeout(2000);

  // 스크린샷 저장
  await page.screenshot({ path: 'test-results/review-page.png', fullPage: true });

  // 페이지 내용 확인
  const pageContent = await page.content();
  console.log('=== 페이지 상태 ===');

  // 모두 승인하기 버튼 또는 빈 상태 확인
  const bulkApproveBtn = page.getByText(/모두 승인하기/);
  const emptyState = page.getByText('모든 제출물을 확인했어요');

  const isBulkVisible = await bulkApproveBtn.isVisible().catch(() => false);
  const isEmptyVisible = await emptyState.isVisible().catch(() => false);

  console.log('모두 승인하기 버튼:', isBulkVisible ? '보임' : '안보임');
  console.log('빈 상태 메시지:', isEmptyVisible ? '보임' : '안보임');

  // 둘 중 하나는 보여야 함
  expect(isBulkVisible || isEmptyVisible).toBe(true);
});
