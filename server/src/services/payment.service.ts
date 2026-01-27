import crypto from 'crypto';
import { env } from '../config/env.js';
import prisma from '../lib/prisma.js';

/**
 * Payment Gateway Integration Service
 * Supports eSewa and Khalti - Nepal's leading payment gateways
 */

// Payment Status
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface PaymentRequest {
    invoiceId: string;
    amount: number;
    customerId: string;
    customerEmail?: string;
    customerPhone?: string;
    returnUrl: string;
    failureUrl: string;
}

export interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    paymentUrl?: string;
    message: string;
    provider: 'esewa' | 'khalti';
}

export interface PaymentVerification {
    success: boolean;
    transactionId: string;
    amount: number;
    status: PaymentStatus;
    provider: 'esewa' | 'khalti';
    rawResponse?: unknown;
}

// eSewa Configuration
const esewaConfig = {
    merchantId: env.ESEWA_MERCHANT_ID || 'EPAYTEST',
    secretKey: env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
    baseUrl: env.ESEWA_ENVIRONMENT === 'production'
        ? 'https://esewa.com.np'
        : 'https://rc-epay.esewa.com.np',
};

// Khalti Configuration
const khaltiConfig = {
    secretKey: env.KHALTI_SECRET_KEY || 'test_secret_key_xxx',
    publicKey: env.KHALTI_PUBLIC_KEY || 'test_public_key_xxx',
    baseUrl: env.KHALTI_ENVIRONMENT === 'production'
        ? 'https://khalti.com/api/v2'
        : 'https://a.khalti.com/api/v2',
};

