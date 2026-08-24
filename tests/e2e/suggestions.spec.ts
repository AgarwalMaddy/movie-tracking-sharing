import { test, expect } from "@playwright/test"

test.describe("Suggestions", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/suggestions")
    await expect(page).toHaveURL(/login/)
  })
})
