import { expect, test } from '@playwright/test';

const display = (page) => page.getByLabel('計算結果');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('calculates operations selected with calculator buttons', async ({ page }) => {
  await page.getByRole('button', { name: '7', exact: true }).click();
  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.getByRole('button', { name: '3', exact: true }).click();
  await page.getByRole('button', { name: '=', exact: true }).click();

  await expect(display(page)).toHaveText('10');
});

test('evaluates chained operations from left to right', async ({ page }) => {
  await page.getByRole('button', { name: '8', exact: true }).click();
  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.getByRole('button', { name: '3', exact: true }).click();
  await page.getByRole('button', { name: '×', exact: true }).click();
  await page.getByRole('button', { name: '2', exact: true }).click();
  await page.getByRole('button', { name: '=', exact: true }).click();

  await expect(display(page)).toHaveText('22');
});

test('subtracts a percentage of the first operand', async ({ page }) => {
  await page.getByRole('button', { name: '1', exact: true }).click();
  await page.getByRole('button', { name: '0', exact: true }).click();
  await page.getByRole('button', { name: '0', exact: true }).click();
  await page.getByRole('button', { name: '−', exact: true }).click();
  await page.getByRole('button', { name: '1', exact: true }).click();
  await page.getByRole('button', { name: '0', exact: true }).click();
  await page.getByRole('button', { name: '%', exact: true }).click();
  await page.getByRole('button', { name: '=', exact: true }).click();

  await expect(display(page)).toHaveText('90');
});

test('shows an error for division by zero', async ({ page }) => {
  await page.getByRole('button', { name: '7', exact: true }).click();
  await page.getByRole('button', { name: '÷', exact: true }).click();
  await page.getByRole('button', { name: '0', exact: true }).click();
  await page.getByRole('button', { name: '=', exact: true }).click();

  await expect(display(page)).toHaveText('0 DIV');
});