export const paymentService = {
    /**
     * Initialize eSewa payment
     */
    async initiateEsewaPayment(request: PaymentRequest): Promise<PaymentResponse> {
        try {
            const transactionId = `AFOCE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Generate signature for eSewa
            const message = `total_amount=${request.amount},transaction_uuid=${transactionId},product_code=${esewaConfig.merchantId}`;
            const signature = crypto
                .createHmac('sha256', esewaConfig.secretKey)
                .update(message)
                .digest('base64');

            // Store pending payment
            await prisma.payment.create({
                data: {
                    transactionId,
                    invoiceId: request.invoiceId,
                    amount: request.amount,
                    provider: 'ESEWA',
                    status: 'PENDING',
                    metadata: {
                        customerId: request.customerId,
                        signature,
                    },
                },
            });

            // Build eSewa payment URL
            const params = new URLSearchParams({
                amount: request.amount.toString(),
                tax_amount: '0',
                total_amount: request.amount.toString(),
                transaction_uuid: transactionId,
                product_code: esewaConfig.merchantId,
                product_service_charge: '0',
                product_delivery_charge: '0',
                success_url: request.returnUrl,
                failure_url: request.failureUrl,
                signed_field_names: 'total_amount,transaction_uuid,product_code',
                signature,
            });

            const paymentUrl = `${esewaConfig.baseUrl}/epay/main?${params.toString()}`;

            return {
                success: true,
                transactionId,
                paymentUrl,
                message: 'eSewa payment initiated',
                provider: 'esewa',
            };
        } catch (error) {
            console.error('eSewa payment initiation failed:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Payment initiation failed',
                provider: 'esewa',
            };
        }
    },

    /**
     * Verify eSewa payment callback
     */
    async verifyEsewaPayment(encodedData: string): Promise<PaymentVerification> {
        try {
            // Decode base64 response from eSewa
            const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));
            
            const { transaction_uuid, total_amount, status, signature } = decodedData;

            // Verify signature
            const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${esewaConfig.merchantId}`;
            const expectedSignature = crypto
                .createHmac('sha256', esewaConfig.secretKey)
                .update(message)
                .digest('base64');

            if (signature !== expectedSignature) {
                throw new Error('Invalid signature');
            }

            // Update payment record
            const payment = await prisma.payment.update({
                where: { transactionId: transaction_uuid },
                data: {
                    status: status === 'COMPLETE' ? 'COMPLETED' : 'FAILED',
                    completedAt: status === 'COMPLETE' ? new Date() : null,
                    rawResponse: decodedData,
                },
                include: { invoice: true },
            });

            // Update invoice if payment successful
            if (status === 'COMPLETE' && payment.invoice) {
                const newPaidAmount = Number(payment.invoice.paidAmount) + Number(total_amount);
                const invoiceTotal = Number(payment.invoice.total);
                
                await prisma.invoice.update({
                    where: { id: payment.invoiceId },
                    data: {
                        paidAmount: newPaidAmount,
                        status: newPaidAmount >= invoiceTotal ? 'PAID' : 'PARTIALLY_PAID',
                    },
                });
            }

            return {
                success: status === 'COMPLETE',
                transactionId: transaction_uuid,
                amount: Number(total_amount),
                status: status === 'COMPLETE' ? 'COMPLETED' : 'FAILED',
                provider: 'esewa',
                rawResponse: decodedData,
            };
        } catch (error) {
            console.error('eSewa verification failed:', error);
            return {
                success: false,
                transactionId: '',
                amount: 0,
                status: 'FAILED',
                provider: 'esewa',
            };
        }
    },

    /**
     * Initialize Khalti payment
     */
    async initiateKhaltiPayment(request: PaymentRequest): Promise<PaymentResponse> {
        try {
            const transactionId = `AFOCE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Khalti expects amount in paisa (1 NPR = 100 paisa)
            const amountInPaisa = Math.round(request.amount * 100);

            const response = await fetch(`${khaltiConfig.baseUrl}/epayment/initiate/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${khaltiConfig.secretKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    return_url: request.returnUrl,
                    website_url: env.FRONTEND_URL,
                    amount: amountInPaisa,
                    purchase_order_id: transactionId,
                    purchase_order_name: `Invoice Payment - ${request.invoiceId}`,
                    customer_info: {
                        name: request.customerId,
                        email: request.customerEmail || '',
                        phone: request.customerPhone || '',
                    },
                }),
            });

            const data = await response.json() as { detail?: string; pidx?: string; payment_url?: string };

            if (!response.ok) {
                throw new Error(data.detail || 'Khalti initiation failed');
            }

            // Store pending payment
            await prisma.payment.create({
                data: {
                    transactionId,
                    invoiceId: request.invoiceId,
                    amount: request.amount,
                    provider: 'KHALTI',
                    status: 'PENDING',
                    khaltiPidx: data.pidx,
                    metadata: {
                        customerId: request.customerId,
                        pidx: data.pidx,
                    },
                },
            });

            return {
                success: true,
                transactionId,
                paymentUrl: data.payment_url,
                message: 'Khalti payment initiated',
                provider: 'khalti',
            };
        } catch (error) {
            console.error('Khalti payment initiation failed:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Payment initiation failed',
                provider: 'khalti',
            };
        }
    },

    /**
     * Verify Khalti payment callback
     */
    async verifyKhaltiPayment(pidx: string): Promise<PaymentVerification> {
        try {
            const response = await fetch(`${khaltiConfig.baseUrl}/epayment/lookup/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${khaltiConfig.secretKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pidx }),
            });

            const data = await response.json() as { detail?: string; status?: string; total_amount?: number };

            if (!response.ok) {
                throw new Error(data.detail || 'Khalti lookup failed');
            }

            // Find payment by pidx
            const payment = await prisma.payment.findFirst({
                where: { khaltiPidx: pidx },
                include: { invoice: true },
            });

            if (!payment) {
                throw new Error('Payment not found');
            }

            const isSuccess = data.status === 'Completed';
            const amount = (data.total_amount ?? 0) / 100; // Convert from paisa

            // Update payment record
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: isSuccess ? 'COMPLETED' : 'FAILED',
                    completedAt: isSuccess ? new Date() : null,
                    rawResponse: data as object,
                },
            });

            // Update invoice if payment successful
            if (isSuccess && payment.invoice) {
                const newPaidAmount = Number(payment.invoice.paidAmount) + amount;
                const invoiceTotal = Number(payment.invoice.total);
                
                await prisma.invoice.update({
                    where: { id: payment.invoiceId },
                    data: {
                        paidAmount: newPaidAmount,
                        status: newPaidAmount >= invoiceTotal ? 'PAID' : 'PARTIALLY_PAID',
                    },
                });
            }

            return {
                success: isSuccess,
                transactionId: payment.transactionId,
                amount,
                status: isSuccess ? 'COMPLETED' : 'FAILED',
                provider: 'khalti',
                rawResponse: data,
            };
        } catch (error) {
            console.error('Khalti verification failed:', error);
            return {
                success: false,
                transactionId: '',
                amount: 0,
                status: 'FAILED',
                provider: 'khalti',
            };
        }
    },

    /**
     * Generate payment link for invoice
     */
    async generatePaymentLink(invoiceId: string, provider: 'esewa' | 'khalti' = 'khalti') {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { customer: true, user: true },
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        const amountDue = Number(invoice.total) - Number(invoice.paidAmount);
        if (amountDue <= 0) {
            throw new Error('Invoice is already paid');
        }

        const request: PaymentRequest = {
            invoiceId: invoice.id,
            amount: amountDue,
            customerId: invoice.customer.id,
            customerEmail: invoice.customer.email || undefined,
            customerPhone: invoice.customer.phone || undefined,
            returnUrl: `${env.FRONTEND_URL}/payment/success?invoice=${invoiceId}`,
            failureUrl: `${env.FRONTEND_URL}/payment/failed?invoice=${invoiceId}`,
        };

        if (provider === 'esewa') {
            return this.initiateEsewaPayment(request);
        } else {
            return this.initiateKhaltiPayment(request);
        }
    },

    /**
     * Get payment history for an invoice
     */
    async getPaymentHistory(invoiceId: string) {
        return prisma.payment.findMany({
            where: { invoiceId },
            orderBy: { createdAt: 'desc' },
        });
    },

    /**
     * Process refund
     */
    async processRefund(paymentId: string, reason: string) {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { invoice: true },
        });

        if (!payment || payment.status !== 'COMPLETED') {
            throw new Error('Payment not found or not eligible for refund');
        }

        // Note: eSewa and Khalti require manual refund processing through their portals
        // This marks it as refunded in our system
        await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'REFUNDED',
                metadata: {
                    ...(payment.metadata as object || {}),
                    refundReason: reason,
                    refundedAt: new Date().toISOString(),
                },
            },
        });

        // Update invoice paid amount
        if (payment.invoice) {
            const newPaidAmount = Math.max(0, Number(payment.invoice.paidAmount) - Number(payment.amount));
            await prisma.invoice.update({
                where: { id: payment.invoiceId },
                data: {
                    paidAmount: newPaidAmount,
                    status: newPaidAmount <= 0 ? 'SENT' : 'PARTIALLY_PAID',
                },
            });
        }

        return { success: true, message: 'Refund processed' };
    },
};

export default paymentService;
