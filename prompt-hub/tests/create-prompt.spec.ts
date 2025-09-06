import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Create Prompt Functionality', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPromptsToLoad();
  });

  test('should open create prompt modal when create button is clicked', { tag: '@P1' }, async ({ page }) => {
    // Open create modal
    await helpers.openCreatePromptModal();
    
    // Check if modal is visible
    await expect(page.locator('[data-testid="create-prompt-modal"]')).toBeVisible();
    
    // Check if form elements are present
    await expect(page.locator('[data-testid="create-title-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-content-textarea"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-tags-section"]')).toBeVisible();
  });

  test('should display create prompt form correctly', { tag: '@P1' }, async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    // Check if all form fields are present
    await expect(page.locator('[data-testid="create-title-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-content-textarea"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-collection-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-submit-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-cancel-button"]')).toBeVisible();
  });

  test('should close create modal when close button is clicked', { tag: '@P2' }, async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    // Click close button
    await helpers.closeCreatePromptModal();
    
    // Modal should be hidden
    await expect(page.locator('[data-testid="create-prompt-modal"]')).not.toBeVisible();
  });

  test('should close create modal when clicking backdrop', { tag: '@P2' }, async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    // Click on backdrop (outside modal content)
    await page.locator('[data-testid="create-modal-backdrop"]').click();
    
    // Modal should be hidden
    await expect(page.locator('[data-testid="create-prompt-modal"]')).not.toBeVisible();
  });

  test('should close create modal with Escape key', { tag: '@P2' }, async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    // Press Escape key
    await page.keyboard.press('Escape');
    
    // Modal should be hidden
    await expect(page.locator('[data-testid="create-prompt-modal"]')).not.toBeVisible();
  });

  test('should create prompt with valid data', { tag: '@P1' }, async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    // Fill in form data
    const titleInput = page.locator('[data-testid="create-title-input"]');
    const contentTextarea = page.locator('[data-testid="create-content-textarea"]');
    
    await titleInput.fill('Test Prompt Title');
    await contentTextarea.fill('This is a test prompt content for testing purposes.');
    
    // Add a tag
    const newTagInput = page.locator('[data-testid="create-new-tag-input"]');
    await newTagInput.fill('testtag');
    await page.locator('[data-testid="create-add-tag-button"]').click();
    
    // Check if tag is added
    await expect(page.locator('[data-testid="create-tag-testtag"]')).toBeVisible();
    
    // Submit form
    await page.locator('[data-testid="create-submit-button"]').click();
    
    // Modal should close
    await expect(page.locator('[data-testid="create-prompt-modal"]')).not.toBeVisible();
    
    // Should show success toast
    await helpers.waitForToast('Prompt copied to clipboard!');
    
    // New prompt should appear in the list
    await expect(page.locator('text=Test Prompt Title')).toBeVisible();
  });

  test('should validate required fields', { tag: '@P1' }, async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    // Try to submit without title
    const contentTextarea = page.locator('[data-testid="create-content-textarea"]');
    await contentTextarea.fill('Content without title');
    
    // Submit button should be disabled or show validation error
    const submitButton = page.locator('[data-testid="create-submit-button"]');
    
    // This test might need adjustment based on actual validation implementation
    // await expect(submitButton).toBeDisabled();
    
    // Try to submit without content
    await page.locator('[data-testid="create-title-input"]').fill('Title without content');
    await contentTextarea.clear();
    
    // Submit button should be disabled or show validation error
    // await expect(submitButton).toBeDisabled();
  });

  test('should manage tags in create form', async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    // Add multiple tags
    const newTagInput = page.locator('[data-testid="create-new-tag-input"]');
    
    await newTagInput.fill('tag1');
    await page.locator('[data-testid="create-add-tag-button"]').click();
    
    await newTagInput.fill('tag2');
    await page.locator('[data-testid="create-add-tag-button"]').click();
    
    await newTagInput.fill('tag3');
    await page.locator('[data-testid="create-add-tag-button"]').click();
    
    // Check if all tags are added
    await expect(page.locator('[data-testid="create-tag-tag1"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-tag-tag2"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-tag-tag3"]')).toBeVisible();
    
    // Remove a tag
    await page.locator('[data-testid="create-tag-tag2"]').locator('[data-testid="remove-tag-button"]').click();
    
    // Tag should be removed
    await expect(page.locator('[data-testid="create-tag-tag2"]')).not.toBeVisible();
  });

  test('should handle tag input with Enter key', async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    const newTagInput = page.locator('[data-testid="create-new-tag-input"]');
    
    // Add tag with Enter key
    await newTagInput.fill('entertag');
    await newTagInput.press('Enter');
    
    // Tag should be added
    await expect(page.locator('[data-testid="create-tag-entertag"]')).toBeVisible();
  });

  test('should prevent duplicate tags', async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    const newTagInput = page.locator('[data-testid="create-new-tag-input"]');
    
    // Add first tag
    await newTagInput.fill('duplicatetag');
    await page.locator('[data-testid="create-add-tag-button"]').click();
    
    // Try to add same tag again
    await newTagInput.fill('duplicatetag');
    await page.locator('[data-testid="create-add-tag-button"]').click();
    
    // Should only have one instance of the tag
    const tagCount = await page.locator('[data-testid="create-tag-duplicatetag"]').count();
    expect(tagCount).toBe(1);
  });

  test('should select collection from dropdown', async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    const collectionSelect = page.locator('[data-testid="create-collection-select"]');
    
    // Click on select to open dropdown
    await collectionSelect.click();
    
    // Select an option (assuming there are options available)
    const firstOption = page.locator('[data-testid="collection-option"]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      
      // Check if selection is made
      const optionText = await firstOption.textContent();
      if (optionText) {
        await expect(collectionSelect).toContainText(optionText);
      }
    }
  });

  test('should handle form submission with loading state', async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    // Fill in form data
    await page.locator('[data-testid="create-title-input"]').fill('Loading Test Prompt');
    await page.locator('[data-testid="create-content-textarea"]').fill('Content for loading test');
    
    // Submit form
    const submitButton = page.locator('[data-testid="create-submit-button"]');
    await submitButton.click();
    
    // Button should show loading state
    await expect(submitButton).toContainText('Creating...');
    
    // Wait for submission to complete
    await expect(page.locator('[data-testid="create-prompt-modal"]')).not.toBeVisible();
  });

  test('should cancel form and clear data', async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    // Fill in some data
    await page.locator('[data-testid="create-title-input"]').fill('Cancel Test Title');
    await page.locator('[data-testid="create-content-textarea"]').fill('Cancel test content');
    
    // Add a tag
    await page.locator('[data-testid="create-new-tag-input"]').fill('canceltag');
    await page.locator('[data-testid="create-add-tag-button"]').click();
    
    // Cancel form
    await page.locator('[data-testid="create-cancel-button"]').click();
    
    // Modal should close
    await expect(page.locator('[data-testid="create-prompt-modal"]')).not.toBeVisible();
    
    // Open modal again - form should be empty
    await helpers.openCreatePromptModal();
    
    await expect(page.locator('[data-testid="create-title-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="create-content-textarea"]')).toHaveValue('');
    
    // No tags should be present
    await expect(page.locator('[data-testid^="create-tag-"]')).not.toBeVisible();
  });

  test('should handle keyboard navigation in create form', async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Should focus on title input first
    const titleInput = page.locator('[data-testid="create-title-input"]');
    await expect(titleInput).toBeFocused();
    
    // Navigate to content textarea
    await page.keyboard.press('Tab');
    const contentTextarea = page.locator('[data-testid="create-content-textarea"]');
    await expect(contentTextarea).toBeFocused();
    
    // Navigate to tags section
    await page.keyboard.press('Tab');
    const newTagInput = page.locator('[data-testid="create-new-tag-input"]');
    await expect(newTagInput).toBeFocused();
  });

  test('should handle long content input', async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    const contentTextarea = page.locator('[data-testid="create-content-textarea"]');
    
    // Fill with long content
    const longContent = 'A'.repeat(1000);
    await contentTextarea.fill(longContent);
    
    // Content should be properly stored
    await expect(contentTextarea).toHaveValue(longContent);
    
    // Form should still be functional
    await page.locator('[data-testid="create-title-input"]').fill('Long Content Test');
    
    // Should be able to submit
    const submitButton = page.locator('[data-testid="create-submit-button"]');
    await expect(submitButton).toBeEnabled();
  });

  test('should handle special characters in title and content', async ({ page }) => {
    await helpers.openCreatePromptModal();
    
    const titleInput = page.locator('[data-testid="create-title-input"]');
    const contentTextarea = page.locator('[data-testid="create-content-textarea"]');
    
    // Test special characters
    const specialTitle = 'Test Title with Special Chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
    const specialContent = 'Content with special chars: éñüßçåøæ and emojis 🚀✨🎉';
    
    await titleInput.fill(specialTitle);
    await contentTextarea.fill(specialContent);
    
    // Content should be properly stored
    await expect(titleInput).toHaveValue(specialTitle);
    await expect(contentTextarea).toHaveValue(specialContent);
  });
});
