import { expect, test } from '@playwright/test'

test('menu → new campaign → decision → action → next round', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: /shadow city/i })).toBeVisible()
  await expect(page.getByText(/make decisions/i)).toBeVisible()

  await page.getByRole('button', { name: /^new game$/i }).click()
  await expect(page.getByRole('heading', { name: /assemble the last light/i })).toBeVisible()

  await page.getByRole('button', { name: /start game/i }).click()
  await expect(page.getByLabel('Round 1 of 8')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('heading', { name: /^the city$/i })).toBeVisible()

  // Resolve the decision through the story screen.
  await page.getByRole('button', { name: /open the decision/i }).first().click()
  await expect(page.getByText(/awaiting choice/i)).toBeVisible()
  await page.locator('main ul li button:not([disabled])').first().click()
  await expect(page.getByRole('button', { name: /continue to action phase/i }).first()).toBeVisible()
  await page.getByRole('button', { name: /continue to action phase/i }).first().click()

  // Spend the round and confirm the next round begins.
  await page.getByRole('button', { name: /end turn/i }).first().click()
  await page.getByRole('button', { name: /continue to survival/i }).first().click()
  await page.getByRole('button', { name: /begin next round/i }).first().click()
  await expect(page.getByLabel('Round 2 of 8')).toBeVisible({ timeout: 10_000 })

  expect(consoleErrors).toEqual([])
})

test('sealed districts cannot be selected', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^new game$/i }).click()
  await page.getByRole('button', { name: /start game/i }).click()
  await expect(page.getByLabel('Round 1 of 8')).toBeVisible({ timeout: 15_000 })

  const locked = page.getByRole('button', { name: /locked/i }).first()
  await expect(locked).toBeDisabled()
})
