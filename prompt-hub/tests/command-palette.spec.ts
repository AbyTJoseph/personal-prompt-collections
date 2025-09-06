import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Command Palette Functionality', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPromptsToLoad();
  });

  test('should open command palette with Ctrl+K shortcut', { tag: '@P1' }, async ({ page }) => {
    // Open command palette
    await helpers.openCommandPalette();
    
    // Check if command palette is visible
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
    
    // Check if search input is focused
    const searchInput = page.locator('[data-testid="command-search-input"]');
    await expect(searchInput).toBeFocused();
  });

  test('should open command palette with Cmd+K shortcut on Mac', { tag: '@P2' }, async ({ page }) => {
    // Simulate Mac keyboard shortcut
    await page.keyboard.press('Meta+k');
    
    // Check if command palette is visible
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
  });

  test('should close command palette with Escape key', { tag: '@P1' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    // Press Escape to close
    await helpers.closeCommandPalette();
    
    // Command palette should be hidden
    await expect(page.locator('[data-testid="command-palette"]')).not.toBeVisible();
  });

  test('should close command palette when clicking outside', { tag: '@P2' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    // Click outside the command palette
    await page.locator('[data-testid="command-palette-backdrop"]').click();
    
    // Command palette should be hidden
    await expect(page.locator('[data-testid="command-palette"]')).not.toBeVisible();
  });

  test('should display command palette with search input', { tag: '@P1' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    // Check if search input is present
    await expect(page.locator('[data-testid="command-search-input"]')).toBeVisible();
    
    // Check if placeholder text is correct
    const searchInput = page.locator('[data-testid="command-search-input"]');
    await expect(searchInput).toHaveAttribute('placeholder', /search/i);
  });

  test('should search and filter commands', { tag: '@P1' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    const searchInput = page.locator('[data-testid="command-search-input"]');
    
    // Type in search
    await searchInput.fill('create');
    
    // Should show filtered results
    await expect(page.locator('[data-testid="command-item"]')).toContainText('create', { ignoreCase: true });
    
    // Clear search
    await searchInput.clear();
    
    // Should show all commands
    await expect(page.locator('[data-testid="command-item"]')).toBeVisible();
  });

  test('should navigate through commands with arrow keys', { tag: '@P2' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    // Press down arrow to select first command
    await page.keyboard.press('ArrowDown');
    
    // First command should be highlighted
    const firstCommand = page.locator('[data-testid="command-item"]').first();
    await expect(firstCommand).toHaveClass(/selected/);
    
    // Press down arrow again to select second command
    await page.keyboard.press('ArrowDown');
    
    // Second command should be highlighted
    const secondCommand = page.locator('[data-testid="command-item"]').nth(1);
    await expect(secondCommand).toHaveClass(/selected/);
    
    // Press up arrow to go back to first
    await page.keyboard.press('ArrowUp');
    await expect(firstCommand).toHaveClass(/selected/);
  });

  test('should execute command with Enter key', { tag: '@P1' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    // Search for create command
    const searchInput = page.locator('[data-testid="command-search-input"]');
    await searchInput.fill('create');
    
    // Select first result
    await page.keyboard.press('ArrowDown');
    
    // Execute command with Enter
    await page.keyboard.press('Enter');
    
    // Command palette should close
    await expect(page.locator('[data-testid="command-palette"]')).not.toBeVisible();
    
    // Create prompt modal should open
    await expect(page.locator('[data-testid="create-prompt-modal"]')).toBeVisible();
  });

  test('should execute command with mouse click', { tag: '@P2' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    // Search for create command
    const searchInput = page.locator('[data-testid="command-search-input"]');
    await searchInput.fill('create');
    
    // Click on first command item
    const firstCommand = page.locator('[data-testid="command-item"]').first();
    await firstCommand.click();
    
    // Command palette should close
    await expect(page.locator('[data-testid="command-palette"]')).not.toBeVisible();
    
    // Create prompt modal should open
    await expect(page.locator('[data-testid="create-prompt-modal"]')).toBeVisible();
  });

  test('should show keyboard shortcuts in command items', { tag: '@P3' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    // Check if command items show keyboard shortcuts
    const commandItems = page.locator('[data-testid="command-item"]');
    
    // At least one command should have a keyboard shortcut
    const hasShortcuts = await commandItems.locator('[data-testid="command-shortcut"]').count() > 0;
    expect(hasShortcuts).toBeTruthy();
  });

  test('should handle empty search results', { tag: '@P2' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    const searchInput = page.locator('[data-testid="command-search-input"]');
    
    // Search for non-existent term
    await searchInput.fill('xyz123nonexistent');
    
    // Should show no results message
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
    await expect(page.locator('text=No commands found')).toBeVisible();
  });

  test('should maintain focus in search input', { tag: '@P2' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    const searchInput = page.locator('[data-testid="command-search-input"]');
    
    // Type something
    await searchInput.fill('test');
    
    // Focus should remain in search input
    await expect(searchInput).toBeFocused();
    
    // Clear and type again
    await searchInput.clear();
    await searchInput.fill('another test');
    
    // Focus should still be in search input
    await expect(searchInput).toBeFocused();
  });

  test('should handle special characters in search', { tag: '@P3' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    const searchInput = page.locator('[data-testid="command-search-input"]');
    
    // Test special characters
    const specialSearch = 'test@#$%^&*()_+-=[]{}|;:,.<>?';
    await searchInput.fill(specialSearch);
    
    // Search should handle special characters gracefully
    await expect(searchInput).toHaveValue(specialSearch);
  });

  test('should show recent commands or suggestions', { tag: '@P3' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    // Check if recent commands or suggestions are shown
    const recentCommands = page.locator('[data-testid="recent-commands"]');
    const suggestions = page.locator('[data-testid="command-suggestions"]');
    
    // At least one of these should be visible
    const hasRecentOrSuggestions = await recentCommands.isVisible() || await suggestions.isVisible();
    expect(hasRecentOrSuggestions).toBeTruthy();
  });

  test('should handle rapid typing in search', { tag: '@P3' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    const searchInput = page.locator('[data-testid="command-search-input"]');
    
    // Type rapidly
    await searchInput.fill('a');
    await page.waitForTimeout(50);
    await searchInput.fill('ab');
    await page.waitForTimeout(50);
    await searchInput.fill('abc');
    await page.waitForTimeout(50);
    await searchInput.fill('abcd');
    
    // Final value should be correct
    await expect(searchInput).toHaveValue('abcd');
  });

  test('should close command palette when navigating away', { tag: '@P2' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    // Navigate to a different page
    await page.goto('/about');
    
    // Command palette should not be visible on new page
    await expect(page.locator('[data-testid="command-palette"]')).not.toBeVisible();
  });

  test('should handle command palette in different viewport sizes', { tag: '@P3' }, async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await helpers.openCommandPalette();
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
    await helpers.closeCommandPalette();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await helpers.openCommandPalette();
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
    await helpers.closeCommandPalette();
    
    // Reset to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
  });

  test('should show appropriate commands based on context', { tag: '@P2' }, async ({ page }) => {
    await helpers.openCommandPalette();
    
    // Check if context-appropriate commands are shown
    const commandItems = page.locator('[data-testid="command-item"]');
    
    // Should show common commands like create, search, etc.
    const commandTexts = await commandItems.allTextContents();
    
    // Check for expected commands
    const hasCreateCommand = commandTexts.some(text => text.toLowerCase().includes('create'));
    const hasSearchCommand = commandTexts.some(text => text.toLowerCase().includes('search'));
    
    expect(hasCreateCommand || hasSearchCommand).toBeTruthy();
  });
});
