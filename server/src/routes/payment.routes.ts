import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { paymentService } from '../services/payment.service.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Payment Gateway Routes
 * Handles eSewa and Khalti payment integration
 */

const router = Router();

// Generate payment link for invoice
router.post('/initiate', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { invoiceId, provider } = req.body;
        
        if (!invoiceId) {
            return sendError(res, 'VALIDATION_ERROR', 'Invoice ID is required', 400);
        }
        
        const result = await paymentService.generatePaymentLink(invoiceId, provider || 'khalti');
        
        if (result.success) {
            sendSuccess(res, result);
        } else {
            sendError(res, 'PAYMENT_ERROR', result.message, 400);
        }
    } catch (error) {
        next(error);
    }
});

// eSewa callback (payment success)
router.get('/esewa/success', async (req: Request, res: Response) => {
    try {
        const { data } = req.query;
        
        if (!data || typeof data !== 'string') {
            return res.redirect('/payment/failed?error=invalid_response');
        }
        
        const result = await paymentService.verifyEsewaPayment(data);
        
        if (result.success) {
            res.redirect(`/payment/success?transaction=${result.transactionId}`);
        } else {
            res.redirect(`/payment/failed?transaction=${result.transactionId}`);
        }
    } catch (error) {
        console.error('eSewa callback error:', error);
        res.redirect('/payment/failed?error=verification_failed');
    }
});

// eSewa callback (payment failure)
router.get('/esewa/failure', async (_req: Request, res: Response) => {
    res.redirect('/payment/failed?error=payment_cancelled');
});

// Khalti callback
router.get('/khalti/callback', async (req: Request, res: Response) => {
    try {
        const { pidx, status } = req.query;
        
        if (!pidx || typeof pidx !== 'string') {
            return res.redirect('/payment/failed?error=invalid_response');
        }
        
        if (status === 'Completed') {
            const result = await paymentService.verifyKhaltiPayment(pidx);
            
            if (result.success) {
                res.redirect(`/payment/success?transaction=${result.transactionId}`);
            } else {
                res.redirect(`/payment/failed?transaction=${result.transactionId}`);
            }
        } else {
            res.redirect('/payment/failed?error=payment_cancelled');
        }
    } catch (error) {
        console.error('Khalti callback error:', error);
        res.redirect('/payment/failed?error=verification_failed');
    }
});

// Verify payment status
router.get('/verify/:transactionId', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { transactionId } = req.params;
        const { provider } = req.query;
        
        let result;
        if (provider === 'esewa') {
            // For eSewa, we'd need the encoded data from callback
            sendError(res, 'VALIDATION_ERROR', 'eSewa verification requires callback data', 400);
            return;
        } else {
            // Get the payment and check its pidx
            const payment = await paymentService.getPaymentHistory(transactionId);
            if (payment.length > 0 && payment[0].khaltiPidx) {
                result = await paymentService.verifyKhaltiPayment(payment[0].khaltiPidx as string);
            } else {
                sendError(res, 'NOT_FOUND', 'Payment not found', 404);
                return;
            }
        }
        
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

// Get payment history for invoice
router.get('/history/:invoiceId', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { invoiceId } = req.params;
        const payments = await paymentService.getPaymentHistory(invoiceId);
        sendSuccess(res, payments);
    } catch (error) {
        next(error);
    }
});

// Process refund (admin only)
router.post('/refund', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { paymentId, reason } = req.body;
        
        if (!paymentId || !reason) {
            return sendError(res, 'VALIDATION_ERROR', 'Payment ID and reason are required', 400);
        }
        
        const result = await paymentService.processRefund(paymentId, reason);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

export default router;
