import { Router } from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.routes.js';
import accountRoutes from './accounts.routes.js';
import customerRoutes from './customers.routes.js';
import vendorRoutes from './vendors.routes.js';
import invoiceRoutes from './invoices.routes.js';
import expenseRoutes from './expenses.routes.js';
import vatRoutes from './vat.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import reportRoutes from './reports.routes.js';
import bankRoutes from './bank.routes.js';
import syncRoutes from './sync.routes.js';
import uploadRoutes from './upload.routes.js';
import workflowRoutes from './workflow.routes.js';
import adminRoutes from './admin.routes.js';
import paymentRoutes from './payment.routes.js';
import aiRoutes from './ai.routes.js';
import analyticsRoutes from './analytics.routes.js';
import companyRoutes from './company.routes.js';
import inventoryRoutes from './inventory.routes.js';
import projectRoutes from './project.routes.js';
import currencyRoutes from './currency.routes.js';

const router = Router();

// Public routes
router.use('/health', healthRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/dashboard', dashboardRoutes);
router.use('/accounts', accountRoutes);
router.use('/customers', customerRoutes);
router.use('/vendors', vendorRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/expenses', expenseRoutes);
router.use('/vat', vatRoutes);
router.use('/reports', reportRoutes);
router.use('/bank', bankRoutes);
router.use('/sync', syncRoutes);
router.use('/upload', uploadRoutes);
router.use('/workflow', workflowRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/companies', companyRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/projects', projectRoutes);
router.use('/currencies', currencyRoutes);

export default router;
