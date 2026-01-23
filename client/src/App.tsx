import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout, AuthLayout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastProvider } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Spinner } from './components/ui/Common';

// Auth Pages - Eager load for faster initial auth
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboard Pages - Lazy load for code splitting
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage').then(m => ({ default: m.CustomersPage })));
const VendorsPage = lazy(() => import('./pages/vendors/VendorsPage').then(m => ({ default: m.VendorsPage })));
const InvoicesPage = lazy(() => import('./pages/invoices/InvoicesPage').then(m => ({ default: m.InvoicesPage })));
const NewInvoicePage = lazy(() => import('./pages/invoices/NewInvoicePage').then(m => ({ default: m.NewInvoicePage })));
const EditInvoicePage = lazy(() => import('./pages/invoices/EditInvoicePage').then(m => ({ default: m.EditInvoicePage })));
const ExpensesPage = lazy(() => import('./pages/expenses/ExpensesPage').then(m => ({ default: m.ExpensesPage })));
const NewExpensePage = lazy(() => import('./pages/expenses/NewExpensePage').then(m => ({ default: m.NewExpensePage })));
const EditExpensePage = lazy(() => import('./pages/expenses/EditExpensePage').then(m => ({ default: m.EditExpensePage })));
const AccountsPage = lazy(() => import('./pages/accounts/AccountsPage').then(m => ({ default: m.AccountsPage })));
const VatPage = lazy(() => import('./pages/vat/VatPage').then(m => ({ default: m.VatPage })));
const BankPage = lazy(() => import('./pages/bank/BankPage').then(m => ({ default: m.BankPage })));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <Spinner size="lg" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
      gcTime: 1000 * 60 * 10, // 10 minutes - keep in cache
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on network reconnect
    },
    mutations: {
      retry: false, // Don't retry failed mutations
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Dashboard Routes - Protected */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Customers */}
                  <Route path="/customers" element={<CustomersPage />} />

                  {/* Vendors */}
                  <Route path="/vendors" element={<VendorsPage />} />

                  {/* Invoices */}
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/invoices/new" element={<NewInvoicePage />} />
                  <Route path="/invoices/:id/edit" element={<EditInvoicePage />} />

                  {/* Expenses */}
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/expenses/new" element={<NewExpensePage />} />
                  <Route path="/expenses/:id/edit" element={<EditExpensePage />} />

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
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
