/**
 * Jest Test Setup
 * Runs before all tests
 */
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/afoce_test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Mock Redis for tests (prevent actual Redis connection)
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined as any),
    disconnect: jest.fn().mockResolvedValue(undefined as any),
    quit: jest.fn().mockResolvedValue(undefined as any),
    ping: jest.fn().mockResolvedValue('PONG' as any),
  }));
});

// Mock BullMQ for tests
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'test-job-id' } as any),
    getJob: jest.fn().mockResolvedValue(null as any),
    close: jest.fn().mockResolvedValue(undefined as any),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined as any),
  })),
}));

// Mock Nodemailer for tests
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' } as any),
  }),
}));

// Global test utilities
(global as any).testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    businessName: 'Test Business',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockJWT: () => 'mock-jwt-token',
  
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};
