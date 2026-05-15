/**
 * Error tracking and Sentry configuration
 * Captures errors with context for observability
 */

function writeStdout(payload: unknown) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

/**
 * Initialize Sentry for production error tracking
 * Call this in app.tsx or main entry point
 */
export function initializeErrorTracking() {
  // Import Sentry if available
  if (typeof window === 'undefined') {
    // Server-side error tracking setup
    // Uncomment when Sentry is installed:
    // import * as Sentry from '@sentry/node';
    // Sentry.init({
    //   dsn: process.env.SENTRY_DSN,
    //   environment: process.env.NODE_ENV,
    //   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // });
  } else {
    // Client-side error tracking setup
    // Uncomment when Sentry is installed:
    // import * as Sentry from '@sentry/react';
    // Sentry.init({
    //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    //   environment: process.env.NODE_ENV,
    //   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // });
  }
}

/**
 * Capture an exception with context
 * DO NOT include sensitive data (passwords, tokens, PII)
 */
export function captureException(
  error: Error,
  context?: {
    userId?: string;
    orgId?: string;
    endpoint?: string;
    operation?: string;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
) {
  // Uncomment when Sentry is installed:
  // import * as Sentry from '@sentry/node';
  // Sentry.captureException(error, {
  //   user: context?.userId ? { id: context.userId } : undefined,
  //   tags: {
  //     org_id: context?.orgId,
  //     endpoint: context?.endpoint,
  //     operation: context?.operation,
  //     ...context?.tags,
  //   },
  //   extra: context?.extra,
  // });

  // For now, just log to console
  console.error('Exception captured:', {
    message: error.message,
    stack: error.stack,
    context,
  });
}

/**
 * Capture a message (info, warning, debug)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: {
    userId?: string;
    orgId?: string;
    tags?: Record<string, string>;
  },
) {
  // Uncomment when Sentry is installed:
  // import * as Sentry from '@sentry/node';
  // Sentry.captureMessage(message, level);

  if (level === 'error' || level === 'warning') {
    console.warn(`[${level.toUpperCase()}] ${message}`, context);
    return;
  }

  writeStdout({
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string) {
  // Uncomment when Sentry is installed:
  // import * as Sentry from '@sentry/node';
  // Sentry.setUser({ id: userId, email });
}

/**
 * Set organization context for error tracking
 */
export function setOrgContext(orgId: string) {
  // Uncomment when Sentry is installed:
  // import * as Sentry from '@sentry/node';
  // Sentry.setTag('org_id', orgId);
}

/**
 * Breadcrumb for tracking user actions leading to error
 */
export function recordBreadcrumb(
  message: string,
  category: string = 'user-action',
  data?: Record<string, unknown>,
) {
  // Uncomment when Sentry is installed:
  // import * as Sentry from '@sentry/node';
  // Sentry.captureMessage(message, { breadcrumbs: [{ message, category, data }] });

  writeStdout({
    level: 'debug',
    category,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Start a performance transaction
 */
export function startTransaction(
  name: string,
  op: string = 'http.request',
): { finish: () => void; setTag: (key: string, value: string) => void } {
  // Uncomment when Sentry is installed:
  // import * as Sentry from '@sentry/node';
  // const transaction = Sentry.startTransaction({ name, op });
  // return {
  //   finish: () => transaction.finish(),
  //   setTag: (key, value) => transaction.setTag(key, value),
  // };

  const startTime = Date.now();
  return {
    finish: () => {
      const duration = Date.now() - startTime;
      writeStdout({
        level: 'debug',
        operation: op,
        name,
        duration,
        timestamp: new Date().toISOString(),
      });
    },
    setTag: () => {},
  };
}
