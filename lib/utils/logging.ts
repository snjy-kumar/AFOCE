/**
 * Structured logging utility
 * Provides JSON logging format for machine parsing and aggregation
 */

import { nanoid } from 'nanoid';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  orgId?: string;
  endpoint?: string;
  method?: string;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  requestId?: string;
  userId?: string;
  orgId?: string;
  endpoint?: string;
  method?: string;
  duration?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  data?: Record<string, unknown>;
}

/**
 * Generate unique request ID for tracing
 */
export function generateRequestId(): string {
  return nanoid(16);
}

/**
 * Create structured log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  extra?: {
    duration?: number;
    error?: Error;
    data?: Record<string, unknown>;
  },
): StructuredLogEntry {
  const entry: StructuredLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'afoce-api',
    message,
    requestId: context?.requestId,
    userId: context?.userId,
    orgId: context?.orgId,
    endpoint: context?.endpoint,
    method: context?.method,
    duration: extra?.duration,
  };

  if (extra?.error) {
    entry.error = {
      message: extra.error.message,
      stack: extra.error.stack,
      code: (extra.error as any).code,
    };
  }

  if (extra?.data) {
    entry.data = extra.data;
  }

  return entry;
}

function writeStdout(entry: StructuredLogEntry) {
  process.stdout.write(`${JSON.stringify(entry)}\n`);
}

/**
 * Log at debug level (development only)
 */
export function logDebug(
  message: string,
  context?: LogContext,
  data?: Record<string, unknown>,
) {
  const entry = createLogEntry(LogLevel.DEBUG, message, context, { data });
  if (process.env.NODE_ENV === 'development') {
    writeStdout(entry);
  }
}

/**
 * Log at info level
 */
export function logInfo(
  message: string,
  context?: LogContext,
  data?: Record<string, unknown>,
) {
  const entry = createLogEntry(LogLevel.INFO, message, context, { data });
  writeStdout(entry);
}

/**
 * Log at warn level
 */
export function logWarn(
  message: string,
  context?: LogContext,
  data?: Record<string, unknown>,
) {
  const entry = createLogEntry(LogLevel.WARN, message, context, { data });
  console.warn(JSON.stringify(entry));
}

/**
 * Log at error level (includes stack trace)
 * DO NOT log sensitive data (passwords, tokens, PII)
 */
export function logError(
  message: string,
  error?: Error,
  context?: LogContext,
  data?: Record<string, unknown>,
) {
  const entry = createLogEntry(LogLevel.ERROR, message, context, {
    error,
    data,
  });

  console.error(JSON.stringify(entry));

  // Optionally send to error tracking service (Sentry, etc.)
  // captureException(error, { tags: { userId: context?.userId } });
}

/**
 * Log API request/response with timing
 */
export function logApiCall(
  method: string,
  endpoint: string,
  statusCode: number,
  durationMs: number,
  context?: LogContext,
) {
  const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;

  const entry = createLogEntry(level, `API ${method} ${endpoint}`, context, {
    duration: durationMs,
    data: { statusCode },
  });

  if (level === LogLevel.ERROR) {
    console.error(JSON.stringify(entry));
  } else if (level === LogLevel.WARN) {
    console.warn(JSON.stringify(entry));
  } else {
    writeStdout(entry);
  }
}

/**
 * Log database operation with timing
 */
export function logDatabaseOperation(
  operation: 'select' | 'insert' | 'update' | 'delete',
  table: string,
  durationMs: number,
  rowCount?: number,
  context?: LogContext,
) {
  logInfo(`Database ${operation.toUpperCase()} on ${table}`, context, {
    operation,
    table,
    durationMs,
    rowCount,
  });
}

/**
 * Log security event (auth, permission denied, etc.)
 */
export function logSecurityEvent(
  event: 'auth_failed' | 'permission_denied' | 'invalid_input' | 'suspicious_activity',
  details: string,
  context?: LogContext,
) {
  logWarn(`Security event: ${event} - ${details}`, context, { event });
}

/**
 * Create request-level logger (for use in API routes)
 */
export function createRequestLogger(requestId: string) {
  return {
    requestId,
    context: (overrides?: Partial<LogContext>): LogContext => ({
      requestId,
      ...overrides,
    }),
    info: (message: string, data?: Record<string, unknown>) =>
      logInfo(message, { requestId }, data),
    warn: (message: string, data?: Record<string, unknown>) =>
      logWarn(message, { requestId }, data),
    error: (message: string, error?: Error, data?: Record<string, unknown>) =>
      logError(message, error, { requestId }, data),
  };
}
