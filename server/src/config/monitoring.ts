/**
 * Monitoring and Error Tracking Configuration
 * Using Winston for logging and preparing for APM integration
 */

import winston from 'winston';
import path from 'path';
import { env } from './env.js';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: {
    service: 'afoce-backend',
    environment: env.NODE_ENV,
  },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: env.NODE_ENV === 'development' ? consoleFormat : logFormat,
    }),
    // Write error logs to file
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined file
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Express request logger middleware
 */
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

/**
 * Application Performance Monitoring (APM) Integration
 * Uncomment and configure when ready to use Sentry or similar
 */

// import * as Sentry from '@sentry/node';
// import { ProfilingIntegration } from '@sentry/profiling-node';

// export function initializeAPM() {
//   if (env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
//     Sentry.init({
//       dsn: process.env.SENTRY_DSN,
//       environment: env.NODE_ENV,
//       integrations: [
//         new Sentry.Integrations.Http({ tracing: true }),
//         new Sentry.Integrations.Express({ app }),
//         new ProfilingIntegration(),
//       ],
//       tracesSampleRate: 0.1, // 10% of requests
//       profilesSampleRate: 0.1,
//     });
    
//     logger.info('Sentry APM initialized');
//   }
// }

// export function sentryRequestHandler() {
//   return Sentry.Handlers.requestHandler();
// }

// export function sentryTracingHandler() {
//   return Sentry.Handlers.tracingHandler();
// }

// export function sentryErrorHandler() {
//   return Sentry.Handlers.errorHandler();
// }

/**
 * Custom error tracking
 */
export function trackError(error: Error, context?: Record<string, any>) {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
  
  // Send to APM service in production
  // if (env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context });
  // }
}

/**
 * Performance metrics tracking
 */
export class PerformanceTracker {
  private startTime: number;
  private operation: string;
  
  constructor(operation: string) {
    this.operation = operation;
    this.startTime = Date.now();
  }
  
  end(metadata?: Record<string, any>) {
    const duration = Date.now() - this.startTime;
    logger.debug('Performance Metric', {
      operation: this.operation,
      duration: `${duration}ms`,
      ...metadata,
    });
    
    // Warn if operation is slow
    if (duration > 1000) {
      logger.warn('Slow Operation Detected', {
        operation: this.operation,
        duration: `${duration}ms`,
        ...metadata,
      });
    }
    
    return duration;
  }
}

/**
 * Database query logger
 */
export function logDatabaseQuery(query: string, duration: number, params?: any[]) {
  if (duration > 100) {
    logger.warn('Slow Database Query', {
      query,
      duration: `${duration}ms`,
      params: params?.slice(0, 3), // Only log first 3 params
    });
  }
}

/**
 * Business event logger for audit trail
 */
export function logBusinessEvent(event: string, data: Record<string, any>) {
  logger.info('Business Event', {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

export default logger;
