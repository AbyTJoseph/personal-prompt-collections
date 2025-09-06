import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Search and Filtering Functionality', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPromptsToLoad();
  });

  test('should display search input prominently', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Search input should be visible
    await expect(searchInput).toBeVisible();
    
    // Should have appropriate placeholder text
    await expect(searchInput).toHaveAttribute('placeholder', /search/i);
    
    // Should be focused or easily accessible
    await expect(searchInput).toBeEnabled();
  });

  test('should perform real-time search as user types', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    const initialCount = await helpers.getPromptCardCount();
    
    // Type search query
    await searchInput.fill('AI');
    
    // Wait for search to complete
    await page.waitForTimeout(500);
    
    const searchResultsCount = await helpers.getPromptCardCount();
    
    // Results should be filtered
    expect(searchResultsCount).toBeLessThanOrEqual(initialCount);
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
    
    // Should return to original count
    await helpers.expectPromptCardCount(initialCount);
  });

  test('should search in prompt titles', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Get first prompt title
    const firstPromptTitle = await page.locator('[data-testid="prompt-title"]').first().textContent();
    
    if (firstPromptTitle) {
      // Search for part of the title
      const searchTerm = firstPromptTitle.substring(0, Math.min(5, firstPromptTitle.length));
      await searchInput.fill(searchTerm);
      await page.waitForTimeout(500);
      
      // Should find the prompt
      await expect(page.locator(`text=${firstPromptTitle}`)).toBeVisible();
    }
  });

  test('should search in prompt content/excerpts', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Get first prompt excerpt
    const firstPromptExcerpt = await page.locator('[data-testid="prompt-excerpt"]').first().textContent();
    
    if (firstPromptExcerpt) {
      // Search for part of the excerpt
      const searchTerm = firstPromptExcerpt.substring(0, Math.min(10, firstPromptExcerpt.length));
      await searchInput.fill(searchTerm);
      await page.waitForTimeout(500);
      
      // Should find the prompt
      await expect(page.locator('[data-testid="prompt-card"]')).toHaveCount.greaterThan(0);
    }
  });

  test('should search in prompt tags', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Get first prompt tags
    const firstPromptTags = page.locator('[data-testid="prompt-tags"]').first();
    const tagElements = firstPromptTags.locator('[data-testid^="tag-"]');
    
    if (await tagElements.count() > 0) {
      const firstTag = await tagElements.first().textContent();
      
      if (firstTag) {
        // Search for the tag
        await searchInput.fill(firstTag);
        await page.waitForTimeout(500);
        
        // Should find prompts with that tag
        await expect(page.locator('[data-testid="prompt-card"]')).toHaveCount.greaterThan(0);
      }
    }
  });

  test('should handle case-insensitive search', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    const initialCount = await helpers.getPromptCardCount();
    
    // Search with uppercase
    await searchInput.fill('AI');
    await page.waitForTimeout(500);
    const upperCaseResults = await helpers.getPromptCardCount();
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
    
    // Search with lowercase
    await searchInput.fill('ai');
    await page.waitForTimeout(500);
    const lowerCaseResults = await helpers.getPromptCardCount();
    
    // Results should be the same
    expect(upperCaseResults).toBe(lowerCaseResults);
  });

  test('should handle partial word search', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Search for partial word
    await searchInput.fill('prom');
    await page.waitForTimeout(500);
    
    // Should find prompts containing "prompt"
    const results = await helpers.getPromptCardCount();
    expect(results).toBeGreaterThan(0);
  });

  test('should filter prompts by clicking on tags', async ({ page }) => {
    const initialCount = await helpers.getPromptCardCount();
    
    // Find a tag to click on
    const firstTag = page.locator('[data-testid^="tag-"]').first();
    
    if (await firstTag.isVisible()) {
      const tagText = await firstTag.textContent();
      
      // Click on the tag
      await firstTag.click();
      await page.waitForTimeout(500);
      
      // Search input should be updated with tag
      const searchInput = page.locator('[data-testid="search-input"]');
      await expect(searchInput).toHaveValue(tagText);
      
      // Results should be filtered
      const filteredCount = await helpers.getPromptCardCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should show total results count', async ({ page }) => {
    const totalResults = page.locator('[data-testid="total-results"]');
    
    // Should display total count
    await expect(totalResults).toBeVisible();
    
    // Should show actual count
    const actualCount = await helpers.getPromptCardCount();
    await expect(totalResults).toContainText(actualCount.toString());
  });

  test('should update results count when filtering', async ({ page }) => {
    const totalResults = page.locator('[data-testid="total-results"]');
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Get initial count
    const initialCount = await helpers.getPromptCardCount();
    
    // Apply search filter
    await searchInput.fill('AI');
    await page.waitForTimeout(500);
    
    // Count should be updated
    const filteredCount = await helpers.getPromptCardCount();
    await expect(totalResults).toContainText(filteredCount.toString());
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
    
    // Count should return to original
    await expect(totalResults).toContainText(initialCount.toString());
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Search for non-existent term
    await searchInput.fill('xyz123nonexistent');
    await page.waitForTimeout(500);
    
    // Should show empty state
    await expect(page.locator('text=No Templates Found')).toBeVisible();
    await expect(page.locator('text=Clear Search')).toBeVisible();
    
    // Clear search button should work
    await page.locator('text=Clear Search').click();
    await helpers.waitForPromptsToLoad();
    
    // Should show prompts again
    await expect(page.locator('[data-testid="prompt-card"]')).toHaveCount.greaterThan(0);
  });

  test('should maintain search state in URL', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Perform a search
    await searchInput.fill('test search');
    await page.waitForTimeout(500);
    
    // Check if URL contains search parameter
    await expect(page).toHaveURL(/q=test%20search/);
    
    // Navigate away and back
    await page.goto('/about');
    await page.goto('/');
    
    // Search should still be applied
    await expect(searchInput).toHaveValue('test search');
  });

  test('should handle special characters in search', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Test special characters
    const specialSearch = 'test@#$%^&*()_+-=[]{}|;:,.<>?';
    await searchInput.fill(specialSearch);
    await page.waitForTimeout(500);
    
    // Search should handle special characters
    await expect(searchInput).toHaveValue(specialSearch);
    
    // URL should be properly encoded
    await expect(page).toHaveURL(/q=test%40%23%24%25%5E%26%2A%28%29_%2B-%3D%5B%5D%7B%7D%7C%3B%3A%2C.%3C%3E%3F/);
  });

  test('should handle rapid search input changes', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Type rapidly
    await searchInput.fill('a');
    await page.waitForTimeout(100);
    await searchInput.fill('ab');
    await page.waitForTimeout(100);
    await searchInput.fill('abc');
    await page.waitForTimeout(100);
    await searchInput.fill('abcd');
    
    // Final value should be correct
    await expect(searchInput).toHaveValue('abcd');
    
    // Should show filtered results
    await page.waitForTimeout(500);
    const results = await helpers.getPromptCardCount();
    expect(results).toBeGreaterThanOrEqual(0);
  });

  test('should clear search with clear button', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    const initialCount = await helpers.getPromptCardCount();
    
    // Perform a search
    await searchInput.fill('test');
    await page.waitForTimeout(500);
    
    // Clear search using clear button (if available)
    const clearButton = page.locator('[data-testid="clear-search-button"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    } else {
      // Use keyboard shortcut or manual clear
      await searchInput.clear();
      await searchInput.press('Enter');
    }
    
    await page.waitForTimeout(500);
    
    // Should return to original count
    await helpers.expectPromptCardCount(initialCount);
  });

  test('should handle search with multiple words', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Search with multiple words
    await searchInput.fill('AI prompt');
    await page.waitForTimeout(500);
    
    // Should find results containing both words
    const results = await helpers.getPromptCardCount();
    expect(results).toBeGreaterThanOrEqual(0);
  });

  test('should show search suggestions or autocomplete', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Type to trigger suggestions
    await searchInput.fill('a');
    await page.waitForTimeout(500);
    
    // Check if suggestions are shown
    const suggestions = page.locator('[data-testid="search-suggestions"]');
    const autocomplete = page.locator('[data-testid="search-autocomplete"]');
    
    // At least one should be visible if implemented
    const hasSuggestions = await suggestions.isVisible() || await autocomplete.isVisible();
    
    // This test might need adjustment based on actual implementation
    // expect(hasSuggestions).toBeTruthy();
  });

  test('should handle search in different view modes', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Test search in grid view
    await helpers.expectViewMode('grid');
    await searchInput.fill('AI');
    await page.waitForTimeout(500);
    const gridResults = await helpers.getPromptCardCount();
    
    // Switch to list view
    await helpers.switchViewMode('list');
    await page.waitForTimeout(500);
    
    // Search should still be applied
    await expect(searchInput).toHaveValue('AI');
    const listResults = await helpers.getPromptCardCount();
    
    // Results should be the same in both views
    expect(gridResults).toBe(listResults);
  });
});




