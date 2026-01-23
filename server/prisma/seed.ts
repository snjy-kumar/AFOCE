import { PrismaClient, AccountType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { seedInvoicesAndExpenses } from './seed-data';

/**
 * Database seed script
 * Creates default chart of accounts based on Nepal accounting standards
 */

const prisma = new PrismaClient();

// Nepal Standard Chart of Accounts
const DEFAULT_ACCOUNTS: Array<{
    code: string;
    name: string;
    nameNe: string;
    type: AccountType;
    isSystem: boolean;
    children?: Array<{
        code: string;
        name: string;
        nameNe: string;
    }>;
}> = [
        // ASSETS
        {
            code: '1000',
            name: 'Current Assets',
            nameNe: 'चालु सम्पत्ति',
            type: 'ASSET',
            isSystem: true,
            children: [
                { code: '1001', name: 'Cash in Hand', nameNe: 'हातमा नगद' },
                { code: '1002', name: 'Cash at Bank', nameNe: 'बैंकमा नगद' },
                { code: '1003', name: 'Accounts Receivable', nameNe: 'प्राप्य खाता' },
                { code: '1004', name: 'Inventory', nameNe: 'मौज्दात' },
                { code: '1005', name: 'Prepaid Expenses', nameNe: 'अग्रिम खर्च' },
                { code: '1006', name: 'Advance to Suppliers', nameNe: 'आपूर्तिकर्तालाई पेश्की' },
            ],
        },
        {
            code: '1100',
            name: 'Fixed Assets',
            nameNe: 'स्थिर सम्पत्ति',
            type: 'ASSET',
            isSystem: true,
            children: [
                { code: '1101', name: 'Land', nameNe: 'जग्गा' },
                { code: '1102', name: 'Building', nameNe: 'भवन' },
                { code: '1103', name: 'Furniture & Fixtures', nameNe: 'फर्निचर र फिक्स्चर' },
                { code: '1104', name: 'Office Equipment', nameNe: 'कार्यालय उपकरण' },
                { code: '1105', name: 'Vehicles', nameNe: 'सवारी साधन' },
                { code: '1106', name: 'Computer & IT Equipment', nameNe: 'कम्प्युटर र IT उपकरण' },
            ],
        },
        // LIABILITIES
        {
            code: '2000',
            name: 'Current Liabilities',
            nameNe: 'चालु दायित्व',
            type: 'LIABILITY',
            isSystem: true,
            children: [
                { code: '2001', name: 'Accounts Payable', nameNe: 'भुक्तानी योग्य खाता' },
                { code: '2002', name: 'VAT Payable', nameNe: 'भ्याट तिर्न बाँकी' },
                { code: '2003', name: 'TDS Payable', nameNe: 'TDS तिर्न बाँकी' },
                { code: '2004', name: 'Salary Payable', nameNe: 'तलब तिर्न बाँकी' },
                { code: '2005', name: 'Advance from Customers', nameNe: 'ग्राहकबाट पेश्की' },
                { code: '2006', name: 'Short-term Loans', nameNe: 'अल्पकालीन ऋण' },
            ],
        },
        {
            code: '2100',
            name: 'Long-term Liabilities',
            nameNe: 'दीर्घकालीन दायित्व',
            type: 'LIABILITY',
            isSystem: true,
            children: [
                { code: '2101', name: 'Bank Loans', nameNe: 'बैंक ऋण' },
                { code: '2102', name: 'Other Long-term Loans', nameNe: 'अन्य दीर्घकालीन ऋण' },
            ],
        },
        // EQUITY
        {
            code: '3000',
            name: "Owner's Equity",
            nameNe: 'मालिकको पूँजी',
            type: 'EQUITY',
            isSystem: true,
            children: [
                { code: '3001', name: 'Capital', nameNe: 'पूँजी' },
                { code: '3002', name: 'Retained Earnings', nameNe: 'संचित आम्दानी' },
                { code: '3003', name: 'Drawing', nameNe: 'झिकाइ' },
            ],
        },
        // INCOME
        {
            code: '4000',
            name: 'Operating Income',
            nameNe: 'सञ्चालन आम्दानी',
            type: 'INCOME',
            isSystem: true,
            children: [
                { code: '4001', name: 'Sales Revenue', nameNe: 'बिक्री आम्दानी' },
                { code: '4002', name: 'Service Revenue', nameNe: 'सेवा आम्दानी' },
                { code: '4003', name: 'Consulting Income', nameNe: 'परामर्श आम्दानी' },
                { code: '4004', name: 'Commission Income', nameNe: 'कमिसन आम्दानी' },
            ],
        },
        {
            code: '4100',
            name: 'Other Income',
            nameNe: 'अन्य आम्दानी',
            type: 'INCOME',
            isSystem: true,
            children: [
                { code: '4101', name: 'Interest Income', nameNe: 'ब्याज आम्दानी' },
                { code: '4102', name: 'Discount Received', nameNe: 'प्राप्त छुट' },
                { code: '4103', name: 'Rental Income', nameNe: 'भाडा आम्दानी' },
            ],
        },
        // EXPENSES
        {
            code: '5000',
            name: 'Cost of Goods Sold',
            nameNe: 'बेचेको सामानको लागत',
            type: 'EXPENSE',
            isSystem: true,
            children: [
                { code: '5001', name: 'Purchase', nameNe: 'खरिद' },
                { code: '5002', name: 'Freight & Shipping', nameNe: 'ढुवानी खर्च' },
                { code: '5003', name: 'Direct Labor', nameNe: 'प्रत्यक्ष श्रम' },
            ],
        },
        {
            code: '5100',
            name: 'Operating Expenses',
            nameNe: 'सञ्चालन खर्च',
            type: 'EXPENSE',
            isSystem: true,
            children: [
                { code: '5101', name: 'Salary & Wages', nameNe: 'तलब र ज्याला' },
                { code: '5102', name: 'Rent Expense', nameNe: 'भाडा खर्च' },
                { code: '5103', name: 'Utilities (Electricity, Water)', nameNe: 'बिजुली, पानी' },
                { code: '5104', name: 'Telephone & Internet', nameNe: 'टेलिफोन र इन्टरनेट' },
                { code: '5105', name: 'Office Supplies', nameNe: 'कार्यालय सामग्री' },
                { code: '5106', name: 'Transportation & Travel', nameNe: 'यातायात र यात्रा' },
                { code: '5107', name: 'Repair & Maintenance', nameNe: 'मर्मत र सम्भार' },
                { code: '5108', name: 'Insurance', nameNe: 'बीमा' },
                { code: '5109', name: 'Professional Fees', nameNe: 'व्यावसायिक शुल्क' },
                { code: '5110', name: 'Bank Charges', nameNe: 'बैंक शुल्क' },
                { code: '5111', name: 'Advertising & Marketing', nameNe: 'विज्ञापन र मार्केटिङ' },
                { code: '5112', name: 'Depreciation', nameNe: 'मूल्यह्रास' },
                { code: '5113', name: 'Miscellaneous Expenses', nameNe: 'विविध खर्च' },
            ],
        },
        {
            code: '5200',
            name: 'Tax Expenses',
            nameNe: 'कर खर्च',
            type: 'EXPENSE',
            isSystem: true,
            children: [
                { code: '5201', name: 'Income Tax Expense', nameNe: 'आयकर खर्च' },
            ],
        },
    ];

async function seedAccounts(userId: string): Promise<void> {
    console.log('Seeding chart of accounts...');

    for (const parentAccount of DEFAULT_ACCOUNTS) {
        // Create parent account
        const parent = await prisma.account.upsert({
            where: { userId_code: { userId, code: parentAccount.code } },
            update: {},
            create: {
                userId,
                code: parentAccount.code,
                name: parentAccount.name,
                nameNe: parentAccount.nameNe,
                type: parentAccount.type,
                isSystem: parentAccount.isSystem,
            },
        });

        console.log(`  Created: ${parent.code} - ${parent.name}`);

        // Create child accounts
        if (parentAccount.children) {
            for (const child of parentAccount.children) {
                await prisma.account.upsert({
                    where: { userId_code: { userId, code: child.code } },
                    update: {},
                    create: {
                        userId,
                        code: child.code,
                        name: child.name,
                        nameNe: child.nameNe,
                        type: parentAccount.type,
                        parentId: parent.id,
                        isSystem: false,
                    },
                });
                console.log(`    Created: ${child.code} - ${child.name}`);
            }
        }
    }
}

async function seedCustomers(userId: string): Promise<void> {
    console.log('\nSeeding customers...');

    const customers = [
        { 
            name: 'Himalayan Traders Pvt. Ltd.', 
            email: 'contact@himalayan.com.np', 
            phone: '+977-1-4444444', 
            address: 'Thamel, Kathmandu',
            panNumber: '111111111' 
        },
        { 
            name: 'Everest Enterprises', 
            email: 'info@everest.com.np', 
            phone: '+977-1-5555555',
            address: 'Boudha, Kathmandu',
            panNumber: '222222222' 
        },
        { 
            name: 'Annapurna Suppliers Co.', 
            email: 'sales@annapurna.com.np', 
            phone: '+977-1-6666666',
            address: 'Lazimpat, Kathmandu',
            panNumber: '333333333' 
        },
        { 
            name: 'Pokhara Trading House', 
            email: 'info@pokharatrade.com', 
            phone: '+977-61-554433',
            address: 'Lakeside, Pokhara',
            panNumber: '444444444' 
        },
    ];

    for (const customer of customers) {
        const existing = await prisma.customer.findFirst({
            where: { userId, name: customer.name },
        });

        if (!existing) {
            await prisma.customer.create({
                data: {
                    userId,
                    ...customer,
                },
            });
            console.log(`  Created: ${customer.name}`);
        } else {
            console.log(`  Skipped (exists): ${customer.name}`);
        }
    }
}

async function seedVendors(userId: string): Promise<void> {
    console.log('\nSeeding vendors...');

    const vendors = [
        { 
            name: 'Kathmandu Office Supplies', 
            email: 'sales@ktmoffice.com', 
            phone: '+977-1-7777777',
            address: 'New Road, Kathmandu',
            panNumber: '555555555' 
        },
        { 
            name: 'Nepal Stationary Hub', 
            email: 'info@nepalstationery.com', 
            phone: '+977-1-8888888',
            address: 'Putalisadak, Kathmandu',
            panNumber: '666666666' 
        },
        { 
            name: 'Himalayan Tech Solutions', 
            email: 'support@himtech.com.np', 
            phone: '+977-1-9999999',
            address: 'Durbarmarg, Kathmandu',
            panNumber: '777777777' 
        },
    ];

    for (const vendor of vendors) {
        const existing = await prisma.vendor.findFirst({
            where: { userId, name: vendor.name },
        });

        if (!existing) {
            await prisma.vendor.create({
                data: {
                    userId,
                    ...vendor,
                },
            });
            console.log(`  Created: ${vendor.name}`);
        } else {
            console.log(`  Skipped (exists): ${vendor.name}`);
        }
    }
}

async function main(): Promise<void> {
    console.log('🌱 Starting database seed...\n');

    // Create demo user
    const hashedPassword = await bcrypt.hash('Demo@123', 12);

    const user = await prisma.user.upsert({
        where: { email: 'demo@nepalaccounting.com' },
        update: {},
        create: {
            email: 'demo@nepalaccounting.com',
            password: hashedPassword,
            businessName: 'Demo Business Pvt. Ltd.',
            panNumber: '123456789',
            vatNumber: '123456789-001',
            address: 'Kathmandu, Nepal',
            phone: '+977-1-1234567',
            language: 'en',
        },
    });

    console.log(`✓ Created demo user: ${user.email}`);

    // Seed chart of accounts
    await seedAccounts(user.id);

    // Seed customers
    await seedCustomers(user.id);

    // Seed vendors
    await seedVendors(user.id);

    // Seed invoices and expenses
    await seedInvoicesAndExpenses(user.id);

    console.log('\n✓ Database seed completed successfully!');
    console.log('\n📋 Demo credentials:');
    console.log('   Email: demo@nepalaccounting.com');
    console.log('   Password: Demo@123');
}

main()
    .catch((e: unknown) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect().catch(console.error);
    });
