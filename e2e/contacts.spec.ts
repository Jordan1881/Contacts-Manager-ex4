import { test, expect } from "@playwright/test";

test.describe("Contacts Manager E2E", () => {
  test("lists seeded contacts", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("contact-list")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("contact-row").first()).toBeVisible();
    await expect(page.getByTestId("list-total")).toContainText("contact");
  });

  test("create → view → edit → delete flow", async ({ page }) => {
    const unique = `E2E User ${Date.now()}`;
    const phone = `+1-555-${String(Date.now()).slice(-4)}`;

    await page.goto("/");
    await page.getByTestId("btn-show-create").click();
    await page.getByTestId("input-name").fill(unique);
    await page.getByTestId("input-phone").fill(phone);
    await page.getByTestId("input-email").fill("e2e@example.com");
    await page.getByTestId("btn-submit").click();

    await expect(page.getByText(unique).first()).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole("link", { name: unique }).click();
    await expect(page.getByTestId("detail-name")).toHaveText(unique);

    await page.getByTestId("input-notes").fill("Updated by Playwright");
    await page.getByTestId("btn-submit").click();
    await expect(page.getByText("Contact updated")).toBeVisible({
      timeout: 10_000,
    });

    await page.getByTestId("btn-delete-detail").click();
    await expect(page.getByTestId("delete-dialog")).toBeVisible();
    await page.getByTestId("btn-delete-confirm").click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: unique })).toHaveCount(0);
  });

  test("search filters contacts", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("input-search").fill("Ada");
    await page.getByTestId("btn-search").click();
    await expect(page.getByTestId("contact-row")).toHaveCount(1, {
      timeout: 10_000,
    });
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
  });

  test("favorites filter", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("filter-favorites").check();
    await expect(page.getByTestId("contact-list")).toBeVisible({
      timeout: 10_000,
    });
    const rows = page.getByTestId("contact-row");
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("validation error on missing phone", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("btn-show-create").click();
    await page.getByTestId("input-name").fill("No Phone Person");
    await page.getByTestId("btn-submit").click();
    await expect(page.getByText(/phone/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
