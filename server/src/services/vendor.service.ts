import prisma from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import type { CreateVendorInput, UpdateVendorInput, VendorQuery } from '../schemas/vendor.schema.js';

/**
 * Vendor service - Vendor database management
 */

export const vendorService = {
    /**
     * Get all vendors for a user with optional filters
     */
    async getVendors(userId: string, query: VendorQuery) {
        const where: {
            userId: string;
            isActive?: boolean;
            OR?: Array<{ name: { contains: string; mode: 'insensitive' } } | { email: { contains: string; mode: 'insensitive' } }>;
        } = { userId };

        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const vendors = await prisma.vendor.findMany({
            where,
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { expenses: true },
                },
            },
        });

        return vendors;
    },

    /**
     * Get vendor by ID
     */
    async getVendorById(userId: string, vendorId: string) {
        const vendor = await prisma.vendor.findFirst({
            where: { id: vendorId, userId },
            include: {
                expenses: {
                    take: 10,
                    orderBy: { date: 'desc' },
                    select: {
                        id: true,
                        expenseNumber: true,
                        date: true,
                        totalAmount: true,
                        description: true,
                    },
                },
                _count: {
                    select: { expenses: true },
                },
            },
        });

        if (!vendor) {
            throw new ApiError(404, 'VENDOR_NOT_FOUND', 'Vendor not found');
        }

        return vendor;
    },

    /**
     * Create a new vendor
     */
    async createVendor(userId: string, input: CreateVendorInput) {
        const vendor = await prisma.vendor.create({
            data: {
                userId,
                name: input.name,
                email: input.email ?? null,
                phone: input.phone ?? null,
                panNumber: input.panNumber ?? null,
                address: input.address ?? null,
                notes: input.notes ?? null,
            },
        });

        return vendor;
    },

    /**
     * Update a vendor
     */
    async updateVendor(userId: string, vendorId: string, input: UpdateVendorInput) {
        // Check vendor exists and belongs to user
        const existing = await prisma.vendor.findFirst({
            where: { id: vendorId, userId },
        });

        if (!existing) {
            throw new ApiError(404, 'VENDOR_NOT_FOUND', 'Vendor not found');
        }

        // Build update data object - only include defined fields
        const updateData: Record<string, string | boolean | null> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.email !== undefined) updateData.email = input.email || null;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.panNumber !== undefined) updateData.panNumber = input.panNumber;
        if (input.address !== undefined) updateData.address = input.address;
        if (input.notes !== undefined) updateData.notes = input.notes;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        const vendor = await prisma.vendor.update({
            where: { id: vendorId },
            data: updateData,
        });

        return vendor;
    },

    /**
     * Delete a vendor
     */
    async deleteVendor(userId: string, vendorId: string) {
        // Check vendor exists and belongs to user
        const existing = await prisma.vendor.findFirst({
            where: { id: vendorId, userId },
            include: {
                _count: {
                    select: { expenses: true },
                },
            },
        });

        if (!existing) {
            throw new ApiError(404, 'VENDOR_NOT_FOUND', 'Vendor not found');
        }

        // Check for linked expenses
        if (existing._count.expenses > 0) {
            throw new ApiError(400, 'HAS_EXPENSES', 'Cannot delete vendor with existing expenses');
        }

        await prisma.vendor.delete({
            where: { id: vendorId },
        });

        return { message: 'Vendor deleted successfully' };
    },
};
