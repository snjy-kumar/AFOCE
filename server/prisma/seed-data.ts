import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as prismaClient from '../src/generated/prisma/client.js';

const { PrismaClient, Prisma } = prismaClient;

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * Seed invoices and expenses for demo data
 * Properly structured to match Prisma schema requirements
 */
export async function seedInvoicesAndExpenses(userId: string) {
    console.log('\nSeeding invoices and expenses...');

    // Retrieve ALL required accounts upfront
    const accountCodes = ['4001', '5101', '5102', '5103', '5104', '5105', '5111', '1104'];
    const accounts = await prisma.account.findMany({
        where: { 
            userId,
            code: { in: accountCodes }
        },
    });

    // Map accounts by code for easy access
    const accountMap = new Map(accounts.map(acc => [acc.code, acc]));
    
    const salesAccount = accountMap.get('4001'); // Sales Revenue
    const salaryAccount = accountMap.get('5101'); // Salary & Wages
    const rentAccount = accountMap.get('5102'); // Rent Expense
    accountMap.get('5103'); // Utilities
    const phoneAccount = accountMap.get('5104'); // Telephone & Internet
    const suppliesAccount = accountMap.get('5105'); // Office Supplies
    const marketingAccount = accountMap.get('5111'); // Advertising & Marketing
    const equipmentAccount = accountMap.get('1104'); // Office Equipment (Asset)

    if (!salesAccount) {
        console.log('  ⚠️  Sales account (4001) not found, skipping invoices/expenses');
        return;
    }

    // Get customers and vendors
    const customers = await prisma.customer.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 4,
    });

    const vendors = await prisma.vendor.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 3,
    });

    if (customers.length < 4) {
        console.log('  ⚠️  Not enough customers found (need 4), skipping transactions');
        return;
    }

    if (vendors.length < 3) {
        console.log('  ⚠️  Not enough vendors found (need 3), skipping transactions');
        return;
    }

    const now = new Date();

    // ========================================
    // CREATE INVOICES
    // ========================================
    console.log('\n  Creating invoices...');
    
    // Invoice 1: Fully Paid
    const invoice1 = await prisma.invoice.findFirst({
        where: { invoiceNumber: 'INV-2026-001', userId },
    });

    if (!invoice1) {
        await prisma.invoice.create({
            data: {
                userId,
                customerId: customers[0].id,
                invoiceNumber: 'INV-2026-001',
                issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
                dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 30),
                status: 'PAID',
                subtotal: new Prisma.Decimal(50000),
                vatRate: new Prisma.Decimal(13.00),
                vatAmount: new Prisma.Decimal(6500),
                discountAmount: new Prisma.Decimal(0),
                total: new Prisma.Decimal(56500),
                paidAmount: new Prisma.Decimal(56500),
                notes: 'Thank you for your business! Payment received in full.',
                terms: 'Payment due within 15 days',
                items: {
                    create: [
                        {
                            accountId: salesAccount.id,
                            description: 'Software Development Services - Phase 1',
                            quantity: new Prisma.Decimal(20),
                            rate: new Prisma.Decimal(2000),
                            amount: new Prisma.Decimal(40000),
                            sortOrder: 1,
                        },
                        {
                            accountId: salesAccount.id,
                            description: 'Technical Support & Maintenance',
                            quantity: new Prisma.Decimal(10),
                            rate: new Prisma.Decimal(1000),
                            amount: new Prisma.Decimal(10000),
                            sortOrder: 2,
                        },
                    ],
                },
            },
        });
        console.log('    ✓ Created: INV-2026-001 (PAID, Rs. 56,500)');
    }

    // Invoice 2: Sent (Unpaid)
    const invoice2 = await prisma.invoice.findFirst({
        where: { invoiceNumber: 'INV-2026-002', userId },
    });

    if (!invoice2) {
        await prisma.invoice.create({
            data: {
                userId,
                customerId: customers[1].id,
                invoiceNumber: 'INV-2026-002',
                issueDate: new Date(now.getFullYear(), now.getMonth(), 5),
                dueDate: new Date(now.getFullYear(), now.getMonth(), 20),
                status: 'SENT',
                subtotal: new Prisma.Decimal(75000),
                vatRate: new Prisma.Decimal(13.00),
                vatAmount: new Prisma.Decimal(9750),
                discountAmount: new Prisma.Decimal(0),
                total: new Prisma.Decimal(84750),
                paidAmount: new Prisma.Decimal(0),
                notes: 'Payment terms: Net 15 days',
                terms: 'Payment due within 15 days. Late payments subject to 2% monthly interest.',
                items: {
                    create: [
                        {
                            accountId: salesAccount.id,
                            description: 'Web Application Design & Development',
                            quantity: new Prisma.Decimal(30),
                            rate: new Prisma.Decimal(2500),
                            amount: new Prisma.Decimal(75000),
                            sortOrder: 1,
                        },
                    ],
                },
            },
        });
        console.log('    ✓ Created: INV-2026-002 (SENT, Rs. 84,750)');
    }

    // Invoice 3: Partially Paid
    const invoice3 = await prisma.invoice.findFirst({
        where: { invoiceNumber: 'INV-2026-003', userId },
    });

    if (!invoice3) {
        await prisma.invoice.create({
            data: {
                userId,
                customerId: customers[2].id,
                invoiceNumber: 'INV-2026-003',
                issueDate: new Date(now.getFullYear(), now.getMonth(), 10),
                dueDate: new Date(now.getFullYear(), now.getMonth(), 25),
                status: 'PARTIALLY_PAID',
                subtotal: new Prisma.Decimal(100000),
                vatRate: new Prisma.Decimal(13.00),
                vatAmount: new Prisma.Decimal(13000),
                discountAmount: new Prisma.Decimal(0),
                total: new Prisma.Decimal(113000),
                paidAmount: new Prisma.Decimal(50000),
                notes: 'Advance payment of Rs. 50,000 received. Balance due on completion.',
                terms: '50% advance, 50% on delivery',
                items: {
                    create: [
                        {
                            accountId: salesAccount.id,
                            description: 'Mobile Application Development - Android & iOS',
                            quantity: new Prisma.Decimal(40),
                            rate: new Prisma.Decimal(2500),
                            amount: new Prisma.Decimal(100000),
                            sortOrder: 1,
                        },
                    ],
                },
            },
        });
        console.log('    ✓ Created: INV-2026-003 (PARTIALLY_PAID, Rs. 113,000)');
    }

    // Invoice 4: Draft
    const invoice4 = await prisma.invoice.findFirst({
        where: { invoiceNumber: 'INV-2026-004', userId },
    });

    if (!invoice4) {
        await prisma.invoice.create({
            data: {
                userId,
                customerId: customers[3].id,
                invoiceNumber: 'INV-2026-004',
                issueDate: new Date(now.getFullYear(), now.getMonth(), 12),
                dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 12),
                status: 'DRAFT',
                subtotal: new Prisma.Decimal(30000),
                vatRate: new Prisma.Decimal(13.00),
                vatAmount: new Prisma.Decimal(3900),
                discountAmount: new Prisma.Decimal(0),
                total: new Prisma.Decimal(33900),
                paidAmount: new Prisma.Decimal(0),
                notes: 'Draft invoice - to be reviewed before sending',
                terms: 'Payment due within 30 days',
                items: {
                    create: [
                        {
                            accountId: salesAccount.id,
                            description: 'Business Consulting Services',
                            quantity: new Prisma.Decimal(15),
                            rate: new Prisma.Decimal(2000),
                            amount: new Prisma.Decimal(30000),
                            sortOrder: 1,
                        },
                    ],
                },
            },
        });
        console.log('    ✓ Created: INV-2026-004 (DRAFT, Rs. 33,900)');
    }

    // ========================================
    // CREATE EXPENSES
    // ========================================
    console.log('\n  Creating expenses...');

    const expenses = [
        {
            expenseNumber: 'EXP-2026-001',
            date: new Date(now.getFullYear(), now.getMonth(), 1),
            description: 'Office Rent - January 2026',
            accountId: rentAccount?.id || salesAccount.id,
            amount: new Prisma.Decimal(25000),
            vatRate: new Prisma.Decimal(0), // Rent typically exempt from VAT
            vatAmount: new Prisma.Decimal(0),
            totalAmount: new Prisma.Decimal(25000),
            isPaid: true,
            vendorId: vendors[0].id,
            notes: 'Monthly office rent payment',
        },
        {
            expenseNumber: 'EXP-2026-002',
            date: new Date(now.getFullYear(), now.getMonth(), 3),
            description: 'Office Supplies & Stationary',
            accountId: suppliesAccount?.id || salesAccount.id,
            amount: new Prisma.Decimal(5000),
            vatRate: new Prisma.Decimal(13.00),
            vatAmount: new Prisma.Decimal(650),
            totalAmount: new Prisma.Decimal(5650),
            isPaid: true,
            vendorId: vendors[1].id,
            notes: 'Purchase of office supplies, paper, pens, folders',
        },
        {
            expenseNumber: 'EXP-2026-003',
            date: new Date(now.getFullYear(), now.getMonth(), 5),
            description: 'Internet & Telephone Bill - January 2026',
            accountId: phoneAccount?.id || salesAccount.id,
            amount: new Prisma.Decimal(3500),
            vatRate: new Prisma.Decimal(13.00),
            vatAmount: new Prisma.Decimal(455),
            totalAmount: new Prisma.Decimal(3955),
            isPaid: true,
            notes: 'Monthly communication expenses',
        },
        {
            expenseNumber: 'EXP-2026-004',
            date: new Date(now.getFullYear(), now.getMonth(), 7),
            description: 'Computer Equipment Purchase - 2 Laptops',
            accountId: equipmentAccount?.id || salesAccount.id, // Asset account, not expense
            amount: new Prisma.Decimal(85000),
            vatRate: new Prisma.Decimal(13.00),
            vatAmount: new Prisma.Decimal(11050),
            totalAmount: new Prisma.Decimal(96050),
            isPaid: true,
            vendorId: vendors[2].id,
            notes: 'Capital expense - 2 Dell Latitude laptops for staff',
        },
        {
            expenseNumber: 'EXP-2026-005',
            date: new Date(now.getFullYear(), now.getMonth(), 8),
            description: 'Employee Salaries - January 2026',
            accountId: salaryAccount?.id || salesAccount.id,
            amount: new Prisma.Decimal(150000),
            vatRate: new Prisma.Decimal(0), // Salaries exempt from VAT
            vatAmount: new Prisma.Decimal(0),
            totalAmount: new Prisma.Decimal(150000),
            isPaid: true,
            notes: 'Monthly salary payment for 3 employees',
        },
        {
            expenseNumber: 'EXP-2026-006',
            date: new Date(now.getFullYear(), now.getMonth(), 10),
            description: 'Marketing & Advertising Campaign',
            accountId: marketingAccount?.id || salesAccount.id,
            amount: new Prisma.Decimal(12000),
            vatRate: new Prisma.Decimal(13.00),
            vatAmount: new Prisma.Decimal(1560),
            totalAmount: new Prisma.Decimal(13560),
            isPaid: false, // Pending payment
            notes: 'Social media advertising and promotional materials',
        },
    ];

    for (const expenseData of expenses) {
        const existing = await prisma.expense.findFirst({
            where: { userId, expenseNumber: expenseData.expenseNumber },
        });

        if (!existing) {
            await prisma.expense.create({
                data: {
                    userId,
                    ...expenseData,
                },
            });
            const status = expenseData.isPaid ? 'PAID' : 'PENDING';
            const amount = expenseData.totalAmount.toString();
            console.log(`    ✓ Created: ${expenseData.expenseNumber} (${status}, Rs. ${amount})`);
        }
    }

    console.log('\n  ✓ Invoices and expenses seeded successfully');
}
