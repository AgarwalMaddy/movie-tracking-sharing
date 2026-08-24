import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("redirects protected routes to login", async ({ page }) => {
    await page.goto("/library")
    await expect(page).toHaveURL(/login/)
  })

  test("shows login and signup pages", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible()

    await page.goto("/signup")
    await expect(page.getByRole("heading", { name: "Sign Up" })).toBeVisible()
  })
})
