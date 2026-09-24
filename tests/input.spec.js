import { expect, test } from '@playwright/test';

const display = (page) => page.getByLabel('計算結果');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('accepts decimal input and removes the final digit', async ({ page }) => {
  await page.getByRole('button', { name: '1', exact: true }).click();
  await page.getByRole('button', { name: '.', exact: true }).click();
  await page.getByRole('button', { name: '2', exact: true }).click();
  await page.getByRole('button', { name: 'DEL', exact: true }).click();

  await expect(display(page)).toHaveText('1.');
});

test('toggles the sign and clears the display', async ({ page }) => {
  await page.getByRole('button', { name: '2', exact: true }).click();
  await page.getByRole('button', { name: '+/−', exact: true }).click();
  await expect(display(page)).toHaveText('-2');

  await page.getByRole('button', { name: 'AC', exact: true }).click();
  await expect(display(page)).toHaveText('0');
});

test('supports keyboard input', async ({ page }) => {
  await page.keyboard.press('5');
  await page.keyboard.press('+');
  await page.keyboard.press('4');
  await page.keyboard.press('Enter');

  await expect(display(page)).toHaveText('9');
});
