/**
 * Test helpers for API integration tests
 * Provides utilities for mocking Supabase auth and database operations
 */

import { expect, vi } from 'vitest';

export interface MockUser {
  id: string;
  email: string;
}

export interface MockProfile {
  id: string;
  org_id: string;
  role: 'finance_admin' | 'manager' | 'team_member';
  full_name: string;
}

/**
 * Create a mock authenticated user
 */
export function createMockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    ...overrides,
  };
}

/**
 * Create a mock user profile
 */
export function createMockProfile(
  userId: string,
  overrides?: Partial<MockProfile>,
): MockProfile {
  return {
    id: userId,
    org_id: 'test-org-id',
    role: 'finance_admin',
    full_name: 'Test User',
    ...overrides,
  };
}

/**
 * Mock Supabase auth.getUser() response
 */
export function mockSupabaseGetUser(user: MockUser | null) {
  return {
    data: { user },
    error: null,
  };
}

/**
 * Mock Supabase select query for profiles
 */
export function mockSupabaseSelect(data: unknown) {
  return {
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data,
      error: null,
    }),
    select: vi.fn().mockReturnThis(),
  };
}

/**
 * Mock Supabase from('table').select()
 */
export function mockSupabaseFrom(tableName: string) {
  return {
    select: vi.fn().mockReturnValue(mockSupabaseSelect(null)),
  };
}

/**
 * Create mock Supabase client
 */
export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  };
}

/**
 * Extract JSON body from Request
 */
export async function parseRequestBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Helper to create test Request objects
 */
export function createMockRequest(
  method: string = 'GET',
  body?: unknown,
): Request {
  const url = new URL('http://localhost:3000/api/test');

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    init.body = JSON.stringify(body);
  }

  return new Request(url, init);
}

/**
 * Expected error response format
 */
export function expectErrorResponse(response: Response, status: number) {
  expect(response.status).toBe(status);
  return response.json();
}

/**
 * Expected success response format
 */
export function expectSuccessResponse(response: Response, status: number = 200) {
  expect(response.status).toBe(status);
  return response.json();
}
