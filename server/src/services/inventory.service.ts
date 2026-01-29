import { Decimal } from '@prisma/client/runtime/client';
import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import type { StockMovementType, Product } from '../generated/prisma/client.js';

/**
 * Inventory service - Product and stock management
 */

export interface CreateProductInput {
    name: string;
    nameNe?: string;
    sku: string;
    description?: string;
    category?: string;
    costPrice?: number;
    sellingPrice?: number;
    vatRate?: number;
    isVatExempt?: boolean;
    currentStock?: number;
    reorderLevel?: number;
    reorderQuantity?: number;
    unit?: string;
}

export interface UpdateProductInput {
    name?: string;
    nameNe?: string;
    sku?: string;
    description?: string;
    category?: string;
    costPrice?: number;
    sellingPrice?: number;
    vatRate?: number;
    isVatExempt?: boolean;
    reorderLevel?: number;
    reorderQuantity?: number;
    unit?: string;
    isActive?: boolean;
}

export interface ProductQuery {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
    lowStock?: boolean;
}

export interface StockAdjustmentInput {
    productId: string;
    type: StockMovementType;
    quantity: number;
    notes?: string;
    unitCost?: number;
    referenceType?: string;
    referenceId?: string;
}

export const inventoryService = {
    /**
     * Create a new product
     */
    async createProduct(userId: string, data: CreateProductInput) {
        const baseSku = data.sku.trim();
        if (!baseSku) {
            throw new ApiError(400, 'INVALID_SKU', 'SKU is required');
        }

        let sku = baseSku;
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const existing = await prisma.product.findUnique({
                where: { userId_sku: { userId, sku } },
            });

            if (!existing) {
                break;
            }

            if (attempt === 4) {
                throw new ApiError(409, 'DUPLICATE_SKU', `Product with SKU "${baseSku}" already exists`);
            }

            sku = `${baseSku}-${attempt + 1}`;
        }

        const product = await prisma.product.create({
            data: {
                userId,
                name: data.name,
                nameNe: data.nameNe,
                sku,
                description: data.description,
                category: data.category,
                costPrice: data.costPrice ? new Decimal(data.costPrice) : new Decimal(0),
                sellingPrice: data.sellingPrice ? new Decimal(data.sellingPrice) : new Decimal(0),
                vatRate: data.vatRate ? new Decimal(data.vatRate) : new Decimal(13.00),
                isVatExempt: data.isVatExempt ?? false,
                currentStock: data.currentStock ?? 0,
                reorderLevel: data.reorderLevel ?? 10,
                reorderQuantity: data.reorderQuantity ?? 50,
                unit: data.unit ?? 'pcs',
            },
        });

        // Create initial stock movement if there's opening stock
        if (data.currentStock && data.currentStock > 0) {
            await prisma.stockMovement.create({
                data: {
                    productId: product.id,
                    type: 'ADJUSTMENT',
                    quantity: data.currentStock,
                    notes: 'Opening stock',
                    previousStock: 0,
                    newStock: data.currentStock,
                    createdBy: userId,
                },
            });
        }

        return product;
    },

    /**
     * Get all products with filters and pagination
     */
    async getProducts(userId: string, query: ProductQuery) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = { userId };

        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }

        if (query.category) {
            where.category = query.category;
        }

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { sku: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        // Low stock filter - get products where currentStock <= reorderLevel
        const lowStockFilter = query.lowStock ?? false;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            prisma.product.count({ where }),
        ]);

        // Filter for low stock if needed
        let filteredProducts = products;
        if (lowStockFilter) {
            filteredProducts = products.filter((p: Product) => p.currentStock <= p.reorderLevel);
        }

        return {
            products: filteredProducts,
            pagination: {
                page,
                limit,
                total: lowStockFilter ? filteredProducts.length : total,
                totalPages: Math.ceil((lowStockFilter ? filteredProducts.length : total) / limit),
            },
        };
    },

    /**
     * Get single product by ID
     */
    async getProduct(userId: string, productId: string) {
        const product = await prisma.product.findFirst({
            where: { id: productId, userId },
            include: {
                stockMovements: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });

        if (!product) {
            throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
        }

        return product;
    },

    /**
     * Update product
     */
    async updateProduct(userId: string, productId: string, data: UpdateProductInput) {
        const existing = await prisma.product.findFirst({
            where: { id: productId, userId },
        });

        if (!existing) {
            throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
        }

        // Check for duplicate SKU if changing
        if (data.sku && data.sku !== existing.sku) {
            const duplicate = await prisma.product.findUnique({
                where: { userId_sku: { userId, sku: data.sku } },
            });
            if (duplicate) {
                throw new ApiError(409, 'DUPLICATE_SKU', `Product with SKU "${data.sku}" already exists`);
            }
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                name: data.name,
                nameNe: data.nameNe,
                sku: data.sku,
                description: data.description,
                category: data.category,
                costPrice: data.costPrice !== undefined ? new Decimal(data.costPrice) : undefined,
                sellingPrice: data.sellingPrice !== undefined ? new Decimal(data.sellingPrice) : undefined,
                vatRate: data.vatRate !== undefined ? new Decimal(data.vatRate) : undefined,
                isVatExempt: data.isVatExempt,
                reorderLevel: data.reorderLevel,
                reorderQuantity: data.reorderQuantity,
                unit: data.unit,
                isActive: data.isActive,
            },
        });

        return product;
    },

    /**
     * Delete product
     */
    async deleteProduct(userId: string, productId: string) {
        const existing = await prisma.product.findFirst({
            where: { id: productId, userId },
        });

        if (!existing) {
            throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
        }

        await prisma.product.delete({
            where: { id: productId },
        });

        return { message: 'Product deleted successfully' };
    },

    /**
     * Adjust stock (add/remove stock with reason)
     */
    async adjustStock(userId: string, data: StockAdjustmentInput) {
        const product = await prisma.product.findFirst({
            where: { id: data.productId, userId },
        });

        if (!product) {
            throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
        }

        // Determine if quantity should be positive or negative
        let adjustedQuantity = Math.abs(data.quantity);
        if (['SALE', 'RETURN_OUT', 'DAMAGED'].includes(data.type)) {
            adjustedQuantity = -adjustedQuantity;
        }

        const newStock = product.currentStock + adjustedQuantity;

        if (newStock < 0) {
            throw new ApiError(400, 'INSUFFICIENT_STOCK', 'Insufficient stock');
        }

        // Update stock and create movement record
        const [updatedProduct, movement] = await prisma.$transaction([
            prisma.product.update({
                where: { id: data.productId },
                data: { currentStock: newStock },
            }),
            prisma.stockMovement.create({
                data: {
                    productId: data.productId,
                    type: data.type,
                    quantity: adjustedQuantity,
                    notes: data.notes,
                    unitCost: data.unitCost ? new Decimal(data.unitCost) : undefined,
                    referenceType: data.referenceType,
                    referenceId: data.referenceId,
                    previousStock: product.currentStock,
                    newStock,
                    createdBy: userId,
                },
            }),
        ]);

        return { product: updatedProduct, movement };
    },

    /**
     * Get stock movements for a product
     */
    async getStockMovements(userId: string, productId: string, page = 1, limit = 50) {
        const product = await prisma.product.findFirst({
            where: { id: productId, userId },
        });

        if (!product) {
            throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
        }

        const skip = (page - 1) * limit;

        const [movements, total] = await Promise.all([
            prisma.stockMovement.findMany({
                where: { productId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.stockMovement.count({ where: { productId } }),
        ]);

        return {
            movements,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Get low stock alerts
     */
    async getLowStockProducts(userId: string) {
        // Get products where current stock is at or below reorder level
        const products = await prisma.product.findMany({
            where: {
                userId,
                isActive: true,
            },
        });

        const lowStockProducts = products.filter((p: Product) => p.currentStock <= p.reorderLevel);

        return {
            count: lowStockProducts.length,
            products: lowStockProducts.map((p: Product) => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                currentStock: p.currentStock,
                reorderLevel: p.reorderLevel,
                reorderQuantity: p.reorderQuantity,
                unit: p.unit,
                shortfall: p.reorderLevel - p.currentStock,
            })),
        };
    },

    /**
     * Get inventory valuation
     */
    async getInventoryValuation(userId: string) {
        const products = await prisma.product.findMany({
            where: { userId, isActive: true },
        });

        const valuation = products.reduce((acc: { totalCostValue: number; totalRetailValue: number; totalItems: number; productCount: number }, p: Product) => {
            const costValue = Number(p.costPrice) * p.currentStock;
            const retailValue = Number(p.sellingPrice) * p.currentStock;
            return {
                totalCostValue: acc.totalCostValue + costValue,
                totalRetailValue: acc.totalRetailValue + retailValue,
                totalItems: acc.totalItems + p.currentStock,
                productCount: acc.productCount + 1,
            };
        }, { totalCostValue: 0, totalRetailValue: 0, totalItems: 0, productCount: 0 });

        return {
            ...valuation,
            potentialProfit: valuation.totalRetailValue - valuation.totalCostValue,
            profitMargin: valuation.totalCostValue > 0
                ? ((valuation.totalRetailValue - valuation.totalCostValue) / valuation.totalCostValue * 100).toFixed(2)
                : '0',
        };
    },

    /**
     * Get product categories
     */
    async getCategories(userId: string) {
        const products = await prisma.product.findMany({
            where: { userId },
            select: { category: true },
            distinct: ['category'],
        });

        return products
            .map((p: { category: string | null }) => p.category)
            .filter((c: string | null): c is string => c !== null)
            .sort();
    },
};
