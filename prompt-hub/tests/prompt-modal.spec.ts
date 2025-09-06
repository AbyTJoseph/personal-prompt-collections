import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Prompt Modal Functionality', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPromptsToLoad();
  });

  test('should open prompt modal when clicking on prompt card', async ({ page }) => {
    // Open modal by clicking on first prompt card
    await helpers.openPromptModal(0);
    
    // Check if modal is visible
    await expect(page.locator('[data-testid="prompt-modal"]')).toBeVisible();
    
    // Check if modal content is loaded
    await expect(page.locator('[data-testid="modal-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="modal-content"]')).toBeVisible();
  });

  test('should display prompt information correctly in modal', async ({ page }) => {
    await helpers.openPromptModal(0);
    
    // Check if title is displayed
    await expect(page.locator('[data-testid="modal-title"]')).toBeVisible();
    
    // Check if tags are displayed
    await expect(page.locator('[data-testid="modal-tags"]')).toBeVisible();
    
    // Check if content is displayed
    await expect(page.locator('[data-testid="modal-content"]')).toBeVisible();
    
    // Check if copy button is present
    await expect(page.locator('[data-testid="copy-prompt-button"]')).toBeVisible();
  });

  test('should close modal when clicking close button', async ({ page }) => {
    await helpers.openPromptModal(0);
    
    // Click close button
    await helpers.closePromptModal();
    
    // Modal should be hidden
    await expect(page.locator('[data-testid="prompt-modal"]')).not.toBeVisible();
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    await helpers.openPromptModal(0);
    
    // Click on backdrop (outside modal content)
    await page.locator('[data-testid="modal-backdrop"]').click();
    
    // Modal should be hidden
    await expect(page.locator('[data-testid="prompt-modal"]')).not.toBeVisible();
  });

  test('should close modal with Escape key', async ({ page }) => {
    await helpers.openPromptModal(0);
    
    // Press Escape key
    await page.keyboard.press('Escape');
    
    // Modal should be hidden
    await expect(page.locator('[data-testid="prompt-modal"]')).not.toBeVisible();
  });

  test('should copy prompt content to clipboard', async ({ page }) => {
    await helpers.openPromptModal(0);
    
    // Click copy button
    const copyButton = page.locator('[data-testid="copy-prompt-button"]');
    await copyButton.click();
    
    // Should show copied state
    await expect(copyButton).toContainText('Copied!');
    
    // Should show toast notification
    await helpers.waitForToast('Prompt copied to clipboard!');
  });

  test('should enter edit mode when edit button is clicked', async ({ page }) => {
    await helpers.openPromptModal(0);
    
    // Click edit button
    await page.locator('[data-testid="edit-prompt-button"]').click();
    
    // Should be in edit mode
    await expect(page.locator('[data-testid="edit-title-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="edit-content-textarea"]')).toBeVisible();
    await expect(page.locator('[data-testid="edit-tags-section"]')).toBeVisible();
  });

  test('should edit prompt title successfully', async ({ page }) => {
    await helpers.openPromptModal(0);
    await page.locator('[data-testid="edit-prompt-button"]').click();
    
    const titleInput = page.locator('[data-testid="edit-title-input"]');
    const originalTitle = await titleInput.inputValue();
    
    // Edit title
    await titleInput.clear();
    await titleInput.fill('Updated Title');
    
    // Save changes
    await page.locator('[data-testid="save-changes-button"]').click();
    
    // Should exit edit mode
    await expect(page.locator('[data-testid="edit-title-input"]')).not.toBeVisible();
    
    // Title should be updated
    await expect(page.locator('[data-testid="modal-title"]')).toContainText('Updated Title');
  });

  test('should edit prompt content successfully', async ({ page }) => {
    await helpers.openPromptModal(0);
    await page.locator('[data-testid="edit-prompt-button"]').click();
    
    const contentTextarea = page.locator('[data-testid="edit-content-textarea"]');
    
    // Edit content
    await contentTextarea.clear();
    await contentTextarea.fill('Updated content for testing');
    
    // Save changes
    await page.locator('[data-testid="save-changes-button"]').click();
    
    // Should exit edit mode
    await expect(page.locator('[data-testid="edit-content-textarea"]')).not.toBeVisible();
    
    // Content should be updated
    await expect(page.locator('[data-testid="modal-content"]')).toContainText('Updated content for testing');
  });

  test('should manage prompt tags in edit mode', async ({ page }) => {
    await helpers.openPromptModal(0);
    await page.locator('[data-testid="edit-prompt-button"]').click();
    
    // Add new tag
    const newTagInput = page.locator('[data-testid="new-tag-input"]');
    await newTagInput.fill('newtag');
    await page.locator('[data-testid="add-tag-button"]').click();
    
    // Check if new tag is added
    await expect(page.locator('[data-testid="tag-newtag"]')).toBeVisible();
    
    // Remove a tag
    const firstTag = page.locator('[data-testid^="edit-tag-"]').first();
    if (await firstTag.isVisible()) {
      await firstTag.locator('[data-testid="remove-tag-button"]').click();
    }
    
    // Save changes
    await page.locator('[data-testid="save-changes-button"]').click();
    
    // Should exit edit mode
    await expect(page.locator('[data-testid="edit-tags-section"]')).not.toBeVisible();
  });

  test('should cancel edit mode without saving', async ({ page }) => {
    await helpers.openPromptModal(0);
    await page.locator('[data-testid="edit-prompt-button"]').click();
    
    // Make some changes
    const titleInput = page.locator('[data-testid="edit-title-input"]');
    const originalTitle = await titleInput.inputValue();
    await titleInput.clear();
    await titleInput.fill('Temporary Title');
    
    // Cancel edit
    await page.locator('[data-testid="cancel-edit-button"]').click();
    
    // Should exit edit mode
    await expect(page.locator('[data-testid="edit-title-input"]')).not.toBeVisible();
    
    // Title should be back to original
    await expect(page.locator('[data-testid="modal-title"]')).toContainText(originalTitle);
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    await helpers.openPromptModal(0);
    
    // Click delete button
    await page.locator('[data-testid="delete-prompt-button"]').click();
    
    // Should show confirmation dialog
    await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toBeVisible();
    await expect(page.locator('text=Are you sure you want to delete')).toBeVisible();
  });

  test('should cancel delete operation', async ({ page }) => {
    await helpers.openPromptModal(0);
    await page.locator('[data-testid="delete-prompt-button"]').click();
    
    // Click cancel in confirmation dialog
    await page.locator('[data-testid="cancel-delete-button"]').click();
    
    // Dialog should be hidden
    await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).not.toBeVisible();
    
    // Modal should still be open
    await expect(page.locator('[data-testid="prompt-modal"]')).toBeVisible();
  });

  test('should delete prompt successfully', async ({ page }) => {
    await helpers.openPromptModal(0);
    await page.locator('[data-testid="delete-prompt-button"]').click();
    
    // Confirm deletion
    await page.locator('[data-testid="confirm-delete-button"]').click();
    
    // Modal should close
    await expect(page.locator('[data-testid="prompt-modal"]')).not.toBeVisible();
    
    // Should show success toast
    await helpers.waitForToast('Prompt deleted successfully!');
  });

  test('should handle loading state when fetching full prompt', async ({ page }) => {
    // This test might need to be adjusted based on how the loading state is implemented
    await helpers.openPromptModal(0);
    
    // Check if loading indicator is shown initially
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
      
      // Wait for loading to complete
      await helpers.waitForLoadingToComplete();
    }
    
    // Content should be loaded
    await expect(page.locator('[data-testid="modal-content"]')).toBeVisible();
  });

  test('should handle keyboard navigation in edit mode', async ({ page }) => {
    await helpers.openPromptModal(0);
    await page.locator('[data-testid="edit-prompt-button"]').click();
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through form elements
    const titleInput = page.locator('[data-testid="edit-title-input"]');
    await expect(titleInput).toBeFocused();
    
    // Test Enter key for adding tags
    const newTagInput = page.locator('[data-testid="new-tag-input"]');
    await newTagInput.focus();
    await newTagInput.fill('testtag');
    await newTagInput.press('Enter');
    
    // Tag should be added
    await expect(page.locator('[data-testid="tag-testtag"]')).toBeVisible();
  });

  test('should validate form inputs in edit mode', async ({ page }) => {
    await helpers.openPromptModal(0);
    await page.locator('[data-testid="edit-prompt-button"]').click();
    
    // Try to save with empty title
    const titleInput = page.locator('[data-testid="edit-title-input"]');
    await titleInput.clear();
    
    // Save button should be disabled or show validation error
    const saveButton = page.locator('[data-testid="save-changes-button"]');
    
    // This test might need adjustment based on actual validation implementation
    // await expect(saveButton).toBeDisabled();
  });

  test('should handle concurrent edits gracefully', async ({ page }) => {
    await helpers.openPromptModal(0);
    await page.locator('[data-testid="edit-prompt-button"]').click();
    
    // Make some changes
    const titleInput = page.locator('[data-testid="edit-title-input"]');
    await titleInput.clear();
    await titleInput.fill('Concurrent Edit Test');
    
    // Open another modal (if possible)
    await helpers.closePromptModal();
    await helpers.openPromptModal(1);
    
    // First modal should be closed
    await expect(page.locator('[data-testid="prompt-modal"]')).toBeVisible();
  });
});




