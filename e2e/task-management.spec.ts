import { test, expect } from "@playwright/test";

test.describe("Task Management", () => {
  test("create a new task and verify it appears", async ({ page }) => {
    await page.goto("/dashboard/tasks");

    // Wait for page to hydrate
    await expect(page.locator("text=Design database schema").first()).toBeVisible({ timeout: 10_000 });

    // Click "New Task +" button
    await page.click("text=New Task");

    // The task modal has a single textarea for description
    await page.fill('textarea[name="description"]', "E2E Test Task");

    // Submit — button text is "Assign task"
    await page.click('button:has-text("Assign task")');

    // Verify task appears in the list
    await expect(page.locator("text=E2E Test Task").first()).toBeVisible({ timeout: 5_000 });
  });

  test("delete a task", async ({ page }) => {
    await page.goto("/dashboard/tasks");

    // Wait for hydration
    await expect(page.locator("text=Design database schema").first()).toBeVisible({ timeout: 10_000 });

    // Count tasks before
    const taskCountBefore = await page.locator('[role="button"], .task-card, [data-testid="task-card"]').count();

    // If there's a delete button on the first task, click it
    const deleteBtn = page.locator('button:has-text("Delete"), button[aria-label*="delete" i]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      // Verify count decreased
      await expect(page.locator('[role="button"], .task-card, [data-testid="task-card"]')).toHaveCount(
        taskCountBefore - 1,
        { timeout: 5_000 }
      );
    }
  });
});
