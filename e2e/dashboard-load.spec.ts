import { test, expect } from "@playwright/test";

test.describe("Dashboard Load", () => {
  test("renders dashboard with agents and tasks from database", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for hydration — agent names should appear
    await expect(page.locator("text=PM Agent").first()).toBeVisible({ timeout: 10_000 });

    // Verify multiple agents render
    await expect(page.locator("text=Architect").first()).toBeVisible();
    await expect(page.locator("text=Frontend").first()).toBeVisible();
  });

  test("tasks page shows tasks from database", async ({ page }) => {
    await page.goto("/dashboard/tasks");

    // Wait for task list to hydrate
    await expect(page.locator("text=Design database schema").first()).toBeVisible({ timeout: 10_000 });
  });
});
