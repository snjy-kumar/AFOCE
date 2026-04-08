import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import prisma from './lib/prisma.js';

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR || './uploads')));

// Health check
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

// API routes
app.use('/api', routes);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        console.log('✓ Database connected');

        // Start HTTP server
        app.listen(env.PORT, () => {
            console.log(`\n🚀 AFOCE Backend running at http://localhost:${env.PORT}`);
            console.log(`   Environment: ${env.NODE_ENV}`);
            console.log(`   API: http://localhost:${env.PORT}/api\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
const shutdown = async (): Promise<void> => {
    console.log('\n🛑 Shutting down...');
    await prisma.$disconnect();
    console.log('✓ Shutdown complete');
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    process.exit(1);
});

startServer();

export default app;
