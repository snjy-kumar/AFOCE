/**
 * Swagger/OpenAPI Configuration
 * Auto-generates API documentation from JSDoc comments
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import { env } from '../config/env.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AFOCE API',
      version: '1.0.0',
      description: `
        Adaptive Financial Operations & Compliance Engine
        
        A comprehensive accounting and financial management system for Nepalese businesses.
        
        ## Features
        - Invoice & Expense Management
        - VAT Compliance (Nepal IRD)
        - Bank Reconciliation
        - Chart of Accounts
        - Customer & Vendor Management
        - Enterprise Workflow Engine
        - Role-Based Access Control (RBAC)
        - Audit Trail & Compliance Reporting
        
        ## Authentication
        All protected endpoints require a JWT token in the Authorization header:
        \`Authorization: Bearer <token>\`
        
        Obtain a token by calling \`POST /api/auth/login\`
      `,
      contact: {
        name: 'AFOCE Support',
        email: 'support@afoce.com',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.afoce.com',
        description: 'Production server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Invoices', description: 'Invoice management' },
      { name: 'Expenses', description: 'Expense tracking' },
      { name: 'Customers', description: 'Customer management' },
      { name: 'Vendors', description: 'Vendor management' },
      { name: 'Accounts', description: 'Chart of accounts' },
      { name: 'Bank', description: 'Bank account & reconciliation' },
      { name: 'VAT', description: 'VAT records & compliance' },
      { name: 'Reports', description: 'Financial reports' },
      { name: 'Dashboard', description: 'Dashboard & KPIs' },
      { name: 'Workflow', description: 'Workflow engine & approvals' },
      { name: 'Upload', description: 'File uploads' },
      { name: 'Sync', description: 'Offline sync queue' },
      { name: 'Health', description: 'System health checks' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Invalid input data' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'UNAUTHORIZED',
                  message: 'Authentication required',
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'FORBIDDEN',
                  message: 'You do not have permission to access this resource',
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: 'Resource not found',
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Invalid input data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'VALIDATION_ERROR',
                  message: 'Invalid input data',
                  details: [
                    { field: 'email', message: 'Invalid email format' },
                  ],
                },
              },
            },
          },
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'RATE_LIMIT_EXCEEDED',
                  message: 'Too many requests. Please try again later.',
                  retryAfter: 900,
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/schemas/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger UI on the Express app
 */
export function setupSwagger(app: Express): void {
  // Swagger JSON endpoint
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'AFOCE API Documentation',
      customfavIcon: '/favicon.ico',
    })
  );

  console.log(`📚 API Documentation available at http://localhost:${env.PORT}/api-docs`);
}

export default swaggerSpec;
