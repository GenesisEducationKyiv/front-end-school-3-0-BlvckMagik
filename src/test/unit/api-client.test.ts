const { mockAxiosInstance } = vi.hoisted(() => ({
  mockAxiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn(),
      },
    },
  },
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackApiClient, getErrorMessage, isRetryableError, isValidationError } from '@/lib/api-client';
import { type CreateTrackDto } from '@/lib/validators';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

vi.mock('@/lib/type-guards', () => ({
  isAxiosError: vi.fn(),
  assertExists: vi.fn(),
}));

describe('API Client - Whitebox Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackApiClient.getTracks', () => {
    it('should successfully fetch tracks with proper validation', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: '1',
              title: 'Test Track',
              artist: 'Test Artist',
              genres: ['Rock'],
            },
          ],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await trackApiClient.getTracks({
        page: 1,
        limit: 10,
        sort: 'createdAt',
        order: 'desc',
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.data).toHaveLength(1);
        expect(result.value.meta.total).toBe(1);
      }
    });

    it('should handle validation errors when response format is invalid', async () => {
      const invalidResponse = {
        data: {
          data: 'not an array', // Invalid format
          meta: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValueOnce(invalidResponse);

      const result = await trackApiClient.getTracks({
        page: 1,
        limit: 10,
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe('validation');
        if (result.error.type === 'validation') {
          expect(result.error.message).toBe('Invalid response format');
        }
      }
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockAxiosInstance.get.mockRejectedValueOnce(networkError);

      const result = await trackApiClient.getTracks({
        page: 1,
        limit: 10,
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe('unknown');
        if (result.error.type === 'unknown') {
          expect(result.error.message).toBe('Network Error');
        }
      }
    });
  });

  describe('trackApiClient.createTrack', () => {
    it('should successfully create track with proper validation', async () => {
      const mockTrackData: CreateTrackDto = {
        title: 'New Track',
        artist: 'New Artist',
        album: 'New Album',
        genres: ['Pop'],
        coverImage: 'https://example.com/cover.jpg',
      };

      const mockResponse = {
        data: {
          id: '123',
          ...mockTrackData,
          audioFile: '',
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await trackApiClient.createTrack(mockTrackData);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.title).toBe('New Track');
        expect(result.value.artist).toBe('New Artist');
        expect(result.value.genres).toEqual(['Pop']);
      }
    });

    it('should handle validation errors for invalid track data', async () => {
      const mockTrackData: CreateTrackDto = {
        title: 'New Track',
        artist: 'New Artist',
        album: 'New Album',
        genres: ['Pop'],
        coverImage: 'https://example.com/cover.jpg',
      };

      const invalidResponse = {
        data: {
          id: '123',
          title: '', // Invalid empty title
          artist: 'New Artist',
          genres: ['Pop'],
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce(invalidResponse);

      const result = await trackApiClient.createTrack(mockTrackData);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe('validation');
        if (result.error.type === 'validation') {
          expect(result.error.message).toBe('Invalid track data received');
        }
      }
    });
  });

  describe('Error handling utilities', () => {
    it('should return appropriate error message for different error types', () => {
      const networkError = {
        type: 'network' as const,
        message: 'Connection failed',
        originalError: new Error('Connection failed'),
      };

      const validationError = {
        type: 'validation' as const,
        message: 'Invalid data',
        details: ['Title is required'],
      };

      const apiError = {
        type: 'api' as const,
        error: {
          error: 'Bad Request',
          message: 'Invalid input',
          statusCode: 400,
        },
      };

      expect(getErrorMessage(networkError)).toBe('Network error: Connection failed');
      expect(getErrorMessage(validationError)).toBe('Validation error: Invalid data. Details: Title is required');
      expect(getErrorMessage(apiError)).toBe('Invalid input');
    });

    it('should correctly identify retryable errors', () => {
      const networkError = {
        type: 'network' as const,
        message: 'Connection failed',
        originalError: new Error('Connection failed'),
      };

      const validationError = {
        type: 'validation' as const,
        message: 'Invalid data',
        details: ['Title is required'],
      };

      expect(isRetryableError(networkError)).toBe(true);
      expect(isRetryableError(validationError)).toBe(false);
    });

    it('should correctly identify validation errors', () => {
      const networkError = {
        type: 'network' as const,
        message: 'Connection failed',
        originalError: new Error('Connection failed'),
      };

      const validationError = {
        type: 'validation' as const,
        message: 'Invalid data',
        details: ['Title is required'],
      };

      expect(isValidationError(validationError)).toBe(true);
      expect(isValidationError(networkError)).toBe(false);
    });
  });
}); 