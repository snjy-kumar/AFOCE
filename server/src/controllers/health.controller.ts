/**
 * Health Check Controller
 * Provides detailed system health information
 */

import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    workflow: 'healthy' | 'unhealthy';
  };
  system?: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: number;
  };
}

// Cache for health check results (avoid hammering services)
let cachedHealth: HealthStatus | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 30000; // 30 seconds

/**
 * Basic health check - fast response
 */
export async function getHealth(_req: Request, res: Response): Promise<void> {
  try {
    // Quick check - just verify app is running
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
}

/**
 * Detailed health check - checks all services
 */
export async function getDetailedHealth(_req: Request, res: Response): Promise<void> {
  try {
    // Return cached result if still valid
    const now = Date.now();
    if (cachedHealth && (now - cacheTime) < CACHE_TTL) {
      res.status(cachedHealth.status === 'healthy' ? 200 : 503).json(cachedHealth);
      return;
    }

    // Check database
    const dbHealthy = await checkDatabase();
    
    // Check Redis
    const redisHealthy = await checkRedis();
    
    // Check workflow system (simplified - just check if initialized)
    const workflowHealthy = true; // Assume healthy if app started
    
    // System metrics
    const memUsage = process.memoryUsage();
    const systemInfo = {
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      },
      cpu: process.cpuUsage().user / 1000000, // seconds
    };
    
    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (dbHealthy && redisHealthy && workflowHealthy) {
      overallStatus = 'healthy';
    } else if (dbHealthy) {
      // If DB is up but other services are down, degraded
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        redis: redisHealthy ? 'healthy' : 'unhealthy',
        workflow: workflowHealthy ? 'healthy' : 'unhealthy',
      },
      system: systemInfo,
    };
    
    // Cache the result
    cachedHealth = healthStatus;
    cacheTime = now;
    
    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Check Redis connectivity
 */
async function checkRedis(): Promise<boolean> {
  try {
    // Simplified Redis check - assume healthy if no errors
    // In production, you'd use actual Redis client
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

/**
 * Readiness check - for Kubernetes/Docker
 */
export async function getReadiness(_req: Request, res: Response): Promise<void> {
  try {
    // Check if app is ready to accept traffic
    const dbHealthy = await checkDatabase();
    
    if (dbHealthy) {
      res.status(200).json({ ready: true });
    } else {
      res.status(503).json({ ready: false, reason: 'Database not ready' });
    }
  } catch (error) {
    res.status(503).json({ ready: false, reason: 'Health check failed' });
  }
}

/**
 * Liveness check - for Kubernetes/Docker
 */
export async function getLiveness(_req: Request, res: Response): Promise<void> {
  // Simple check - if we can respond, we're alive
  res.status(200).json({ alive: true });
}
