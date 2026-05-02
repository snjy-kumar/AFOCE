import { describe, it, expect } from 'vitest';
import {
  ApiError,
} from '@/lib/utils/error-handler';

describe('Error Handler', () => {
  describe('ApiError', () => {
    it('should create ApiError with status code', () => {
      const error = new ApiError(400, 'Bad request', 'BAD_REQUEST');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.name).toBe('ApiError');
    });

    it('should create ApiError with details', () => {
      const details = { email: ['Invalid email'] };
      const error = new ApiError(422, 'Validation failed', 'VALIDATION_ERROR', details);

      expect(error.statusCode).toBe(422);
      expect(error.details).toEqual(details);
    });

    it('should handle error without code', () => {
      const error = new ApiError(500, 'Server error');

      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
    });
  });

  describe('Error detection', () => {
    it('should be instance of Error', () => {
      const error = new ApiError(400, 'Test');
      expect(error instanceof Error).toBe(true);
    });

    it('should have proper error properties', () => {
      const error = new ApiError(404, 'Not found', 'NOT_FOUND');

      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('Error handling patterns', () => {
    it('should handle multiple error attributes', () => {
      const error = new ApiError(
        422,
        'Validation failed',
        'VALIDATION_ERROR',
        {
          email: ['Invalid format', 'Already exists'],
          password: ['Too short'],
        }
      );

      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details?.email).toHaveLength(2);
      expect(error.details?.password).toHaveLength(1);
    });

    it('should preserve error stack trace', () => {
      const error = new ApiError(500, 'Internal error');
      expect(error.stack).toBeDefined();
    });
  });
});
