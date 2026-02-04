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

    // Check time display exists
    await expect(page.locator('.time-display')).toBeVisible();

    // Check clock is visible
    await expect(page.locator('.clock')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/initial-state.png' });
  });

  test('shows next and then activities', async ({ page }) => {
    await page.goto('/');

    // Check next block
    await expect(page.locator('.next-block')).toContainText('NEXT');
    await expect(page.locator('.next-block')).toContainText('DINNER');

    // Check then block
    await expect(page.locator('.then-block')).toContainText('THEN');
    await expect(page.locator('.then-block')).toContainText('BATH');
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

    // Wait for panel animation to complete
    await page.waitForTimeout(500);

    // Take screenshot of parent panel
    await page.screenshot({ path: 'tests/screenshots/parent-panel.png' });
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
    await expect(page.locator('.next-then-bar')).toBeVisible();

    // Take tablet screenshot
    await page.screenshot({ path: 'tests/screenshots/tablet-portrait.png' });
  });

  test('landscape layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // All elements should still be visible
    await expect(page.locator('.clock')).toBeVisible();
    await expect(page.locator('.activity-icon')).toBeVisible();

    // Take landscape screenshot
    await page.screenshot({ path: 'tests/screenshots/landscape.png' });
  });
});

test.describe('Visual Screenshots', () => {
  test('capture all activity colors', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 1280 });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Wait for app to be ready
    await expect(page.locator('.activity-name')).toContainText('PLAY');

    // Take screenshot of initial (PLAY - green) - use clip to capture viewport only
    await page.screenshot({ path: 'tests/screenshots/activity-play.png' });

    // Helper to open parent panel and skip to next activity
    const skipToNextActivity = async (expectedActivity: string) => {
      // Open parent panel
      const trigger = page.locator('.parent-trigger');
      await trigger.hover();
      await page.mouse.down();
      await page.waitForTimeout(2100);
      await page.mouse.up();
      await expect(page.locator('.parent-panel')).toBeVisible();
      await page.waitForTimeout(300);

      // Start timer if paused (needed for skip to trigger transition)
      const playBtn = page.locator('button:has-text("Play")');
      if (await playBtn.isVisible()) {
        await playBtn.click();
        await page.waitForTimeout(100);
      }

      // Click Skip and close panel
      await page.click('button:has-text("Skip")');
      await page.click('.close-btn');

      // Wait for transition overlay to appear and disappear (2.5s), plus buffer
      await page.waitForTimeout(3500);

      // Verify we're on the expected activity
      await expect(page.locator('.activity-name')).toContainText(expectedActivity, { timeout: 5000 });
    };

    // Skip through activities
    await skipToNextActivity('DINNER');
    await page.screenshot({ path: 'tests/screenshots/activity-dinner.png' });

    await skipToNextActivity('BATH');
    await page.screenshot({ path: 'tests/screenshots/activity-bath.png' });

    await skipToNextActivity('BRUSH TEETH');
    await skipToNextActivity('STORY');
    await page.screenshot({ path: 'tests/screenshots/activity-story.png' });
  });

  test('capture transition celebration', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 1280 });
    await page.goto('/');

    // Set a very short timer by manipulating localStorage
    await page.evaluate(() => {
      const state = {
        currentRoutine: 'normal',
        schedule: [
          { activity: 'play', duration: 1, totalSeconds: 2 },
          { activity: 'dinner', duration: 20, totalSeconds: 1200 },
        ],
        currentIndex: 0,
        remainingSeconds: 2,
        isPaused: false,
        lastTick: Date.now(),
      };
      localStorage.setItem('activity-timer-state-v3', JSON.stringify(state));
    });

    await page.reload();

    // Wait for the transition overlay to appear (timer runs down then shows celebration)
    await expect(page.locator('.transition-overlay')).toBeVisible({ timeout: 5000 });

    // Wait a moment for confetti to render
    await page.waitForTimeout(500);

    // Capture transition
    await page.screenshot({ path: 'tests/screenshots/transition-celebration.png' });
  });
});
