import { Router, type Response, type NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types/index.js';
import { inventoryService } from '../services/inventory.service.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/inventory/products
 * @desc Get all products with filters
 */
router.get('/products', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const query = {
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 20,
            search: req.query.search as string,
            category: req.query.category as string,
            isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
            lowStock: req.query.lowStock === 'true',
        };

        const result = await inventoryService.getProducts(req.user!.userId, query);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /api/inventory/products
 * @desc Create a new product
 */
router.post('/products', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const product = await inventoryService.createProduct(req.user!.userId, req.body);
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/inventory/products/:id
 * @desc Get a single product by ID
 */
router.get('/products/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const product = await inventoryService.getProduct(req.user!.userId, req.params.id);
        res.json(product);
    } catch (error) {
        next(error);
    }
});

/**
 * @route PUT /api/inventory/products/:id
 * @desc Update a product
 */
router.put('/products/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const product = await inventoryService.updateProduct(req.user!.userId, req.params.id, req.body);
        res.json(product);
    } catch (error) {
        next(error);
    }
});

/**
 * @route DELETE /api/inventory/products/:id
 * @desc Delete a product
 */
router.delete('/products/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await inventoryService.deleteProduct(req.user!.userId, req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /api/inventory/products/:id/adjust-stock
 * @desc Adjust stock for a product
 */
router.post('/products/:id/adjust-stock', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { type, quantity, notes, unitCost, referenceType, referenceId } = req.body;
        
        if (!type || quantity === undefined) {
            throw new ApiError(400, 'MISSING_FIELDS', 'Type and quantity are required');
        }

        const result = await inventoryService.adjustStock(req.user!.userId, {
            productId: req.params.id,
            type,
            quantity,
            notes,
            unitCost,
            referenceType,
            referenceId,
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/inventory/products/:id/movements
 * @desc Get stock movements for a product
 */
router.get('/products/:id/movements', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        
        const result = await inventoryService.getStockMovements(req.user!.userId, req.params.id, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/inventory/low-stock
 * @desc Get all products with low stock
 */
router.get('/low-stock', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await inventoryService.getLowStockProducts(req.user!.userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/inventory/valuation
 * @desc Get inventory valuation summary
 */
router.get('/valuation', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await inventoryService.getInventoryValuation(req.user!.userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/inventory/categories
 * @desc Get all product categories
 */
router.get('/categories', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const categories = await inventoryService.getCategories(req.user!.userId);
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

export default router;
