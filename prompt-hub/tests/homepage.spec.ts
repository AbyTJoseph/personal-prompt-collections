import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Homepage Functionality', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPromptsToLoad();
  });

  test('should load homepage with prompts', { tag: 'P1' }, async ({ page }) => {
    // Check if the page loads with prompts
    await expect(page.locator('[data-testid="prompt-card"]')).toHaveCount(1);
    
    // Check if header elements are visible
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-filters"]')).toBeVisible();
    
    // Check if search input is present
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
  });

  test('should display search filters correctly', { tag: 'P1' }, async ({ page }) => {
    const searchFilters = page.locator('[data-testid="search-filters"]');
    
    // Check if view mode toggles are present
    await expect(searchFilters.locator('[data-testid="view-toggle-grid"]')).toBeVisible();
    await expect(searchFilters.locator('[data-testid="view-toggle-list"]')).toBeVisible();
    
    // Check if create button is present
    await expect(searchFilters.locator('[data-testid="create-prompt-button"]')).toBeVisible();
    
    // Check if total results count is displayed
    await expect(searchFilters.locator('[data-testid="total-results"]')).toBeVisible();
  });

  test('should switch between grid and list view modes', { tag: 'P2' }, async ({ page }) => {
    // Start with grid view (default)
    await helpers.expectViewMode('grid');
    
    // Switch to list view
    await helpers.switchViewMode('list');
    await helpers.expectViewMode('list');
    
    // Switch back to grid view
    await helpers.switchViewMode('grid');
    await helpers.expectViewMode('grid');
  });

  test('should search prompts effectively', { tag: 'P1' }, async ({ page }) => {
    const initialCount = await helpers.getPromptCardCount();
    
    // Search for a specific term
    await helpers.searchPrompts('AI');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    const searchResultsCount = await helpers.getPromptCardCount();
    
    // Results should be filtered (less than or equal to initial count)
    expect(searchResultsCount).toBeLessThanOrEqual(initialCount);
    
    // Clear search
    await helpers.clearSearch();
    
    // Should return to original count
    await helpers.expectPromptCardCount(initialCount);
  });

  test('should filter prompts by tags', { tag: 'P2' }, async ({ page }) => {
    const initialCount = await helpers.getPromptCardCount();
    
    // Click on a tag (assuming there are tags available)
    const firstTag = page.locator('[data-testid^="tag-"]').first();
    if (await firstTag.isVisible()) {
      await firstTag.click();
      await page.waitForTimeout(500);
      
      const filteredCount = await helpers.getPromptCardCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should handle empty search results', { tag: 'P2' }, async ({ page }) => {
    // Search for a term that likely won't exist
    await helpers.searchPrompts('xyz123nonexistent');
    
    // Should show empty state
    await expect(page.locator('text=No Templates Found')).toBeVisible();
    await expect(page.locator('text=Clear Search')).toBeVisible();
    
    // Clear search should restore results
    await page.locator('text=Clear Search').click();
    await helpers.waitForPromptsToLoad();
    await expect(page.locator('[data-testid="prompt-card"]')).toHaveCount(1);
  });

  test('should refresh catalog successfully', { tag: 'P2' }, async ({ page }) => {
    const initialCount = await helpers.getPromptCardCount();
    
    // Refresh the catalog
    await helpers.refreshCatalog();
    
    // Wait for refresh to complete
    await page.waitForTimeout(2000);
    
    // Should still have prompts after refresh
    await helpers.expectPromptCardCount(initialCount);
  });

  test('should scroll to top when button is clicked', { tag: 'P3' }, async ({ page }) => {
    // Scroll down first
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check if scroll to top button is visible
    const scrollButton = page.locator('[data-testid="scroll-to-top-button"]');
    await expect(scrollButton).toBeVisible();
    
    // Click scroll to top
    await helpers.scrollToTop();
    
    // Check if page scrolled to top
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test('should display prompt cards with correct information', { tag: 'P1' }, async ({ page }) => {
    const firstCard = page.locator('[data-testid="prompt-card"]').first();
    
    // Check if card has title
    await expect(firstCard.locator('[data-testid="prompt-title"]')).toBeVisible();
    
    // Check if card has excerpt
    await expect(firstCard.locator('[data-testid="prompt-excerpt"]')).toBeVisible();
    
    // Check if card has tags
    await expect(firstCard.locator('[data-testid="prompt-tags"]')).toBeVisible();
    
    // Check if card has preview button
    await expect(firstCard.locator('[data-testid="preview-button"]')).toBeVisible();
  });

  test('should handle keyboard shortcuts', { tag: 'P2' }, async ({ page }) => {
    // Test command palette shortcut (Ctrl+K)
    await helpers.openCommandPalette();
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
    
    // Close with Escape
    await helpers.closeCommandPalette();
    await expect(page.locator('[data-testid="command-palette"]')).not.toBeVisible();
  });

  test('should be responsive on different viewport sizes', { tag: 'P3' }, async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check if elements are still visible
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-filters"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Check if elements are still visible
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-filters"]')).toBeVisible();
    
    // Reset to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
  });

  test('should handle loading states correctly', { tag: 'P2' }, async ({ page }) => {
    // Navigate to page and check loading
    await page.goto('/');
    
    // Should show loading initially
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for loading to complete
    await helpers.waitForLoadingToComplete();
    
    // Should show prompts after loading
    await expect(page.locator('[data-testid="prompt-card"]')).toHaveCount(1);
  });

  test('should maintain search state in URL', { tag: 'P2' }, async ({ page }) => {
    // Perform a search
    await helpers.searchPrompts('test');
    
    // Check if URL contains search parameter
    await expect(page).toHaveURL(/q=test/);
    
    // Navigate away and back
    await page.goto('/about');
    await page.goto('/');
    
    // Search should still be applied
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('test');
  });
});
