import { expect, test } from '@playwright/test';

const display = (page) => page.getByLabel('計算結果');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('stores, recalls, and clears memory', async ({ page }) => {
  await page.getByRole('button', { name: '2', exact: true }).click();
  await page.getByRole('button', { name: 'M+', exact: true }).click();
  await expect(page.getByLabel('メモリに値あり')).toBeVisible();

  await page.getByRole('button', { name: 'AC', exact: true }).click();
  await page.getByRole('button', { name: 'MR', exact: true }).click();
  await expect(display(page)).toHaveText('2');

  await page.getByRole('button', { name: 'MC', exact: true }).click();
  await expect(page.getByLabel('メモリは空')).toBeVisible();
});
