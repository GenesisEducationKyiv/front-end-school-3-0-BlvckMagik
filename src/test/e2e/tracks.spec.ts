import { test, expect } from '@playwright/test';

test.describe('Tracks E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display tracks page with header and create button', async ({ page }) => {
    await expect(page.getByTestId('tracks-header')).toBeVisible();
    await expect(page.getByText('Tracks')).toBeVisible();
    
    await expect(page.getByTestId('create-track-button')).toBeVisible();
    await expect(page.getByText('Create Track')).toBeVisible();
  });

  test('should load and display tracks from API', async ({ page }) => {
    await expect(page.getByTestId('loading-tracks')).toBeVisible();
    
    await expect(page.getByTestId('loading-tracks')).not.toBeVisible();
    
    await expect(page.getByText('Test Track 1')).toBeVisible();
    await expect(page.getByText('Test Artist 1')).toBeVisible();
    await expect(page.getByText('Test Track 2')).toBeVisible();
    await expect(page.getByText('Test Artist 2')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    await expect(page.getByTestId('loading-tracks')).not.toBeVisible();
    
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('Test Track 1');
    
    await page.waitForTimeout(600);
    
    await expect(page.getByText('Test Track 1')).toBeVisible();
    await expect(page.getByText('Test Track 2')).not.toBeVisible();
  });

  test('should handle sorting functionality', async ({ page }) => {
    await expect(page.getByTestId('loading-tracks')).not.toBeVisible();
    
    const sortSelect = page.getByTestId('sort-select');
    await expect(sortSelect).toBeVisible();
    
    await sortSelect.click();
    
    await expect(page.getByText('By Title')).toBeVisible();
    await expect(page.getByText('By Artist')).toBeVisible();
    await expect(page.getByText('By Album')).toBeVisible();
  });

  test('should handle genre filtering', async ({ page }) => {
    await expect(page.getByTestId('loading-tracks')).not.toBeVisible();
    
    const genreFilter = page.getByTestId('filter-genre');
    await expect(genreFilter).toBeVisible();
    
    await genreFilter.click();
    
    await expect(page.getByText('Rock')).toBeVisible();
    await expect(page.getByText('Pop')).toBeVisible();
    await expect(page.getByText('Jazz')).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    await page.route('/api/tracks', async route => {
      const url = new URL(route.request().url());
      const page = parseInt(url.searchParams.get('page') || '1');
      
      if (page === 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: '1',
                title: 'Track 1',
                artist: 'Artist 1',
                album: 'Album 1',
                genres: ['Rock'],
                coverImage: 'https://example.com/cover1.jpg',
                audioFile: 'https://example.com/audio1.mp3',
              },
            ],
            meta: {
              total: 2,
              page: 1,
              limit: 1,
              totalPages: 2,
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: '2',
                title: 'Track 2',
                artist: 'Artist 2',
                album: 'Album 2',
                genres: ['Pop'],
                coverImage: 'https://example.com/cover2.jpg',
                audioFile: 'https://example.com/audio2.mp3',
              },
            ],
            meta: {
              total: 2,
              page: 2,
              limit: 1,
              totalPages: 2,
            },
          }),
        });
      }
    });
    
    await page.reload();
    
    await expect(page.getByTestId('loading-tracks')).not.toBeVisible();
    
    await expect(page.getByTestId('pagination')).toBeVisible();
    
    await expect(page.getByText('Track 1')).toBeVisible();
    await expect(page.getByText('Track 2')).not.toBeVisible();
    
    await page.getByText('2').click();
    
    await expect(page.getByText('Track 2')).toBeVisible();
    await expect(page.getByText('Track 1')).not.toBeVisible();
  });

  test('should handle create track button click', async ({ page }) => {
    await expect(page.getByTestId('loading-tracks')).not.toBeVisible();
    
    await page.getByTestId('create-track-button').click();
    
  });

  test('should handle responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.getByTestId('loading-tracks')).not.toBeVisible();
    
    await expect(page.getByTestId('tracks-header')).toBeVisible();
    await expect(page.getByTestId('create-track-button')).toBeVisible();
    await expect(page.getByTestId('search-input')).toBeVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await expect(page.getByTestId('tracks-header')).toBeVisible();
    await expect(page.getByTestId('create-track-button')).toBeVisible();
    await expect(page.getByTestId('search-input')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.route('/api/tracks', route => {
      void route.abort('failed');
    });
    
    await page.reload();
    
    await expect(page.getByTestId('loading-tracks')).toBeVisible();
    
    await expect(page.getByTestId('loading-tracks')).not.toBeVisible();
    
    await expect(page.getByTestId('tracks-header')).toBeVisible();
    await expect(page.getByTestId('create-track-button')).toBeVisible();
  });
}); 