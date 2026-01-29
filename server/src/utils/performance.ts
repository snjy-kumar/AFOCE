/**
 * Performance Monitoring Utilities
 * Track and optimize application performance
 */

import { logger } from '../config/monitoring.js';

/**
 * Database query performance tracking
 */
export class QueryPerformanceMonitor {
  private static slowQueries: Map<string, number> = new Map();
  private static queryCount: Map<string, number> = new Map();
  
  static track(operation: string, duration: number, query?: string) {
    // Count queries
    const count = this.queryCount.get(operation) || 0;
    this.queryCount.set(operation, count + 1);
    
    // Track slow queries
    if (duration > 100) {
      const slowCount = this.slowQueries.get(operation) || 0;
      this.slowQueries.set(operation, slowCount + 1);
      
      logger.warn('Slow database query detected', {
        operation,
        duration: `${duration}ms`,
        query: query?.substring(0, 200),
        slowQueryCount: slowCount + 1,
      });
    }
  }
  
  static getStats() {
    return {
      totalQueries: Array.from(this.queryCount.values()).reduce((a, b) => a + b, 0),
      slowQueries: Array.from(this.slowQueries.values()).reduce((a, b) => a + b, 0),
      operationStats: Object.fromEntries(this.queryCount),
      slowOperations: Object.fromEntries(this.slowQueries),
    };
  }
  
  static reset() {
    this.slowQueries.clear();
    this.queryCount.clear();
  }
}

/**
 * API endpoint performance tracking
 */
export class EndpointPerformanceMonitor {
  private static metrics: Map<string, {
    count: number;
    totalDuration: number;
    maxDuration: number;
    minDuration: number;
  }> = new Map();
  
  static track(endpoint: string, duration: number) {
    const existing = this.metrics.get(endpoint) || {
      count: 0,
      totalDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
    };
    
    this.metrics.set(endpoint, {
      count: existing.count + 1,
      totalDuration: existing.totalDuration + duration,
      maxDuration: Math.max(existing.maxDuration, duration),
      minDuration: Math.min(existing.minDuration, duration),
    });
    
    // Alert on slow endpoints
    if (duration > 2000) {
      logger.error('Very slow endpoint response', {
        endpoint,
        duration: `${duration}ms`,
      });
    }
  }
  
  static getStats() {
    const stats: any = {};
    
    this.metrics.forEach((value, key) => {
      stats[key] = {
        count: value.count,
        avgDuration: Math.round(value.totalDuration / value.count),
        maxDuration: value.maxDuration,
        minDuration: value.minDuration === Infinity ? 0 : value.minDuration,
      };
    });
    
    return stats;
  }
  
  static getSlowestEndpoints(limit: number = 10) {
    const sorted = Array.from(this.metrics.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgDuration: stats.totalDuration / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
    
    return sorted;
  }
  
  static reset() {
    this.metrics.clear();
  }
}

/**
 * Memory monitoring
 */
export class MemoryMonitor {
  // Note: heapUsed/heapTotal percentage can be misleading as Node.js
  // allocates memory in chunks. Only warn at very high levels.
  private static warningThreshold = 0.95; // 95% memory usage
  private static criticalThreshold = 0.99; // 99% memory usage
  
  static check() {
    const usage = process.memoryUsage();
    const heapUsedPercent = usage.heapUsed / usage.heapTotal;
    
    if (heapUsedPercent > this.criticalThreshold) {
      logger.error('Critical memory usage', {
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        percentage: `${Math.round(heapUsedPercent * 100)}%`,
      });
    } else if (heapUsedPercent > this.warningThreshold) {
      logger.warn('High memory usage', {
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        percentage: `${Math.round(heapUsedPercent * 100)}%`,
      });
    }
    
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      percentage: heapUsedPercent,
      rss: usage.rss,
      external: usage.external,
    };
  }
  
  static startMonitoring(intervalMs: number = 60000) {
    setInterval(() => {
      this.check();
    }, intervalMs);
  }
}

/**
 * Request metrics aggregator
 */
export class MetricsAggregator {
  private static requests: number = 0;
  private static errors: number = 0;
  private static startTime: number = Date.now();
  
  static incrementRequests() {
    this.requests++;
  }
  
  static incrementErrors() {
    this.errors++;
  }
  
  static getMetrics() {
    const uptime = Date.now() - this.startTime;
    const uptimeSeconds = Math.floor(uptime / 1000);
    
    return {
      uptime: uptimeSeconds,
      requests: this.requests,
      errors: this.errors,
      errorRate: this.requests > 0 ? (this.errors / this.requests * 100).toFixed(2) + '%' : '0%',
      requestsPerSecond: this.requests > 0 ? (this.requests / uptimeSeconds).toFixed(2) : '0',
      memory: MemoryMonitor.check(),
      database: QueryPerformanceMonitor.getStats(),
      endpoints: EndpointPerformanceMonitor.getSlowestEndpoints(5),
    };
  }
  
  static reset() {
    this.requests = 0;
    this.errors = 0;
    this.startTime = Date.now();
    QueryPerformanceMonitor.reset();
    EndpointPerformanceMonitor.reset();
  }
}

/**
 * Middleware to track endpoint performance
 */
export function performanceMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  
  MetricsAggregator.incrementRequests();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    
    EndpointPerformanceMonitor.track(endpoint, duration);
    
    if (res.statusCode >= 500) {
      MetricsAggregator.incrementErrors();
    }
  });
  
  next();
}

/**
 * Get performance report
 */
export function getPerformanceReport() {
  return {
    timestamp: new Date().toISOString(),
    metrics: MetricsAggregator.getMetrics(),
    recommendations: generateRecommendations(),
  };
}

/**
 * Generate performance recommendations
 */
function generateRecommendations() {
  const recommendations: string[] = [];
  const metrics = MetricsAggregator.getMetrics();
  
  // Check error rate
  const errorRate = parseFloat(metrics.errorRate);
  if (errorRate > 5) {
    recommendations.push(`High error rate (${metrics.errorRate}). Investigate error logs.`);
  }
  
  // Check slow endpoints
  if (metrics.endpoints.length > 0) {
    const slowest = metrics.endpoints[0];
    if (slowest.avgDuration > 1000) {
      recommendations.push(`Endpoint "${slowest.endpoint}" is slow (${slowest.avgDuration.toFixed(0)}ms avg). Consider optimization.`);
    }
  }
  
  // Check memory
  const memPercent = metrics.memory.percentage;
  if (memPercent > 0.85) {
    recommendations.push(`High memory usage (${(memPercent * 100).toFixed(0)}%). Consider implementing caching or scaling.`);
  }
  
  // Check database
  const dbStats = metrics.database;
  if (dbStats.slowQueries > dbStats.totalQueries * 0.1) {
    recommendations.push(`${((dbStats.slowQueries / dbStats.totalQueries) * 100).toFixed(0)}% of queries are slow. Review database indexes.`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('System performance is optimal.');
  }
  
  return recommendations;
}

// Start memory monitoring
MemoryMonitor.startMonitoring();
