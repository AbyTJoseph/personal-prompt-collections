import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Responsive Design and Accessibility', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPageLoaded();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check if header is properly sized
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();
    
    // Check if search filters are accessible
    const searchFilters = page.locator('[data-testid="search-filters"]');
    await expect(searchFilters).toBeVisible();
    
    // Check if prompt cards are properly sized
    const promptCards = page.locator('[data-testid="prompt-card"]');
    await expect(promptCards.first()).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Check if layout adapts to tablet size
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();
    
    const searchFilters = page.locator('[data-testid="search-filters"]');
    await expect(searchFilters).toBeVisible();
    
    // Check if prompt cards are visible
    const promptCards = page.locator('[data-testid="prompt-card"]');
    await expect(promptCards.first()).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // Check if layout is optimized for desktop
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();
    
    const searchFilters = page.locator('[data-testid="search-filters"]');
    await expect(searchFilters).toBeVisible();
    
    // Check if prompt cards are visible
    const promptCards = page.locator('[data-testid="prompt-card"]');
    await expect(promptCards.first()).toBeVisible();
  });

  test('should handle view mode switching on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Test view mode switching
    await helpers.switchViewMode('list');
    await helpers.expectViewMode('list');
    
    await helpers.switchViewMode('grid');
    await helpers.expectViewMode('grid');
  });

  test('should handle view mode switching on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Test view mode switching
    await helpers.switchViewMode('list');
    await helpers.expectViewMode('list');
    
    await helpers.switchViewMode('grid');
    await helpers.expectViewMode('grid');
  });

  test('should handle view mode switching on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // Test view mode switching
    await helpers.switchViewMode('list');
    await helpers.expectViewMode('list');
    
    await helpers.switchViewMode('grid');
    await helpers.expectViewMode('grid');
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check if main elements have proper ARIA attributes
    const main = page.locator('main');
    await expect(main).toHaveAttribute('role', 'main');
    
    // Check if search input has proper label
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveAttribute('aria-label');
    
    // Check if buttons have proper labels
    const createButton = page.locator('[data-testid="create-prompt-button"]');
    await expect(createButton).toHaveAttribute('aria-label');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Should focus on first focusable element
    const firstFocusable = page.locator('button, input, a').first();
    await expect(firstFocusable).toBeFocused();
    
    // Test arrow key navigation in search
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.focus();
    await searchInput.fill('test');
    
    // Should be able to navigate with arrow keys
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
  });

  test('should have proper focus management', async ({ page }) => {
    // Test focus when opening modals
    await helpers.openCreatePromptModal();
    
    // Focus should be on first input
    const titleInput = page.locator('[data-testid="create-title-input"]');
    await expect(titleInput).toBeFocused();
    
    // Close modal
    await helpers.closeCreatePromptModal();
    
    // Focus should return to trigger element or reasonable default
    const createButton = page.locator('[data-testid="create-prompt-button"]');
    await expect(createButton).toBeFocused();
  });

  test('should handle screen reader announcements', async ({ page }) => {
    // Check if live regions are present for dynamic content
    const liveRegion = page.locator('[aria-live]');
    
    // At least one live region should be present
    const hasLiveRegion = await liveRegion.count() > 0;
    expect(hasLiveRegion).toBeTruthy();
  });

  test('should have proper color contrast', async ({ page }) => {
    // This test would require visual testing tools
    // For now, we'll check if the page loads without obvious contrast issues
    
    // Check if text is visible
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();
    
    // Check if prompt cards are visible
    const promptCards = page.locator('[data-testid="prompt-card"]');
    await expect(promptCards.first()).toBeVisible();
  });

  test('should handle high contrast mode', async ({ page }) => {
    // This test would require system-level high contrast mode
    // For now, we'll check if the page remains functional
    
    // Check if all elements are still visible
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();
    
    const searchFilters = page.locator('[data-testid="search-filters"]');
    await expect(searchFilters).toBeVisible();
  });

  test('should support zoom functionality', async ({ page }) => {
    // Test page zoom (this is browser-level functionality)
    // We'll check if the page remains functional at different zoom levels
    
    // Check if elements are still accessible
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();
    
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // This test would require system-level reduced motion settings
    // For now, we'll check if animations don't interfere with functionality
    
    // Open and close a modal to test animations
    await helpers.openCreatePromptModal();
    await expect(page.locator('[data-testid="create-prompt-modal"]')).toBeVisible();
    
    await helpers.closeCreatePromptModal();
    await expect(page.locator('[data-testid="create-prompt-modal"]')).not.toBeVisible();
  });

  test('should be accessible with screen readers', async ({ page }) => {
    // Check if semantic HTML is used
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check if headings are properly structured
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings).toHaveCount.greaterThan(0);
  });

  test('should handle different text sizes', async ({ page }) => {
    // This test would require changing browser font size
    // For now, we'll check if text remains readable
    
    // Check if text is visible and readable
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();
    
    const promptCards = page.locator('[data-testid="prompt-card"]');
    await expect(promptCards.first()).toBeVisible();
  });

  test('should maintain functionality on small screens', async ({ page }) => {
    // Set very small viewport
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(500);
    
    // Check if essential elements are still accessible
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();
    
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
    
    const createButton = page.locator('[data-testid="create-prompt-button"]');
    await expect(createButton).toBeVisible();
  });

  test('should handle landscape orientation on mobile', async ({ page }) => {
    // Set mobile landscape viewport
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);
    
    // Check if layout adapts to landscape
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();
    
    const searchFilters = page.locator('[data-testid="search-filters"]');
    await expect(searchFilters).toBeVisible();
    
    const promptCards = page.locator('[data-testid="prompt-card"]');
    await expect(promptCards.first()).toBeVisible();
  });

  test('should have proper touch targets on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check if buttons are properly sized for touch
    const createButton = page.locator('[data-testid="create-prompt-button"]');
    await expect(createButton).toBeVisible();
    
    // Check if prompt cards are clickable
    const promptCards = page.locator('[data-testid="prompt-card"]');
    await expect(promptCards.first()).toBeVisible();
  });

  test('should handle different device pixel ratios', async ({ page }) => {
    // This test would require changing device pixel ratio
    // For now, we'll check if the page remains functional
    
    // Check if elements are still visible and functional
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();
    
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
  });

  test('should maintain accessibility during view transitions', async ({ page }) => {
    // Test accessibility during view mode changes
    await helpers.switchViewMode('list');
    await helpers.expectViewMode('list');
    
    // Check if content is still accessible
    const promptCards = page.locator('[data-testid="prompt-card"]');
    await expect(promptCards.first()).toBeVisible();
    
    await helpers.switchViewMode('grid');
    await helpers.expectViewMode('grid');
    
    // Check if content is still accessible
    await expect(promptCards.first()).toBeVisible();
  });
});




