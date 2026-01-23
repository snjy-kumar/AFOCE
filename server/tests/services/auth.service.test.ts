/**
 * Authentication Service Tests
 * Testing user registration, login, and JWT token generation
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authService } from '../../src/services/auth.service.js';
import prisma from '../../src/lib/prisma.js';
import type { User } from '@prisma/client';

// Mock Prisma
jest.mock('../../src/lib/prisma.js', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('authService', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    password: '$2a$10$abcdefghijklmnopqrstuv', // bcrypt hash
    businessName: 'Test Business',
    panNumber: null,
    vatNumber: null,
    address: null,
    phone: null,
    logoUrl: null,
    settings: {},
    language: 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        businessName: 'New User Business',
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        ...mockUser,
        email: registerData.email,
        businessName: registerData.businessName || 'Test Business',
      });

      const result = await authService.register(registerData);

      expect(result).toBeDefined();
      expect(result.email).toBe(registerData.email);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        businessName: 'Existing User Business',
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      await expect(authService.register(registerData)).rejects.toThrow('Email already registered');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should hash password before storing', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'PlainTextPassword',
        businessName: 'New User Business',
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue(mockUser);

      await authService.register(registerData);

      const createCall: any = (prisma.user.create as any).mock.calls[0][0];
      const hashedPassword = createCall.data.password;

      // Verify password was hashed (should not be plain text)
      expect(hashedPassword).not.toBe(registerData.password);
      expect(hashedPassword).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt format
    });
  });

  describe('login', () => {
    it('should successfully login with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'CorrectPassword123!',
      };

      const hashedPassword = await bcrypt.hash(loginData.password, 10);
      (prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      (prisma.user.update as any).mockResolvedValue(mockUser);

      const result = await authService.login(loginData);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      
      // Verify token is valid JWT
      const decoded = jwt.decode(result.token) as any;
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockUser.id);
    });

    it('should throw error if user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SomePassword123!',
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const correctPassword = 'CorrectPassword123!';
      const hashedPassword = await bcrypt.hash(correctPassword, 10);
      (prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user is inactive', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'CorrectPassword123!',
      };

      const hashedPassword = await bcrypt.hash(loginData.password, 10);
      (prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      await expect(authService.login(loginData)).rejects.toThrow('Account is deactivated');
    });

    it('should update lastLoginAt timestamp', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'CorrectPassword123!',
      };

      const hashedPassword = await bcrypt.hash(loginData.password, 10);
      (prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      (prisma.user.update as any).mockResolvedValue(mockUser);

      await authService.login(loginData);

      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: mockUser.id,
        email: mockUser.email,
      };

      const token = authService.generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token can be decoded
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should include expiration in token', () => {
      const payload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.email,
      };

      const token = authService.generateToken(payload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.email,
      };

      const token = authService.generateToken(payload);
      const decoded = authService.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => authService.verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create token with immediate expiration
      const payload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.email,
      };
      const expiredToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '0s' });

      // Wait a bit to ensure expiration
      setTimeout(() => {
        expect(() => authService.verifyToken(expiredToken)).toThrow('jwt expired');
      }, 100);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const profile = await authService.getProfile(mockUser.id);

      expect(profile).toBeDefined();
      expect(profile.id).toBe(mockUser.id);
      expect(profile.email).toBe(mockUser.email);
      expect(profile).not.toHaveProperty('password');
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(authService.getProfile('nonexistent-id')).rejects.toThrow('User not found');
    });
  });

  describe('changePassword', () => {
    it('should successfully change password with correct old password', async () => {
      const oldPassword = 'OldPassword123!';
      const newPassword = 'NewPassword456!';
      const hashedOldPassword = await bcrypt.hash(oldPassword, 10);

      (prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        password: hashedOldPassword,
      });
      (prisma.user.update as any).mockResolvedValue(mockUser);

      await authService.changePassword(mockUser.id, oldPassword, newPassword);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { password: expect.any(String) },
      });

      // Verify new password was hashed
      const updateCall = (prisma.user.update as any).mock.calls[0][0];
      const newHashedPassword = updateCall.data.password;
      expect(newHashedPassword).not.toBe(newPassword);
      expect(await bcrypt.compare(newPassword, newHashedPassword)).toBe(true);
    });

    it('should throw error if old password is incorrect', async () => {
      const oldPassword = 'WrongOldPassword!';
      const newPassword = 'NewPassword456!';
      const correctOldPassword = 'CorrectOldPassword123!';
      const hashedOldPassword = await bcrypt.hash(correctOldPassword, 10);

      (prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        password: hashedOldPassword,
      });

      await expect(
        authService.changePassword(mockUser.id, oldPassword, newPassword)
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should not allow same old and new password', async () => {
      const password = 'SamePassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      (prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      await expect(
        authService.changePassword(mockUser.id, password, password)
      ).rejects.toThrow('New password must be different');
    });
  });
});
