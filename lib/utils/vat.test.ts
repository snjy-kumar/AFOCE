import { describe, it, expect } from 'vitest';
import {
  calculateVAT,
  calculateGross,
  calculateNetFromGross,
  extractVATFromGross,
  formatCurrency,
  generateVATReport,
  getMonthlyVATData,
} from '@/lib/utils/vat';

describe('VAT Calculations', () => {
  describe('calculateVAT', () => {
    it('should calculate 13% VAT correctly', () => {
      expect(calculateVAT(1000)).toBe(130);
      expect(calculateVAT(10000)).toBe(1300);
    });

    it('should handle zero amounts', () => {
      expect(calculateVAT(0)).toBe(0);
    });

    it('should round to nearest rupee', () => {
      expect(calculateVAT(100)).toBe(13);
      expect(calculateVAT(77)).toBe(10); // 77 * 0.13 = 10.01, rounds to 10
    });

    it('should handle decimal amounts', () => {
      expect(calculateVAT(1000.5)).toBe(130);
    });
  });

  describe('calculateGross', () => {
    it('should add VAT to base amount', () => {
      expect(calculateGross(1000)).toBe(1130);
      expect(calculateGross(10000)).toBe(11300);
    });

    it('should handle zero', () => {
      expect(calculateGross(0)).toBe(0);
    });
  });

  describe('calculateNetFromGross', () => {
    it('should extract net from gross', () => {
      expect(calculateNetFromGross(1130)).toBe(1000);
      expect(calculateNetFromGross(11300)).toBe(10000);
    });

    it('should handle zero', () => {
      expect(calculateNetFromGross(0)).toBe(0);
    });
  });

  describe('extractVATFromGross', () => {
    it('should extract VAT portion from gross', () => {
      expect(extractVATFromGross(1130)).toBe(130);
      expect(extractVATFromGross(11300)).toBe(1300);
    });

    it('should handle zero', () => {
      expect(extractVATFromGross(0)).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format numbers as NPR currency', () => {
      const formatted = formatCurrency(1000);
      expect(formatted).toContain('1,000');
    });

    it('should include decimal places', () => {
      const formatted = formatCurrency(1000.5);
      expect(formatted).toMatch(/\d+\.\d{2}/);
    });
  });

  describe('generateVATReport', () => {
    it('should calculate VAT report for period', () => {
      const invoices = [
        { amount: 1000, ad_date: '2024-01-15' },
        { amount: 2000, ad_date: '2024-01-20' },
      ];
      const expenses = [
        { amount: 500, ad_date: '2024-01-10' },
      ];

      const report = generateVATReport(invoices, expenses, {
        from: '2024-01-01',
        to: '2024-01-31',
      });

      expect(report.outputVAT).toBe(calculateVAT(3000));
      expect(report.inputVAT).toBe(calculateVAT(500));
      expect(report.netVAT).toBe(report.outputVAT - report.inputVAT);
      expect(report.invoiceCount).toBe(2);
      expect(report.expenseCount).toBe(1);
    });

    it('should exclude records outside period', () => {
      const invoices = [
        { amount: 1000, ad_date: '2023-12-15' },
        { amount: 2000, ad_date: '2024-01-20' },
      ];

      const report = generateVATReport(invoices, [], {
        from: '2024-01-01',
        to: '2024-01-31',
      });

      expect(report.invoiceCount).toBe(1);
      expect(report.outputVAT).toBe(calculateVAT(2000));
    });
  });

  describe('getMonthlyVATData', () => {
    it('should aggregate VAT by month', () => {
      const invoices = [
        { amount: 1000, ad_date: '2024-01-15' },
        { amount: 2000, ad_date: '2024-02-20' },
      ];
      const expenses = [
        { amount: 500, ad_date: '2024-01-10' },
      ];

      const monthlyData = getMonthlyVATData(invoices, expenses);

      expect(monthlyData).toHaveLength(2);
      expect(monthlyData[0].month).toBe('2024-01');
      expect(monthlyData[0].outputVAT).toBe(calculateVAT(1000));
      expect(monthlyData[0].inputVAT).toBe(calculateVAT(500));
      expect(monthlyData[1].month).toBe('2024-02');
    });

    it('should sort by month', () => {
      const invoices = [
        { amount: 1000, ad_date: '2024-03-15' },
        { amount: 2000, ad_date: '2024-01-20' },
        { amount: 1500, ad_date: '2024-02-10' },
      ];

      const monthlyData = getMonthlyVATData(invoices, []);

      expect(monthlyData[0].month).toBe('2024-01');
      expect(monthlyData[1].month).toBe('2024-02');
      expect(monthlyData[2].month).toBe('2024-03');
    });
  });
});
