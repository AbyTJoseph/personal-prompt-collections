import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for the page to be fully loaded with prompts
   */
  async waitForPromptsToLoad() {
    // First wait for the loading text to disappear
    await this.page.waitForFunction(() => {
      const loadingText = document.querySelector('p');
      return loadingText && !loadingText.textContent?.includes('Loading templates...');
    }, { timeout: 15000 });

    // Then wait for prompt cards to appear
    await this.page.waitForSelector('[data-testid="prompt-card"]', { timeout: 10000 });
  }

  /**
   * Wait for loading state to disappear
   */
  async waitForLoadingToComplete() {
    await this.page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden', timeout: 10000 });
  }

  /**
   * Wait for the "Loading templates..." text to disappear
   */
  async waitForTemplatesToLoad() {
    await this.page.waitForFunction(() => {
      const loadingText = document.querySelector('p');
      return loadingText && !loadingText.textContent?.includes('Loading templates...');
    }, { timeout: 60000 });
  }

  /**
   * Wait for page to be fully loaded and ready for interaction
   */
  async waitForPageReady() {
    // Wait for DOM to be ready
    await this.page.waitForLoadState('domcontentloaded');

    // Wait for loading text to disappear (this is the key indicator the app has loaded)
    await this.waitForTemplatesToLoad();

    // Wait for prompt cards to appear with a reasonable timeout
    await this.page.waitForSelector('[data-testid="prompt-card"]', { timeout: 15000 });
  }

  /**
   * Simplified wait method that focuses on loading state only
   */
  async waitForPageLoaded() {
    // Wait for the loading text to disappear - this indicates the app has finished loading
    await this.waitForTemplatesToLoad();

    // Give more buffer time for the UI to fully update and render
    await this.page.waitForTimeout(3000);

    // Wait for prompt cards to appear with a longer timeout
    await this.page.waitForSelector('[data-testid="prompt-card"]', { timeout: 30000 });

    // Additional buffer to ensure everything is stable
    await this.page.waitForTimeout(2000);

    // Final verification that we have prompt cards
    const promptCards = await this.page.locator('[data-testid="prompt-card"]').count();
    if (promptCards === 0) {
      throw new Error('No prompt cards found after loading completed');
    }
  }

  /**
   * Ultra-patient wait method for very slow loading scenarios
   */
  async waitForPageLoadedSlow() {
    console.log('Waiting for page to load (ultra-patient mode)...');

    // Maximum wait time for loading text to disappear
    const maxWaitTime = 120000; // 2 minutes
    const startTime = Date.now();

    // Poll for loading text to disappear
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const loadingVisible = await this.page.locator('p').filter({ hasText: 'Loading templates...' }).isVisible();
        if (!loadingVisible) {
          console.log('Loading text disappeared, waiting for content...');
          break;
        }
      } catch (e) {
        // If we can't find the element, it might have disappeared
        console.log('Loading text not found, assuming loaded...');
        break;
      }
      await this.page.waitForTimeout(2000); // Check every 2 seconds
    }

    // Long buffer for UI to render
    console.log('Waiting for UI to render...');
    await this.page.waitForTimeout(5000);

    // Wait for prompt cards with very long timeout
    console.log('Waiting for prompt cards...');
    await this.page.waitForSelector('[data-testid="prompt-card"]', { timeout: 60000 });

    // Final long buffer
    console.log('Final stabilization...');
    await this.page.waitForTimeout(5000);

    console.log('Page loading complete!');
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




