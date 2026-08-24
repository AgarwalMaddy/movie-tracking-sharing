import { test, expect } from "@playwright/test"

test.describe("Friends", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/friends")
    await expect(page).toHaveURL(/login/)
  })
})
