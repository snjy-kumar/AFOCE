#!/usr/bin/env node

/**
 * Automated API Test Runner
 * Tests all critical endpoints and validates responses
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const VERBOSE = process.env.VERBOSE === 'true';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Test state
let testsPassed = 0;
let testsFailed = 0;
let authToken = '';
let testData = {
  userId: '',
  customerId: '',
  vendorId: '',
  accountId: '',
  invoiceId: '',
  expenseId: '',
};

// Utility: Make HTTP request
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AFOCE-Test-Runner/1.0',
        ...headers,
      },
    };

    if (authToken && !headers.Authorization) {
      options.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
            body,
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            body,
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Utility: Log test result
function logTest(name, passed, details = '') {
  const icon = passed ? '✓' : '✗';
  const color = passed ? colors.green : colors.red;

  console.log(`${color}${icon} ${name}${colors.reset}`);

  if (details && (VERBOSE || !passed)) {
    console.log(`${colors.gray}  ${details}${colors.reset}`);
  }

  if (passed) {
    testsPassed++;
  } else {
    testsFailed++;
  }
}

// Test: Health check
async function testHealthCheck() {
  console.log(`\n${colors.cyan}=== Health Checks ===${colors.reset}`);

  try {
    const res = await makeRequest('GET', '/health');
    logTest(
      'Basic health check',
      res.status === 200 && res.data.status === 'ok',
      `Status: ${res.status}, Response: ${JSON.stringify(res.data)}`
    );
  } catch (err) {
    logTest('Basic health check', false, err.message);
  }

  try {
    const res = await makeRequest('GET', '/health/detailed');
    const hasDatabase = res.data?.checks?.database !== undefined;
    logTest(
      'Detailed health check',
      res.status === 200 && hasDatabase,
      `Database: ${res.data?.checks?.database ? 'Connected' : 'Failed'}`
    );
  } catch (err) {
    logTest('Detailed health check', false, err.message);
  }

  try {
    const res = await makeRequest('GET', '/health/ready');
    logTest('Readiness probe', res.status === 200, `Status: ${res.status}`);
  } catch (err) {
    logTest('Readiness probe', false, err.message);
  }
}

// Test: Authentication flow
async function testAuthentication() {
  console.log(`\n${colors.cyan}=== Authentication ===${colors.reset}`);

  const timestamp = Date.now();
  const testUser = {
    email: `test${timestamp}@afoce.com`,
    password: 'TestPass123!@#',
    businessName: 'Test Business',
    panNumber: '123456789',
  };

  // Register
  try {
    const res = await makeRequest('POST', '/auth/register', testUser);
    const success = res.status === 201 && res.data?.data?.token;

    if (success) {
      authToken = res.data.data.token;
      testData.userId = res.data.data.user.id;
    }

    logTest(
      'Register new user',
      success,
      success ? `User ID: ${testData.userId.slice(0, 8)}...` : `Status: ${res.status}`
    );
  } catch (err) {
    logTest('Register new user', false, err.message);
  }

  // Login
  try {
    const res = await makeRequest('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    const success = res.status === 200 && res.data?.data?.token;

    if (success) {
      authToken = res.data.data.token;
    }

    logTest('Login', success, success ? 'Token received' : `Status: ${res.status}`);
  } catch (err) {
    logTest('Login', false, err.message);
  }

  // Get profile
  try {
    const res = await makeRequest('GET', '/auth/profile');
    const success = res.status === 200 && res.data?.data?.email === testUser.email;
    logTest(
      'Get profile',
      success,
      success ? `Email: ${res.data.data.email}` : `Status: ${res.status}`
    );
  } catch (err) {
    logTest('Get profile', false, err.message);
  }
}

// Test: Customer operations
async function testCustomers() {
  console.log(`\n${colors.cyan}=== Customers ===${colors.reset}`);

  const customer = {
    name: 'Test Customer Inc',
    email: `customer${Date.now()}@test.com`,
    phone: '+977-9876543210',
    address: 'Kathmandu, Nepal',
  };

  // Create customer
  try {
    const res = await makeRequest('POST', '/customers', customer);
    const success = res.status === 201 && res.data?.data?.id;

    if (success) {
      testData.customerId = res.data.data.id;
    }

    logTest(
      'Create customer',
      success,
      success ? `ID: ${testData.customerId.slice(0, 8)}...` : `Status: ${res.status}`
    );
  } catch (err) {
    logTest('Create customer', false, err.message);
  }

  // Get all customers
  try {
    const res = await makeRequest('GET', '/customers?limit=10');
    const success = res.status === 200 && Array.isArray(res.data?.data);
    logTest(
      'Get all customers',
      success,
      success ? `Found ${res.data.data.length} customers` : `Status: ${res.status}`
    );
  } catch (err) {
    logTest('Get all customers', false, err.message);
  }

  // Get customer by ID
  if (testData.customerId) {
    try {
      const res = await makeRequest('GET', `/customers/${testData.customerId}`);
      const success = res.status === 200 && res.data?.data?.id === testData.customerId;
      logTest('Get customer by ID', success, success ? 'Found' : `Status: ${res.status}`);
    } catch (err) {
      logTest('Get customer by ID', false, err.message);
    }
  }

  // Search customers
  try {
    const res = await makeRequest('GET', '/customers?search=Test');
    const success = res.status === 200;
    logTest('Search customers', success, `Status: ${res.status}`);
  } catch (err) {
    logTest('Search customers', false, err.message);
  }
}

// Test: Vendor operations
async function testVendors() {
  console.log(`\n${colors.cyan}=== Vendors ===${colors.reset}`);

  const vendor = {
    name: 'Test Vendor LLC',
    email: `vendor${Date.now()}@test.com`,
    phone: '+977-9876543220',
  };

  try {
    const res = await makeRequest('POST', '/vendors', vendor);
    const success = res.status === 201 && res.data?.data?.id;

    if (success) {
      testData.vendorId = res.data.data.id;
    }

    logTest(
      'Create vendor',
      success,
      success ? `ID: ${testData.vendorId.slice(0, 8)}...` : `Status: ${res.status}`
    );
  } catch (err) {
    logTest('Create vendor', false, err.message);
  }

  try {
    const res = await makeRequest('GET', '/vendors');
    const success = res.status === 200 && Array.isArray(res.data?.data);
    logTest('Get all vendors', success, success ? `Found ${res.data.data.length} vendors` : `Status: ${res.status}`);
  } catch (err) {
    logTest('Get all vendors', false, err.message);
  }
}

// Test: Account operations
async function testAccounts() {
  console.log(`\n${colors.cyan}=== Chart of Accounts ===${colors.reset}`);

  try {
    const res = await makeRequest('GET', '/accounts');
    const success = res.status === 200 && Array.isArray(res.data?.data);

    if (success && res.data.data.length > 0) {
      testData.accountId = res.data.data[0].id;
    }

    logTest(
      'Get all accounts',
      success,
      success ? `Found ${res.data.data.length} accounts` : `Status: ${res.status}`
    );
  } catch (err) {
    logTest('Get all accounts', false, err.message);
  }

  // Create account if none exist
  if (!testData.accountId) {
    const account = {
      code: `TEST${Date.now()}`,
      name: 'Test Account',
      type: 'REVENUE',
      description: 'Test revenue account',
    };

    try {
      const res = await makeRequest('POST', '/accounts', account);
      const success = res.status === 201 && res.data?.data?.id;

      if (success) {
        testData.accountId = res.data.data.id;
      }

      logTest('Create account', success, success ? `ID: ${testData.accountId.slice(0, 8)}...` : `Status: ${res.status}`);
    } catch (err) {
      logTest('Create account', false, err.message);
    }
  }
}

// Test: Invoice operations
async function testInvoices() {
  console.log(`\n${colors.cyan}=== Invoices ===${colors.reset}`);

  if (!testData.customerId || !testData.accountId) {
    console.log(`${colors.yellow}  ⚠ Skipping invoice tests (missing dependencies)${colors.reset}`);
    return;
  }

  const invoice = {
    customerId: testData.customerId,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vatRate: 13,
    discountAmount: 0,
    notes: 'Test invoice',
    items: [
      {
        accountId: testData.accountId,
        description: 'Test Service',
        quantity: 2,
        rate: 1000,
      },
    ],
  };

  try {
    const res = await makeRequest('POST', '/invoices', invoice);
    const success = res.status === 201 && res.data?.data?.id;

    if (success) {
      testData.invoiceId = res.data.data.id;
    }

    logTest(
      'Create invoice',
      success,
      success
        ? `Invoice: ${res.data.data.invoiceNumber}, Total: ${res.data.data.total}`
        : `Status: ${res.status}`
    );
  } catch (err) {
    logTest('Create invoice', false, err.message);
  }

  try {
    const res = await makeRequest('GET', '/invoices?limit=10');
    const success = res.status === 200 && Array.isArray(res.data?.data);
    logTest('Get all invoices', success, success ? `Found ${res.data.data.length} invoices` : `Status: ${res.status}`);
  } catch (err) {
    logTest('Get all invoices', false, err.message);
  }

  if (testData.invoiceId) {
    try {
      const res = await makeRequest('GET', `/invoices/${testData.invoiceId}`);
      const success = res.status === 200;
      logTest('Get invoice by ID', success, `Status: ${res.status}`);
    } catch (err) {
      logTest('Get invoice by ID', false, err.message);
    }
  }

  try {
    const res = await makeRequest('GET', '/invoices/summary');
    const success = res.status === 200 && res.data?.data !== undefined;
    logTest('Get invoice summary', success, `Status: ${res.status}`);
  } catch (err) {
    logTest('Get invoice summary', false, err.message);
  }
}

// Test: Expense operations
async function testExpenses() {
  console.log(`\n${colors.cyan}=== Expenses ===${colors.reset}`);

  if (!testData.accountId) {
    console.log(`${colors.yellow}  ⚠ Skipping expense tests (missing account)${colors.reset}`);
    return;
  }

  const expense = {
    vendorId: testData.vendorId || null,
    accountId: testData.accountId,
    date: new Date().toISOString().split('T')[0],
    amount: 500,
    category: 'OFFICE',
    description: 'Test expense',
    paymentMethod: 'CASH',
    isVatable: true,
  };

  try {
    const res = await makeRequest('POST', '/expenses', expense);
    const success = res.status === 201 && res.data?.data?.id;

    if (success) {
      testData.expenseId = res.data.data.id;
    }

    logTest('Create expense', success, success ? `Amount: ${res.data.data.amount}` : `Status: ${res.status}`);
  } catch (err) {
    logTest('Create expense', false, err.message);
  }

  try {
    const res = await makeRequest('GET', '/expenses?limit=10');
    const success = res.status === 200 && Array.isArray(res.data?.data);
    logTest('Get all expenses', success, success ? `Found ${res.data.data.length} expenses` : `Status: ${res.status}`);
  } catch (err) {
    logTest('Get all expenses', false, err.message);
  }
}

// Test: Reports
async function testReports() {
  console.log(`\n${colors.cyan}=== Reports ===${colors.reset}`);

  const startDate = '2026-01-01';
  const endDate = '2026-01-31';

  try {
    const res = await makeRequest('GET', `/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`);
    const success = res.status === 200;
    logTest('Profit & Loss statement', success, `Status: ${res.status}`);
  } catch (err) {
    logTest('Profit & Loss statement', false, err.message);
  }

  try {
    const res = await makeRequest('GET', `/reports/balance-sheet?date=${endDate}`);
    const success = res.status === 200;
    logTest('Balance sheet', success, `Status: ${res.status}`);
  } catch (err) {
    logTest('Balance sheet', false, err.message);
  }

  try {
    const res = await makeRequest('GET', `/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`);
    const success = res.status === 200;
    logTest('Cash flow statement', success, `Status: ${res.status}`);
  } catch (err) {
    logTest('Cash flow statement', false, err.message);
  }
}

// Test: Dashboard
async function testDashboard() {
  console.log(`\n${colors.cyan}=== Dashboard ===${colors.reset}`);

  try {
    const res = await makeRequest('GET', '/dashboard/summary');
    const success = res.status === 200 && res.data?.data !== undefined;
    logTest('Dashboard summary', success, `Status: ${res.status}`);
  } catch (err) {
    logTest('Dashboard summary', false, err.message);
  }

  try {
    const res = await makeRequest('GET', '/dashboard/recent-activity');
    const success = res.status === 200;
    logTest('Recent activity', success, `Status: ${res.status}`);
  } catch (err) {
    logTest('Recent activity', false, err.message);
  }
}

// Test: VAT
async function testVAT() {
  console.log(`\n${colors.cyan}=== VAT ===${colors.reset}`);

  const startDate = '2026-01-01';
  const endDate = '2026-01-31';

  try {
    const res = await makeRequest('GET', `/vat/summary?startDate=${startDate}&endDate=${endDate}`);
    const success = res.status === 200;
    logTest('VAT summary', success, `Status: ${res.status}`);
  } catch (err) {
    logTest('VAT summary', false, err.message);
  }

  try {
    const res = await makeRequest('GET', `/vat/report?startDate=${startDate}&endDate=${endDate}`);
    const success = res.status === 200;
    logTest('VAT report', success, `Status: ${res.status}`);
  } catch (err) {
    logTest('VAT report', false, err.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.blue}
╔════════════════════════════════════════════════════════╗
║         AFOCE Backend - Automated Test Suite          ║
╠════════════════════════════════════════════════════════╣
║  Target: ${BASE_URL.padEnd(45)}║
║  Time:   ${new Date().toISOString().padEnd(45)}║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);

  const startTime = Date.now();

  try {
    await testHealthCheck();
    await testAuthentication();
    await testCustomers();
    await testVendors();
    await testAccounts();
    await testInvoices();
    await testExpenses();
    await testReports();
    await testDashboard();
    await testVAT();
  } catch (err) {
    console.error(`\n${colors.red}Fatal error: ${err.message}${colors.reset}`);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const total = testsPassed + testsFailed;
  const passRate = total > 0 ? ((testsPassed / total) * 100).toFixed(1) : 0;

  console.log(`\n${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║                     Test Summary                       ║${colors.reset}`);
  console.log(`${colors.blue}╠════════════════════════════════════════════════════════╣${colors.reset}`);
  console.log(
    `${colors.blue}║${colors.reset}  ${colors.green}Passed:${colors.reset}  ${String(testsPassed).padEnd(44)}${colors.blue}║${colors.reset}`
  );
  console.log(
    `${colors.blue}║${colors.reset}  ${colors.red}Failed:${colors.reset}  ${String(testsFailed).padEnd(44)}${colors.blue}║${colors.reset}`
  );
  console.log(
    `${colors.blue}║${colors.reset}  Total:   ${String(total).padEnd(44)}${colors.blue}║${colors.reset}`
  );
  console.log(
    `${colors.blue}║${colors.reset}  Pass Rate: ${passRate}%${' '.repeat(40 - passRate.length)}${colors.blue}║${colors.reset}`
  );
  console.log(
    `${colors.blue}║${colors.reset}  Duration: ${duration}s${' '.repeat(41 - duration.length)}${colors.blue}║${colors.reset}`
  );
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

  if (testsFailed === 0) {
    console.log(`${colors.green}✓ All tests passed! Backend is production-ready.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Some tests failed. Review the output above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((err) => {
  console.error(`\n${colors.red}Unhandled error: ${err.message}${colors.reset}`);
  console.error(err.stack);
  process.exit(1);
});
