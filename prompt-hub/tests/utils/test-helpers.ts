import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for the page to be fully loaded with prompts
   */
  async waitForPromptsToLoad() {
    await this.page.waitForSelector('[data-testid="prompt-card"]', { timeout: 10000 });
  }

  /**
   * Wait for loading state to disappear
   */
  async waitForLoadingToComplete() {
    await this.page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden', timeout: 10000 });
  }

  /**
   * Get the number of visible prompt cards
   */
  async getPromptCardCount() {
    return await this.page.locator('[data-testid="prompt-card"]').count();
  }

  /**
   * Search for prompts using the search input
   */
  async searchPrompts(query: string) {
    const searchInput = this.page.locator('[data-testid="search-input"]');
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await this.page.waitForTimeout(500); // Wait for search to complete
  }

  /**
   * Clear the search input
   */
  async clearSearch() {
    const searchInput = this.page.locator('[data-testid="search-input"]');
    await searchInput.clear();
    await searchInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  /**
   * Click on a tag to filter by it
   */
  async clickTag(tagName: string) {
    await this.page.locator(`[data-testid="tag-${tagName}"]`).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Switch between grid and list view modes
   */
  async switchViewMode(mode: 'grid' | 'list') {
    const viewToggle = this.page.locator(`[data-testid="view-toggle-${mode}"]`);
    await viewToggle.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Open the command palette
   */
  async openCommandPalette() {
    await this.page.keyboard.press('Control+k');
    await this.page.waitForSelector('[data-testid="command-palette"]', { timeout: 5000 });
  }

  /**
   * Close the command palette
   */
  async closeCommandPalette() {
    await this.page.keyboard.press('Escape');
    await this.page.waitForSelector('[data-testid="command-palette"]', { state: 'hidden', timeout: 5000 });
  }

  /**
   * Open a prompt modal by clicking on a prompt card
   */
  async openPromptModal(promptIndex: number = 0) {
    const promptCard = this.page.locator('[data-testid="prompt-card"]').nth(promptIndex);
    await promptCard.click();
    await this.page.waitForSelector('[data-testid="prompt-modal"]', { timeout: 5000 });
  }

  /**
   * Close the prompt modal
   */
  async closePromptModal() {
    const closeButton = this.page.locator('[data-testid="modal-close-button"]');
    await closeButton.click();
    await this.page.waitForSelector('[data-testid="prompt-modal"]', { state: 'hidden', timeout: 5000 });
  }

  /**
   * Open the create prompt modal
   */
  async openCreatePromptModal() {
    const createButton = this.page.locator('[data-testid="create-prompt-button"]');
    await createButton.click();
    await this.page.waitForSelector('[data-testid="create-prompt-modal"]', { timeout: 5000 });
  }

  /**
   * Close the create prompt modal
   */
  async closeCreatePromptModal() {
    const closeButton = this.page.locator('[data-testid="create-modal-close-button"]');
    await closeButton.click();
    await this.page.waitForSelector('[data-testid="create-prompt-modal"]', { state: 'hidden', timeout: 5000 });
  }

  /**
   * Refresh the catalog
   */
  async refreshCatalog() {
    const refreshButton = this.page.locator('[data-testid="refresh-button"]');
    await refreshButton.click();
    await this.page.waitForTimeout(2000); // Wait for refresh to complete
  }

  /**
   * Scroll to top of the page
   */
  async scrollToTop() {
    const scrollButton = this.page.locator('[data-testid="scroll-to-top-button"]');
    await scrollButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if toast notification is visible
   */
  async waitForToast(message?: string) {
    const toast = this.page.locator('[data-testid="toast-notification"]');
    if (message) {
      await expect(toast).toContainText(message);
    } else {
      await expect(toast).toBeVisible();
    }
  }

  /**
   * Wait for a specific number of prompt cards to be visible
   */
  async expectPromptCardCount(expectedCount: number) {
    await expect(this.page.locator('[data-testid="prompt-card"]')).toHaveCount(expectedCount);
  }

  /**
   * Check if the page is in the expected view mode
   */
  async expectViewMode(mode: 'grid' | 'list') {
    if (mode === 'grid') {
      await expect(this.page.locator('.cards-grid')).toBeVisible();
      await expect(this.page.locator('.cards-list')).not.toBeVisible();
    } else {
      await expect(this.page.locator('.cards-list')).toBeVisible();
      await expect(this.page.locator('.cards-grid')).not.toBeVisible();
    }
  }
}




