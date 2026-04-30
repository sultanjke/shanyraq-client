import { expect, type Page, test } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/en/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Apartment construction/ })).toBeVisible();
}

test("resident can vote and see audit navigation", async ({ page }) => {
  await login(page, "resident@shanyraq.kz", "resident123");
  await page.getByRole("link", { name: "Approvals" }).click();
  await page.getByRole("button", { name: "Vote yes" }).first().click();
  await expect(page).toHaveURL(/approvals\?voted=1/);
  await page.getByRole("link", { name: "Audit trail" }).click();
  await expect(page.getByRole("heading", { name: "Hash-chain audit trail" })).toBeVisible();
});

test("manager can publish finance report", async ({ page }) => {
  await login(page, "manager@shanyraq.kz", "manager123");
  await page.getByRole("link", { name: "Finance" }).click();
  await page.getByRole("button", { name: "Publish monthly report" }).click();
  await expect(page).toHaveURL(/finance\?published=1/);
});

test("auditor can run checks and verify documents", async ({ page }) => {
  await login(page, "auditor@shanyraq.kz", "auditor123");
  await page.getByRole("button", { name: "Run consistency checks" }).click();
  await expect(page).toHaveURL(/dashboard\?checked=1/);
  await page.getByRole("link", { name: "Documents" }).click();
  await page.getByRole("button", { name: "Verify" }).first().click();
  await expect(page).toHaveURL(/documents\?verified=1/);
});

test("language switcher preserves route", async ({ page }) => {
  await login(page, "resident@shanyraq.kz", "resident123");
  await page.getByRole("link", { name: "RU" }).click();
  await expect(page).toHaveURL(/\/ru\/dashboard/);
  await expect(page.getByText("Пилотный MVP")).toBeVisible();
});
