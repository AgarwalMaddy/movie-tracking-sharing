import { type Page } from "@playwright/test"

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Sign In" }).click()
  await page.waitForURL(/library/)
}

export async function signup(
  page: Page,
  data: { email: string; password: string; username: string; name: string }
) {
  await page.goto("/signup")
  await page.getByLabel("Name").fill(data.name)
  await page.getByLabel("Username").fill(data.username)
  await page.getByLabel("Email").fill(data.email)
  await page.getByLabel("Password").fill(data.password)
  await page.getByRole("button", { name: "Sign Up" }).click()
}
