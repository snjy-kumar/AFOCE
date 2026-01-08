import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout, AuthLayout } from './components/layout/Layout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboard Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CustomersPage } from './pages/customers/CustomersPage';
import { VendorsPage } from './pages/vendors/VendorsPage';
import { InvoicesPage } from './pages/invoices/InvoicesPage';
import { NewInvoicePage } from './pages/invoices/NewInvoicePage';
import { ExpensesPage } from './pages/expenses/ExpensesPage';
import { NewExpensePage } from './pages/expenses/NewExpensePage';
import { AccountsPage } from './pages/accounts/AccountsPage';
import { VatPage } from './pages/vat/VatPage';
import { BankPage } from './pages/bank/BankPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Customers */}
            <Route path="/customers" element={<CustomersPage />} />

            {/* Vendors */}
            <Route path="/vendors" element={<VendorsPage />} />

            {/* Invoices */}
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/new" element={<NewInvoicePage />} />

            {/* Expenses */}
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/expenses/new" element={<NewExpensePage />} />

            {/* Accounts */}
            <Route path="/accounts" element={<AccountsPage />} />

            {/* VAT */}
            <Route path="/vat" element={<VatPage />} />

            {/* Bank */}
            <Route path="/bank" element={<BankPage />} />

            {/* Reports */}
            <Route path="/reports" element={<ReportsPage />} />

            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
