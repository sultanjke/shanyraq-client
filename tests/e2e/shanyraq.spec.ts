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
  const voteButton = page.getByRole("button", { name: "Vote yes" }).first();
  if (await voteButton.isVisible()) {
    await voteButton.click();
    await expect(page).toHaveURL(/approvals\?voted=1/);
  } else {
    await expect(page.getByText(/You voted/).first()).toBeVisible();
  }
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
  await page.getByRole("button", { name: "en", exact: true }).click();
  await page.getByRole("menuitem", { name: /Russian/ }).click();
  await expect(page).toHaveURL(/\/ru\/dashboard/);
  await expect(page.getByText("Пилотный MVP")).toBeVisible();
});

test("resident can request access for a building", async ({ page }) => {
  const email = `resident-${Date.now()}@example.kz`;

  await page.goto("/en/register");
  await page.getByLabel("Full name").fill("Test Resident");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("resident123");
  await page.getByLabel("Unit or apartment").fill("18A");
  await page.getByLabel("Access evidence").fill("Owner of unit 18A requesting resident oversight access.");
  await page.getByRole("button", { name: "Submit access request" }).click();
  await expect(page).toHaveURL(/login\?registered=1/);

  await login(page, "manager@shanyraq.kz", "manager123");
  await page.getByRole("link", { name: "Access" }).click();
  await expect(page.getByText(email)).toBeVisible();
});
