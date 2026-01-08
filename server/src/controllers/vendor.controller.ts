import type { Response, NextFunction } from 'express';
import { vendorService } from '../services/vendor.service.js';
import { sendSuccess } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { CreateVendorInput, UpdateVendorInput, VendorQuery } from '../schemas/vendor.schema.js';

/**
 * Vendor controller - handles HTTP requests
 */

export const vendorController = {
    async getVendors(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const query = req.query as VendorQuery;
            const vendors = await vendorService.getVendors(userId, query);
            sendSuccess(res, vendors);
        } catch (error) {
            next(error);
        }
    },

    async getVendorById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const vendor = await vendorService.getVendorById(userId, id);
            sendSuccess(res, vendor);
        } catch (error) {
            next(error);
        }
    },

    async createVendor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const input = req.body as CreateVendorInput;
            const vendor = await vendorService.createVendor(userId, input);
            sendSuccess(res, vendor, 201);
        } catch (error) {
            next(error);
        }
    },

    async updateVendor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const input = req.body as UpdateVendorInput;
            const vendor = await vendorService.updateVendor(userId, id, input);
            sendSuccess(res, vendor);
        } catch (error) {
            next(error);
        }
    },

    async deleteVendor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('User ID not found');

            const { id } = req.params;
            const result = await vendorService.deleteVendor(userId, id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    },
};
