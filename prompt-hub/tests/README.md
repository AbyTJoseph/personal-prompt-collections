# Playwright Test Suite

This directory contains comprehensive UI tests for the Prompt Hub application using Playwright.

## Overview

The test suite covers all major functionality of the Prompt Hub application including:
- Homepage functionality and navigation
- Prompt management (create, read, update, delete)
- Search and filtering capabilities
- Command palette functionality
- Modal interactions
- Responsive design and accessibility
- Cross-browser compatibility

## Test Structure

```
tests/
├── README.md                           # This file
├── utils/
│   └── test-helpers.ts                # Common test utility functions
├── homepage.spec.ts                    # Homepage functionality tests
├── prompt-modal.spec.ts               # Prompt modal interaction tests
├── create-prompt.spec.ts              # Create prompt functionality tests
├── command-palette.spec.ts            # Command palette tests
├── search-filtering.spec.ts           # Search and filtering tests
└── responsive-accessibility.spec.ts   # Responsive design and accessibility tests
```

## Test Utilities

### TestHelpers Class

The `TestHelpers` class provides common utility functions for tests:

- **Page Navigation**: `waitForPromptsToLoad()`, `waitForLoadingToComplete()`
- **Search Operations**: `searchPrompts()`, `clearSearch()`
- **Modal Management**: `openPromptModal()`, `closePromptModal()`
- **View Mode Switching**: `switchViewMode()`, `expectViewMode()`
- **Command Palette**: `openCommandPalette()`, `closeCommandPalette()`
- **Form Operations**: `openCreatePromptModal()`, `closeCreatePromptModal()`
- **Utility Functions**: `refreshCatalog()`, `scrollToTop()`, `waitForToast()`

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npm run test:install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Test Commands

```bash
# Run all tests
npm test

# Run tests with Playwright UI
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Show test report
npm run test:report

# Run specific test file
npx playwright test tests/homepage.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with specific tags
npx playwright test --grep="should search"
```

## Test Configuration

The test configuration is defined in `playwright.config.ts` at the project root:

- **Test Directory**: `./tests`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Timeouts**: 30s global, 10s expect
- **Parallel Execution**: Enabled
- **Retries**: 2 (CI only)
- **Web Server**: Automatically starts dev server

## Writing Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Feature Name', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPromptsToLoad();
  });

  test('should do something specific', async ({ page }) => {
    // Test implementation
    await expect(page.locator('[data-testid="element"]')).toBeVisible();
  });
});
```

### Best Practices

1. **Use TestHelpers**: Leverage the utility functions for common operations
2. **Descriptive Test Names**: Use clear, descriptive test names that explain what is being tested
3. **Proper Waiting**: Use appropriate waiting mechanisms for async operations
4. **Data Test IDs**: Use `data-testid` attributes for reliable element selection
5. **Cleanup**: Ensure tests clean up after themselves
6. **Isolation**: Each test should be independent and not rely on other tests

### Element Selection

Use `data-testid` attributes for reliable element selection:

```typescript
// Good - using data-testid
await page.locator('[data-testid="search-input"]').fill('query');

// Avoid - using text content or CSS classes
await page.locator('text=Search').click();
await page.locator('.search-input').fill('query');
```

### Waiting Strategies

```typescript
// Wait for element to be visible
await page.waitForSelector('[data-testid="element"]', { timeout: 10000 });

// Wait for element to be hidden
await page.waitForSelector('[data-testid="element"]', { state: 'hidden' });

// Wait for specific text
await expect(page.locator('text=Expected Text')).toBeVisible();

// Wait for count
await expect(page.locator('[data-testid="item"]')).toHaveCount(5);
```

## Test Data

### Sample Data Requirements

Tests require the application to have:
- Sample prompts with titles, content, and tags
- Various prompt categories and collections
- Different tag combinations for testing filtering

### Data Management

- Tests should not rely on specific data content
- Use dynamic data selection when possible
- Clean up any test data created during tests

## Debugging Tests

### Debug Mode

```bash
npm run test:debug
```

This opens tests in debug mode with:
- Slower execution
- Browser dev tools open
- Step-by-step execution

### Playwright UI

```bash
npm run test:ui
```

Provides a visual interface for:
- Running tests
- Viewing test results
- Debugging failures
- Generating reports

### Console Logging

```typescript
// Add logging to tests
console.log('Debug information');
await page.evaluate(() => console.log('Browser console log'));
```

## Continuous Integration

### GitHub Actions

The tests can be integrated into CI/CD pipelines:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npx playwright test

- name: Upload test results
  uses: actions/upload-artifact@v2
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

### Test Reports

Tests generate multiple report formats:
- **HTML Report**: `playwright-report/index.html`
- **JSON Report**: `test-results/results.json`
- **JUnit Report**: `test-results/results.xml`

## Troubleshooting

### Common Issues

1. **Tests Fail on CI but Pass Locally**
   - Check for timing issues
   - Ensure proper waiting mechanisms
   - Verify test data availability

2. **Element Not Found**
   - Verify `data-testid` attributes are present
   - Check if element is in DOM
   - Ensure proper waiting for dynamic content

3. **Flaky Tests**
   - Add proper waiting mechanisms
   - Use stable selectors
   - Avoid race conditions

4. **Browser Compatibility Issues**
   - Test on multiple browsers
   - Check for browser-specific behavior
   - Use cross-browser compatible selectors

### Getting Help

- Check Playwright documentation: https://playwright.dev/
- Review test examples in this directory
- Check the main project README for setup instructions

## Contributing

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Use the `TestHelpers` class for common operations
3. Add comprehensive test coverage for new features
4. Update the test coverage documentation
5. Ensure tests are reliable and maintainable

## Test Coverage

For detailed test coverage information, see:
- `TEST_COVERAGE.md` - Comprehensive coverage documentation
- `playwright-report/` - HTML test reports
- Test results in CI/CD pipeline




