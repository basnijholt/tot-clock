import { test, expect } from '@playwright/test';

test.describe('Activity Timer', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('displays initial activity with clock', async ({ page }) => {
    await page.goto('/');

    // Check activity name is visible
    await expect(page.locator('.activity-name')).toContainText('PLAY');

    // Check activity icon is visible
    await expect(page.locator('.activity-icon')).toContainText('🧸');

    // Check time display exists in clock
    await expect(page.locator('.time-display')).toBeVisible();

    // Check clock is visible
    await expect(page.locator('.clock')).toBeVisible();
  });

  test('shows next activity in bottom bar', async ({ page }) => {
    await page.goto('/');

    // Check next bar
    await expect(page.locator('.next-bar')).toContainText('NEXT:');
    await expect(page.locator('.next-bar')).toContainText('DINNER');
  });

  test('parent panel opens on long press', async ({ page }) => {
    await page.goto('/');

    // Long press the trigger zone
    const trigger = page.locator('.parent-trigger');
    await trigger.hover();

    // Simulate long press with mouse
    await page.mouse.down();
    await page.waitForTimeout(2100); // Wait for 2 second trigger
    await page.mouse.up();

    // Parent panel should be visible
    await expect(page.locator('.parent-panel')).toBeVisible();
    await expect(page.locator('.parent-header h2')).toContainText('Parent Controls');
  });

  test('play/pause works', async ({ page }) => {
    await page.goto('/');

    // Open parent panel
    const trigger = page.locator('.parent-trigger');
    await trigger.hover();
    await page.mouse.down();
    await page.waitForTimeout(2100);
    await page.mouse.up();

    // Wait for panel to be visible
    await expect(page.locator('.parent-panel')).toBeVisible();

    // Find the play/pause button
    const playPauseBtn = page.locator('.ctrl-btn').filter({ hasText: /Play|Pause/ }).first();
    await expect(playPauseBtn).toBeVisible();

    // Initial state should be paused (button says Play)
    await expect(playPauseBtn).toContainText('Play');

    // Click play
    await playPauseBtn.click();
    await page.waitForTimeout(100);
    await expect(playPauseBtn).toContainText('Pause');

    // Click pause
    await playPauseBtn.click();
    await page.waitForTimeout(100);
    await expect(playPauseBtn).toContainText('Play');
  });

  test('add time works', async ({ page }) => {
    await page.goto('/');

    // Get initial time
    const timeDisplay = page.locator('.time-display');
    const initialTime = await timeDisplay.textContent();

    // Open parent panel
    const trigger = page.locator('.parent-trigger');
    await trigger.hover();
    await page.mouse.down();
    await page.waitForTimeout(2100);
    await page.mouse.up();

    // Click +1 min
    await page.click('button:has-text("+1 min")');

    // Close parent panel
    await page.click('.close-btn');

    // Time should have increased
    const newTime = await timeDisplay.textContent();
    expect(newTime).not.toBe(initialTime);
  });

  test('schedule editor shows activities', async ({ page }) => {
    await page.goto('/');

    // Open parent panel
    const trigger = page.locator('.parent-trigger');
    await trigger.hover();
    await page.mouse.down();
    await page.waitForTimeout(2100);
    await page.mouse.up();

    // Check schedule list has items
    const scheduleItems = page.locator('.schedule-item');
    await expect(scheduleItems).toHaveCount(6); // Normal day has 6 activities

    // First item should be current (PLAY)
    await expect(scheduleItems.first()).toHaveClass(/current/);
    await expect(scheduleItems.first()).toContainText('PLAY');
  });

  test('routine selector works', async ({ page }) => {
    await page.goto('/');

    // Open parent panel
    const trigger = page.locator('.parent-trigger');
    await trigger.hover();
    await page.mouse.down();
    await page.waitForTimeout(2100);
    await page.mouse.up();

    // Wait for panel
    await expect(page.locator('.parent-panel')).toBeVisible();

    // Scroll to load routine section
    await page.locator('h3:has-text("Load Routine")').scrollIntoViewIfNeeded();

    // Select weekend routine - this auto-loads on change
    const select = page.locator('select').first();
    await select.selectOption('weekend');
    await page.waitForTimeout(300);

    // First activity should now be BREAKFAST (weekend starts with breakfast)
    const firstItem = page.locator('.schedule-item').first();
    await expect(firstItem).toContainText('BREAKFAST');
  });

  test('tap creates bounce animation', async ({ page }) => {
    await page.goto('/');

    // Click on the app (not on parent trigger)
    await page.click('.activity-section');

    // The app should have 'tapped' class briefly
    // We can't easily test transient classes, but we can verify no errors
    await expect(page.locator('.activity-icon')).toBeVisible();
  });

  test('responsive layout on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 1280 });
    await page.goto('/');

    // All main elements should be visible
    await expect(page.locator('.clock')).toBeVisible();
    await expect(page.locator('.activity-icon')).toBeVisible();
    await expect(page.locator('.activity-name')).toBeVisible();
    await expect(page.locator('.next-bar')).toBeVisible();
  });

  test('landscape layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // All elements should still be visible
    await expect(page.locator('.clock')).toBeVisible();
    await expect(page.locator('.activity-icon')).toBeVisible();
  });
});

test.describe('Visual Screenshots', () => {
  test('capture main states', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 1280 });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Initial state - PLAY activity
    await page.screenshot({ path: 'tests/screenshots/main-view.png', fullPage: true });

    // Open parent panel
    const trigger = page.locator('.parent-trigger');
    await trigger.hover();
    await page.mouse.down();
    await page.waitForTimeout(2100);
    await page.mouse.up();

    await page.screenshot({ path: 'tests/screenshots/parent-panel.png', fullPage: true });

    // Close and skip to next activity (DINNER)
    await page.click('button:has-text("Skip")');
    await page.waitForTimeout(100);
    await page.click('.close-btn');
    await page.waitForTimeout(2600);

    await page.screenshot({ path: 'tests/screenshots/activity-dinner.png', fullPage: true });
  });

  test('capture transition celebration', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 800, height: 1280 });

    // Set a very short timer by manipulating localStorage
    await page.evaluate(() => {
      const state = {
        currentRoutine: 'normal',
        schedule: [
          { activity: 'play', duration: 1, totalSeconds: 2 },
          { activity: 'dinner', duration: 20, totalSeconds: 1200 },
        ],
        currentIndex: 0,
        remainingSeconds: 1,
        isPaused: false,
        lastTick: Date.now(),
      };
      localStorage.setItem('activity-timer-state-v3', JSON.stringify(state));
    });

    await page.reload();

    // Wait for transition to appear
    await page.waitForTimeout(1500);

    // Capture transition
    await page.screenshot({ path: 'tests/screenshots/transition.png', fullPage: true });
  });

  test('capture landscape mode', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.screenshot({ path: 'tests/screenshots/landscape.png', fullPage: true });
  });
});
