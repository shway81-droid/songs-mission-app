import { test, expect } from '@playwright/test';

test('가족 선택 후 화면 이동 테스트', async ({ page }) => {
  // 배포된 사이트로 이동
  await page.goto('https://homework-7eefc.web.app/select');
  await page.waitForTimeout(2000);

  console.log('=== 선택 화면 로드됨 ===');

  // 송현준 선택
  const sonButton = page.getByText('송현준');
  await expect(sonButton).toBeVisible();
  console.log('송현준 버튼 보임');

  await sonButton.click();
  console.log('송현준 클릭함');

  await page.waitForTimeout(3000);

  // 현재 URL 확인
  const currentUrl = page.url();
  console.log('현재 URL:', currentUrl);

  // 스크린샷
  await page.screenshot({ path: 'test-results/after-click.png', fullPage: true });

  // child 페이지로 이동했는지 확인
  const isChildPage = currentUrl.includes('/child');
  const isSelectPage = currentUrl.includes('/select');

  console.log('child 페이지인가?', isChildPage);
  console.log('select 페이지인가?', isSelectPage);

  expect(isChildPage).toBe(true);
});
