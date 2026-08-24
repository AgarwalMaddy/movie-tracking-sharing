import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("redirects protected routes to login", async ({ page }) => {
    await page.goto("/library")
    await expect(page).toHaveURL(/login/)
  })

  test("shows login and signup pages", async ({ page }) => {
    await page.goto("/login")
    await expect(
      page.getByRole("heading", { name: "Sign In" })
    ).toBeVisible()

    await page.goto("/signup")
    await expect(
      page.getByRole("heading", { name: "Sign Up" })
    ).toBeVisible()
  })

  test("login form validates required fields", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: "Sign In" }).click()
    await expect(page).toHaveURL(/login/)
  })

  test("signup form validates required fields", async ({ page }) => {
    await page.goto("/signup")
    await page.getByRole("button", { name: "Sign Up" }).click()
    await expect(page).toHaveURL(/signup/)
  })

  test("login page has link to signup", async ({ page }) => {
    await page.goto("/login")
    const signupLink = page.getByRole("link", { name: /sign up/i })
    await expect(signupLink).toBeVisible()
  })

  test("landing page loads with CTAs", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByRole("link", { name: "Get Started" })
    ).toBeVisible()
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible()
  })

  test("Get Started links to signup", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: "Get Started" }).click()
    await expect(page).toHaveURL(/signup/)
  })
})
