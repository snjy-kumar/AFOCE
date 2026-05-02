/**
 * Centralized error handling for API routes
 * Provides consistent error responses and logging
 */

import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';

export interface ApiErrorResponse {
  data: null;
  error: {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
  };
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Create a consistent error response
 */
export function errorResponse(
  statusCode: number,
  message: string,
  code?: string,
  details?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      data: null,
      error: {
        message,
        ...(code && { code }),
        ...(details && { details }),
      },
    },
    { status: statusCode }
  );
}

/**
 * Handle Zod validation errors
 */
export function validationErrorResponse(
  error: ZodError
): NextResponse<ApiErrorResponse> {
  const details: Record<string, string[]> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!details[path]) {
      details[path] = [];
    }
    details[path]?.push(err.message);
  });

  return errorResponse(
    422,
    'Validation failed',
    'VALIDATION_ERROR',
    details
  );
}

/**
 * Handle different error types and return appropriate responses
 */
export function handleError(
  error: unknown,
  defaultMessage = 'Internal server error'
): NextResponse<ApiErrorResponse> {
  // ApiError instances
  if (error instanceof ApiError) {
    return errorResponse(
      error.statusCode,
      error.message,
      error.code,
      error.details
    );
  }

  // Zod validation errors
  if (error instanceof Error && error.name === 'ZodError') {
    return validationErrorResponse(error as ZodError);
  }

  // Standard Error instances
  if (error instanceof Error) {
    const message = error.message || defaultMessage;
    const statusCode =
      message.toLowerCase().includes('not found') ? 404 : 500;
    return errorResponse(statusCode, message);
  }

  // Unknown errors
  return errorResponse(500, defaultMessage);
}

/**
 * Log error for debugging
 */
export function logError(
  error: unknown,
  context: {
    method: string;
    path: string;
    userId?: string;
    orgId?: string;
  }
): void {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error('[API Error]', {
    timestamp,
    ...context,
    message,
    stack,
  });
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandling<
  T extends (...args: never[]) => Promise<NextResponse>
>(handler: T): T {
  return (async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  }) as T;
}
