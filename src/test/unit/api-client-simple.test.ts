import { describe, it, expect } from 'vitest';
import { getErrorMessage, isRetryableError, isValidationError } from '@/lib/api-client';

describe('API Client Utilities - Simple Unit Tests', () => {
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
      const validationError = {
        type: 'validation' as const,
        message: 'Invalid data',
        details: ['Title is required'],
      };

      const networkError = {
        type: 'network' as const,
        message: 'Connection failed',
        originalError: new Error('Connection failed'),
      };

      expect(isValidationError(validationError)).toBe(true);
      expect(isValidationError(networkError)).toBe(false);
    });
  });
}); 