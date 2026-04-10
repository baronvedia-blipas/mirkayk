import { test, expect } from "@playwright/test";

test.describe("Project Management", () => {
  test("projects page loads and shows existing project", async ({ page }) => {
    await page.goto("/dashboard/projects");

    // Wait for hydration — the seeded project should be visible
    await expect(page.locator("text=mirkayk v1").first()).toBeVisible({ timeout: 10_000 });
  });

  test("create a new project", async ({ page }) => {
    await page.goto("/dashboard/projects");

    // Wait for page hydration
    await expect(page.locator("text=mirkayk v1").first()).toBeVisible({ timeout: 10_000 });

    // Click "New Project" button
    await page.click('button:has-text("New Project")');

    // Fill the form — uses name attributes
    await page.fill('input[name="name"]', "E2E Project");
    await page.fill('textarea[name="description"]', "Created by Playwright");

    // Submit
    await page.click('button:has-text("Create Project")');

    // Verify project appears
    await expect(page.locator("text=E2E Project").first()).toBeVisible({ timeout: 5_000 });
  });
});
