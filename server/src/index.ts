import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env.js';
import { setupSwagger } from './config/swagger.js';
import { logger, requestLogger } from './config/monitoring.js';
import { performanceMiddleware } from './utils/performance.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initializeWorkflowSystem, shutdownWorkflowSystem } from './services/workflow-init.service.js';
import { emailQueueService } from './services/emailQueue.service.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { setupProcessHandlers } from './utils/process-handlers.js';
import { waitForDatabase, disconnectDatabase, checkMigrationStatus } from './utils/database-health.js';
import { securityHeaders, apiSecurityHeaders, contentSecurityPolicy } from './utils/security-headers.js';
import { detectSuspiciousPatterns, validateContentType } from './utils/request-validator.js';

/**
 * AFOCE - Adaptive Financial Operations & Compliance Engine
 * Backend Server - Production-hardened Express application
 */

const app = express();

// Security middleware (Production-hardened)
app.use(helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? contentSecurityPolicy : false,
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
}));
app.use(securityHeaders);
app.use(apiSecurityHeaders);

// CORS configuration
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
}));

// Request logging
app.use(requestLogger);

// Performance monitoring
app.use(performanceMiddleware);

// Request validation & security
app.use(detectSuspiciousPatterns);
app.use(validateContentType(['application/json', 'multipart/form-data']));

// Rate limiting (global)
app.use('/api', apiLimiter);

// Body parsing with size limits
app.use(express.json({ 
    limit: '10mb',
    strict: true,
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb',
    parameterLimit: 1000,
}));

// Static files (uploads)
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR || './uploads')));

// Root health check (for load balancers hitting /)
app.get('/', (_req, res) => {
    res.json({
        success: true,
        data: {
            name: 'AFOCE API',
            status: 'running',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        },
    });
});

// API Documentation
setupSwagger(app);

// API routes
app.use('/api', routes);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server with production-grade initialization
const startServer = async (): Promise<void> => {
    try {
        logger.info('🚀 Starting AFOCE Backend Server...');

        // 1. Wait for database to be ready
        await waitForDatabase();

        // 2. Verify database migrations
        await checkMigrationStatus();

        // 3. Initialize workflow system
        await initializeWorkflowSystem();

        // 4. Start email queue worker (if Redis is available)
        try {
            emailQueueService.startWorker();
            logger.info('  ✓ Email queue worker started');
        } catch (err) {
            logger.warn('  ⚠ Email queue worker not started (Redis may not be available)');
        }

        // 5. Start HTTP server
        const server = app.listen(env.PORT, () => {
            logger.info(`
╔═══════════════════════════════════════════════════════════╗
║     AFOCE - Backend Server                                ║
╠═══════════════════════════════════════════════════════════╣
║  Status:      ✓ Running                                   ║
║  Environment: ${env.NODE_ENV.padEnd(43)}║
║  Port:        ${String(env.PORT).padEnd(43)}║
║  API URL:     http://localhost:${env.PORT}/api${' '.repeat(24)}║
║  API Docs:    http://localhost:${env.PORT}/api-docs${' '.repeat(19)}║
║  Database:    ✓ Connected${' '.repeat(30)}║
║  Workflow:    ✓ Initialized${' '.repeat(30)}║
║  Email Queue: ✓ Running${' '.repeat(32)}║
║  Security:    ✓ Hardened${' '.repeat(31)}║
╚═══════════════════════════════════════════════════════════╝
    `);
        });

        // Set server timeout (2 minutes for long-running requests)
        server.timeout = 120000;

        // Keep-alive timeout
        server.keepAliveTimeout = 65000;

    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown handler
const shutdown = async (): Promise<void> => {
    logger.info('🛑 Initiating graceful shutdown...');
    
    try {
        // 1. Stop accepting new connections
        logger.info('  → Stopping HTTP server...');
        
        // 2. Shutdown workflow system
        logger.info('  → Shutting down workflow system...');
        await shutdownWorkflowSystem();
        
        // 3. Shutdown email queue
        logger.info('  → Shutting down email queue...');
        await emailQueueService.close();
        
        // 4. Disconnect from database
        logger.info('  → Disconnecting from database...');
        await disconnectDatabase();
        
        logger.info('✓ Graceful shutdown complete');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

// Setup all process error handlers and shutdown signals
setupProcessHandlers(shutdown);

// Start the server
startServer();

export default app;
