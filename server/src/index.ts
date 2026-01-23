import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

/**
 * AFOCE - Adaptive Financial Operations & Compliance Engine
 * Backend Server - Express application with security middleware and structured routing
 */

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR || './uploads')));

// API routes
app.use('/api', routes);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = (): void => {
    app.listen(env.PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║     AFOCE - Backend Server                                ║
╠═══════════════════════════════════════════════════════════╣
║  Status:      Running                                     ║
║  Environment: ${env.NODE_ENV.padEnd(43)}║
║  Port:        ${String(env.PORT).padEnd(43)}║
║  API URL:     http://localhost:${env.PORT}/api${' '.repeat(24)}║
╚═══════════════════════════════════════════════════════════╝
    `);
    });
};

startServer();

export default app;
