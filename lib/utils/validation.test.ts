import { describe, it, expect } from 'vitest';
import {
  createInvoiceSchema,
  createExpenseSchema,
  createClientSchema,
} from '@/lib/utils/validation';

describe('Validation Schemas', () => {
  describe('createInvoiceSchema', () => {
    it('should validate invoice with required fields', () => {
      const validData = {
        client_id: 'client-123',
        amount: 1000,
        bs_date: 'Baisakh 2081',
        ad_date: '2024-04-14',
        due_days: 30,
      };

      const result = createInvoiceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const invalidData = {
        client_id: 'client-123',
        amount: -100,
        bs_date: 'Baisakh 2081',
        ad_date: '2024-04-14',
        due_days: 30,
      };

      const result = createInvoiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject zero amount', () => {
      const invalidData = {
        client_id: 'client-123',
        amount: 0,
        bs_date: 'Baisakh 2081',
        ad_date: '2024-04-14',
        due_days: 30,
      };

      const result = createInvoiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require client_id', () => {
      const invalidData = {
        amount: 1000,
        bs_date: 'Baisakh 2081',
        ad_date: '2024-04-14',
        due_days: 30,
      };

      const result = createInvoiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should have default due_days of 30', () => {
      const validData = {
        client_id: 'client-123',
        amount: 1000,
        bs_date: 'Baisakh 2081',
        ad_date: '2024-04-14',
      };

      const result = createInvoiceSchema.safeParse(validData);
      if (result.success) {
        expect(result.data.due_days).toBe(30);
      }
    });
  });

  describe('createExpenseSchema', () => {
    it('should validate expense with required fields', () => {
      const validData = {
        employee: 'John Doe',
        category: 'Travel',
        amount: 500,
        bs_date: 'Baisakh 2081',
        ad_date: '2024-04-14',
      };

      const result = createExpenseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const invalidData = {
        employee: 'John Doe',
        category: 'Travel',
        amount: -500,
        bs_date: 'Baisakh 2081',
        ad_date: '2024-04-14',
      };

      const result = createExpenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject zero amount', () => {
      const invalidData = {
        employee: 'John Doe',
        category: 'Travel',
        amount: 0,
        bs_date: 'Baisakh 2081',
        ad_date: '2024-04-14',
      };

      const result = createExpenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require employee name', () => {
      const invalidData = {
        category: 'Travel',
        amount: 500,
        bs_date: 'Baisakh 2081',
        ad_date: '2024-04-14',
      };

      const result = createExpenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createClientSchema', () => {
    it('should validate client with required fields', () => {
      const validData = {
        name: 'Acme Corp',
        pan: '123456789',
      };

      const result = createClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate client with full data', () => {
      const validData = {
        name: 'Acme Corp',
        pan: '123456789',
        email: 'contact@acme.com',
        phone: '+977 1 4123456',
        type: 'vendor',
      };

      const result = createClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'Acme Corp',
        pan: '123456789',
        email: 'not-an-email',
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require name field', () => {
      const invalidData = {
        pan: '123456789',
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require valid 9-digit PAN', () => {
      const invalidData = {
        name: 'Simple Client',
        pan: '12345',
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
