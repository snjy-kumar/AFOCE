import { Decimal } from '@prisma/client/runtime/client';
import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Currency service - Multi-currency support with exchange rates
 */

export interface CreateCurrencyInput {
    code: string;
    name: string;
    nameNe?: string;
    symbol: string;
    decimals?: number;
    isActive?: boolean;
    isBase?: boolean;
}

export interface ExchangeRateInput {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    effectiveDate?: string;
    source?: string;
}

// Default currencies for Nepal
const DEFAULT_CURRENCIES = [
    { code: 'NPR', name: 'Nepali Rupee', nameNe: 'नेपाली रुपैयाँ', symbol: 'रु', isBase: true },
    { code: 'USD', name: 'US Dollar', nameNe: 'अमेरिकी डलर', symbol: '$' },
    { code: 'INR', name: 'Indian Rupee', nameNe: 'भारतीय रुपैयाँ', symbol: '₹' },
    { code: 'EUR', name: 'Euro', nameNe: 'युरो', symbol: '€' },
    { code: 'GBP', name: 'British Pound', nameNe: 'ब्रिटिश पाउण्ड', symbol: '£' },
    { code: 'AUD', name: 'Australian Dollar', nameNe: 'अस्ट्रेलियन डलर', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', nameNe: 'क्यानेडियन डलर', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', nameNe: 'स्विस फ्र्याङ्क', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', nameNe: 'चिनियाँ युआन', symbol: '¥' },
    { code: 'JPY', name: 'Japanese Yen', nameNe: 'जापानी येन', symbol: '¥', decimals: 0 },
];

export const currencyService = {
    /**
     * Initialize default currencies
     */
    async initializeDefaultCurrencies() {
        for (const currency of DEFAULT_CURRENCIES) {
            await prisma.currency.upsert({
                where: { code: currency.code },
                create: {
                    code: currency.code,
                    name: currency.name,
                    nameNe: currency.nameNe,
                    symbol: currency.symbol,
                    decimals: currency.decimals ?? 2,
                    isBase: currency.isBase ?? false,
                    isActive: true,
                },
                update: {}, // Don't update if exists
            });
        }
        return { message: 'Default currencies initialized' };
    },

    /**
     * Get all currencies
     */
    async getCurrencies(activeOnly = true) {
        return prisma.currency.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: [
                { isBase: 'desc' },
                { code: 'asc' },
            ],
        });
    },

    /**
     * Get currency by code
     */
    async getCurrencyByCode(code: string) {
        const currency = await prisma.currency.findUnique({
            where: { code: code.toUpperCase() },
        });
        if (!currency) {
            throw new ApiError(404, 'CURRENCY_NOT_FOUND', `Currency ${code} not found`);
        }
        return currency;
    },

    /**
     * Create a new currency
     */
    async createCurrency(data: CreateCurrencyInput) {
        const existing = await prisma.currency.findUnique({
            where: { code: data.code.toUpperCase() },
        });
        if (existing) {
            throw new ApiError(409, 'CURRENCY_EXISTS', `Currency ${data.code} already exists`);
        }

        // If setting as base, unset other base currencies
        if (data.isBase) {
            await prisma.currency.updateMany({
                where: { isBase: true },
                data: { isBase: false },
            });
        }

        return prisma.currency.create({
            data: {
                code: data.code.toUpperCase(),
                name: data.name,
                nameNe: data.nameNe,
                symbol: data.symbol,
                decimals: data.decimals ?? 2,
                isActive: data.isActive ?? true,
                isBase: data.isBase ?? false,
            },
        });
    },

    /**
     * Update currency
     */
    async updateCurrency(code: string, data: Partial<CreateCurrencyInput>) {
        const existing = await prisma.currency.findUnique({
            where: { code: code.toUpperCase() },
        });
        if (!existing) {
            throw new ApiError(404, 'CURRENCY_NOT_FOUND', `Currency ${code} not found`);
        }

        // If setting as base, unset other base currencies
        if (data.isBase && !existing.isBase) {
            await prisma.currency.updateMany({
                where: { isBase: true },
                data: { isBase: false },
            });
        }

        return prisma.currency.update({
            where: { code: code.toUpperCase() },
            data: {
                name: data.name,
                nameNe: data.nameNe,
                symbol: data.symbol,
                decimals: data.decimals,
                isActive: data.isActive,
                isBase: data.isBase,
            },
        });
    },

    /**
     * Set exchange rate
     */
    async setExchangeRate(data: ExchangeRateInput) {
        const effectiveDate = data.effectiveDate ? new Date(data.effectiveDate) : new Date();
        // Normalize date to start of day
        effectiveDate.setHours(0, 0, 0, 0);

        return prisma.exchangeRate.upsert({
            where: {
                fromCurrency_toCurrency_effectiveDate: {
                    fromCurrency: data.fromCurrency.toUpperCase(),
                    toCurrency: data.toCurrency.toUpperCase(),
                    effectiveDate,
                },
            },
            create: {
                fromCurrency: data.fromCurrency.toUpperCase(),
                toCurrency: data.toCurrency.toUpperCase(),
                rate: new Decimal(data.rate),
                effectiveDate,
                source: data.source ?? 'manual',
            },
            update: {
                rate: new Decimal(data.rate),
                source: data.source ?? 'manual',
            },
        });
    },

    /**
     * Get latest exchange rate
     */
    async getExchangeRate(fromCurrency: string, toCurrency: string, date?: Date) {
        const targetDate = date ? new Date(date) : new Date();

        const rate = await prisma.exchangeRate.findFirst({
            where: {
                fromCurrency: fromCurrency.toUpperCase(),
                toCurrency: toCurrency.toUpperCase(),
                effectiveDate: { lte: targetDate },
            },
            orderBy: { effectiveDate: 'desc' },
        });

        if (!rate) {
            // Try reverse rate
            const reverseRate = await prisma.exchangeRate.findFirst({
                where: {
                    fromCurrency: toCurrency.toUpperCase(),
                    toCurrency: fromCurrency.toUpperCase(),
                    effectiveDate: { lte: targetDate },
                },
                orderBy: { effectiveDate: 'desc' },
            });

            if (reverseRate) {
                return {
                    fromCurrency: fromCurrency.toUpperCase(),
                    toCurrency: toCurrency.toUpperCase(),
                    rate: 1 / Number(reverseRate.rate),
                    effectiveDate: reverseRate.effectiveDate,
                    source: reverseRate.source,
                    isReverse: true,
                };
            }

            throw new ApiError(404, 'RATE_NOT_FOUND', `Exchange rate from ${fromCurrency} to ${toCurrency} not found`);
        }

        return {
            ...rate,
            rate: Number(rate.rate),
            isReverse: false,
        };
    },

    /**
     * Get all exchange rates for a base currency
     */
    async getExchangeRatesForCurrency(baseCurrency: string, date?: Date) {
        const targetDate = date ? new Date(date) : new Date();

        const rates = await prisma.exchangeRate.findMany({
            where: {
                fromCurrency: baseCurrency.toUpperCase(),
                effectiveDate: { lte: targetDate },
            },
            orderBy: { effectiveDate: 'desc' },
        });

        const latestByPair = new Map<string, typeof rates[number]>();

        for (const rate of rates) {
            const key = `${rate.fromCurrency}-${rate.toCurrency}`;
            if (!latestByPair.has(key)) {
                latestByPair.set(key, rate);
            }
        }

        return Array.from(latestByPair.values()).map((rate) => ({
            ...rate,
            rate: Number(rate.rate),
        }));
    },

    /**
     * Convert amount from one currency to another
     */
    async convertAmount(amount: number, fromCurrency: string, toCurrency: string, date?: Date) {
        if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
            return {
                originalAmount: amount,
                convertedAmount: amount,
                fromCurrency: fromCurrency.toUpperCase(),
                toCurrency: toCurrency.toUpperCase(),
                rate: 1,
            };
        }

        const rateInfo = await this.getExchangeRate(fromCurrency, toCurrency, date);
        const convertedAmount = amount * rateInfo.rate;

        return {
            originalAmount: amount,
            convertedAmount: Math.round(convertedAmount * 100) / 100,
            fromCurrency: fromCurrency.toUpperCase(),
            toCurrency: toCurrency.toUpperCase(),
            rate: rateInfo.rate,
            effectiveDate: rateInfo.effectiveDate,
        };
    },

    /**
     * Bulk set exchange rates (useful for importing from central bank)
     */
    async bulkSetExchangeRates(rates: ExchangeRateInput[], baseCurrency = 'NPR') {
        const effectiveDate = new Date();
        effectiveDate.setHours(0, 0, 0, 0);

        const results = await Promise.all(
            rates.map((rate) =>
                this.setExchangeRate({
                    fromCurrency: rate.fromCurrency || baseCurrency,
                    toCurrency: rate.toCurrency,
                    rate: rate.rate,
                    effectiveDate: rate.effectiveDate,
                    source: rate.source ?? 'bulk_import',
                })
            )
        );

        return {
            count: results.length,
            rates: results,
        };
    },

    /**
     * Get exchange rate history
     */
    async getExchangeRateHistory(fromCurrency: string, toCurrency: string, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return prisma.exchangeRate.findMany({
            where: {
                fromCurrency: fromCurrency.toUpperCase(),
                toCurrency: toCurrency.toUpperCase(),
                effectiveDate: { gte: startDate },
            },
            orderBy: { effectiveDate: 'desc' },
        });
    },
};
