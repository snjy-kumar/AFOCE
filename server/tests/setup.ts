/**
 * Jest Test Setup
 * Runs before all tests
 */
import { jest } from '@jest/globals';

// Mock environment variables (must be set before importing any modules)
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/afoce_test';
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Mock Redis for tests (prevent actual Redis connection)
jest.mock('ioredis', () => {
  const mockFn = jest.fn;
  return mockFn().mockImplementation(() => ({
    on: mockFn(),
    connect: mockFn().mockImplementation(() => Promise.resolve(undefined)),
    disconnect: mockFn().mockImplementation(() => Promise.resolve(undefined)),
    quit: mockFn().mockImplementation(() => Promise.resolve(undefined)),
    ping: mockFn().mockImplementation(() => Promise.resolve('PONG')),
  }));
});

// Mock BullMQ for tests
jest.mock('bullmq', () => {
  const mockFn = jest.fn;
  return {
    Queue: mockFn().mockImplementation(() => ({
      add: mockFn().mockImplementation(() => Promise.resolve({ id: 'test-job-id' })),
      getJob: mockFn().mockImplementation(() => Promise.resolve(null)),
      close: mockFn().mockImplementation(() => Promise.resolve(undefined)),
    })),
    Worker: mockFn().mockImplementation(() => ({
      on: mockFn(),
      close: mockFn().mockImplementation(() => Promise.resolve(undefined)),
    })),
  };
});

// Mock Nodemailer for tests
jest.mock('nodemailer', () => {
  const mockFn = jest.fn;
  return {
    createTransport: mockFn().mockReturnValue({
      sendMail: mockFn().mockImplementation(() => Promise.resolve({ messageId: 'test-message-id' })),
    }),
  };
});

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
