/**
 * API middleware for request/response logging and error tracking
 * Use in API route handlers to automatically log operations
 */

import { NextResponse } from 'next/server';
import {
  generateRequestId,
  createRequestLogger,
  logApiCall,
} from '@/lib/utils/logging';
import { captureException, setUserContext, setOrgContext } from '@/lib/utils/error-tracking';

export interface ApiHandlerOptions {
  requireAuth?: boolean;
  requireRole?: 'finance_admin' | 'manager' | 'team_member';
  logSensitiveData?: boolean;
}

/**
 * Wrap API route handler with observability
 *
 * Usage:
 * ```ts
 * export const GET = withObservability(async (request, context) => {
 *   const { logger } = context;
 *   logger.info('Processing request');
 *   // ... route logic
 * }, { requireAuth: true });
 * ```
 */
export function withObservability(
  handler: (
    request: Request,
    context: {
      logger: ReturnType<typeof createRequestLogger>;
      requestId: string;
    },
  ) => Promise<Response>,
  options?: ApiHandlerOptions,
) {
  return async (request: Request): Promise<Response> => {
    const requestId = generateRequestId();
    const logger = createRequestLogger(requestId);
    const startTime = Date.now();

    try {
      const method = request.method;
      const url = new URL(request.url);
      const endpoint = url.pathname;

      logger.info(`${method} ${endpoint} started`);

      // Call handler
      const response = await handler(request, { logger, requestId });

      const durationMs = Date.now() - startTime;
      logApiCall(method, endpoint, response.status, durationMs, {
        requestId,
      });

      return response;
    } catch (error) {
      const durationMs = Date.now() - startTime;

      if (error instanceof Error) {
        logger.error('Request failed', error, { duration: durationMs });
        captureException(error, {
          endpoint: new URL(request.url).pathname,
          operation: 'api-handler',
        });
      }

      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Internal server error',
            requestId,
          },
        },
        { status: 500 },
      );
    }
  };
}

/**
 * Parse request body safely with logging
 */
export async function parseRequestBodySafely(
  request: Request,
  logger: ReturnType<typeof createRequestLogger>,
) {
  try {
    return await request.json();
  } catch (error) {
    logger.warn('Failed to parse request body', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Validate authentication in API route
 */
export async function validateAuth(
  request: Request,
  supabase: any,
  logger: ReturnType<typeof createRequestLogger>,
) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      logger.warn('Authentication failed');
      return { user: null, error: 'Unauthorized' };
    }

    logger.info('User authenticated', { userId: user.id });
    setUserContext(user.id, user.email);

    return { user, error: null };
  } catch (error) {
    logger.error('Auth check failed', error as Error);
    return { user: null, error: 'Authentication check failed' };
  }
}

/**
 * Validate user role for sensitive operations
 */
export async function validateRole(
  userId: string,
  requiredRole: 'finance_admin' | 'manager' | 'team_member',
  supabase: any,
  logger: ReturnType<typeof createRequestLogger>,
) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, org_id')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      logger.warn('Failed to load user profile', { userId });
      return { profile: null, error: 'Profile not found' };
    }

    setOrgContext(profile.org_id);

    const roleHierarchy = {
      finance_admin: 3,
      manager: 2,
      team_member: 1,
    };

    if (
      roleHierarchy[profile.role as keyof typeof roleHierarchy] <
      roleHierarchy[requiredRole]
    ) {
      logger.warn('Insufficient permissions', {
        userId,
        required: requiredRole,
        actual: profile.role,
      });
      return { profile: null, error: 'Insufficient permissions' };
    }

    return { profile, error: null };
  } catch (error) {
    logger.error('Role validation failed', error as Error);
    return { profile: null, error: 'Role validation failed' };
  }
}
