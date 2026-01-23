/**
 * Invoice Service Tests
 * Testing invoice CRUD operations and business logic
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { invoiceService } from '../../src/services/invoice.service.js';
import { prisma } from '../../src/lib/prisma.js';
import type { Invoice, InvoiceItem } from '@prisma/client';

jest.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    invoice: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    invoiceItem: {
      deleteMany: jest.fn(),
    },
  },
}));

describe('invoiceService', () => {
  const mockInvoice: any = {
    id: 'inv-123',
    invoiceNumber: 'INV-001',
    customerId: 'cust-123',
    userId: 'user-123',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    status: 'DRAFT',
    subtotal: 1000,
    vatRate: 13,
    vatAmount: 130,
    discountAmount: 0,
    total: 1130,
    paidAmount: 0,
    notes: null,
    terms: null,
    pdfUrl: null,
    syncStatus: 'synced',
    localId: null,
    requiresApproval: false,
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null,
    workflowState: null,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInvoiceItems: any[] = [
    {
      id: 'item-1',
      invoiceId: 'inv-123',
      description: 'Web Development',
      quantity: 10,
      rate: 100,
      amount: 1000,
      
      vatAmount: 130,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInvoices', () => {
    it('should return paginated invoices', async () => {
      const mockInvoices = [mockInvoice];
      (prisma.invoice.findMany as any).mockResolvedValue(mockInvoices);
      (prisma.invoice.count as any).mockResolvedValue(1);

      const result = await invoiceService.getInvoices('org-123', {
        page: 1,
        limit: 20,
      });

      expect(result.invoices).toEqual(mockInvoices);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter invoices by status', async () => {
      (prisma.invoice.findMany as any).mockResolvedValue([mockInvoice]);
      (prisma.invoice.count as any).mockResolvedValue(1);

      await invoiceService.getInvoices('org-123', {
        status: 'DRAFT',
        page: 1,
        limit: 20,
      });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'DRAFT',
          }),
        })
      );
    });

    it('should filter invoices by date range', async () => {
      (prisma.invoice.findMany as any).mockResolvedValue([mockInvoice]);
      (prisma.invoice.count as any).mockResolvedValue(1);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      await invoiceService.getInvoices('org-123', {
        startDate,
        endDate,
        page: 1,
        limit: 20,
      });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
        })
      );
    });
  });

  describe('getInvoiceById', () => {
    it('should return invoice with items and customer', async () => {
      const mockFullInvoice = {
        ...mockInvoice,
        items: mockInvoiceItems,
        customer: {
          id: 'cust-123',
          name: 'Test Customer',
          email: 'customer@example.com',
        },
      };

      (prisma.invoice.findUnique as any).mockResolvedValue(mockFullInvoice);

      const result = await invoiceService.getInvoiceById('inv-123', 'org-123');

      expect(result).toEqual(mockFullInvoice);
      expect(result.items).toHaveLength(1);
      expect(result.customer).toBeDefined();
    });

    it('should throw error if invoice not found', async () => {
      (prisma.invoice.findUnique as any).mockResolvedValue(null);

      await expect(
        invoiceService.getInvoiceById('nonexistent', 'org-123')
      ).rejects.toThrow('Invoice not found');
    });

    it('should throw error if invoice belongs to different organization', async () => {
      (prisma.invoice.findUnique as any).mockResolvedValue({
        ...mockInvoice,
        userId: 'other-org',
      });

      await expect(
        invoiceService.getInvoiceById('inv-123', 'org-123')
      ).rejects.toThrow('Invoice not found');
    });
  });

  describe('createInvoice', () => {
    it('should create invoice with items and calculate totals', async () => {
      const createData: any = {
        customerId: 'cust-123',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        vatRate: 13,
        discountAmount: 0,
        items: [
          {
            accountId: 'acc-123',
            description: 'Web Development',
            quantity: 10,
            rate: 100,
          },
        ],
      };

      (prisma.invoice.create as any).mockResolvedValue({
        ...mockInvoice,
        items: mockInvoiceItems,
      });

      const result = await invoiceService.createInvoice('org-123', createData);

      expect(result).toBeDefined();
      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerId: createData.customerId,
            userId: 'org-123',
            subtotal: 1000,
            vatAmount: 130,
            total: 1130,
          }),
        })
      );
    });

    it('should auto-generate invoice number', async () => {
      const createData = {
        customerId: 'cust-123',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        items: mockInvoiceItems,
      };

      (prisma.invoice.create as any).mockResolvedValue(mockInvoice);

      await invoiceService.createInvoice('org-123', createData);

      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            invoiceNumber: expect.stringMatching(/^INV-\d+$/),
          }),
        })
      );
    });

    it('should apply discount correctly', async () => {
      const createData = {
        customerId: 'cust-123',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        
        items: [
          {
            description: 'Service',
            quantity: 1,
            rate: 1000,
            
          },
        ],
      };

      (prisma.invoice.create as any).mockResolvedValue({
        ...mockInvoice,
        subtotal: 1000,
        vatAmount: 130,
        
        total: 1030, // 1000 + 130 - 100
      });

      const result = await invoiceService.createInvoice('org-123', createData);

      expect(result.discountAmount).toBe(100);
      expect(result.total).toBe(1030);
    });
  });

  describe('updateInvoice', () => {
    it('should update invoice and recalculate totals', async () => {
      const updateData = {
        items: [
          {
            description: 'Updated Service',
            quantity: 5,
            rate: 200,
            
          },
        ],
      };

      (prisma.invoice.findUnique as any).mockResolvedValue(mockInvoice);
      (prisma.invoiceItem.deleteMany as any).mockResolvedValue({ count: 1 });
      (prisma.invoice.update as any).mockResolvedValue({
        ...mockInvoice,
        subtotal: 1000,
        vatAmount: 130,
        total: 1130,
      });

      const result = await invoiceService.updateInvoice('inv-123', 'org-123', updateData);

      expect(result).toBeDefined();
      expect(prisma.invoiceItem.deleteMany).toHaveBeenCalled();
      expect(prisma.invoice.update).toHaveBeenCalled();
    });

    it('should not allow updating paid invoice', async () => {
      (prisma.invoice.findUnique as any).mockResolvedValue({
        ...mockInvoice,
        status: 'PAID',
      });

      await expect(
        invoiceService.updateInvoice('inv-123', 'org-123', { notes: 'Test' })
      ).rejects.toThrow('Cannot update paid invoice');
    });
  });

  describe('deleteInvoice', () => {
    it('should delete draft invoice', async () => {
      (prisma.invoice.findUnique as any).mockResolvedValue({
        ...mockInvoice,
        status: 'DRAFT',
      });
      (prisma.invoice.delete as any).mockResolvedValue(mockInvoice);

      await invoiceService.deleteInvoice('inv-123', 'org-123');

      expect(prisma.invoice.delete).toHaveBeenCalledWith({
        where: { id: 'inv-123' },
      });
    });

    it('should not allow deleting paid invoice', async () => {
      (prisma.invoice.findUnique as any).mockResolvedValue({
        ...mockInvoice,
        status: 'PAID',
      });

      await expect(
        invoiceService.deleteInvoice('inv-123', 'org-123')
      ).rejects.toThrow('Cannot delete paid invoice');
    });
  });

  describe('markAsPaid', () => {
    it('should mark invoice as paid and update amounts', async () => {
      (prisma.invoice.findUnique as any).mockResolvedValue(mockInvoice);
      (prisma.invoice.update as any).mockResolvedValue({
        ...mockInvoice,
        status: 'PAID',
        amountPaid: 1130,
        amountDue: 0,
      });

      const result = await invoiceService.markAsPaid('inv-123', 'org-123', {
        amount: 1130,
        paymentDate: new Date(),
      });

      expect(result.status).toBe('PAID');
      expect(result.amountPaid).toBe(1130);
      expect(result.amountDue).toBe(0);
    });

    it('should handle partial payment', async () => {
      (prisma.invoice.findUnique as any).mockResolvedValue(mockInvoice);
      (prisma.invoice.update as any).mockResolvedValue({
        ...mockInvoice,
        status: 'PARTIAL',
        amountPaid: 500,
        amountDue: 630,
      });

      const result = await invoiceService.markAsPaid('inv-123', 'org-123', {
        amount: 500,
        paymentDate: new Date(),
      });

      expect(result.status).toBe('PARTIAL');
      expect(result.amountPaid).toBe(500);
      expect(result.amountDue).toBe(630);
    });

    it('should throw error if payment exceeds total', async () => {
      (prisma.invoice.findUnique as any).mockResolvedValue(mockInvoice);

      await expect(
        invoiceService.markAsPaid('inv-123', 'org-123', {
          amount: 2000, // More than total
          paymentDate: new Date(),
        })
      ).rejects.toThrow('Payment amount exceeds invoice total');
    });
  });
});
