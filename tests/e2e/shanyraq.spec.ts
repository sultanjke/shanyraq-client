import { expect, type Page, test } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/en/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/dashboard/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Apartment construction/ })).toBeVisible();
}

test("public landing page exposes localized entry points", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);

  await page.goto("/en");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("heading", { name: /Transparent apartment governance/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" }).first()).toHaveAttribute("href", "/en/login");
  await expect(page.getByRole("link", { name: "Request access" }).first()).toHaveAttribute("href", "/en/register");

  await page.getByRole("button", { name: "en", exact: true }).click();
  await page.getByRole("menuitem", { name: /Russian/ }).click();
  await expect(page).toHaveURL(/\/ru$/);
  await expect(page.getByRole("heading", { name: /Прозрачное управление/ })).toBeVisible();

  const hadDarkTheme = await page.locator("html").evaluate((element) => element.classList.contains("dark"));
  await page.getByRole("button", { name: /Switch to (light|dark) theme/ }).click();
  await expect
    .poll(() => page.locator("html").evaluate((element) => element.classList.contains("dark")))
    .toBe(!hadDarkTheme);
});

test("register page supports Russian and Kazakh", async ({ page }) => {
  await page.goto("/ru/register");
  await expect(page.getByRole("heading", { name: "Запросить доступ" })).toBeVisible();
  await expect(page.getByLabel("Полное имя")).toBeVisible();
  await expect(page.getByRole("button", { name: "ru", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "ru", exact: true }).click();
  await page.getByRole("menuitem", { name: /Kazakh/ }).click();
  await expect(page).toHaveURL(/\/kk\/register/);
  await expect(page.getByRole("heading", { name: "Қолжетімділік сұрау" })).toBeVisible();
  await expect(page.getByLabel("Толық аты-жөні")).toBeVisible();
});

test("resident can vote and see audit navigation", async ({ page }) => {
  await login(page, "resident@shanyraq.kz", "resident123");
  await page.getByRole("link", { name: "Approvals" }).click();
  await expect(page).toHaveURL(/\/en\/approvals/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Resident participation" })).toBeVisible();
  const voteButton = page.getByRole("button", { name: "Vote yes" }).first();
  if (await voteButton.isVisible()) {
    await voteButton.click();
    await expect(page).toHaveURL(/approvals\?voted=1/, { timeout: 15_000 });
  } else {
    await expect(page.getByText(/Quorum/).first()).toBeVisible();
  }
  await page.getByRole("link", { name: "Audit trail" }).click();
  await expect(page).toHaveURL(/\/en\/audit/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Hash-chain audit trail" })).toBeVisible();
});

test("manager can publish finance report", async ({ page }) => {
  await login(page, "manager@shanyraq.kz", "manager123");
  await page.getByRole("link", { name: "Finance" }).click();
  await expect(page).toHaveURL(/\/en\/finance/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Transparent financial reporting" })).toBeVisible();
  const publishButton = page.getByRole("button", { name: "Publish monthly report" });
  if (await publishButton.isVisible()) {
    await publishButton.click();
    await expect(page).toHaveURL(/finance\?published=1/, { timeout: 15_000 });
  } else {
    await expect(page.getByText("Published").first()).toBeVisible();
  }
});

test("auditor can run checks and verify documents", async ({ page }) => {
  await login(page, "auditor@shanyraq.kz", "auditor123");
  await page.getByRole("button", { name: "Run consistency checks" }).click();
  await expect(page).toHaveURL(/dashboard\?checked=1/, { timeout: 15_000 });
  await page.getByRole("link", { name: "Documents" }).click();
  await expect(page).toHaveURL(/\/en\/documents/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Land and construction documents" })).toBeVisible();
  const verifyButton = page.getByRole("button", { name: "Verify" }).first();
  if (await verifyButton.isVisible()) {
    await verifyButton.click();
    await expect(page).toHaveURL(/documents\?verified=1/, { timeout: 15_000 });
  } else {
    await expect(page.getByText("Verified").first()).toBeVisible();
  }
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
