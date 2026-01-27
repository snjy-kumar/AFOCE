import { Router, Response } from 'express';
import { currencyService } from '../services/currency.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/currencies:
 *   get:
 *     summary: Get all currencies
 *     tags: [Currencies]
 *     parameters:
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *         description: Include inactive currencies
 *     responses:
 *       200:
 *         description: List of currencies
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    const activeOnly = req.query.all !== 'true';
    const currencies = await currencyService.getCurrencies(activeOnly);
    res.json(currencies);
});

/**
 * @swagger
 * /api/currencies/initialize:
 *   post:
 *     summary: Initialize default currencies
 *     tags: [Currencies]
 *     responses:
 *       200:
 *         description: Default currencies initialized
 */
router.post('/initialize', async (_req: AuthenticatedRequest, res: Response) => {
    const result = await currencyService.initializeDefaultCurrencies();
    res.json(result);
});

/**
 * @swagger
 * /api/currencies:
 *   post:
 *     summary: Create a new currency
 *     tags: [Currencies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - symbol
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               nameNe:
 *                 type: string
 *               symbol:
 *                 type: string
 *               decimals:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               isBase:
 *                 type: boolean
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
    const currency = await currencyService.createCurrency(req.body);
    res.status(201).json(currency);
});

/**
 * @swagger
 * /api/currencies/{code}:
 *   get:
 *     summary: Get currency by code
 *     tags: [Currencies]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:code', async (req: AuthenticatedRequest, res: Response) => {
    const currency = await currencyService.getCurrencyByCode(req.params.code);
    res.json(currency);
});

/**
 * @swagger
 * /api/currencies/{code}:
 *   put:
 *     summary: Update currency
 *     tags: [Currencies]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:code', async (req: AuthenticatedRequest, res: Response) => {
    const currency = await currencyService.updateCurrency(req.params.code, req.body);
    res.json(currency);
});

/**
 * @swagger
 * /api/currencies/rates:
 *   post:
 *     summary: Set exchange rate
 *     tags: [Currencies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromCurrency
 *               - toCurrency
 *               - rate
 *             properties:
 *               fromCurrency:
 *                 type: string
 *               toCurrency:
 *                 type: string
 *               rate:
 *                 type: number
 *               effectiveDate:
 *                 type: string
 *               source:
 *                 type: string
 */
router.post('/rates', async (req: AuthenticatedRequest, res: Response) => {
    const rate = await currencyService.setExchangeRate(req.body);
    res.status(201).json(rate);
});

/**
 * @swagger
 * /api/currencies/rates/bulk:
 *   post:
 *     summary: Bulk set exchange rates
 *     tags: [Currencies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rates
 *             properties:
 *               rates:
 *                 type: array
 *               baseCurrency:
 *                 type: string
 */
router.post('/rates/bulk', async (req: AuthenticatedRequest, res: Response) => {
    const result = await currencyService.bulkSetExchangeRates(req.body.rates, req.body.baseCurrency);
    res.status(201).json(result);
});

/**
 * @swagger
 * /api/currencies/rates/{from}/{to}:
 *   get:
 *     summary: Get exchange rate
 *     tags: [Currencies]
 *     parameters:
 *       - in: path
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 */
router.get('/rates/:from/:to', async (req: AuthenticatedRequest, res: Response) => {
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const rate = await currencyService.getExchangeRate(req.params.from, req.params.to, date);
    res.json(rate);
});

/**
 * @swagger
 * /api/currencies/rates/{from}/{to}/history:
 *   get:
 *     summary: Get exchange rate history
 *     tags: [Currencies]
 */
router.get('/rates/:from/:to/history', async (req: AuthenticatedRequest, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;
    const history = await currencyService.getExchangeRateHistory(req.params.from, req.params.to, days);
    res.json(history);
});

/**
 * @swagger
 * /api/currencies/convert:
 *   post:
 *     summary: Convert amount between currencies
 *     tags: [Currencies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - fromCurrency
 *               - toCurrency
 *             properties:
 *               amount:
 *                 type: number
 *               fromCurrency:
 *                 type: string
 *               toCurrency:
 *                 type: string
 *               date:
 *                 type: string
 */
router.post('/convert', async (req: AuthenticatedRequest, res: Response) => {
    const { amount, fromCurrency, toCurrency, date } = req.body;
    const result = await currencyService.convertAmount(
        amount,
        fromCurrency,
        toCurrency,
        date ? new Date(date) : undefined
    );
    res.json(result);
});

/**
 * @swagger
 * /api/currencies/{base}/rates:
 *   get:
 *     summary: Get all exchange rates for a base currency
 *     tags: [Currencies]
 */
router.get('/:base/rates', async (req: AuthenticatedRequest, res: Response) => {
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const rates = await currencyService.getExchangeRatesForCurrency(req.params.base, date);
    res.json(rates);
});

export default router;
